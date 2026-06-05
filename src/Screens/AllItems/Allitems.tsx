
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Flame, Shirt } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    increment,
    serverTimestamp,
    QueryDocumentSnapshot,
    DocumentData,
} from '../../firebase/firestore';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_W - 48) / 2;

// ─── Type ─────────────────────────────────────────────────────────────────────

type OutfitItem = {
    id: string;
    title: string;
    category: string;
    color: string;
    imageURL: string;
    createdAt: any;
    fireCount: number;
    rawItemDetails?: any;
};

// ─── Same mapper as OutfitScreen ──────────────────────────────────────────────

const mapOutfitDoc = (d: QueryDocumentSnapshot<DocumentData>): OutfitItem => {
    const data = d.data();
    const itemDetails = data.itemDetails || {};
    const firstKey = Object.keys(itemDetails)[0];
    const details = itemDetails[firstKey] || {};
    return {
        id: d.id,
        createdAt: data.createdAt,
        title: data.name || 'Outfit',
        category: details.category || data.occasion || 'Uncategorized',
        color: details.color || '',
        imageURL: details.imageURL || data.imageURL || '',
        fireCount: data.fireCount ?? 0,
        rawItemDetails: itemDetails,
    };
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const AllitemsScreen = () => {
    const navigation = useNavigation<any>();
    const db = getFirestore(getApp());
    const user = getAuth(getApp()).currentUser;

    const [items, setItems] = useState<OutfitItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [firedIds, setFiredIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        const fetchOutfits = async () => {
            try {
                const snap = await getDocs(
                    query(
                        collection(db, 'outfits'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    )
                );
                setItems(snap.docs.map(mapOutfitDoc));
            } catch (e) {
                console.warn('[AllitemsScreen]', e);
            } finally {
                setLoading(false);
            }
        };
        fetchOutfits();
    }, [db, user]);

    useEffect(() => {
        if (!user) return;
        const firesQuery = query(collection(db, 'outfitFires'), where('userId', '==', user.uid));
        return onSnapshot(firesQuery, snapshot => {
            setFiredIds(new Set(snapshot.docs.map(d => d.data().outfitId as string)));
        });
    }, [db, user]);

    const handleToggleFire = async (outfitId: string) => {
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
        } catch (error) {
            setItems(prev =>
                prev.map(item =>
                    item.id === outfitId
                        ? { ...item, fireCount: Math.max(0, (item.fireCount ?? 0) - delta) }
                        : item,
                ),
            );
            console.warn('[Allitems fire]', error);
        }
    };

    const renderItem = ({ item, index }: { item: OutfitItem; index: number }) => {
        const displayTitle = item.title === 'Outfit' ? `Outfit ${items.length - index}` : item.title;
        return (
            <TouchableOpacity
                style={s.card}
                activeOpacity={0.9}
                onPress={() => {
                    const itemsArray = Object.entries(item.rawItemDetails || {}).map(([id, detail]: [string, any]) => ({
                        id,
                        title: detail.title,
                        category: detail.category,
                        color: detail.color,
                        imageURL: detail.imageURL,
                    }));
                    navigation.navigate('preview', { items: itemsArray, isSaved: true });
                }}
            >
                {item.imageURL ? (
                    <Image source={{ uri: item.imageURL }} style={s.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[s.cardImage, s.cardFallback]}>
                        <Shirt size={28} color="#CBD5E1" />
                    </View>
                )}
                <View style={s.cardInfo}>
                    <Text style={s.cardTitle} numberOfLines={1}>{displayTitle}</Text>
                    <View style={s.metaRow}>
                        <Text style={s.cardMeta}>
                            {item.category}{item.color ? ` · ${item.color}` : ''}
                        </Text>
                        <TouchableOpacity
                            style={[s.fireBtn, firedIds.has(item.id) && s.fireBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => handleToggleFire(item.id)}
                        >
                            <Flame size={12} color={firedIds.has(item.id) ? '#EA580C' : '#FB923C'} fill={firedIds.has(item.id) ? '#EA580C' : 'transparent'} />
                            <Text style={s.fireText}>{item.fireCount ?? 0}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={s.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={s.backBtn}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color="#1E293B" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Recent Outfits</Text>
                <View style={{ width: 36 }} />
            </View>

            {loading ? (
                <View style={s.centered}>
                    <ActivityIndicator size="large" color="#2869BD" />
                </View>
            ) : items.length === 0 ? (
                <View style={s.centered}>
                    <Shirt size={48} color="#E2E8F0" />
                    <Text style={s.emptyText}>No outfits created yet</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={i => i.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={s.row}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={s.countText}>{items.length} outfits</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

// ─── Styles (self-contained, no external import needed) ───────────────────────

const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16, fontFamily: 'InterBold', fontWeight: '700', color: '#1E293B',
    },

    countText: {
        fontSize: 13, fontFamily: 'InterRegular', color: '#94A3B8',
        paddingHorizontal: 16, paddingBottom: 12,
    },
    listContent: {
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between', marginBottom: 16,
    },

    card: {
        width: CARD_SIZE, backgroundColor: '#F8FAFC',
        borderRadius: 14, overflow: 'hidden',
    },
    cardImage: {
        width: CARD_SIZE, height: CARD_SIZE * 1.15,
    },
    cardFallback: {
        backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center',
    },
    cardInfo: {
        paddingHorizontal: 10, paddingVertical: 8, gap: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 13, fontFamily: 'InterSemiBold', fontWeight: '600', color: '#1E293B',
    },
    cardMeta: {
        fontSize: 11, fontFamily: 'InterRegular', color: '#94A3B8',
    },
    fireBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF7ED',
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    fireBtnActive: {
        backgroundColor: '#FFEDD5',
    },
    fireText: {
        fontSize: 10,
        color: '#EA580C',
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14, fontFamily: 'InterRegular', color: '#94A3B8',
    },
});

export default AllitemsScreen;
