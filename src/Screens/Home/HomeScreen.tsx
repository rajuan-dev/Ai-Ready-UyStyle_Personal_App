import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    TextInput,
    FlatList,
    ActivityIndicator,
    Animated,
    Keyboard,
    StyleSheet,
    Dimensions, RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronRight, Search, Sparkles, Zap, X, User } from 'lucide-react-native';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { OutfitCollage } from '../../components/OutfitCollage';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import { addNotification, upsertNotification } from '../../utils/notifications';
import {
    getFirestore,
    doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    getCountFromServer,
} from '../../firebase/firestore';
import { getTabScreenBottomPadding } from '../../theme/layout';

const { width: SCREEN_W } = Dimensions.get('window');

type RecentClosetItem = {
    id: string;
    name: string;
    category: string;
    image: string;
    color?: string;
};

type RecentOutfit = {
    id: string;
    name: string;
    image: string;
    rawItemDetails?: any;
};

// ── Helper: deterministic daily seed from date + items ─────────────────────
const getDailySeed = () => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
};

const getOutfitSignature = (items: { id: string }[]): string => {
    return items.map(item => item.id).sort().join(',');
};

const getCoreSignature = (items: { id: string; category: string }[]): string => {
    // Only tops and bottoms count as the primary outfit signature
    const primaryCategoriesRegex = /top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short/i;
    return items
        .filter(item => primaryCategoriesRegex.test(item.category))
        .map(item => item.id)
        .sort()
        .join(',');
};

const MAX_COMBO_ENUMERATION = 20000;

const createRandom = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
};

const getRandomItem = <T,>(arr: (T | null)[]): T | null => {
    return arr[Math.floor(Math.random() * arr.length)];
};

