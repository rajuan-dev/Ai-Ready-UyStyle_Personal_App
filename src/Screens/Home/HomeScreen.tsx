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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronRight, Search, Sparkles, Zap, X, User } from 'lucide-react-native';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
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
} from '@react-native-firebase/firestore';

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
    const [activeTab, setActiveTab] = useState<'wear' | 'build'>('wear');
    const navigation = useNavigation<any>();

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;
    const [recentItems, setRecentItems] = useState<RecentClosetItem[]>([]);
    const [recentOutfits, setRecentOutfits] = useState<RecentOutfit[]>([]);

    // ── 1. Real-time profile photo ──────────────────────
    const [photoURL, setPhotoURL] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(
            doc(db, 'users', user.uid),
            (snap) => {
                if (snap.exists()) setPhotoURL(snap.data()?.photoURL || null);
            }
        );
        return () => unsub();
    }, [db, user]);

    useEffect(() => {
        if (!user) return;

        const itemsQuery = query(
            collection(db, 'closetItems'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5),
        );
        const outfitsQuery = query(
            collection(db, 'outfits'),
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
        }, error => {
            console.warn('[Home] recent items error:', error);
            setRecentItems([]);
        });

        const unsubOutfits = onSnapshot(outfitsQuery, snapshot => {
            setRecentOutfits(
                snapshot.docs.map(d => {
                    const data = d.data() as any;
                    const itemDetails = data.itemDetails || {};
                    const firstKey = Object.keys(itemDetails)[0];
                    const details = firstKey ? itemDetails[firstKey] : null;
                    return {
                        id: d.id,
                        name: details?.title || data.name || 'Untitled outfit',
                        image: details?.imageURL || data.imageURL || '',
                        rawItemDetails: itemDetails,
                    };
                }),
            );
        }, error => {
            console.warn('[Home] recent outfits error:', error);
            setRecentOutfits([]);
        });

        return () => {
            unsubItems();
            unsubOutfits();
        };
    }, [db, user]);

    // ── 2. Search state ─────────────────────────────────
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery,   setSearchQuery]   = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching,     setSearching]     = useState(false);
    const searchAnim = useRef(new Animated.Value(0)).current;
    const inputRef   = useRef<TextInput>(null);

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
                        (i.title    ?? '').toLowerCase().includes(lower) ||
                        (i.category ?? '').toLowerCase().includes(lower) ||
                        (i.color    ?? '').toLowerCase().includes(lower)
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

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        if (!user) return;
        setRefreshing(true);
        try {
            const itemsQuery = query(
                collection(db, 'closetItems'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(5),
            );
            const outfitsQuery = query(
                collection(db, 'outfits'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(5),
            );

            const [itemsSnap, outfitsSnap] = await Promise.all([
                getDocs(itemsQuery),
                getDocs(outfitsQuery),
            ]);

            setRecentItems(
                itemsSnap.docs.map(d => {
                    const data = d.data() as any;
                    return {
                        id: d.id,
                        name: data.title || 'Untitled item',
                        category: data.category || 'Uncategorized',
                        image: data.imageURL || '',
                    };
                })
            );

            setRecentOutfits(
                outfitsSnap.docs.map(d => {
                    const data = d.data() as any;
                    const itemDetails = data.itemDetails || {};
                    const firstKey = Object.keys(itemDetails)[0];
                    const details = firstKey ? itemDetails[firstKey] : null;
                    return {
                        id: d.id,
                        name: details?.title || data.name || 'Untitled outfit',
                        image: details?.imageURL || data.imageURL || '',
                    };
                })
            );
        } catch (e) {
            console.warn('[Home] pull to refresh error:', e);
        } finally {
            setRefreshing(false);
        }
    }, [db, user]);

    // ── Render ───────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header — only avatar + icons changed */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>

                    {/* ✅ Dynamic avatar from Firebase */}
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

                    {/* ✅ Search toggle */}
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={toggleSearch}
                        activeOpacity={0.7}
                    >
                        {searchVisible
                            ? <X size={20} color="#2869BD" />
                            : <Search size={20} color="#0F1729" />
                        }
                    </TouchableOpacity>

                    {/* ✅ Bell → notification screen */}
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate('notification')}
                        activeOpacity={0.7}
                    >
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

            {/* Search Results */}
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
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.searchCard}
                                    activeOpacity={0.85}
                                    onPress={() => { toggleSearch(); navigation.navigate('closet'); }}
                                >
                                    {item.imageURL
                                        ? <Image source={{ uri: item.imageURL }} style={localStyles.searchCardImg} />
                                        : <View style={[localStyles.searchCardImg, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]} />
                                    }
                                    <Text style={localStyles.searchCardTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={localStyles.searchCardSub}>{item.category}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}

            {/* ── Main Content (100% unchanged from original) ── */}
            {!(searchVisible && searchQuery.trim() !== '') && (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2869BD']}
                            tintColor="#2869BD"
                        />
                    }
                >
                    {/* Quick Fit Banner */}
                    <TouchableOpacity
                        style={styles.quickFit}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('AIChatScreen')}
                    >
                        <View style={styles.quickFitLeft}>
                            <View style={styles.quickFitIcon}>
                                <Zap size={16} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.quickFitTitle}>Quick Fit</Text>
                                <Text style={styles.quickFitSub}>Generate an outfit instantly with AI</Text>
                            </View>
                        </View>
                        <Sparkles size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Today's Pick Banner */}
                    <View style={styles.todayPick}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600' }}
                            style={styles.todayPickImage}
                        />
                        <View style={styles.todayPickOverlay}>
                            <Text style={styles.todayPickLabel}>Today's Pick</Text>
                            <Text style={styles.todayPickTitle}>Casual sunny{'\n'}day look</Text>
                        </View>
                    </View>

                    {/* Wear / Build Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'wear' && styles.tabBtnActive]}
                            onPress={() => setActiveTab('wear')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, activeTab === 'wear' && styles.tabTextActive]}>
                                Wear This
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'build' && styles.tabBtnActive]}
                            onPress={() => navigation.navigate('combine')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, activeTab === 'build' && styles.tabTextActive]}>
                                Build Another
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Items */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Items</Text>
                            <TouchableOpacity
                                style={styles.seeAll}
                                onPress={() => navigation.navigate('Recentitems')}
                            >
                                <Text style={styles.seeAllText}>See All</Text>
                                <ChevronRight size={14} color="#65758B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemsRow}>
                            {recentItems.length > 0 ? recentItems.map(item => (
                                <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.8}>
                                    {item.image
                                        ? <Image source={{ uri: item.image }} style={styles.itemImage} />
                                        : <View style={styles.itemImage} />
                                    }
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemCategory}>{item.category}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={localStyles.sectionEmptyText}>No recent items yet.</Text>
                            )}
                        </View>
                    </View>

                    {/* Recent Outfits */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Outfits</Text>
                            <TouchableOpacity
                                style={styles.seeAll}
                                onPress={() => navigation.navigate('outfits')}
                            >
                                <Text style={styles.seeAllText}>See All</Text>
                                <ChevronRight size={14} color="#2869BD" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.itemsRow}>
                            {recentOutfits.length > 0 ? recentOutfits.map(item => (
                                <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.8}>
                                    {item.image
                                        ? <Image source={{ uri: item.image }} style={styles.itemImage} />
                                        : <View style={styles.itemImage} />
                                    }
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={localStyles.sectionEmptyText}>No recent outfits yet.</Text>
                            )}
                        </View>
                    </View>

                    {/* Create Your Own */}
                    <TouchableOpacity
                        style={styles.createBtn}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('combine')}
                    >
                        <Text style={styles.createBtnText}>Create Your Own</Text>
                    </TouchableOpacity>

                </ScrollView>
            )}
        </SafeAreaView>
    );
};

