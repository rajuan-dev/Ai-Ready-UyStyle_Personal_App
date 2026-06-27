import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Pressable,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, X, Pencil } from 'lucide-react-native';
import { getApp } from '../../firebase/app';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, deleteDoc, updateDoc, increment } from '../../firebase/firestore';
import { useAuth } from '../../context';
import {
    logUnfavoriteLook,
    recordCrashlyticsError,
} from '../../services';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

// Memory cache for resolved favorites list
let favoritesCache: any[] | null = null;
// Cache for resolved individual closet items to avoid redundant getDocs
const resolvedClosetItemsCache = new Map<string, any>();

export const invalidateFavoriteLooksCache = (itemId?: string) => {
    if (itemId) {
        resolvedClosetItemsCache.delete(itemId);
    } else {
        resolvedClosetItemsCache.clear();
        favoritesCache = null;
    }
};

const FavoriteLooksScreen = ({ navigation }: any) => {
    const [favorites, setFavorites] = useState<any[]>(favoritesCache || []);
    const [loading, setLoading] = useState(!favoritesCache);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const db = getFirestore(getApp());
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;


        const q = query(collection(db, 'likes'), where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const sortedDocs = [...snapshot.docs].sort((a, b) => {
                    const aVal = a.data().createdAt;
                    const bVal = b.data().createdAt;
                    const aTime = aVal?.toMillis?.() || aVal?.seconds || 0;
                    const bTime = bVal?.toMillis?.() || bVal?.seconds || 0;
                    return bTime - aTime;
                });

                const promises = sortedDocs.map(async (d) => {
                    const likeData = d.data();
                    const itemId = likeData.itemId;
                    if (resolvedClosetItemsCache.has(itemId)) {
                        return resolvedClosetItemsCache.get(itemId);
                    }
                    const itemRef = doc(db, 'closetItems', itemId);
                    const itemSnap = await getDoc(itemRef);
                    if (itemSnap.exists()) {
                        const resolvedItem = {
                            id: itemSnap.id,
                            ...itemSnap.data()
                        };
                        resolvedClosetItemsCache.set(itemId, resolvedItem);
                        return resolvedItem;
                    }
                    return null;
                });

                const resolved = await Promise.all(promises);
                const favItems = resolved.filter((item): item is any => item !== null);
                favoritesCache = favItems;
                setFavorites(favItems);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [user, db]);

    const handleUnlike = useCallback(async (itemId: string) => {
        if (!user) return;

        // Optimistically remove from state so it disappears instantly
        setFavorites(prev => prev.filter(item => item.id !== itemId));

        try {
            const likeRef = doc(db, 'likes', `${user.uid}_${itemId}`);
            const itemRef = doc(db, 'closetItems', itemId);
            await deleteDoc(likeRef);
            await updateDoc(itemRef, {
                likeCount: increment(-1),
            });
            // ── Analytics
            logUnfavoriteLook();
        } catch (error) {
            console.error("Error unfavoriting:", error);
            recordCrashlyticsError(error, 'unfavorite_look');
        }
    }, [user, db]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.88}
            onPress={() => setSelectedItem(item)}
        >
            <Image source={{ uri: item.imageURL }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.meta}>{item.category} · {item.color}</Text>
            </View>
            <TouchableOpacity 
                style={styles.heartBadge}
                activeOpacity={0.8}
                onPress={() => handleUnlike(item.id)}
            >
                <Heart size={12} color="#ef4444" fill="#ef4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorite Looks</Text>
                <View style={styles.headerSpacer} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#2869BD" />
                </View>
            ) : favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No favorite items yet!</Text>
                </View>
            )}

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
                                        try {
                                            navigation.navigate('AddItemEditor', { initialItem: item });
                                        } catch {
                                            navigation.getParent()?.navigate('AddItemEditor', { initialItem: item });
                                        }
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
                                        try {
                                            navigation.navigate('combine', { initialItem: item });
                                        } catch {
                                            navigation.getParent()?.navigate('combine', { initialItem: item });
                                        }
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

export default FavoriteLooksScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    listContent: { padding: 15 },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        marginHorizontal: 5,
        overflow: 'hidden',
        elevation: 2,
    },
    image: { width: '100%', height: 180, resizeMode: 'cover' },
    info: { padding: 10 },
    title: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
    meta: { fontSize: 12, color: '#64748B', marginTop: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 14 },
    heartBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 12,
        padding: 4,
    },
    headerSpacer: {
        width: 24,
    }
});

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