import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Image,
    Pressable,
    Modal,
} from 'react-native';
import { useAppAlert } from '../context/AlertContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Package, CheckCircle2, Info, Bell, X, Pencil, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '../firebase/app';
import { getAuth } from '../firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    getDocs,
    getDoc,
    limit,
} from '../firebase/firestore';

// ─── Data Types ───────────────────────────────────────────────────────────────

type Notification = {
    id: string;
    title: string;
    desc: string;
    createdAt: any;
    type: string;
    isRead: boolean;
    screen?: string | null;  // optional navigation target
    route?: string | null;
    outfitId?: string | null;
    itemId?: string | null;
    metadata?: any;
};

// ─── Timestamp Formatting Helper ──────────────────────────────────────────────
const formatTime = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    
    let date: Date;
    if (typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
    } else if (createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000);
    } else {
        date = new Date(createdAt);
    }

    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Memory cache for notifications to persist across entries
let notificationsCache: Notification[] | null = null;

const NotificationScreen = () => {
    const navigation = useNavigation();
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    const { showConfirm, showError } = useAppAlert();

    const [notifications, setNotifications] = useState<Notification[]>(notificationsCache || []);
    const [loading, setLoading] = useState(!notificationsCache);
    const [clearing, setClearing] = useState(false);
    const [navigatingId, setNavigatingId] = useState<string | null>(null);

    // ── Sync notifications from Firestore ─────────────────────────────────────
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...(d.data() as Omit<Notification, 'id'>),
                }));
                setNotifications(list);
                notificationsCache = list;
                setLoading(false);
            },
            (error) => {
                console.warn('[Notifications] Fetch error:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, db]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'recommendation': return <Sparkles size={20} color="#2869BD" />;
            case 'system': return <Package size={20} color="#10B981" />;
            case 'reminder': return <CheckCircle2 size={20} color="#F59E0B" />;
            default: return <Info size={20} color="#64748B" />;
        }
    };

    const handleClearAll = () => {
        if (clearing || notifications.length === 0 || !user) return;

        showConfirm(
            'Clear All Notifications',
            'This will permanently delete all your notifications. This action cannot be undone.',
            async () => {
                setClearing(true);
                try {
                    const batch = writeBatch(db);
                    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
                    const snap = await getDocs(q);
                    snap.docs.forEach((docSnap) => {
                        batch.delete(docSnap.ref);
                    });
                    await batch.commit();
                } catch (error) {
                    console.warn('Failed to clear notifications:', error);
                    showError('Failed to Clear', 'Something went wrong. Please try again.');
                } finally {
                    setClearing(false);
                }
            }
        );
    };

    const handleNotifPress = async (item: Notification) => {
        if (!user || navigatingId) return;

        // 1. Mark as read in Firestore
        try {
            const notifRef = doc(db, 'notifications', item.id);
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.warn('Failed to mark notification as read:', error);
        }

        const outfitId = item.outfitId || item.metadata?.outfitId;
        const itemId = item.itemId || item.metadata?.itemId;

        setNavigatingId(item.id);

        try {
            // Case 1: Notification has an outfitId -> Navigate to outfit preview/detail
            if (outfitId) {
                const outfitRef = doc(db, 'outfits', outfitId);
                const outfitSnap = await getDoc(outfitRef);
                if (outfitSnap.exists() && outfitSnap.data().userId === user.uid) {
                    const outfitData = outfitSnap.data();
                    const itemDetails = outfitData.itemDetails || {};
                    const itemsArray = Object.entries(itemDetails).map(([id, detail]: [string, any]) => ({
                        id,
                        title: detail.title || 'Untitled item',
                        category: detail.category || 'Uncategorized',
                        color: detail.color || '',
                        imageURL: detail.imageURL || '',
                    }));
                    
                    if (itemsArray.length === 0) {
                        showError('Outfit Empty', 'This outfit has no items.');
                        (navigation as any).navigate('bottombar', { screen: 'Home' });
                    } else {
                        (navigation as any).navigate('preview', {
                            items: itemsArray,
                            isSaved: true,
                            outfitId: outfitSnap.id,
                        });
                    }
                } else {
                    showError('Outfit Unavailable', 'This outfit is no longer available.');
                    (navigation as any).navigate('bottombar', { screen: 'Home' });
                }
                return;
            }

            // Case 2: Notification has an itemId -> Navigate to closet item details page
            if (itemId) {
                const itemRef = doc(db, 'closetItems', itemId);
                const itemSnap = await getDoc(itemRef);
                if (itemSnap.exists() && itemSnap.data().userId === user.uid) {
                    const itemData = itemSnap.data();
                    const initialItem = {
                        id: itemSnap.id,
                        title: itemData.title || '',
                        category: itemData.category || '',
                        color: itemData.color || '',
                        imageURL: itemData.imageURL || '',
                        userId: itemData.userId || '',
                        createdAt: itemData.createdAt || null,
                        likeCount: itemData.likeCount ?? 0,
                    };
                    (navigation as any).navigate('AddItemEditor', { initialItem });
                } else {
                    showError('Item Unavailable', 'This item is no longer in your closet.');
                    (navigation as any).navigate('bottombar', { screen: 'Home' });
                }
                return;
            }

            // Case 3: Parse item title / outfit name from description (backward compatibility for old notifications)
            const match = item.desc.match(/"([^"]+)"/);
            if (match && match[1]) {
                const parsedName = match[1].trim();
                const isOutfit = item.desc.toLowerCase().includes('outfit') || item.title.toLowerCase().includes('outfit');

                if (isOutfit) {
                    // Try exact match first
                    const qOutfits = query(
                        collection(db, 'outfits'),
                        where('userId', '==', user.uid),
                        where('name', '==', parsedName),
                        limit(1)
                    );
                    const querySnap = await getDocs(qOutfits);
                    if (!querySnap.empty) {
                        const matchedDoc = querySnap.docs[0];
                        const outfitData = matchedDoc.data();
                        const itemDetails = outfitData.itemDetails || {};
                        const itemsArray = Object.entries(itemDetails).map(([id, detail]: [string, any]) => ({
                            id,
                            title: detail.title || 'Untitled item',
                            category: detail.category || 'Uncategorized',
                            color: detail.color || '',
                            imageURL: detail.imageURL || '',
                        }));
                        
                        if (itemsArray.length > 0) {
                            (navigation as any).navigate('preview', {
                                items: itemsArray,
                                isSaved: true,
                                outfitId: matchedDoc.id,
                            });
                            return;
                        }
                    }

                    // Fallback to case-insensitive match on all user's outfits
                    const qAllOutfits = query(
                        collection(db, 'outfits'),
                        where('userId', '==', user.uid)
                    );
                    const allSnap = await getDocs(qAllOutfits);
                    const matchedDoc = allSnap.docs.find(d => {
                        const name = (d.data().name || '').toLowerCase().trim();
                        return name === parsedName.toLowerCase();
                    });
                    if (matchedDoc) {
                        const outfitData = matchedDoc.data();
                        const itemDetails = outfitData.itemDetails || {};
                        const itemsArray = Object.entries(itemDetails).map(([id, detail]: [string, any]) => ({
                            id,
                            title: detail.title || 'Untitled item',
                            category: detail.category || 'Uncategorized',
                            color: detail.color || '',
                            imageURL: detail.imageURL || '',
                        }));
                        if (itemsArray.length > 0) {
                            (navigation as any).navigate('preview', {
                                items: itemsArray,
                                isSaved: true,
                                outfitId: matchedDoc.id,
                            });
                            return;
                        }
                    }

                    // Fallback: if we matched "outfit" but couldn't find/preview it, take to Home tab
                    (navigation as any).navigate('bottombar', { screen: 'Home' });
                    return;
                } else {
                    // Try exact match first
                    const qItems = query(
                        collection(db, 'closetItems'),
                        where('userId', '==', user.uid),
                        where('title', '==', parsedName),
                        limit(1)
                    );
                    const querySnap = await getDocs(qItems);
                    if (!querySnap.empty) {
                        const matchedDoc = querySnap.docs[0];
                        const itemData = matchedDoc.data();
                        const initialItem = {
                            id: matchedDoc.id,
                            title: itemData.title || '',
                            category: itemData.category || '',
                            color: itemData.color || '',
                            imageURL: itemData.imageURL || '',
                            userId: itemData.userId || '',
                            createdAt: itemData.createdAt || null,
                            likeCount: itemData.likeCount ?? 0,
                        };
                        (navigation as any).navigate('AddItemEditor', { initialItem });
                        return;
                    }

                    // Fallback to case-insensitive match on all user's closet items
                    const qAllItems = query(
                        collection(db, 'closetItems'),
                        where('userId', '==', user.uid)
                    );
                    const allSnap = await getDocs(qAllItems);
                    const matchedDoc = allSnap.docs.find(d => {
                        const title = (d.data().title || '').toLowerCase().trim();
                        return title === parsedName.toLowerCase();
                    });
                    if (matchedDoc) {
                        const itemData = matchedDoc.data();
                        const initialItem = {
                            id: matchedDoc.id,
                            title: itemData.title || '',
                            category: itemData.category || '',
                            color: itemData.color || '',
                            imageURL: itemData.imageURL || '',
                            userId: itemData.userId || '',
                            createdAt: itemData.createdAt || null,
                            likeCount: itemData.likeCount ?? 0,
                        };
                        (navigation as any).navigate('AddItemEditor', { initialItem });
                        return;
                    }

                    // Fallback: if we couldn't find the item by name, take to Home tab
                    (navigation as any).navigate('bottombar', { screen: 'Home' });
                    return;
                }
            }

            // Case 4: Target screen or route in notification metadata/properties
            let targetScreen = item.screen || item.route || item.metadata?.screen || item.metadata?.route;
            if (item.title.toLowerCase().includes('welcome')) {
                targetScreen = 'Home';
            }
            if (targetScreen) {
                if (targetScreen === 'preview' && item.metadata?.itemIds && Array.isArray(item.metadata.itemIds)) {
                    const fetchPromises = item.metadata.itemIds.map(async (fId: string) => {
                        try {
                            const refDoc = doc(db, 'closetItems', fId);
                            const snapDoc = await getDoc(refDoc);
                            if (snapDoc.exists() && snapDoc.data().userId === user.uid) {
                                const d = snapDoc.data();
                                return {
                                    id: snapDoc.id,
                                    title: d.title || 'Untitled item',
                                    category: d.category || 'Uncategorized',
                                    color: d.color || '',
                                    imageURL: d.imageURL || '',
                                };
                            }
                        } catch (err) {
                            console.warn(`[Notifications] Failed to fetch item ${fId}:`, err);
                        }
                        return null;
                    });
                    const results = await Promise.all(fetchPromises);
                    const fetchedItems = results.filter((i): i is NonNullable<typeof i> => i !== null);
                    
                    if (fetchedItems.length === 0) {
                        showError('Outfit Unavailable', 'The items in this outfit are no longer in your closet.');
                        (navigation as any).navigate('bottombar', { screen: 'Home' });
                    } else {
                        (navigation as any).navigate('preview', { items: fetchedItems, isSaved: false });
                    }
                } else {
                    // Try to navigate directly to the screen (supporting nested tabs and case-insensitive resolution too)
                    try {
                        const tabScreens = ['Home', 'Closet', 'Add', 'Outfits', 'Profile'];
                        const stackScreens = [
                            'onboarding', 'signup', 'signin', 'forgotPassword', 'verifyEmail',
                            'profileedit', 'ChangePassword', 'AIChatScreen', 'preference',
                            'combine', 'preview', 'saveSuccess', 'notification',
                            'accountsettings', 'privacypolicy', 'help',
                            'FavoriteLooksScreen', 'Recentitems', 'outfits', 'AddItemEditor'
                        ];

                        const targetLower = targetScreen.toLowerCase().trim();

                        // Try to find in tabScreens first
                        const matchedTab = tabScreens.find(s => s.toLowerCase() === targetLower);
                        if (matchedTab) {
                            (navigation as any).navigate('bottombar', { screen: matchedTab });
                        } else {
                            // Try to find in stackScreens
                            const matchedStack = stackScreens.find(s => s.toLowerCase() === targetLower);
                            if (matchedStack) {
                                (navigation as any).navigate(matchedStack);
                            } else {
                                // If not recognized in our lists, try navigating directly as a fallback
                                (navigation as any).navigate(targetScreen);
                            }
                        }
                    } catch (navErr) {
                        console.warn(`[Notifications] Direct navigation to ${targetScreen} failed:`, navErr);
                        // Fallback directly to Home if direct navigation fails
                        (navigation as any).navigate('bottombar', { screen: 'Home' });
                    }
                }
                return;
            }

            // Case 5: Final fallback to Home if no direct screen or ID mapping succeeds
            (navigation as any).navigate('bottombar', { screen: 'Home' });
        } catch (err) {
            console.warn('[Notifications] Error handling press:', err);
            showError('Error', 'An error occurred while loading. Please try again.');
        } finally {
            setNavigatingId(null);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity
                    style={[styles.clearBtn, (clearing || notifications.length === 0) && styles.clearBtnDisabled]}
                    onPress={handleClearAll}
                    disabled={clearing || notifications.length === 0}
                    activeOpacity={0.7}
                >
                    {clearing ? (
                        <ActivityIndicator size="small" color="#2869BD" />
                    ) : (
                        <Text style={[
                            styles.clearText,
                            notifications.length === 0 && styles.clearTextDisabled,
                        ]}>
                            Clear all
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#2869BD" />
                    <Text style={styles.centerTxt}>Loading notifications…</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {notifications.length > 0 ? (
                        notifications.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.notifCard, !item.isRead && styles.unreadCard]}
                                activeOpacity={0.75}
                                onPress={() => handleNotifPress(item)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: item.isRead ? '#F1F5F9' : '#fff' }]}>
                                    {navigatingId === item.id ? (
                                        <ActivityIndicator size="small" color="#2869BD" />
                                    ) : (
                                        getIcon(item.type)
                                    )}
                                </View>

                                <View style={styles.notifTextContent}>
                                    <View style={styles.notifHeaderRow}>
                                        <Text style={styles.notifTitle}>{item.title}</Text>
                                        {!item.isRead && <View style={styles.unreadDot} />}
                                    </View>
                                    <Text style={styles.notifDesc} numberOfLines={2}>
                                        {item.desc}
                                    </Text>
                                    <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Bell size={64} color="#E2E8F0" />
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptySub}>No new notifications for now.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'InterBold', 
        color: '#0F1729',
    },
    clearBtn: {
        paddingHorizontal: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    clearBtnDisabled: {
        opacity: 0.5,
    },
    clearText: {
        fontSize: 14,
        color: '#2869BD',
        fontFamily: 'InterSemiBold',
    },
    clearTextDisabled: {
        color: '#94A3B8',
    },
    scrollContent: {
        paddingVertical: 10,
    },
    notifCard: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    unreadCard: {
        backgroundColor: '#F0F7FF',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    notifTextContent: {
        flex: 1,
    },
    notifHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 15,
        fontFamily: 'InterSemiBold', 
        color: '#1E293B',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2869BD',
    },
    notifDesc: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'InterRegular', 
        lineHeight: 20,
        marginBottom: 6,
    },
    notifTime: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'InterMedium',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 120,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'InterBold',
        color: '#1E293B',
        marginTop: 20,
    },
    emptySub: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    centerTxt: {
        fontSize: 13,
        fontFamily: 'InterRegular',
        color: '#94A3B8',
    },
});

export default NotificationScreen;