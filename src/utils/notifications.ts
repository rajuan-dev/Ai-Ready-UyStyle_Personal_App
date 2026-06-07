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
        console.warn('[Notification Utility] Error upserting notification:', error);
    }
};
