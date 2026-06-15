import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    FlatList,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppAlert } from '../../context/AlertContext';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from '../../firebase/firestore';
import { styles } from './style';
import { getTabScreenBottomPadding } from '../../theme/layout';
import { OutfitCollage } from '../../components/OutfitCollage';

// --- Types ---
type OutfitItem = {
    id: string;
    title: string;
    category: string;
    color: string;
    imageURL: string;
    userId: string;
    createdAt?: any;
    fireCount: number;
    rawItemDetails?: any;
};

const PAGE_SIZE = 10;

// --- Helper: Firestore Data Mapper ---

const mapFirestoreDoc = (d: QueryDocumentSnapshot<DocumentData>): OutfitItem => {
    const data = d.data();
    const itemDetails = data.itemDetails || {};
    const firstKey = Object.keys(itemDetails)[0];
    const details = itemDetails[firstKey] || {};

    return {
        id: d.id,
        userId: data.userId,
        createdAt: data.createdAt,
        title: data.name || 'Outfit',
        category: details.category || 'Uncategorized',
        color: details.color || '',
        imageURL: details.imageURL || '',
        fireCount: data.fireCount ?? 0,
        rawItemDetails: itemDetails,
    };
};

// --- Sub-Components ---

const SkeletonCard = () => {
    const shimmer = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, [shimmer]);

    return (
        <Animated.View style={[styles.skeletonCard, { opacity: shimmer }]}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonTextBlock}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
        </Animated.View>
    );
};

