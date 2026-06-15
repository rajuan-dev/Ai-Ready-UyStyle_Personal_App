

import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    TouchableOpacity,
    Image,
    TextInput,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Animated,
    Modal,
    ScrollView,
    BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Grid3x3,
    List,
    SlidersHorizontal,
    Search,
    ShoppingBag,
    Heart,
    X,
    Pencil,
    ArrowLeft,
} from 'lucide-react-native';
import { styles } from './style';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context';
import { getApp } from '../../firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    limit,
    doc,
    setDoc,
    deleteDoc,
    increment,
    updateDoc,
} from '../../firebase/firestore';
import { getTabScreenBottomPadding } from '../../theme/layout';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE  = 10;
const CARD_GAP   = 12;
const SCREEN_W   = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_W - 32 - CARD_GAP) / 2;

// ─── Types ────────────────────────────────────────────────────────────────────
export type ClosetItem = {
    id:        string;
    title:     string;
    category:  string;
    color:     string;
    imageURL:  string;
    userId:    string;
    createdAt: any;
    likeCount: number;
};


interface HeartButtonProps {
    itemId:   string;
    liked:    boolean;
    onToggle: (id: string) => void;
}

const HeartButton: React.FC<HeartButtonProps> = ({ itemId, liked, onToggle }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 50, bounciness: 12 }),
            Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 30 }),
        ]).start();
        onToggle(itemId);
    };

    return (
        <TouchableOpacity
            style={likeStyles.wrapper}
            onPress={handlePress}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <Heart
                    size={18}
                    color={liked ? '#ef4444' : '#fff'}
                    fill={liked ? '#ef4444' : 'transparent'}
                    strokeWidth={2}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

// ─── ItemCard ─────
interface ItemCardProps {
    item:     ClosetItem;
    liked:    boolean;
    onToggle: (id: string) => void;
    onPress:  (item: ClosetItem) => void;
    viewMode: 'grid' | 'list';
}

const ItemCard: React.FC<ItemCardProps> = React.memo(({ item, liked, onToggle, onPress, viewMode }) => {
    const count = item.likeCount ?? 0;
    const isList = viewMode === 'list';
    return (
        <TouchableOpacity 
            style={isList ? listCardStyles.card : cardStyles.card} 
            activeOpacity={0.88}
            onPress={() => onPress(item)}
        >
            <View style={isList ? listCardStyles.imageWrapper : cardStyles.imageWrapper}>
                <Image
                    source={{ uri: item.imageURL }}
                    style={isList ? listCardStyles.image : cardStyles.image}
                    resizeMode="cover"
                />
                <HeartButton itemId={item.id} liked={liked} onToggle={onToggle} />
            </View>
            <View style={isList ? listCardStyles.info : cardStyles.info}>
                <Text style={isList ? listCardStyles.title : cardStyles.title} numberOfLines={1}>{item.title}</Text>
                <View style={isList ? listCardStyles.metaRow : cardStyles.metaRow}>
                    <Text style={isList ? listCardStyles.meta : cardStyles.meta} numberOfLines={1}>
                        {item.category ?? '—'} · {item.color ?? '—'}
                    </Text>
                    <View style={isList ? listCardStyles.badge : cardStyles.badge}>
                        <Heart size={10} color="#ef4444" fill="#ef4444" strokeWidth={0} />
                        <Text style={isList ? listCardStyles.badgeText : cardStyles.badgeText}>
                            {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ─── ClosetScreen ─────────────────────────────────────────────────────────────
const ClosetScreen = () => {
    const insets = useSafeAreaInsets();

    const [items,            setItems]            = useState<ClosetItem[]>([]);
    const [likedIds,         setLikedIds]         = useState<Set<string>>(new Set());
    const [loading,          setLoading]          = useState(true);
    const [loadingMore,      setLoadingMore]      = useState(false);
    const [hasMore,          setHasMore]          = useState(true);
    const [pageSize,         setPageSize]         = useState(PAGE_SIZE);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchText,       setSearchText]       = useState('');
    const [selectedItem,     setSelectedItem]     = useState<ClosetItem | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterColors,       setFilterColors]       = useState<string[]>([]);
    const [viewMode,           setViewMode]           = useState<'grid' | 'list'>('grid');

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const app  = getApp();
    const db   = getFirestore(app);
    const { user } = useAuth();

    // Handle back redirection to Profile when navigated from Profile stats card
    useEffect(() => {
        if (route.params?.fromProfile) {
            const onBackPress = () => {
                navigation.navigate('Profile');
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }
    }, [route.params?.fromProfile, navigation]);

    // Clear the fromProfile param on blur so subsequent entries to Closet don't carry back behavior
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            if (route.params?.fromProfile) {
                navigation.setParams({ fromProfile: undefined });
            }
        });
        return unsubscribe;
    }, [navigation, route.params?.fromProfile]);


    useEffect(() => {
        if (!user) return;

        pageSize > PAGE_SIZE ? setLoadingMore(true) : setLoading(true);

        const q = query(
            collection(db, 'closetItems'),
            where('userId', '==', user.uid),
            limit(pageSize),
        );

        const unsub = onSnapshot(
            q,
            snap => {
                const data: ClosetItem[] = snap.docs
                    .map(d => ({ id: d.id, likeCount: 0, ...d.data() } as ClosetItem))
                 
                    .sort((a, b) =>
                        (b.createdAt?.toMillis?.() ?? 0) -
                        (a.createdAt?.toMillis?.() ?? 0),
                    );

                setItems(data);
                setHasMore(snap.docs.length === pageSize);
                setLoading(false);
                setLoadingMore(false);
            },
            err => {
                console.error('ClosetScreen snapshot:', err);
                setLoading(false);
                setLoadingMore(false);
            },
        );

        return () => unsub();
    }, [db, user, pageSize]);

    // ── 2. Real-time likes listener ───────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(
            query(collection(db, 'likes'), where('userId', '==', user.uid)),
            snap => setLikedIds(new Set(snap.docs.map(d => d.data().itemId as string))),
        );
        return () => unsub();
    }, [db, user]);


    const categoryTabs = useMemo(() => {
        const unique = Array.from(
            new Set(items.map(i => i.category).filter(Boolean)),
        ).sort();
        return ['All', ...unique];
    }, [items]);


    useEffect(() => {
        if (selectedCategory !== 'All' && !categoryTabs.includes(selectedCategory)) {
            setSelectedCategory('All');
        }
    }, [categoryTabs, selectedCategory]);

    // ── 4. Client-side filter 
    const filteredItems = useMemo(() =>
        items.filter(item => {
            const matchCat    = selectedCategory === 'All' || item.category === selectedCategory;
            const s           = searchText.toLowerCase().trim();
            const matchSearch =
                !s ||
                (item.title    ?? '').toLowerCase().includes(s) ||
                (item.color    ?? '').toLowerCase().includes(s) ||
                (item.category ?? '').toLowerCase().includes(s);
            const matchColor  =
                filterColors.length === 0 ||
                filterColors.some(fc => (item.color ?? '').toLowerCase() === fc.toLowerCase());
            return matchCat && matchSearch && matchColor;
        }),
    [items, selectedCategory, searchText, filterColors]);

    // ── Available colors from closet data for filter modal ─────────────────────
    const availableColors = useMemo(() => {
        const unique = Array.from(
            new Set(items.map(i => i.color).filter(Boolean)),
        ).sort();
        return unique;
    }, [items]);

    const toggleFilterColor = (color: string) => {
        setFilterColors(prev =>
            prev.includes(color)
                ? prev.filter(c => c !== color)
                : [...prev, color],
        );
    };

    const clearFilters = () => {
        setFilterColors([]);
        setSelectedCategory('All');
        setFilterModalVisible(false);
    };

    const activeFilterCount = filterColors.length + (selectedCategory !== 'All' ? 1 : 0);

    // ── 5. Pagination + refresh ───────────────────────────────────────────────
    const loadMore       = useCallback(() => {
        if (!hasMore || loadingMore || loading) return;
        setPageSize(p => p + PAGE_SIZE);
    }, [hasMore, loadingMore, loading]);

    const handleRefresh  = useCallback(() => setPageSize(PAGE_SIZE), []);

    // ── 6. Like / Unlike 
    const handleToggleLike = useCallback(async (itemId: string) => {
        if (!user) return;
        const isLiked = likedIds.has(itemId);
        const delta   = isLiked ? -1 : 1;

        const targetItem = items.find(i => i.id === itemId);
        const imageURL   = targetItem?.imageURL || '';

        // Optimistic update
        setItems(prev =>
            prev.map(i =>
                i.id === itemId
                    ? { ...i, likeCount: Math.max(0, (i.likeCount ?? 0) + delta) }
                    : i,
            ),
        );

        try {
            const likeRef = doc(db, 'likes',      `${user.uid}_${itemId}`);
            const itemRef = doc(db, 'closetItems', itemId);
            if (isLiked) {
                await deleteDoc(likeRef);
                await updateDoc(itemRef, { likeCount: increment(-1) });
            } else {
                await setDoc(likeRef, { userId: user.uid, itemId, createdAt: new Date(), imageURL });
                await updateDoc(itemRef, { likeCount: increment(1) });
            }
        } catch (err) {
            // Rollback on failure
            setItems(prev =>
                prev.map(i =>
                    i.id === itemId
                        ? { ...i, likeCount: Math.max(0, (i.likeCount ?? 0) - delta) }
                        : i,
                ),
            );
            console.error('Like error:', err);
        }
    }, [user, likedIds, db, items]);

    // ── Render helpers
    const renderItem = useCallback(
        ({ item }: { item: ClosetItem }) => (
            <ItemCard 
                item={item} 
                liked={likedIds.has(item.id)} 
                onToggle={handleToggleLike} 
                onPress={setSelectedItem}
                viewMode={viewMode}
            />
        ),
        [likedIds, handleToggleLike, viewMode],
    );

    const keyExtractor = useCallback((item: ClosetItem) => item.id, []);

    const renderChip = useCallback(
        ({ item: cat }: { item: string }) => (
            <TouchableOpacity
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
            >
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                    {cat}
                </Text>
            </TouchableOpacity>
        ),
        [selectedCategory],
    );

    const renderFooter = useCallback(() =>
        loadingMore ? (
            <View style={footerStyles.loader}>
                <ActivityIndicator size="small" color="#0F1729" />
                <Text style={footerStyles.text}>Loading more…</Text>
            </View>
        ) : null,
    [loadingMore]);

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconWrapper}>
                <ShoppingBag size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>
                {searchText || selectedCategory !== 'All'
                    ? 'No items found'
                    : 'Your closet is empty'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {searchText || selectedCategory !== 'All'
                    ? 'Try a different search or category'
                    : 'Tap + to add your first item'}
            </Text>
        </View>
    ), [searchText, selectedCategory]);

    // ── Full-screen initial load ───────────────────────────────────────────────
    if (loading && items.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0F1729" />
                    <Text style={styles.loadingText}>Loading your closet…</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeftRow}>

                    <View>
                        <Text style={styles.title}>My Closet</Text>
                        <Text style={styles.subtitle}>{filteredItems.length} items</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                        activeOpacity={0.7}
                    >
                        {viewMode === 'grid' ? (
                            <Grid3x3 size={20} color="#1E293B" />
                        ) : (
                            <List size={20} color="#1E293B" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconBtn, activeFilterCount > 0 && filterBtnStyles.activeBtn]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <SlidersHorizontal size={20} color={activeFilterCount > 0 ? '#fff' : '#1E293B'} />
                        {activeFilterCount > 0 && (
                            <View style={filterBtnStyles.badge}>
                                <Text style={filterBtnStyles.badgeText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <Search size={16} color="#65758B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, color, category..."
                    placeholderTextColor="#94A3B8"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Dynamic category chips */}
            <FlatList
                data={categoryTabs}
                keyExtractor={cat => cat}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
                style={styles.chipsScroll}
                renderItem={renderChip}
            />

            {/* Items grid */}
            <FlatList<ClosetItem>
                key={viewMode}
                data={filteredItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                numColumns={viewMode === 'grid' ? 2 : 1}
                columnWrapperStyle={viewMode === 'grid' ? gridStyles.columnWrapper : undefined}
                contentContainerStyle={[
                    gridStyles.content,
                    { paddingBottom: getTabScreenBottomPadding(insets.bottom) },
                    filteredItems.length === 0 && gridStyles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                onRefresh={handleRefresh}
                refreshing={loading && pageSize === PAGE_SIZE}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                removeClippedSubviews
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
            />

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <Pressable
                    style={filterModalStyles.overlay}
                    onPress={() => setFilterModalVisible(false)}
                />
                <View style={filterModalStyles.sheet}>
                    <View style={filterModalStyles.handle} />
                    <View style={filterModalStyles.headerRow}>
                        <Text style={filterModalStyles.title}>Filter Items</Text>
                        <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Category Filter */}
                        <View style={filterModalStyles.section}>
                            <Text style={filterModalStyles.sectionTitle}>Category</Text>
                            <View style={filterModalStyles.chipRow}>
                                {categoryTabs.map(cat => {
                                    const isSelected = selectedCategory === cat;
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                filterModalStyles.chip,
                                                isSelected && filterModalStyles.chipSelected,
                                            ]}
                                            onPress={() => setSelectedCategory(cat)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                filterModalStyles.chipText,
                                                isSelected && filterModalStyles.chipTextSelected,
                                            ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Color Filter */}
                        {availableColors.length > 0 && (
                            <View style={filterModalStyles.section}>
                                <Text style={filterModalStyles.sectionTitle}>Color</Text>
                                <View style={filterModalStyles.chipRow}>
                                    {availableColors.map(color => {
                                        const isSelected = filterColors.includes(color);
                                        return (
                                            <TouchableOpacity
                                                key={color}
                                                style={[
                                                    filterModalStyles.chip,
                                                    isSelected && filterModalStyles.chipSelected,
                                                ]}
                                                onPress={() => toggleFilterColor(color)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[
                                                    filterModalStyles.chipText,
                                                    isSelected && filterModalStyles.chipTextSelected,
                                                ]}>
                                                    {color}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom Actions */}
                    <View style={filterModalStyles.actions}>
                        <TouchableOpacity
                            style={filterModalStyles.clearBtn}
                            onPress={clearFilters}
                        >
                            <Text style={filterModalStyles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={filterModalStyles.applyBtn}
                            onPress={() => setFilterModalVisible(false)}
                        >
                            <Text style={filterModalStyles.applyText}>
                                Show Results ({filteredItems.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {selectedItem && (
                <View style={modalStyles.overlay}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setSelectedItem(null)}
                    />
                    <Animated.View style={modalStyles.content}>
                        <TouchableOpacity
                            style={modalStyles.closeBtn}
                            onPress={() => setSelectedItem(null)}
                        >
                            <X size={20} color="#0F1729" />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: selectedItem.imageURL }}
                            style={modalStyles.image}
                            resizeMode="cover"
                        />
                        <View style={modalStyles.info}>
                            <Text style={modalStyles.title}>{selectedItem.title}</Text>
                            <Text style={modalStyles.meta}>
                                {selectedItem.category} • {selectedItem.color}
                            </Text>

                            <View style={modalStyles.stats}>
                                <Heart size={16} color="#ef4444" fill="#ef4444" />
                                <Text style={modalStyles.statsText}>
                                    {selectedItem.likeCount || 0} Likes
                                </Text>
                            </View>

                            <View style={modalStyles.actionRow}>
                                        <TouchableOpacity
                                            style={modalStyles.editBtn}
                                            onPress={() => {
                                                const item = selectedItem;
                                                setSelectedItem(null);
                                                navigation.getParent()?.navigate('AddItemEditor', {
                                                    initialItem: item,
                                                });
                                            }}
                                        >
                                    <Pencil size={16} color="#0F1729" />
                                    <Text style={modalStyles.editBtnText}>Edit Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={modalStyles.outfitBtn}
                                    onPress={() => {
                                        const item = selectedItem;
                                        setSelectedItem(null);
                                        navigation.navigate('combine', { initialItem: item });
                                    }}
                                >
                                    <Text style={modalStyles.outfitBtnText}>Create Outfit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            )}
        </SafeAreaView>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 1000,
        elevation: 1000,
    },
    content: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 8,
    },
    image: {
        width: '100%',
        height: 280,
        backgroundColor: '#f1f5f9',
    },
    info: {
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F1729',
        marginBottom: 4,
    },
    meta: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    statsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F1729',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F1729',
    },
    outfitBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#0F1729',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outfitBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ClosetScreen;

// ─── Local styles 
const cardStyles = StyleSheet.create({
    card: {
        width:           CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius:    16,
        overflow:        'hidden',
        shadowColor:     '#1e293b',
        shadowOffset:    { width: 0, height: 2 },
        shadowOpacity:   0.07,
        shadowRadius:    8,
        elevation:       3,
        marginBottom:    CARD_GAP,
    },
    imageWrapper: {
        width:           '100%',
        height:          CARD_WIDTH,
        backgroundColor: '#f1f5f9',
    },
    image:   { width: '100%', height: '100%' },
    info: {
        paddingHorizontal: 10,
        paddingTop:        8,
        paddingBottom:     10,
    },
    title: {
        fontSize:     13,
        fontWeight:   '600',
        color:        '#0f172a',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
    },
    meta: {
        fontSize:    11,
        color:       '#94a3b8',
        fontWeight:  '400',
        flexShrink:  1,
        marginRight: 6,
    },
    badge: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               3,
        backgroundColor:   '#fef2f2',
        borderRadius:      99,
        paddingHorizontal: 6,
        paddingVertical:   2,
    },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
});

const listCardStyles = StyleSheet.create({
    card: {
        width:           '100%',
        backgroundColor: '#fff',
        borderRadius:    16,
        overflow:        'hidden',
        shadowColor:     '#1e293b',
        shadowOffset:    { width: 0, height: 2 },
        shadowOpacity:   0.07,
        shadowRadius:    8,
        elevation:       3,
        marginBottom:    CARD_GAP,
        flexDirection:   'row',
        padding:         10,
        alignItems:      'center',
    },
    imageWrapper: {
        width:           90,
        height:          90,
        borderRadius:    12,
        backgroundColor: '#f1f5f9',
        overflow:        'hidden',
        position:        'relative',
    },
    image:   { width: '100%', height: '100%' },
    info: {
        flex:              1,
        paddingHorizontal: 16,
        justifyContent:    'center',
    },
    title: {
        fontSize:     15,
        fontWeight:   '600',
        color:        '#0f172a',
        marginBottom: 6,
        fontFamily:   'InterSemiBold',
    },
    metaRow: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginTop:      4,
    },
    meta: {
        fontSize:    13,
        color:       '#64748B',
        fontWeight:  '400',
        fontFamily:  'InterRegular',
        flexShrink:  1,
        marginRight: 6,
    },
    badge: {
        flexDirection:     'row',
        alignItems:        'center',
        gap:               3,
        backgroundColor:   '#fef2f2',
        borderRadius:      99,
        paddingHorizontal: 8,
        paddingVertical:   4,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#ef4444', fontFamily: 'InterMedium' },
});

const likeStyles = StyleSheet.create({
    wrapper: {
        position:        'absolute',
        top:             8,
        right:           8,
        backgroundColor: 'rgba(0,0,0,0.28)',
        borderRadius:    20,
        padding:         7,
    },
});

const gridStyles = StyleSheet.create({
    columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 16 },
    content:       { paddingTop: 12, paddingBottom: 140 },
    emptyContent:  { flexGrow: 1 },
});

const footerStyles = StyleSheet.create({
    loader: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    text: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
});

const filterBtnStyles = StyleSheet.create({
    activeBtn: {
        backgroundColor: '#2869BD',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
});

const filterModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 34,
        maxHeight: '60%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'InterBold',
        color: '#0F1729',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
        color: '#1E293B',
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    chipSelected: {
        backgroundColor: '#EBF1FB',
        borderColor: '#2869BD',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'InterMedium',
        color: '#565E74',
    },
    chipTextSelected: {
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
        color: '#2869BD',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    clearBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
        color: '#64748B',
    },
    applyBtn: {
        flex: 1.6,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#0F1729',
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
        color: '#fff',
    },
});
