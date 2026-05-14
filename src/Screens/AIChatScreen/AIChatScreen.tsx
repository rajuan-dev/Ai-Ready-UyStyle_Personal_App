/**
 * AIChatScreen.tsx — Quick Fit Outfit Generator
 * Premium fashion-app outfit suggestion screen.
 *
 * Dependencies (already in project):
 *   react-native, react-native-safe-area-context,
 *   @react-native-firebase/app, @react-native-firebase/auth, @react-native-firebase/firestore
 *   lucide-react-native
 *
 * Weather: Local state only — hot | warm | cool | rainy (NO external API)
 * Data:    Firestore `closetItems` collection only
 */

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    Animated,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Shuffle,
    Plus,
    Shirt,
    RefreshCw,
    Sparkles,
    Heart,
    Cloud,
    Sun,
    CloudRain,
    Thermometer,
    ChevronRight,
} from 'lucide-react-native';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
} from '@react-native-firebase/firestore';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP   = 10;
const CARD_WIDTH = (SCREEN_W - 32 - CARD_GAP) / 2;

// ─── Types ────────────────────────────────────────────────────────────────────

type ClosetItem = {
    id:        string;
    title:     string;
    category:  string;
    color:     string;
    imageURL:  string;
    userId:    string;
    likeCount: number;
    createdAt: any;
};

type StylePrefs = {
    styles:    string[];
    occasions: string[];
    colors:    string[];
};

type WeatherType = 'hot' | 'warm' | 'cool' | 'rainy';

type Outfit = {
    id:       string;
    name:     string;
    occasion: string;
    weather:  WeatherType | null;
    items:    ClosetItem[];
};

// ─── Filter configuration ─────────────────────────────────────────────────────

const FILTER_TABS = [
    { id: 'all',     label: 'All'       },
    { id: 'casual',  label: 'Casual'    },
    { id: 'gym',     label: 'Gym'       },
    { id: 'formal',  label: 'Formal'    },
    { id: 'night',   label: 'Night Out' },
    { id: 'weekend', label: 'Weekend'   },
] as const;

type FilterId = typeof FILTER_TABS[number]['id'];

const OUTFIT_NAMES: Record<FilterId, string[]> = {
    all:     ['Everyday Look', 'Daily Fit', 'Go-To Outfit', 'Fresh Combo', 'Signature Set'],
    casual:  ['Chill Vibes', 'Weekend Casual', 'Laid-Back Look', 'Easy Day'],
    gym:     ['Gym Session', 'Workout Ready', 'Active Mode', 'Power Set'],
    formal:  ['Office Ready', 'Business Look', 'Smart Formal', 'Sharp Edge'],
    night:   ['Night Out', 'Evening Glam', 'Party Mode', 'Golden Hour'],
    weekend: ['Weekend Mood', 'Sunday Fit', 'Brunch Ready', 'City Wander'],
};

const FILTER_KEYWORDS: Record<FilterId, string[]> = {
    all:     [],
    gym:     ['gym', 'sport', 'active', 'athletic', 'workout', 'legging', 'shorts'],
    formal:  ['formal', 'business', 'office', 'suit', 'blazer', 'chino', 'oxford'],
    night:   ['night', 'party', 'evening', 'dress', 'heels', 'velvet'],
    weekend: ['casual', 'weekend', 'relax', 'denim', 'hoodie', 'sneaker'],
    casual:  ['casual', 'basic', 't-shirt', 'jeans', 'tee', 'linen'],
};

// Weather → preferred clothing keywords
const WEATHER_KEYWORDS: Record<WeatherType, string[]> = {
    hot:   ['t-shirt', 'tee', 'shorts', 'sleeveless', 'tank', 'sandal', 'linen'],
    warm:  ['shirt', 'jeans', 'chino', 'polo', 'sneaker', 'loafer'],
    cool:  ['hoodie', 'sweater', 'jacket', 'coat', 'boots', 'knit', 'layer'],
    rainy: ['jacket', 'boots', 'raincoat', 'waterproof', 'trench', 'ankle boot'],
};

const WEATHER_LABEL: Record<WeatherType, string> = {
    hot:   'Hot',
    warm:  'Warm',
    cool:  'Cool',
    rainy: 'Rainy',
};

