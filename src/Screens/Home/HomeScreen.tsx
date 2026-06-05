import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronRight, Search, Sparkles, Zap, X, User, Flame } from 'lucide-react-native';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
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
} from '../../firebase/firestore';
import { getTabScreenBottomPadding } from '../../theme/layout';

const { width: SCREEN_W } = Dimensions.get('window');

type RecentClosetItem = {
    id: string;
    name: string;
    category: string;
    image: string;
};

type RecentOutfit = {
    id: string;
    name: string;
    image: string;
    rawItemDetails?: any;
};

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'wear' | 'build'>('wear');
    const navigation = useNavigation<any>();

    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    const [recentItems, setRecentItems] = useState<RecentClosetItem[]>([]);
    const [recentOutfits, setRecentOutfits] = useState<RecentOutfit[]>([]);
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    // ── 1. Data Fetching ────────────────────────────────
    useEffect(() => {
        if (!user) return;

        // Profile Photo
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) setPhotoURL(snap.data()?.photoURL || null);
        });

        // Recent Items
        const itemsQuery = query(
            collection(db, 'closetItems'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5),
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
                    };
                }),
            );
        });

        // Recent Outfits (Limit to 1 as requested)
        const outfitsQuery = query(
            collection(db, 'outfits'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(1),
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

        return () => {
            unsubProfile();
            unsubItems();
            unsubOutfits();
        };
    }, [db, user]);

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
                    <Text style={styles.headerText}>What are you wearing today?</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={toggleSearch} activeOpacity={0.7}>
                        {searchVisible ? <X size={20} color="#2869BD" /> : <Search size={20} color="#0F1729" />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('notification')} activeOpacity={0.7}>
                        <View style={styles.notifWrapper}>
                            <Bell size={20} color="#1E293B" />
                            <View style={styles.notifDot} />
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

                    {/* Today's Pick Banner */}
                    <View style={styles.todayPick}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600' }} style={styles.todayPickImage} />
                        <View style={styles.todayPickOverlay}>
                            <Text style={styles.todayPickLabel}>Today's Pick</Text>
                            <Text style={styles.todayPickTitle}>Casual sunny{'\n'}day look</Text>
                        </View>
                    </View>

                    {/* Wear / Build Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity style={[styles.tabBtn, activeTab === 'wear' && styles.tabBtnActive]} onPress={() => setActiveTab('wear')} activeOpacity={0.8}>
                            <Text style={[styles.tabText, activeTab === 'wear' && styles.tabTextActive]}>Wear This</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tabBtn, activeTab === 'build' && styles.tabBtnActive]} onPress={() => navigation.navigate('combine')} activeOpacity={0.8}>
                            <Text style={[styles.tabText, activeTab === 'build' && styles.tabTextActive]}>Build Another</Text>
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
                            {recentItems.length > 0 ? recentItems.map(item => (
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
                            {recentOutfits.length > 0 ? (
                                <View style={localStyles.singleOutfitCard}>
                                    <Image source={{ uri: recentOutfits[0].image }} style={localStyles.singleOutfitImg} resizeMode="cover" />
                                    <View style={localStyles.singleOutfitInfo}>
                                        <Text style={localStyles.singleOutfitName}>{recentOutfits[0].name}</Text>
                                        <TouchableOpacity
                                            style={localStyles.viewLookBtn}
                                            onPress={() => {
                                                const item = recentOutfits[0];
                                                const itemsArray = Object.entries(item.rawItemDetails || {}).map(([id, detail]: [string, any]) => ({
                                                    id, title: detail.title, category: detail.category, color: detail.color, imageURL: detail.imageURL,
                                                }));
                                                navigation.navigate('preview', { items: itemsArray, isSaved: true });
                                            }}
                                        >
                                            <Text style={localStyles.viewLookText}>View Look</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : <Text style={localStyles.sectionEmptyText}>No recent outfits yet.</Text>}
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
});

export default HomeScreen;
