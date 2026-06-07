import { getApp } from '../firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from '../firebase/firestore';

export type NotificationType = 'recommendation' | 'system' | 'reminder' | 'info';

export const addNotification = async (
    userId: string,
    title: string,
    desc: string,
    type: NotificationType
) => {
    try {
        const db = getFirestore(getApp());
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            desc,
            type,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.warn('[Notification Utility] Error adding notification:', error);
    }
};