// ─── Weather helpers ──────────────────────────────────────────────────────────

function weatherIcon(type: WeatherType | null, size = 14, color = '#64748B') {
    switch (type) {
        case 'hot':   return <Sun size={size} color={color} />;
        case 'warm':  return <Sun size={size} color={color} />;
        case 'cool':  return <Cloud size={size} color={color} />;
        case 'rainy': return <CloudRain size={size} color={color} />;
        default:      return <Thermometer size={size} color={color} />;
    }
}

// ─── Outfit generator logic ───────────────────────────────────────────────────

function colorMatches(itemColor: string, prefColors: string[]): boolean {
    if (!prefColors?.length) return true;
    const c = itemColor.toLowerCase();
    return prefColors.some(
        p => c.includes(p.toLowerCase()) || p.toLowerCase().includes(c),
    );
}

function shuffleArr<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function filterByKeywords(items: ClosetItem[], keywords: string[]): ClosetItem[] {
    if (!keywords.length) return items;
    return items.filter(i =>
        keywords.some(
            k =>
                (i.category ?? '').toLowerCase().includes(k) ||
                (i.title ?? '').toLowerCase().includes(k),
        ),
    );
}

function categorise(pool: ClosetItem[]) {
    return {
        tops:    pool.filter(i => /top|shirt|tee|blouse|hoodie|sweater|jacket|coat|outerwear|vest|tank|sleeveless|polo|knit|layer/i.test(i.category)),
        bottoms: pool.filter(i => /bottom|pant|jean|skirt|short|trouser|legging|chino/i.test(i.category)),
        shoes:   pool.filter(i => /shoe|sneaker|boot|sandal|footwear|loafer|heel|oxford|ankle/i.test(i.category)),
    };
}

type GenerateResult = { outfits: Outfit[]; notEnough: boolean };

