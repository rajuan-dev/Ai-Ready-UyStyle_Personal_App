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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { getApp } from '../../firebase/app';
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from '../../firebase/firestore';
import { getAuth } from '../../firebase/auth';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

const FavoriteLooksScreen = ({ navigation }: any) => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const db = getFirestore(getApp());
    const user = getAuth().currentUser;

    useEffect(() => {
        if (!user) return;


        const q = query(collection(db, 'likes'), where('userId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            setLoading(true);
            try {
                const favItems = [];
                for (const d of snapshot.docs) {
                    const likeData = d.data();
         
                    const itemRef = doc(db, 'closetItems', likeData.itemId);
                    const itemSnap = await getDoc(itemRef);
                    
                    if (itemSnap.exists()) {
                        favItems.push({
                            id: itemSnap.id,
                            ...itemSnap.data()
                        });
                    }
                }
                setFavorites(favItems);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageURL }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.meta}>{item.category} · {item.color}</Text>
            </View>
            <View style={styles.heartBadge}>
                <Heart size={12} color="#ef4444" fill="#ef4444" />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorite Looks</Text>
                <View style={{ width: 24 }} />
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
    }
});