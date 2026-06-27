import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { getApp } from '../firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    serverTimestamp,
} from '../firebase/firestore';
import { recordCrashlyticsError } from '../services';

export type NotificationType = 'recommendation' | 'system' | 'reminder' | 'info';

/**
 * Always creates a NEW notification document.
 * Use for one-time events like adding an item, saving an outfit, etc.
 */
export const addNotification = async (
    userId: string,
    title: string,
    desc: string,
    type: NotificationType,
    screen?: string,
    metadata?: Record<string, any>
) => {
    try {
        const db = getFirestore(getApp());
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            desc,
            type,
            screen: screen || null,
            metadata: metadata || null,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        recordCrashlyticsError(error, 'notifications_util');
        console.warn('[Notification Utility] Error adding notification:', error);
    }
};

/**
 * Update-or-create a notification keyed by (userId + type).
 * If a document of the same type already exists for this user, it is updated
 * instead of creating duplicates. Use for repeatable events like "Build Another".
 */
export const upsertNotification = async (
    userId: string,
    title: string,
    desc: string,
    type: NotificationType,
    screen?: string,
    metadata?: Record<string, any>
) => {
    try {
        const db = getFirestore(getApp());
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('type', '==', type)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            // Update the first matching doc — refresh content and mark unread again
            const existing = snap.docs[0];
            await updateDoc(existing.ref, {
                title,
                desc,
                screen: screen || null,
                metadata: metadata || null,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        } else {
            // No existing notification of this type — create a fresh one
            await addDoc(collection(db, 'notifications'), {
                userId,
                title,
                desc,
                type,
                screen: screen || null,
                metadata: metadata || null,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        }
    } catch (error) {
        recordCrashlyticsError(error, 'notifications_util');
        console.warn('[Notification Utility] Error upserting notification:', error);
    }
};

/**
 * Checks and requests notification permissions dynamically.
 * Attempts to load expo-notifications first, then falls back to PermissionsAndroid for Android 13+,
 * or a simulated choice dialog on iOS/other platforms.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    let ExpoNotifications: any = null;
    try {
        ExpoNotifications = require('expo-notifications');
    } catch {
        // Ignored, expo-notifications is not installed
    }

    if (ExpoNotifications) {
        try {
            const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await ExpoNotifications.requestPermissionsAsync({
                    ios: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                    },
                });
                finalStatus = status;
            }
            return finalStatus === 'granted';
        } catch (error) {
            console.warn('Error requesting permissions via expo-notifications:', error);
        }
    }

    // Native platform check fallback
    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
            try {
                const permissionStr = 'android.permission.POST_NOTIFICATIONS';
                const hasPermission = await PermissionsAndroid.check(permissionStr as any);
                if (hasPermission) return true;

                const granted = await PermissionsAndroid.request(
                    permissionStr as any,
                    {
                        title: 'Notification Permission',
                        message: 'Ustyle needs permission to send you daily outfit reminders.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Deny',
                        buttonPositive: 'Allow',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Error requesting Android POST_NOTIFICATIONS permission:', err);
                return false;
            }
        }
        return true;
    } else if (Platform.OS === 'ios') {
        return new Promise<boolean>((resolve) => {
            Alert.alert(
                '“Ustyle” Would Like to Send You Notifications',
                'Notifications may include daily outfit reminders, alerts, sounds, and icon badges.',
                [
                    {
                        text: 'Don’t Allow',
                        style: 'cancel',
                        onPress: () => resolve(false),
                    },
                    {
                        text: 'Allow',
                        onPress: () => resolve(true),
                    },
                ]
            );
        });
    }

    return false;
};

/**
 * Schedules a local recurring notification at 9:00 AM daily.
 * Safe fallback if expo-notifications is not installed.
 */
export const scheduleDailyReminder = async () => {
    let ExpoNotifications: any = null;
    try {
        ExpoNotifications = require('expo-notifications');
    } catch {
        // Ignored
    }

    if (ExpoNotifications) {
        try {
            ExpoNotifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });

            await cancelDailyReminder();

            const id = await ExpoNotifications.scheduleNotificationAsync({
                content: {
                    title: 'Daily Outfit Reminder 👕',
                    body: 'Time to check your outfits and look stylish today!',
                    sound: true,
                },
                trigger: {
                    hour: 9,
                    minute: 0,
                    repeats: true,
                },
            });
            console.log('Successfully scheduled daily outfit reminder with ID:', id);
        } catch (error) {
            console.warn('Failed to schedule daily reminder via expo-notifications:', error);
        }
    } else {
        console.log('[Notification Utility] expo-notifications is not installed. Dynamic local scheduling skipped.');
    }
};

/**
 * Cancels all scheduled local notifications.
 * Safe fallback if expo-notifications is not installed.
 */
export const cancelDailyReminder = async () => {
    let ExpoNotifications: any = null;
    try {
        ExpoNotifications = require('expo-notifications');
    } catch {
        // Ignored
    }

    if (ExpoNotifications) {
        try {
            await ExpoNotifications.cancelAllScheduledNotificationsAsync();
            console.log('Cancelled all scheduled reminders.');
        } catch (error) {
            console.warn('Failed to cancel scheduled reminders:', error);
        }
    }
};
