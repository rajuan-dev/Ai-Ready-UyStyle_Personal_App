import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Heart, PenLine, Shirt, User } from 'lucide-react-native';
import { styles } from './style';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    where,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
} from '@react-native-firebase/firestore';
import { getTabScreenBottomPadding } from '../../theme/layout';

// ── Firebase refs (singleton — created once, not every render) ──
const app  = getApp();
const auth = getAuth(app);
const db   = getFirestore(app);

// ── In-memory cache so tab switches are instant ──
let profileCache: {
    fullName: string;
    photoURL: string | null;
    closetCount: number;
    outfitCount: number;
    likesCount: number;
    likedPreviews: { id: string; imageURL: string }[];
    timestamp: number;
} | null = null;

const CACHE_TTL = 60_000; // 1 minute — skip network if fresh

const menuItems = [
    { label: 'Notifications',    danger: false, screen: 'notification'    },
    { label: 'Account Settings', danger: false, screen: 'accountsettings' },
    { label: 'Privacy',          danger: false, screen: 'privacypolicy'   },
    { label: 'Help',             danger: false, screen: 'help'            },
    { label: 'Logout',           danger: true,  screen: null              },
];

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [fullName,      setFullName]      = useState(profileCache?.fullName ?? '');
    const [photoURL,      setPhotoURL]      = useState<string | null>(profileCache?.photoURL ?? null);
    const [loading,       setLoading]       = useState(!profileCache);

    const [closetCount,   setClosetCount]   = useState(profileCache?.closetCount ?? 0);
    const [outfitCount,   setOutfitCount]   = useState(profileCache?.outfitCount ?? 0);
    const [likesCount,    setLikesCount]    = useState(profileCache?.likesCount ?? 0);
    const [countsLoading, setCountsLoading] = useState(!profileCache);

    const [likedPreviews, setLikedPreviews] = useState<{ id: string; imageURL: string }[]>(
        profileCache?.likedPreviews ?? []
    );

    const [refreshing,    setRefreshing]    = useState(false);

    // Prevent duplicate fetches if focus fires rapidly
    const fetchingRef = useRef(false);

    const triggerFetch = useCallback(async (force = false) => {
        const user = auth.currentUser;
        if (!user) return;

        // If cache is fresh and not forced, skip network entirely
        if (!force && profileCache && Date.now() - profileCache.timestamp < CACHE_TTL) {
            setFullName(profileCache.fullName);
            setPhotoURL(profileCache.photoURL);
            setClosetCount(profileCache.closetCount);
            setOutfitCount(profileCache.outfitCount);
            setLikesCount(profileCache.likesCount);
            setLikedPreviews(profileCache.likedPreviews);
            setLoading(false);
            setCountsLoading(false);
            return;
        }

        if (fetchingRef.current) return;
        fetchingRef.current = true;

        if (force) {
            setRefreshing(true);
        } else if (profileCache) {
            setLoading(false);
            setCountsLoading(false);
        }

        const uid = user.uid;

        try {
            const [profileSnap, closetSnap, outfitsSnap, likesSnap, previewSnap] =
                await Promise.all([
                    getDoc(doc(db, 'users', uid)),
                    getCountFromServer(
                        query(collection(db, 'closetItems'), where('userId', '==', uid))
                    ),
                    getCountFromServer(
                        query(collection(db, 'outfits'), where('userId', '==', uid))
                    ),
                    getCountFromServer(
                        query(collection(db, 'likes'), where('userId', '==', uid))
                    ),
                    getDocs(
                        query(
                            collection(db, 'likes'),
                            where('userId', '==', uid),
                            orderBy('createdAt', 'desc'),
                            limit(2)
                        )
                    ),
                ]);

            let name = '';
            let photo: string | null = null;
            if (profileSnap.exists()) {
                const data = profileSnap.data();
                name  = data?.fullName || '';
                photo = data?.photoURL || null;
            }
            setFullName(name);
            setPhotoURL(photo);

            const cCloset  = closetSnap.data().count;
            const cOutfits = outfitsSnap.data().count;
            const cLikes   = likesSnap.data().count;
            setClosetCount(cCloset);
            setOutfitCount(cOutfits);
            setLikesCount(cLikes);

            const previews: { id: string; imageURL: string }[] = [];
            for (const d of previewSnap.docs) {
                const likeData = d.data();
                if (likeData.imageURL) {
                    previews.push({ id: d.id, imageURL: likeData.imageURL });
                } else if (likeData.itemId) {
                    try {
                        const itemSnap = await getDoc(doc(db, 'closetItems', likeData.itemId));
                        if (itemSnap.exists()) {
                            previews.push({ id: d.id, imageURL: itemSnap.data()?.imageURL || '' });
                        }
                    } catch (e) { console.log('[Profile] Fav Join failed:', e); }
                }
            }
            const validPreviews = previews.filter(p => p.imageURL !== '');
            setLikedPreviews(validPreviews);

            profileCache = {
                fullName: name,
                photoURL: photo,
                closetCount: cCloset,
                outfitCount: cOutfits,
                likesCount: cLikes,
                likedPreviews: validPreviews,
                timestamp: Date.now(),
            };
        } catch (e: any) {
            console.log('[Profile] fetch error:', e?.message || e);
        } finally {
            setLoading(false);
            setCountsLoading(false);
            setRefreshing(false);
            fetchingRef.current = false;
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            triggerFetch(false);
        }, [triggerFetch])
    );

    const onRefresh = useCallback(() => {
        triggerFetch(true);
    }, [triggerFetch]);

    const stats = [
        { label: 'Items',     value: countsLoading ? '—' : String(closetCount) },
        { label: 'Outfits',   value: countsLoading ? '—' : String(outfitCount) },
        { label: 'Favorites', value: countsLoading ? '—' : String(likesCount)  },
    ];

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        profileCache = null; // Clear cache on logout
                        await signOut(auth);
                    }
                    catch (error: any) { Alert.alert('Error', error.message); }
                },
            },
        ]);
    };

    const handleMenuPress = (item: { label: string; screen: string | null }) => {
        if (item.label === 'Logout') handleLogout();
        else if (item.screen) navigation.navigate(item.screen);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: getTabScreenBottomPadding(insets.bottom) },
                ]}
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
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileLeft}>
                        {loading ? (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <ActivityIndicator size="small" color="#2869BD" />
                            </View>
                        ) : photoURL ? (
                            <Image source={{ uri: photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <User size={22} color="#94A3B8" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.profileName}>
                                Hi, {loading ? '...' : fullName || 'User'}
                            </Text>
                            <Text style={styles.profileSub}>Inspiration for today</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('profileedit')}
                        style={styles.editBtn}
                        activeOpacity={0.7}
                    >
                        <PenLine size={18} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {stats.map((stat) => (
                        <View key={stat.label} style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Style Preferences */}
                <TouchableOpacity
                    style={styles.stylePrefs}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('preference')}
                >
                    <View style={styles.stylePrefLeft}>
                        <View style={styles.stylePrefIcon}>
                            <Shirt size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.stylePrefTitle}>Style Preferences</Text>
                            <Text style={styles.stylePrefSub}>Casual, Gym, Formal</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Favorite Looks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Favorite Looks</Text>
                        {/* See All → FavoriteLooksScreen */}
                        <TouchableOpacity
                            style={styles.seeAll}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('FavoriteLooksScreen')}
                        >
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight size={14} color="#2869BD" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.favRow}>
                        {likedPreviews.length > 0 ? (
                            likedPreviews.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={styles.favCard} 
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate('FavoriteLooksScreen')}
                                >
                                    <Image source={{ uri: item.imageURL }} style={styles.favImage} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyFavContainer}>
                                <Heart size={20} color="#94A3B8" strokeWidth={1.8} fill="transparent" />
                                <Text style={styles.emptyFavText}>No favorite looks yet</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={styles.menuRow}
                            activeOpacity={0.7}
                            onPress={() => handleMenuPress(item)}
                        >
                            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                                {item.label}
                            </Text>
                            <ChevronRight size={18} color={item.danger ? '#EF4444' : '#65758B'} />
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

// Export cache invalidator so ProfileEditScreen can clear it after saving
export const invalidateProfileCache = () => { profileCache = null; };