function generateSingleOutfit(
    allItems: RecentClosetItem[],
    preferences: any,
    seed: number | null,
    shownSignaturesParam?: Set<string>,
    shownCoreSignaturesParam?: Set<string>,
    shownItemCountsParam?: Record<string, number>
): RecentClosetItem[] {
    const shownSignatures = shownSignaturesParam || new Set<string>();
    const shownCoreSignatures = shownCoreSignaturesParam || new Set<string>();
    const shownItemCounts = shownItemCountsParam || {};
    if (allItems.length === 0) return [];

    const rng = seed !== null ? createRandom(seed) : Math.random;

    // Categorize
    const allTops = allItems.filter(i => /top|shirt|sweater|blouse|tee|knit/i.test(i.category));
    const allBottoms = allItems.filter(i => /bottom|jean|trouser|pant|skirt|short/i.test(i.category));
    const allShoes = allItems.filter(i => /shoe|sneaker|boot|loafer|heel|sandal/i.test(i.category));
    const allOuterwear = allItems.filter(i => /outer|coat|jacket|blazer|trench/i.test(i.category));
    const allAccessories = allItems.filter(i => !/top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short|shoe|sneaker|boot|loafer|heel|sandal|outer|coat|jacket|blazer|trench/i.test(i.category));

    // Colors pref
    const preferredColors = preferences?.colors || preferences?.color || [];
    const isAnyColor = (c: string) => !c || /any_color|any\s+color/i.test(c);
    const hasColorPref = preferredColors.length > 0 && !preferredColors.every(isAnyColor);

    const colorMatches = (itemColor: string | undefined, prefColors: string[]): boolean => {
        if (!prefColors?.length) return true;
        if (prefColors.some(p => {
            const pref = p.trim().toLowerCase();
            return pref === 'any_color' || pref === 'any color';
        })) {
            return true;
        }
        if (!itemColor || !itemColor.trim()) return false;
        const c = itemColor.trim().toLowerCase();
        return prefColors.some(p => {
            const pref = p.trim().toLowerCase();
            if (!pref) return false;
            return c.includes(pref) || pref.includes(c);
        });
    };

    const getCategoryPool = (list: RecentClosetItem[]) => {
        if (!hasColorPref) return list;
        const filtered = list.filter(item => colorMatches(item.color, preferredColors));
        return filtered.length >= 2 ? filtered : list;
    };

    const tops = getCategoryPool(allTops);
    const bottoms = getCategoryPool(allBottoms);
    const shoes = getCategoryPool(allShoes);
    const outerwear = getCategoryPool(allOuterwear);
    const accessories = getCategoryPool(allAccessories);

    const shuffleArr = <T,>(arr: T[]): T[] => {
        const next = [...arr];
        for (let i = next.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rng() * (i + 1));
            [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
    };

    const shTops = shuffleArr(tops);
    const shBottoms = shuffleArr(bottoms);
    const shShoes = shuffleArr(shoes);
    const shOuter = shuffleArr(outerwear);
    const shAcc = shuffleArr(accessories);

    const topOptions = shTops.length > 0 ? shTops : [null];
    const bottomOptions = shBottoms.length > 0 ? shBottoms : [null];
    const shoeOptions = shShoes.length > 0 ? shShoes : [null];
    const outerOptions = shOuter.length > 0 ? [null, ...shOuter] : [null];
    const accessoryOptions = shAcc.length > 0 ? [null, ...shAcc] : [null];
    const totalPossible =
        topOptions.length *
        bottomOptions.length *
        shoeOptions.length *
        outerOptions.length *
        accessoryOptions.length;

    const candidates: RecentClosetItem[][] = [];
    const seenKeys = new Set<string>();
    const addCandidate = (combo: RecentClosetItem[]) => {
        if (combo.length === 0) return;
        const sig = getOutfitSignature(combo);
        if (seenKeys.has(sig)) return;
        seenKeys.add(sig);
        candidates.push(combo);
    };

    if (totalPossible <= MAX_COMBO_ENUMERATION) {
        for (const t of topOptions) {
            for (const b of bottomOptions) {
                for (const s of shoeOptions) {
                    for (const o of outerOptions) {
                        for (const a of accessoryOptions) {
                            addCandidate([t, b, s, o, a].filter(Boolean) as RecentClosetItem[]);
                        }
                    }
                }
            }
        }
    } else {
        const targetPoolSize = 240;
        const maxAttempts = 5000;

        for (let attempt = 0; attempt < maxAttempts && candidates.length < targetPoolSize; attempt += 1) {
            addCandidate(
                [
                    getRandomItem(topOptions),
                    getRandomItem(bottomOptions),
                    getRandomItem(shoeOptions),
                    getRandomItem(outerOptions),
                    getRandomItem(accessoryOptions),
                ].filter(Boolean) as RecentClosetItem[],
            );
        }
    }

    if (candidates.length === 0) {
        return allItems.slice(0, 3);
    }

    // Score candidates
    let bestCandidates = candidates.filter(c => !shownSignatures.has(getOutfitSignature(c)));
    if (bestCandidates.length === 0) {
        shownSignatures.clear();
        shownCoreSignatures.clear();
        for (const key of Object.keys(shownItemCounts)) {
            delete shownItemCounts[key];
        }
        bestCandidates = candidates;
    }

    const freshCoreCandidates = bestCandidates.filter(c => !shownCoreSignatures.has(getCoreSignature(c)));
    const pool = freshCoreCandidates.length > 0 ? freshCoreCandidates : bestCandidates;

    // Score based on item frequencies
    const scored = pool.map(C => {
        const coreSig = getCoreSignature(C);
        let score = 0;
        if (shownCoreSignatures.has(coreSig)) {
            score += 1000;
        }
        for (const item of C) {
            const count = shownItemCounts[item.id] || 0;
            const isPrimary = /top|shirt|sweater|blouse|tee|knit|bottom|jean|trouser|pant|skirt|short/i.test(item.category);
            score += count * (isPrimary ? 50 : 10);
        }
        return { combo: C, score };
    });

    scored.sort((a, b) => a.score - b.score);
    const bestScore = scored[0]?.score ?? 0;
    const bestOptions = scored.filter(s => s.score === bestScore);
    const selected = bestOptions[Math.floor(rng() * bestOptions.length)]?.combo || [];

    return selected;
}

const HomeScreen = () => {
    const insets = useSafeAreaInsets();

    const navigation = useNavigation<any>();

    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    const [recentItems, setRecentItems] = useState<RecentClosetItem[]>([]);
    const [recentOutfits, setRecentOutfits] = useState<RecentOutfit[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string>('');
    const [preferences, setPreferences] = useState<any>(null);
    const [recommendedOutfit, setRecommendedOutfit] = useState<RecentClosetItem[]>([]);
    const shownSignatures = useRef<Set<string>>(new Set());
    const shownCoreSignatures = useRef<Set<string>>(new Set());
    const shownItemCounts = useRef<Record<string, number>>({});
    const [hasUnread, setHasUnread] = useState<boolean>(false);

    // ── 1. Data Fetching ────────────────────────────────
    useEffect(() => {
        if (!user) return;

        // Profile Photo + Name
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setPhotoURL(data?.photoURL || null);
                setFullName(data?.fullName || '');
            }
        });

        // Style Preferences Sync
        const prefsRef = doc(db, 'stylePrefs', user.uid);
        const unsubPrefs = onSnapshot(prefsRef, (snap) => {
            if (snap.exists()) {
                setPreferences(snap.data());
            } else {
                setPreferences(null);
            }
        });

        // Recent Items (fetch more for Today's Pick pool)
        const itemsQuery = query(
            collection(db, 'closetItems'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20),
        );
        const unsubItems = onSnapshot(itemsQuery, snapshot => {
            setRecentItems(
                snapshot.docs.map(d => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        name: data.title || 'Untitled item',
                        category: data.category || 'Uncategorized',
                        image: data.imageURL || '',
                        color: data.color || '',
                    };
                }),
            );
        });

        // Recent Outfits (Limit to 3 for rotation)
        const outfitsQuery = query(
            collection(db, 'outfits'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3),
        );
        const unsubOutfits = onSnapshot(outfitsQuery, snapshot => {
            setRecentOutfits(
                snapshot.docs.map(d => {
                    const data = d.data() as any;
                    const itemDetails = data.itemDetails || {};
                    const firstKey = Object.keys(itemDetails)[0];
                    const details = firstKey ? itemDetails[firstKey] : null;
                    return {
                        id: d.id,
                        name: data.name || 'Your Outfit',
                        image: details?.imageURL || data.imageURL || '',
                        rawItemDetails: itemDetails,
                    };
                }),
            );
        });

        // Unread Notifications Sync
        const notifsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('isRead', '==', false),
            limit(1)
        );
        const unsubUnread = onSnapshot(notifsQuery, snapshot => {
            setHasUnread(!snapshot.empty);
        });

        return () => {
            unsubProfile();
            unsubPrefs();
            unsubItems();
            unsubOutfits();
            unsubUnread();
        };
    }, [db, user]);

    // ── Welcome Notification Seeding ────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const checkAndSeedWelcome = async () => {
            try {
                const notifsRef = collection(db, 'notifications');
                const q = query(notifsRef, where('userId', '==', user.uid));
                const countSnap = await getCountFromServer(q);
                if (countSnap.data().count === 0) {
                    await addNotification(
                        user.uid,
                        'Welcome to USTYLE! ✦',
                        'Ready to elevate your wardrobe? Add items to your Closet and start building looks in the Combine tab.',
                        'info'
                    );
                }
            } catch (err) {
                console.warn('[Welcome Notification] Check/Seed error:', err);
            }
        };
        checkAndSeedWelcome();
    }, [user?.uid, db]);

    // ── Personalized Greeting ─────────────────────────────
    const greeting = useMemo(() => {
        const firstName = fullName.split(' ')[0]?.trim();
        if (firstName) {
            return `What are you wearing today, ${firstName}?`;
        }
        return 'What are you wearing today?';
    }, [fullName]);

    // ── Generate & Sync Recommended Outfit ────────────────
    useEffect(() => {
        if (recentItems.length === 0) {
            setRecommendedOutfit([]);
            return;
        }
        const allExist = recommendedOutfit.length > 0 && recommendedOutfit.every(item => recentItems.some(ri => ri.id === item.id));
        if (!allExist || recommendedOutfit.length === 0) {
            const initialOutfit = generateSingleOutfit(recentItems, preferences, getDailySeed(), shownSignatures.current, shownCoreSignatures.current, shownItemCounts.current);
            setRecommendedOutfit(initialOutfit);
            if (initialOutfit.length > 0) {
                shownSignatures.current.add(getOutfitSignature(initialOutfit));
                shownCoreSignatures.current.add(getCoreSignature(initialOutfit));
                for (const item of initialOutfit) {
                    shownItemCounts.current[item.id] = (shownItemCounts.current[item.id] || 0) + 1;
                }
            }
        }
    }, [recentItems, preferences]);

    const recommendedOutfitMessage = useMemo(() => {
        if (recentItems.length === 0) return 'Your closet is empty. Add items!';
        if (recentItems.length === 1) return 'Only 1 item in closet. Add more for complete recommendations!';
        if (recommendedOutfit.length === 1) return 'Add more categories to get full outfits!';
        return recommendedOutfit.map(i => i.category).join(', ');
    }, [recentItems, recommendedOutfit]);

    // ── Wear This handler ─────────────────────────────────
    const handleWearThis = useCallback(() => {
        if (recommendedOutfit.length > 0) {
            const previewItems = recommendedOutfit.map(item => ({
                id: item.id,
                title: item.name,
                category: item.category,
                color: item.color || '',
                imageURL: item.image,
            }));
            navigation.navigate('preview', { items: previewItems, isSaved: false });
        } else {
            Alert.alert(
                'No Closet Items',
                'Add items to your closet to get outfit recommendations!',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Add Item', onPress: () => navigation.navigate('AddItemEditor') },
                ],
            );
        }
    }, [recommendedOutfit, navigation]);

    // ── Build Another handler ─────────────────────────────
    const handleBuildAnother = useCallback(() => {
        if (recentItems.length === 0) return;

        const newOutfit = generateSingleOutfit(recentItems, preferences, null, shownSignatures.current, shownCoreSignatures.current, shownItemCounts.current);
        setRecommendedOutfit(newOutfit);
        if (newOutfit.length > 0) {
            shownSignatures.current.add(getOutfitSignature(newOutfit));
            shownCoreSignatures.current.add(getCoreSignature(newOutfit));
            for (const item of newOutfit) {
                shownItemCounts.current[item.id] = (shownItemCounts.current[item.id] || 0) + 1;
            }
        }

        console.log('[Home] Build Another clicked. New outfit:', newOutfit.map(i => i.name));

        if (user && newOutfit.length > 0) {
            const newItemIds = newOutfit.map(i => i.id);
            upsertNotification(
                user.uid,
                'New Outfit Picked ✦',
                'We generated a fresh outfit pick for you. Tap to preview it now!',
                'recommendation',
                'preview',
                { itemIds: newItemIds }
            );
        }
    }, [recentItems, preferences, user]);

    // ── 2. Search Logic ─────────────────────────────────
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const searchAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);

    const toggleSearch = () => {
        if (searchVisible) {
            Keyboard.dismiss();
            Animated.timing(searchAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
                setSearchVisible(false);
                setSearchQuery('');
                setSearchResults([]);
            });
        } else {
            setSearchVisible(true);
            Animated.timing(searchAnim, { toValue: 1, duration: 220, useNativeDriver: false }).start(() => {
                inputRef.current?.focus();
            });
        }
    };

    const handleSearch = useCallback(async (text: string) => {
        setSearchQuery(text);
        if (!text.trim() || !user) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const snap = await getDocs(
                query(collection(db, 'closetItems'), where('userId', '==', user.uid))
            );
            const lower = text.toLowerCase();
            setSearchResults(
                snap.docs
                    .map(d => ({ id: d.id, ...d.data() }) as any)
                    .filter((i: any) =>
                        (i.title ?? '').toLowerCase().includes(lower) ||
                        (i.category ?? '').toLowerCase().includes(lower) ||
                        (i.color ?? '').toLowerCase().includes(lower)
                    )
            );
        } catch (e) {
            console.warn('[Home] search error:', e);
        } finally {
            setSearching(false);
        }
    }, [db, user]);

    const searchBarHeight = searchAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, 52],
    });

    // ── 3. Pull to Refresh ──────────────────────────────
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        try {
            // Simplified refresh - standard onSnapshot will update automatically, 
            // but we can force a manual re-fetch if needed for non-snap state.
        } finally {
            setRefreshing(false);
        }
    }, [user]);

    // ── 4. Render ───────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {photoURL ? (
                        <Image source={{ uri: photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, localStyles.avatarFallback]}>
                            <User size={18} color="#94A3B8" />
                        </View>
                    )}
                    <Text style={styles.headerText}>{greeting}</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={toggleSearch} activeOpacity={0.7}>
                        {searchVisible ? <X size={20} color="#2869BD" /> : <Search size={20} color="#0F1729" />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('notification')} activeOpacity={0.7}>
                        <View style={styles.notifWrapper}>
                            <Bell size={20} color="#1E293B" />
                            {hasUnread && <View style={styles.notifDot} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Animated Search Bar */}
            <Animated.View style={{ height: searchBarHeight, overflow: 'hidden', paddingHorizontal: 16 }}>
                <View style={localStyles.searchInputRow}>
                    <Search size={15} color="#94A3B8" />
                    <TextInput
                        ref={inputRef}
                        style={localStyles.searchInput}
                        placeholder="Search by name, category, color..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                        autoCorrect={false}
                    />
                    {searching && <ActivityIndicator size="small" color="#2869BD" />}
                </View>
            </Animated.View>

            {/* Search Results Overlay */}
            {searchVisible && searchQuery.trim() !== '' && (
                <View style={localStyles.searchOverlay}>
                    {searchResults.length === 0 && !searching ? (
                        <Text style={localStyles.searchEmpty}>No items found for "{searchQuery}"</Text>
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={i => i.id}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ padding: 16, gap: 12 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.searchCard}
                                    activeOpacity={0.85}
                                    onPress={() => { toggleSearch(); navigation.navigate('Closet'); }}
                                >
                                    {item.imageURL
                                        ? <Image source={{ uri: item.imageURL }} style={localStyles.searchCardImg} />
                                        : <View style={[localStyles.searchCardImg, { backgroundColor: '#E2E8F0' }]} />
                                    }
                                    <Text style={localStyles.searchCardTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={localStyles.searchCardSub}>{item.category}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}

            {/* Main Content */}
            {!(searchVisible && searchQuery.trim() !== '') && (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: getTabScreenBottomPadding(insets.bottom) },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Quick Fit Banner */}
                    <TouchableOpacity style={styles.quickFit} activeOpacity={0.8} onPress={() => navigation.navigate('AIChatScreen')}>
                        <View style={styles.quickFitLeft}>
                            <View style={styles.quickFitIcon}><Zap size={16} color="#fff" /></View>
                            <View>
                                <Text style={styles.quickFitTitle}>Quick Fit</Text>
                                <Text style={styles.quickFitSub}>Generate an outfit instantly with AI</Text>
                            </View>
                        </View>
                        <Sparkles size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Today's Pick Banner — Dynamic from closet */}
                    <TouchableOpacity
                        style={styles.todayPick}
                        activeOpacity={0.85}
                        onPress={handleWearThis}
                    >
                        <OutfitCollage images={recommendedOutfit.map(i => i.image)} />
                        <View style={styles.todayPickOverlay}>
                            <Text style={styles.todayPickLabel}>Today's Pick</Text>
                            <Text style={styles.todayPickTitle} numberOfLines={2}>
                                {recommendedOutfitMessage}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Wear / Build Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabBtn, styles.tabBtnActive]}
                            onPress={handleWearThis}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, styles.tabTextActive]}>Wear This</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.tabBtn}
                            onPress={handleBuildAnother}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.tabText}>Build Another</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Items */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Items</Text>
                            <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('Recentitems')}>
                                <Text style={styles.seeAllText}>See All</Text>
                                <ChevronRight size={14} color="#65758B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemsRow}>
                            {recentItems.length > 0 ? recentItems.slice(0, 5).map(item => (
                                <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.8} onPress={() => navigation.navigate('Closet')}>
                                    {item.image ? <Image source={{ uri: item.image }} style={styles.itemImage} /> : <View style={styles.itemImage} />}
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemCategory}>{item.category}</Text>
                                </TouchableOpacity>
                            )) : <Text style={localStyles.sectionEmptyText}>No recent items yet.</Text>}
                        </View>
                    </View>

                    {/* Recent Outfits - Prominent Single Card */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Outfit</Text>
                            <TouchableOpacity style={styles.seeAll} onPress={() => navigation.navigate('Outfits')}>
                                <Text style={styles.seeAllText}>See All</Text>
                                <ChevronRight size={14} color="#2869BD" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 20 }}>
                            {recentOutfits.length > 0 ? (() => {
                                const outfitImages = Object.values(recentOutfits[0].rawItemDetails || {}).map((detail: any) => detail.imageURL).filter(Boolean);
                                if (outfitImages.length === 0 && recentOutfits[0].image) {
                                    outfitImages.push(recentOutfits[0].image);
                                }
                                return (
                                    <View style={localStyles.singleOutfitCard}>
                                        <OutfitCollage images={outfitImages} style={localStyles.singleOutfitImg} />
                                        <View style={localStyles.singleOutfitInfo}>
                                            <Text style={localStyles.singleOutfitName}>{recentOutfits[0].name}</Text>
                                            <TouchableOpacity
                                                style={localStyles.viewLookBtn}
                                                onPress={() => {
                                                    const item = recentOutfits[0];
                                                    const itemsArray = Object.entries(item.rawItemDetails || {}).map(([id, detail]: [string, any]) => ({
                                                        id, title: detail.title, category: detail.category, color: detail.color, imageURL: detail.imageURL,
                                                    }));
                                                    navigation.navigate('preview', { items: itemsArray, isSaved: true, outfitId: item.id });
                                                }}
                                            >
                                                <Text style={localStyles.viewLookText}>View Look</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })() : <Text style={localStyles.sectionEmptyText}>No recent outfits yet.</Text>}
                        </View>
                    </View>

                    {/* Create Your Own */}
                    <TouchableOpacity style={styles.createBtn} activeOpacity={0.85} onPress={() => navigation.navigate('combine')}>
                        <Text style={styles.createBtnText}>Create Your Own</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    avatarFallback: { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
    searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 8 },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'InterRegular', color: '#1E293B' },
    searchOverlay: { flex: 1, backgroundColor: '#fff' },
    searchEmpty: { textAlign: 'center', padding: 40, color: '#94A3B8', fontSize: 14, fontFamily: 'InterRegular' },
    searchCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, overflow: 'hidden' },
    searchCardImg: { width: '100%', height: (SCREEN_W / 2) - 28 },
    searchCardTitle: { fontSize: 13, fontFamily: 'InterSemiBold', fontWeight: '600', color: '#1E293B', paddingHorizontal: 10, paddingTop: 8 },
    searchCardSub: { fontSize: 11, fontFamily: 'InterRegular', color: '#94A3B8', paddingHorizontal: 10, paddingBottom: 8 },
    sectionEmptyText: { width: '100%', fontSize: 13, color: '#94A3B8', fontFamily: 'InterRegular', paddingVertical: 6 },

    // Prominent Single Card Styles (Glassmorphism)
    singleOutfitCard: {
        width: '100%',
        height: 240,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    singleOutfitImg: {
        width: '100%',
        height: '100%',
    },
    singleOutfitInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderRadius: 18,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Border for glass effect
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    singleOutfitName: {
        fontSize: 15,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
        flex: 1,
        marginRight: 8,
    },
    viewLookBtn: {
        backgroundColor: '#0F1729',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    viewLookText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    generatingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        height: '100%',
        gap: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    generatingText: {
        fontSize: 14,
        fontFamily: 'InterMedium',
        color: '#64748B',
    },
});

export default HomeScreen;
