
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
import { ArrowLeft, Shirt } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    QueryDocumentSnapshot,
    DocumentData,
} from '@react-native-firebase/firestore';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_W - 48) / 2;

// ─── Type ─────────────────────────────────────────────────────────────────────

type closetItems= {
    id:        string;
    title:     string;
    category:  string;
    color:     string;
    imageURL:  string;
    createdAt: any;
};

const mapClosetDoc = (d: QueryDocumentSnapshot<DocumentData>): closetItems=> {
    const data = d.data();
    return {
        id:        d.id,
        createdAt: data.createdAt,
        title:     data.title    || 'Untitled',
        category:  data.category || 'Uncategorized',
        color:     data.color    || '',
        imageURL:  data.imageURL || '',
    };
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const Recentitems = () => {
    const navigation = useNavigation<any>();
    const db   = getFirestore(getApp());
    const user = getAuth(getApp()).currentUser;

    const [items,   setItems]   = useState<closetItems[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchclosetItems = async () => {
            try {
                const snap = await getDocs(
                    query(
                        collection(db, 'closetItems'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    )
                );
                setItems(snap.docs.map(mapClosetDoc));
            } catch (e) {
                console.warn('[AllitemsScreen]', e);
            } finally {
                setLoading(false);
            }
        };
        fetchclosetItems();
    }, []);

    const renderItem = ({ item }: { item: closetItems}) => (
        <View style={s.card}>
            {item.imageURL ? (
                <Image source={{ uri: item.imageURL }} style={s.cardImage} resizeMode="cover" />
            ) : (
                <View style={[s.cardImage, s.cardFallback]}>
                    <Shirt size={28} color="#CBD5E1" />
                </View>
            )}
            <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.cardMeta}>
                    {item.category}{item.color ? ` · ${item.color}` : ''}
                </Text>
            </View>
        </View>
    );

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
                <Text style={s.headerTitle}>Recent Items</Text>
                <View style={{ width: 36 }} />
            </View>

            {loading ? (
                <View style={s.centered}>
                    <ActivityIndicator size="large" color="#2869BD" />
                </View>
            ) : items.length === 0 ? (
                <View style={s.centered}>
                    <Shirt size={48} color="#E2E8F0" />
                    <Text style={s.emptyText}>No closetItems created yet</Text>
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
                        <Text style={s.countText}>{items.length} closetItems</Text>
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
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal:  20,
        paddingVertical:    12,
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
    cardTitle: {
        fontSize: 13, fontFamily: 'InterSemiBold', fontWeight: '600', color: '#1E293B',
    },
    cardMeta: {
        fontSize: 11, fontFamily: 'InterRegular', color: '#94A3B8',
    },
    emptyText: {
        fontSize: 14, fontFamily: 'InterRegular', color: '#94A3B8',
    },
});

export default Recentitems;