const OutfitCard = React.memo(({ item, isActive, fired, onCardPress, onDelete, onOutfitPress, onToggleFire }: any) => {
    const xScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(xScale, {
            toValue: isActive ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
        }).start();
    }, [isActive, xScale]);

    const images = Object.values(item.rawItemDetails || {}).map((detail: any) => detail.imageURL).filter(Boolean);
    if (images.length === 0 && item.imageURL) {
        images.push(item.imageURL);
    }

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => isActive ? onOutfitPress?.(item) : onCardPress(item.id)}

        >
            <View style={[styles.card, isActive && styles.cardActive]}>
                <View style={styles.imageWrapper}>
                    <OutfitCollage images={images} />

                    <Animated.View style={[styles.deleteBadge, { transform: [{ scale: xScale }] }]}>
                        <TouchableOpacity style={styles.deleteBadgeInner} onPress={() => onDelete(item)}>
                            <X size={12} color="#fff" strokeWidth={3} />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={[styles.viewOverlay, { opacity: xScale }]} pointerEvents="none">
                        <View style={styles.viewBadge}>
                            <Text style={styles.viewBadgeText}>View Look</Text>
                        </View>
                    </Animated.View>
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.itemMetaRow}>
                        <Text style={styles.itemMeta} numberOfLines={1}>{item.category} • {item.color}</Text>
                        <TouchableOpacity
                            style={[styles.fireBtn, fired && styles.fireBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => onToggleFire(item.id)}
                        >
                            <Flame size={12} color={fired ? '#EA580C' : '#FB923C'} fill={fired ? '#EA580C' : 'transparent'} />
                            <Text style={styles.fireCount}>{item.fireCount ?? 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// --- Main Screen ---

const OutfitScreen: React.FC<{ onOutfitPress?: (item: OutfitItem) => void }> = ({ onOutfitPress }) => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const db = getFirestore(getApp());
    const user = getAuth().currentUser;

    const [items, setItems] = useState<OutfitItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [firedIds, setFiredIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

    // Initial Fetch (Real-time)
    const subscribe = useCallback(() => {
        if (!user) return;
        setError(null);
        setLoading(true);

        const q = query(
            collection(db, 'outfits'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(PAGE_SIZE)
        );

        unsubscribeRef.current = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(mapFirestoreDoc);
            setItems(docs);
            lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setError(null);
            setLoading(false);
        }, (err) => {
            console.warn('[OutfitScreen]', err);
            setError('Failed to load saved outfits. Please try again.');
            setLoading(false);
        });
    }, [db, user]);

    useEffect(() => {
        subscribe();
        return () => unsubscribeRef.current?.();
    }, [subscribe]);

    useEffect(() => {
        if (!user) return;
        const firesQuery = query(collection(db, 'outfitFires'), where('userId', '==', user.uid));
        return onSnapshot(firesQuery, snapshot => {
            setFiredIds(new Set(snapshot.docs.map(d => d.data().outfitId as string)));
        });
    }, [db, user]);

    // Pagination
    const loadMore = async () => {
        if (!user || !hasMore || loadingMore || !lastDocRef.current) return;
        setLoadingMore(true);
        try {
            const q = query(
                collection(db, 'outfits'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                startAfter(lastDocRef.current),
                limit(PAGE_SIZE)
            );
            const snapshot = await getDocs(q);
            const newDocs = snapshot.docs.map(mapFirestoreDoc);
            setItems(prev => [...prev, ...newDocs]);
            lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (err) {
            console.warn(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const { showConfirm, showSuccess, showError } = useAppAlert();

    const handleDelete = (item: OutfitItem) => {
        showConfirm(
            'Delete Outfit',
            `Are you sure you want to remove ${item.title}? This cannot be undone.`,
            async () => {
                try {
                    await deleteDoc(doc(db, 'outfits', item.id));
                    setItems(prev => prev.filter(i => i.id !== item.id));
                    setActiveCardId(null);
                    showSuccess('Deleted', `${item.title} has been removed.`);
                } catch (e) {
                    console.warn(e);
                    showError('Error', 'Failed to delete outfit. Please try again.');
                }
            }
        );
    };

    const handleToggleFire = useCallback(async (outfitId: string) => {
        if (!user) return;
        const isFired = firedIds.has(outfitId);
        const delta = isFired ? -1 : 1;

        setItems(prev =>
            prev.map(item =>
                item.id === outfitId
                    ? { ...item, fireCount: Math.max(0, (item.fireCount ?? 0) + delta) }
                    : item,
            ),
        );

        try {
            const fireRef = doc(db, 'outfitFires', `${user.uid}_${outfitId}`);
            const outfitRef = doc(db, 'outfits', outfitId);

            if (isFired) {
                await deleteDoc(fireRef);
                await updateDoc(outfitRef, { fireCount: increment(-1) });
            } else {
                await setDoc(fireRef, {
                    userId: user.uid,
                    outfitId,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(outfitRef, { fireCount: increment(1) });
            }
        } catch (err) {
            setItems(prev =>
                prev.map(item =>
                    item.id === outfitId
                        ? { ...item, fireCount: Math.max(0, (item.fireCount ?? 0) - delta) }
                        : item,
                ),
            );
            console.warn('[Outfit fire]', err);
        }
    }, [db, firedIds, user]);

    // Filter Logic
    const categories = useMemo(() => ['All', ...new Set(items.map(i => i.category))].sort(), [items]);
    const filteredItems = useMemo(() => selectedCategory === 'All' ? items : items.filter(i => i.category === selectedCategory), [items, selectedCategory]);

    return (
        <TouchableWithoutFeedback onPress={() => setActiveCardId(null)}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <Text style={styles.title}>Saved Outfits</Text>
                    <Text style={styles.subtitle}>
                        {loading ? 'Loading...' : `${filteredItems.length} items found`}
                    </Text>
                </View>

                {/* Category Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsRow}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {error ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>⚠️</Text>
                        <Text style={styles.emptyTitle}>Error Loading Outfits</Text>
                        <Text style={styles.emptySubtitle}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={subscribe}>
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : loading ? (
                    <View style={styles.skeletonGrid}>{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</View>
                ) : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: getTabScreenBottomPadding(insets.bottom) },
                            filteredItems.length === 0 && { flexGrow: 1, justifyContent: 'center', paddingBottom: 0 },
                        ]}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>👗</Text>
                                <Text style={styles.emptyTitle}>No Outfits Saved</Text>
                                <Text style={styles.emptySubtitle}>You haven't saved any looks yet. Head over to the Combine tab to build your first outfit!</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            const displayTitle = item.title === 'Outfit' ? `Outfit ${filteredItems.length - index}` : item.title;
                            return (
                                <OutfitCard
                                    item={{ ...item, title: displayTitle }}
                                    isActive={activeCardId === item.id}
                                    fired={firedIds.has(item.id)}
                                    onCardPress={setActiveCardId}
                                    onDelete={handleDelete}
                                    onOutfitPress={(outfitItem: OutfitItem) => {
                                        if (onOutfitPress) {
                                            onOutfitPress(outfitItem);
                                        } else {
                                            const itemsArray = Object.entries(outfitItem.rawItemDetails || {}).map(([id, detail]: [string, any]) => ({
                                                id,
                                                title: detail.title,
                                                category: detail.category,
                                                color: detail.color,
                                                imageURL: detail.imageURL,
                                            }));
                                            navigation.navigate('preview', { items: itemsArray, isSaved: true, outfitId: outfitItem.id });
                                        }
                                    }}
                                    onToggleFire={handleToggleFire}
                                />
                            );
                        }}
                        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 20 }} /> : null}
                    />
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default OutfitScreen;