// ─── Local styles ─────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
    avatarFallback: {
        backgroundColor: '#E2E8F0',
        alignItems:      'center',
        justifyContent:  'center',
    },
    searchInputRow: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:                8,
        backgroundColor:   '#F3F4F6',
        borderRadius:       12,
        paddingHorizontal: 14,
        height:             44,
        marginBottom:        8,
    },
    searchInput: {
        flex:       1,
        fontSize:   14,
        fontFamily: 'InterRegular',
        color:      '#1E293B',
    },
    searchOverlay: {
        flex:            1,
        backgroundColor: '#fff',
    },
    searchEmpty: {
        textAlign:  'center',
        padding:     40,
        color:      '#94A3B8',
        fontSize:    14,
        fontFamily: 'InterRegular',
    },
    searchCard: {
        flex:            1,
        backgroundColor: '#F8FAFC',
        borderRadius:    12,
        overflow:        'hidden',
    },
    searchCardImg: {
        width:  '100%',
        height: (SCREEN_W / 2) - 28,
    },
    searchCardTitle: {
        fontSize:          13,
        fontFamily:        'InterSemiBold',
        fontWeight:        '600',
        color:             '#1E293B',
        paddingHorizontal: 10,
        paddingTop:         8,
    },
    searchCardSub: {
        fontSize:          11,
        fontFamily:        'InterRegular',
        color:             '#94A3B8',
        paddingHorizontal: 10,
        paddingBottom:      8,
    },
    sectionEmptyText: {
        width: '100%',
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: 'InterRegular',
        paddingVertical: 6,
    },
});

export default HomeScreen;