function generateOutfits(
    items:      ClosetItem[],
    filter:     FilterId,
    stylePrefs: StylePrefs | null,
    weather:    WeatherType | null,
    count = 3,
): GenerateResult {

    /* ── Style-pref gate ── */
    if (stylePrefs && filter !== 'all') {
        const prefStylesLower = (stylePrefs.styles ?? []).map(s => s.toLowerCase());
        const filterInPrefs   = prefStylesLower.some(
            s => s.includes(filter) || filter.includes(s),
        );
        if (!filterInPrefs) return { outfits: [], notEnough: true };
    }

    /* ── Filter pool by occasion ── */
    let pool = items;
    const occKw = FILTER_KEYWORDS[filter];
    if (occKw.length) {
        const filtered = filterByKeywords(items, occKw);
        pool = filtered.length >= 2 ? filtered : items;
    }

    /* ── Filter pool by weather (local state, no API) ── */
    if (weather) {
        const wKw      = WEATHER_KEYWORDS[weather];
        const wFiltered = filterByKeywords(pool, wKw);
        pool = wFiltered.length >= 2 ? wFiltered : pool;
    }

    /* ── Filter pool by color prefs ── */
    if (stylePrefs?.colors?.length) {
        const colorFiltered = pool.filter(i =>
            colorMatches(i.color, stylePrefs.colors),
        );
        pool = colorFiltered.length >= 2 ? colorFiltered : pool;
    }

    if (pool.length < 2) return { outfits: [], notEnough: true };

    /* ── Categorise ── */
    const { tops, bottoms, shoes } = categorise(pool);

    /* ── Build outfits ── */
    const outfits:    Outfit[]     = [];
    const usedCombos = new Set<string>();
    const names      = OUTFIT_NAMES[filter];
    const occasion   = FILTER_TABS.find(t => t.id === filter)?.label ?? 'Everyday';

    for (let attempt = 0; attempt < 40 && outfits.length < count; attempt++) {
        const top    = shuffleArr(tops)[0];
        const bottom = shuffleArr(bottoms)[0];
        const shoe   = shuffleArr(shoes)[0];
        const combo  = [top, bottom, shoe].filter(Boolean) as ClosetItem[];
        if (combo.length < 1) continue;

        const key = combo.map(i => i.id).sort().join('|');
        if (usedCombos.has(key)) continue;
        usedCombos.add(key);

        outfits.push({
            id:      `outfit-${Date.now()}-${outfits.length}`,
            name:    names[outfits.length % names.length],
            occasion,
            weather: weather ?? null,
            items:   combo,
        });
    }

    /* ── Fallback: any random combos ── */
    if (outfits.length === 0) {
        const shuffled = shuffleArr(pool);
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            const combo = shuffled.slice(i, i + Math.min(3, shuffled.length - i));
            if (!combo.length) break;
            outfits.push({
                id:      `outfit-fallback-${i}`,
                name:    names[i % names.length],
                occasion,
                weather: weather ?? null,
                items:   combo,
            });
        }
    }

    return { outfits, notEnough: outfits.length === 0 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single closet item card inside an outfit */
const ItemCard: React.FC<{ item: ClosetItem }> = React.memo(({ item }) => {
    const count    = item.likeCount ?? 0;
    const scaleRef = useRef(new Animated.Value(1)).current;

    const onPressIn  = () => Animated.spring(scaleRef, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
    const onPressOut = () => Animated.spring(scaleRef, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();

    return (
        <Animated.View style={[cStyles.card, { transform: [{ scale: scaleRef }] }]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={{ flex: 1 }}
            >
                <View style={cStyles.imageWrapper}>
                    {item.imageURL ? (
                        <Image
                            source={{ uri: item.imageURL }}
                            style={cStyles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={cStyles.imageFallback}>
                            <Shirt size={26} color="#CBD5E1" />
                        </View>
                    )}
                    {count > 0 && (
                        <View style={cStyles.likeChip}>
                            <Heart size={9} color="#ef4444" fill="#ef4444" strokeWidth={0} />
                            <Text style={cStyles.likeText}>
                                {count >= 1000
                                    ? `${(count / 1000).toFixed(1)}k`
                                    : count}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={cStyles.info}>
                    <Text style={cStyles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={cStyles.meta} numberOfLines={1}>
                        {[item.category, item.color].filter(Boolean).join(' · ') || '—'}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

/** One generated outfit block */
const OutfitCard: React.FC<{ outfit: Outfit; index: number }> = ({ outfit, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 400,
                delay: index * 130, useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0, friction: 8, tension: 60,
                delay: index * 130, useNativeDriver: true,
            }),
        ]).start();
    }, [outfit.id]);

    return (
        <Animated.View style={[s.outfitBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Card header */}
            <View style={s.outfitHeader}>
                <View style={s.outfitHeaderLeft}>
                    <View style={s.indexBadge}>
                        <Text style={s.indexText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.outfitName}>{outfit.name}</Text>
                        <View style={s.outfitMeta}>
                            <Text style={s.outfitOccasion}>
                                {outfit.occasion} · {outfit.items.length} pieces
                            </Text>
                            {outfit.weather && (
                                <View style={s.weatherPill}>
                                    {weatherIcon(outfit.weather, 11, '#64748B')}
                                    <Text style={s.weatherPillText}>
                                        {WEATHER_LABEL[outfit.weather]}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
            </View>

            {/* Item grid — left-to-right wrap */}
            <View style={s.itemGrid}>
                {outfit.items.map(item => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </View>
        </Animated.View>
    );
};

/** Horizontal filter pill */
const FilterTab: React.FC<{
    tab:      typeof FILTER_TABS[number];
    selected: boolean;
    onPress:  () => void;
}> = React.memo(({ tab, selected, onPress }) => (
    <TouchableOpacity
        style={[s.filterTab, selected && s.filterTabActive]}
        onPress={onPress}
        activeOpacity={0.75}
    >
        <Text style={[s.filterLabel, selected && s.filterLabelActive]}>
            {tab.label}
        </Text>
    </TouchableOpacity>
));


const WEATHER_BG: Record<WeatherType, string> = {
    hot:   '#FFF7ED',
    warm:  '#FFFBEB',
    cool:  '#F0F9FF',
    rainy: '#F0F4FF',
};
const WEATHER_FG: Record<WeatherType, string> = {
    hot:   '#EA580C',
    warm:  '#D97706',
    cool:  '#0284C7',
    rainy: '#4F46E5',
};

const WeatherSelector: React.FC<{
    current:  WeatherType | null;
    onChange: (w: WeatherType | null) => void;
}> = ({ current, onChange }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const options: WeatherType[] = ['hot', 'warm', 'cool', 'rainy'];

    return (
        <Animated.View style={[s.weatherSelectorWrap, { opacity: fadeAnim }]}>
            <Text style={s.weatherSelectorLabel}>Weather</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.weatherSelectorRow}
            >
                {options.map(type => {
                    const active = current === type;
                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                s.weatherChip,
                                {
                                    backgroundColor: active ? WEATHER_BG[type] : '#F1F5F9',
                                    borderColor:     active ? WEATHER_FG[type] : '#E2E8F0',
                                },
                            ]}
                            onPress={() => onChange(active ? null : type)}
                            activeOpacity={0.75}
                        >
                            {weatherIcon(type, 13, active ? WEATHER_FG[type] : '#94A3B8')}
                            <Text
                                style={[
                                    s.weatherChipText,
                                    { color: active ? WEATHER_FG[type] : '#64748B' },
                                ]}
                            >
                                {WEATHER_LABEL[type]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </Animated.View>
    );
};


const EmptyState: React.FC<{
    onAdd:  () => void;
    filter: FilterId;
    prefs:  StylePrefs | null;
}> = ({ onAdd, filter, prefs }) => {
    const bounceAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                Animated.timing(bounceAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
            ]),
        ).start();
    }, []);

    const filterLabel     = FILTER_TABS.find(t => t.id === filter)?.label ?? filter;
    const prefStylesLower = (prefs?.styles ?? []).map(s => s.toLowerCase());
    const filterInPrefs   = filter === 'all' || prefStylesLower.some(
        s => s.includes(filter) || filter.includes(s),
    );

    const message = !filterInPrefs
        ? `"${filterLabel}" isn't part of your style preferences yet.`
        : prefs?.colors?.length
            ? `Not enough items match your color preferences for "${filterLabel}" outfits.`
            : `Add more "${filterLabel}" items to unlock full outfit suggestions.`;

    return (
        <View style={s.emptyWrap}>

            <Text style={s.emptyTitle}>Add more items to get better outfit suggestions.</Text>
            <Text style={s.emptyMsg}>{message}</Text>
            <TouchableOpacity style={s.addBtn} onPress={onAdd} activeOpacity={0.85}>
                <Plus size={15} color="#fff" />
                <Text style={s.addBtnText}>Add Items to Closet</Text>
            </TouchableOpacity>
        </View>
    );
};



const AIChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const app  = getApp();
    const db   = getFirestore(app);
    const user = getAuth(app).currentUser;

    /* ── State ── */
    const [closetItems,  setClosetItems]  = useState<ClosetItem[]>([]);
    const [stylePrefs,   setStylePrefs]   = useState<StylePrefs | null>(null);
    const [weather,      setWeather]      = useState<WeatherType | null>(null);  
    const [outfits,      setOutfits]      = useState<Outfit[]>([]);
    const [notEnough,    setNotEnough]    = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterId>('all');
    const [loading,      setLoading]      = useState(true);
    const [generating,   setGenerating]   = useState(false);

    /* ── Spin animation on generate ── */
    const spinVal = useRef(new Animated.Value(0)).current;
    const spinDeg = spinVal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const triggerSpin = () => {
        spinVal.setValue(0);
        Animated.timing(spinVal, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    };

    /* ── Header fade-in ── */
    const headerFade = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    /* ── Initial data fetch (Firestore closetItems only, no weather API) ── */
    useEffect(() => {
        if (!user) return;
        (async () => {
            setLoading(true);
            try {
                /* Closet items */
                const q    = query(collection(db, 'closetItems'), where('userId', '==', user.uid));
                const snap = await getDocs(q);
                const items: ClosetItem[] = snap.docs.map(d => ({
                    id:        d.id,
                    likeCount: 0,
                    ...(d.data() as any),
                }));
                setClosetItems(items);

                /* Style prefs */
                const prefsSnap = await getDoc(doc(db, 'stylePrefs', user.uid));
                const prefs     = prefsSnap.exists() ? (prefsSnap.data() as StylePrefs) : null;
                setStylePrefs(prefs);

                /* Generate first batch (no weather selected) */
                const result = generateOutfits(items, 'all', prefs, null);
                setOutfits(result.outfits);
                setNotEnough(result.notEnough);
            } catch (err) {
                console.error('[QuickFit] fetch error:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.uid]);

    /* ── Generate outfits ── */
    const handleGenerate = useCallback(
        (filter: FilterId = activeFilter, wx: WeatherType | null = weather) => {
            setGenerating(true);
            triggerSpin();
            setTimeout(() => {
                const result = generateOutfits(closetItems, filter, stylePrefs, wx);
                setOutfits(result.outfits);
                setNotEnough(result.notEnough);
                setGenerating(false);
            }, 480);
        },
        [closetItems, activeFilter, stylePrefs, weather],
    );

    const handleFilterChange = useCallback((id: FilterId) => {
        setActiveFilter(id);
        handleGenerate(id, weather);
    }, [handleGenerate, weather]);

    /* ── Weather change triggers re-generation immediately ── */
    const handleWeatherChange = useCallback((wx: WeatherType | null) => {
        setWeather(wx);
        handleGenerate(activeFilter, wx);
    }, [handleGenerate, activeFilter]);

    /* ── Stats line ── */
    const statsLine = useMemo(() => {
        if (loading) return 'Loading your closet…';
        return `${closetItems.length} items · ${outfits.length} outfit${outfits.length !== 1 ? 's' : ''}`;
    }, [loading, closetItems.length, outfits.length]);

    /* ── Render ── */
    return (
        <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

            {/* ── Header ── */}
            <Animated.View style={[s.header, { opacity: headerFade }]}>
                <View>
                    <Text style={s.headerTitle}>Quick Fit</Text>
                    <Text style={s.headerSub}>{statsLine}</Text>
                </View>
                <TouchableOpacity
                    style={[s.genBtn, generating && s.genBtnDisabled]}
                    onPress={() => handleGenerate()}
                    disabled={generating || loading}
                    activeOpacity={0.82}
                >
                    <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
                        <Shuffle size={16} color="#FFFFFF" />
                    </Animated.View>
                    <Text style={s.genBtnText}>Generate</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* ── Style prefs banner ── */}
            {stylePrefs?.styles?.length ? (
                <View style={s.prefsBanner}>
                    <Sparkles size={12} color="#2563EB" />
                    <Text style={s.prefsText} numberOfLines={1}>
                        {stylePrefs.styles.slice(0, 3).join(' · ')}
                        {stylePrefs.colors?.length
                            ? `  ·  ${stylePrefs.colors.slice(0, 3).join(', ')}`
                            : ''}
                    </Text>
                </View>
            ) : null}

            {/* ── Weather selector (tap to pick: hot / warm / cool / rainy) ── */}
            {!loading && (
                <WeatherSelector current={weather} onChange={handleWeatherChange} />
            )}

            {/* ── Filter tabs ── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterRow}
                style={s.filterScroll}
            >
                {FILTER_TABS.map(tab => (
                    <FilterTab
                        key={tab.id}
                        tab={tab}
                        selected={activeFilter === tab.id}
                        onPress={() => handleFilterChange(tab.id)}
                    />
                ))}
            </ScrollView>

            {/* ── Body ── */}
            {loading ? (
                <View style={s.loadingWrap}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={s.loadingText}>Syncing wardrobe…</Text>
                </View>
            ) : notEnough ? (
                <EmptyState
                    filter={activeFilter}
                    prefs={stylePrefs}
                    onAdd={() => navigation.navigate('Add')}
                />
            ) : (
                <FlatList
                    data={outfits}
                    keyExtractor={o => o.id}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        generating ? (
                            <View style={s.generatingRow}>
                                <ActivityIndicator size="small" color="#2563EB" />
                                <Text style={s.generatingText}>Finding perfect combinations…</Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item, index }) => (
                        <OutfitCard outfit={item} index={index} />
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            filter={activeFilter}
                            prefs={stylePrefs}
                            onAdd={() => navigation.navigate('Add')}
                        />
                    }
                    ListFooterComponent={
                        outfits.length > 0 ? (
                            <TouchableOpacity
                                style={s.footerBtn}
                                onPress={() => handleGenerate()}
                                activeOpacity={0.8}
                            >
                                <RefreshCw size={13} color="#2563EB" />
                                <Text style={s.footerBtnText}>Try different combinations</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE    = '#2563EB';
const BLUE_BG = '#EFF6FF';

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#FAFAFA' },

    /* Header */
    header: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: 20,
        paddingTop:        14,
        paddingBottom:     10,
    },
    headerTitle: {
        fontSize:      24,
        fontWeight:    '800',
        color:         '#0F172A',
        letterSpacing: -0.8,
        fontFamily:    Platform.select({ ios: 'Georgia', android: 'serif' }),
    },
    headerSub: {
        fontSize:   12,
        color:      '#94A3B8',
        marginTop:  2,
        fontWeight: '400',
    },

    /* Generate button */
    genBtn: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               7,
        backgroundColor:   BLUE,
        paddingHorizontal: 16,
        paddingVertical:   10,
        borderRadius:      24,
        ...Platform.select({
            ios: {
                shadowColor:   '#2563EB',
                shadowOffset:  { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius:  10,
            },
            android: { elevation: 6 },
        }),
    },
    genBtnDisabled: { opacity: 0.55 },
    genBtnText: {
        fontSize:      13,
        fontWeight:    '700',
        color:         '#FFFFFF',
        letterSpacing: 0.2,
    },

    /* Style prefs banner */
    prefsBanner: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               6,
        marginHorizontal:  20,
        marginBottom:       6,
        backgroundColor:   BLUE_BG,
        paddingHorizontal: 12,
        paddingVertical:    7,
        borderRadius:      10,
    },
    prefsText: {
        fontSize:      12,
        color:         BLUE,
        fontWeight:    '600',
        textTransform: 'capitalize',
        flexShrink:     1,
    },

    /* Weather selector */
    weatherSelectorWrap: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               10,
        marginHorizontal:  20,
        marginBottom:       8,
    },
    weatherSelectorLabel: {
        fontSize:   12,
        color:      '#64748B',
        fontWeight: '600',
    },
    weatherSelectorRow: {
        flexDirection: 'row',
        gap:            8,
    },
    weatherChip: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               5,
        paddingHorizontal: 11,
        paddingVertical:    6,
        borderRadius:      99,
        borderWidth:        1.5,
    },
    weatherChipText: {
        fontSize:   12,
        fontWeight: '600',
    },

    /* Filter row */
    filterScroll: { flexGrow: 0, flexShrink: 0 },
    filterRow: {
        paddingHorizontal: 16,
        paddingVertical:    8,
        gap:                8,
        flexDirection:     'row',
        alignItems:        'center',
    },
    filterTab: {
        height:            34,
        paddingHorizontal: 16,
        borderRadius:      17,
        backgroundColor:   '#F1F5F9',
        borderWidth:        1.5,
        borderColor:       '#E2E8F0',
        alignItems:        'center',
        justifyContent:    'center',
    },
    filterTabActive: {
        backgroundColor: BLUE_BG,
        borderColor:     BLUE,
    },
    filterLabel: {
        fontSize:   12,
        fontWeight: '500',
        color:      '#64748B',
        lineHeight: 15,
    },
    filterLabelActive: {
        color:      BLUE,
        fontWeight: '700',
    },

    /* Loading */
    loadingWrap: {
        flex:           1,
        alignItems:     'center',
        justifyContent: 'center',
        gap:            12,
    },
    loadingText: {
        fontSize:   13,
        color:      '#94A3B8',
        fontWeight: '400',
    },

    /* Generating row */
    generatingRow: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             8,
        paddingVertical: 10,
    },
    generatingText: {
        fontSize:   12,
        color:      '#94A3B8',
        fontWeight: '400',
    },

    /* List */
    listContent: {
        paddingHorizontal: 16,
        paddingTop:         8,
        paddingBottom:     48,
        gap:               20,
    },

    /* Outfit block */
    outfitBlock: {
        backgroundColor: '#FFFFFF',
        borderRadius:    20,
        padding:         16,
        ...Platform.select({
            ios: {
                shadowColor:   '#94A3B8',
                shadowOffset:  { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius:  12,
            },
            android: { elevation: 3 },
        }),
    },
    outfitHeader: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'space-between',
        marginBottom:    14,
    },
    outfitHeaderLeft: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           10,
        flex:           1,
    },
    indexBadge: {
        width:           28,
        height:          28,
        borderRadius:    14,
        backgroundColor: BLUE_BG,
        alignItems:      'center',
        justifyContent:  'center',
    },
    indexText: {
        fontSize:   13,
        fontWeight: '800',
        color:      BLUE,
    },
    outfitName: {
        fontSize:      15,
        fontWeight:    '700',
        color:         '#0F172A',
        letterSpacing: -0.3,
    },
    outfitMeta: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           8,
        marginTop:      2,
    },
    outfitOccasion: {
        fontSize:   12,
        color:      '#94A3B8',
        fontWeight: '400',
    },
    weatherPill: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               4,
        backgroundColor:   '#F8FAFC',
        borderRadius:      99,
        paddingHorizontal:  7,
        paddingVertical:    2,
        borderWidth:        1,
        borderColor:       '#E2E8F0',
    },
    weatherPillText: {
        fontSize:   10,
        color:      '#64748B',
        fontWeight: '600',
    },

    /* Item grid */
    itemGrid: {
        flexDirection: 'row',
        flexWrap:      'wrap',
        gap:           CARD_GAP,
    },

    /* Footer reshuffle */
    footerBtn: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             6,
        paddingVertical: 16,
    },
    footerBtnText: {
        fontSize:   13,
        color:      BLUE,
        fontWeight: '600',
    },

    /* Empty state */
    emptyWrap: {
        flex:              1,
        alignItems:        'center',
        justifyContent:    'center',
        paddingHorizontal: 40,
        paddingVertical:   60,
        gap:               14,
    },
    emptyIcon: {
        width:           80,
        height:          80,
        borderRadius:    40,
        backgroundColor: '#F1F5F9',
        alignItems:      'center',
        justifyContent:  'center',
        marginBottom:     4,
    },
    emptyTitle: {
        fontSize:      17,
        fontWeight:    '700',
        color:         '#1E293B',
        textAlign:     'center',
        lineHeight:    24,
        letterSpacing: -0.3,
    },
    emptyMsg: {
        fontSize:   13,
        color:      '#94A3B8',
        textAlign:  'center',
        lineHeight: 20,
        fontWeight: '400',
    },
    addBtn: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               8,
        backgroundColor:   BLUE,
        paddingHorizontal: 22,
        paddingVertical:   13,
        borderRadius:      16,
        marginTop:          6,
        ...Platform.select({
            ios: {
                shadowColor:   BLUE,
                shadowOffset:  { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius:  10,
            },
            android: { elevation: 5 },
        }),
    },
    addBtnText: {
        fontSize:   14,
        fontWeight: '700',
        color:      '#FFFFFF',
    },
});

/* ── Item card styles ── */
const cStyles = StyleSheet.create({
    card: {
        width:           CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius:    16,
        overflow:        'hidden',
        ...Platform.select({
            ios: {
                shadowColor:   '#94A3B8',
                shadowOffset:  { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius:  8,
            },
            android: { elevation: 2 },
        }),
    },
    imageWrapper: {
        width:           '100%',
        height:          CARD_WIDTH,
        backgroundColor: '#F8FAFC',
    },
    image:         { width: '100%', height: '100%' },
    imageFallback: {
        width:           '100%',
        height:          '100%',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: '#F1F5F9',
    },
    likeChip: {
        position:          'absolute',
        top:                8,
        right:              8,
        flexDirection:     'row',
        alignItems:        'center',
        gap:                3,
        backgroundColor:   'rgba(255,255,255,0.92)',
        borderRadius:      99,
        paddingHorizontal:  6,
        paddingVertical:    3,
    },
    likeText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
    info: {
        paddingHorizontal: 10,
        paddingTop:         8,
        paddingBottom:     10,
    },
    title: {
        fontSize:      13,
        fontWeight:    '700',
        color:         '#0F172A',
        letterSpacing: -0.2,
        marginBottom:   3,
    },
    meta: {
        fontSize:   11,
        color:      '#94A3B8',
        fontWeight: '400',
    },
});

export default AIChatScreen;
