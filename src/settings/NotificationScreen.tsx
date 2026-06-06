import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Package, CheckCircle2, Info, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// ─── Data ────────────────────────────────────────────────────────────────────

type Notification = {
    id: string;
    title: string;
    desc: string;
    time: string;
    type: string;
    isRead: boolean;
};

const initialNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Style Recommendation',
        desc: 'Based on your recent "Blue Knit Sweater" pick, we found 3 matching bottoms!',
        time: '2m ago',
        type: 'recommendation',
        isRead: false,
    },
    {
        id: '2',
        title: 'Closet Updated',
        desc: 'Successfully added "Leather Belt" to your Accessory collection.',
        time: '1h ago',
        type: 'system',
        isRead: false,
    },
    {
        id: '3',
        title: 'Outfit of the Day',
        desc: "Don't forget to log your look for today to track your style progress.",
        time: '5h ago',
        type: 'reminder',
        isRead: true,
    },
    {
        id: '4',
        title: 'System Update',
        desc: 'Version 2.0 is now live. Check out the new "Combine" feature!',
        time: 'Yesterday',
        type: 'info',
        isRead: true,
    },
];

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [clearing, setClearing] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'recommendation': return <Sparkles size={20} color="#2869BD" />;
            case 'system': return <Package size={20} color="#10B981" />;
            case 'reminder': return <CheckCircle2 size={20} color="#F59E0B" />;
            default: return <Info size={20} color="#64748B" />;
        }
    };

    const handleClearAll = async () => {
        if (clearing || notifications.length === 0) return;
        setClearing(true);
        try {
            // Small delay to show loading state and prevent accidental double-taps
            await new Promise(resolve => setTimeout(resolve, 300));
            setNotifications([]);
        } catch (error) {
            console.warn('Failed to clear notifications:', error);
        } finally {
            setClearing(false);
        }
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {notifications.length > 0 ? (
                    notifications.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.notifCard, !item.isRead && styles.unreadCard]}
                            activeOpacity={0.7}
                            onPress={() => handleMarkAsRead(item.id)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.isRead ? '#F1F5F9' : '#fff' }]}>
                                {getIcon(item.type)}
                            </View>

                            <View style={styles.notifTextContent}>
                                <View style={styles.notifHeaderRow}>
                                    <Text style={styles.notifTitle}>{item.title}</Text>
                                    {!item.isRead && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.notifDesc} numberOfLines={2}>
                                    {item.desc}
                                </Text>
                                <Text style={styles.notifTime}>{item.time}</Text>
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
});

export default NotificationScreen;