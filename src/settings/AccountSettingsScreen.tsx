import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
    ActionSheetIOS,
    PermissionsAndroid,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, User, Mail, Lock, Camera, Bell, Trash2 } from 'lucide-react-native';
import {
    requestNotificationPermission,
    scheduleDailyReminder,
    cancelDailyReminder,
} from '../utils/notifications';
import { useNavigation } from '@react-navigation/native';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';
import { getApp } from '../firebase/app';
import { getAuth, deleteUser } from '../firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, deleteDoc } from '../firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '../firebase/storage';
import { recordCrashlyticsError } from '../services';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
    fullName: string;
    email: string;
    photoURL?: string;
    dailyRemindersEnabled?: boolean;
}

interface SettingRowProps {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    value?: string;
    onPress: () => void;
    isLast?: boolean;
    isDanger?: boolean;
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

const SettingRow = React.memo(({
    icon: Icon,
    label,
    value,
    onPress,
    isLast,
    isDanger,
}: SettingRowProps) => (
    <TouchableOpacity
        style={[styles.row, isLast && styles.noBorder]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={label}
        accessibilityRole="button"
    >
        <View style={styles.rowLeft}>
            <View style={[styles.iconContainer, isDanger && styles.dangerIconContainer]}>
                <Icon size={20} color={isDanger ? '#EF4444' : '#64748B'} />
            </View>
            <Text style={[styles.rowLabel, isDanger && styles.dangerText]}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
            {value ? (
                <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
            ) : null}
            <ChevronRight size={18} color={isDanger ? '#EF4444' : '#94A3B8'} />
        </View>
    </TouchableOpacity>
));

interface SettingSwitchRowProps {
    icon: React.ComponentType<{ size: number; color: string }>;
    label: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    isLast?: boolean;
    disabled?: boolean;
}

const SettingSwitchRow = React.memo(({
    icon: Icon,
    label,
    value,
    onValueChange,
    isLast,
    disabled,
}: SettingSwitchRowProps) => (
    <View style={[styles.row, isLast && styles.noBorder]}>
        <View style={styles.rowLeft}>
            <View style={styles.iconContainer}>
                <Icon size={20} color="#64748B" />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#E2E8F0', true: '#2869BD' }}
            thumbColor={Platform.OS === 'android' ? (value ? '#FFFFFF' : '#F1F5F9') : undefined}
        />
    </View>
));

// ─── Camera permission (Android only) ────────────────────────────────────────

const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true; // iOS: launchCamera handles it

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
            title: 'Camera Permission',
            message: 'App needs camera access to update your profile photo.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
        },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

    Alert.alert(
        'Camera Access Denied',
        'Enable camera access in Settings → Apps → [App Name] → Permissions → Camera.',
        [{ text: 'OK' }],
    );
    return false;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const AccountSettingsScreen = () => {
    const navigation = useNavigation<any>();

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);

    const [profile,       setProfile]       = useState<UserProfile | null>(null);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState<string | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [updatingReminders, setUpdatingReminders] = useState(false);

    // ── Firestore listener ─────────────────────────────────────────────────────
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError('Please sign in again to access account settings.');
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'users', currentUser.uid),
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setProfile({
                        fullName: data?.fullName ?? '',
                        email:    data?.email    ?? currentUser.email ?? '',
                        photoURL: data?.photoURL ?? undefined,
                        dailyRemindersEnabled: data?.dailyRemindersEnabled ?? false,
                    });
                } else {
                    setError('Profile not found.');
                }
                setLoading(false);
            },
            (err) => {
                console.error('Firestore error:', err);
                setError('Failed to load profile.');
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [auth, db, navigation]);

    // ── Upload photo to Storage → save URL to Firestore ────────────────────────
    const uploadPhoto = async (uri: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setPhotoUploading(true);
        try {
            const storage = getStorage(app);
            const fileRef = ref(storage, `avatars/${currentUser.uid}.jpg`);

            const response = await fetch(uri);
            const blob     = await response.blob();

            await new Promise<void>((resolve, reject) => {
                const task = uploadBytesResumable(fileRef, blob);
                task.on('state_changed', undefined, reject, async () => {
                    const url = await getDownloadURL(task.snapshot!.ref);
                    await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url });
                    resolve();
                });
            });
        } catch (e: any) {
            recordCrashlyticsError(e, 'account_settings');
            Alert.alert('Upload failed', e.message);
        } finally {
            setPhotoUploading(false);
        }
    };

    // ── Handle image picker response ───────────────────────────────────────────
    const handleImageResponse = (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) uploadPhoto(uri);
    };

    // ── Open camera ────────────────────────────────────────────────────────────
    const openCamera = async () => {
        const allowed = await requestCameraPermission();
        if (!allowed) return;
        launchCamera(
            { mediaType: 'photo', saveToPhotos: false, quality: 1, cameraType: 'back' },
            handleImageResponse,
        );
    };

    // ── Open gallery ───────────────────────────────────────────────────────────
    const openGallery = () =>
        launchImageLibrary(
            { mediaType: 'photo', selectionLimit: 1, quality: 1 },
            handleImageResponse,
        );

    // ── Camera icon press → action sheet ──────────────────────────────────────
    const handleCameraIconPress = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', '📷 Take Photo', '📁 Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (index) => {
                    if (index === 1) openCamera();
                    if (index === 2) openGallery();
                },
            );
        } else {
            Alert.alert('Update Profile Photo', 'Choose an option', [
                { text: 'Cancel',                 style: 'cancel' },
                { text: '📷 Take Photo',           onPress: openCamera },
                { text: '📁 Choose from Gallery',  onPress: openGallery },
            ]);
        }
    };

    // ── Notification toggle handler ────────────────────────────────────────────
    const handleToggleDailyReminders = async (value: boolean) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setUpdatingReminders(true);
        try {
            if (value) {
                const permissionGranted = await requestNotificationPermission();
                if (permissionGranted) {
                    await updateDoc(doc(db, 'users', currentUser.uid), {
                        dailyRemindersEnabled: true,
                    });
                    await scheduleDailyReminder();
                } else {
                    Alert.alert(
                        'Notification Permission',
                        'To receive daily reminders, please enable notifications in your device settings.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    dailyRemindersEnabled: false,
                });
                await cancelDailyReminder();
            }
        } catch (err: any) {
            console.error('Failed to toggle daily reminders:', err);
            Alert.alert('Error', 'Failed to update reminder settings.');
        } finally {
            setUpdatingReminders(false);
        }
    };

    // ── Navigation handlers ────────────────────────────────────────────────────
    const handleEditName = useCallback(() =>
        navigation.navigate('profileedit', { field: 'name', currentValue: profile?.fullName }),
    [navigation, profile?.fullName]);

    const handleEditEmail = useCallback(() =>
        navigation.navigate('profileedit', { field: 'email', currentValue: profile?.email }),
    [navigation, profile?.email]);

    const handleChangePassword = useCallback(() =>
        navigation.navigate('ChangePassword'),
    [navigation]);

    const handleDeleteAccount = useCallback(() => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action is permanent and will delete all your outfits, wardrobe items, and personal settings from our database. It cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                        const currentUser = auth.currentUser;
                        if (!currentUser) return;
                        setLoading(true);
                        try {
                            const uid = currentUser.uid;
                            // 1. Delete user profile document from Firestore
                            await deleteDoc(doc(db, 'users', uid));
                            
                            // 2. Delete the user from Firebase Authentication
                            await deleteUser(currentUser);
                            
                            Alert.alert('Account Deleted', 'Your account and data have been successfully deleted.');
                        } catch (error: any) {
                            console.error('[AccountSettings] Delete account error:', error);
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    'Re-authentication Required',
                                    'For your security, deleting your account requires a recent login. Please log out, sign back in, and try again.'
                                );
                            } else {
                                Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }, [auth, db, navigation]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator style={styles.centered} size="large" color="#2869BD" />
            </SafeAreaView>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryBtn}>
                        <Text style={styles.retryBtnText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Avatar Section ── */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        {/* Profile photo or placeholder */}
                        {profile?.photoURL ? (
                            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <User size={38} color="#94A3B8" />
                            </View>
                        )}

                        {/* Upload overlay while uploading */}
                        {photoUploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator color="#fff" size="small" />
                            </View>
                        )}

                        {/* Camera icon button */}
                        <TouchableOpacity
                            style={styles.cameraBtn}
                            onPress={handleCameraIconPress}
                            disabled={photoUploading}
                            accessibilityLabel="Change profile photo"
                            accessibilityRole="button"
                        >
                            <Camera size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{profile?.fullName}</Text>
                    <Text style={styles.userEmail}>{profile?.email}</Text>

                    {photoUploading && (
                        <Text style={styles.uploadingText}>Uploading photo…</Text>
                    )}
                </View>

                {/* ── Personal Information ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon={User}
                            label="Full Name"
                            value={profile?.fullName}
                            onPress={handleEditName}
                        />
                        <SettingRow
                            icon={Mail}
                            label="Email"
                            value={profile?.email}
                            onPress={handleEditEmail}
                            isLast
                        />
                    </View>
                </View>

                {/* ── Notifications ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
                    <View style={styles.card}>
                        <SettingSwitchRow
                            icon={Bell}
                            label="Daily Outfit Reminders"
                            value={profile?.dailyRemindersEnabled ?? false}
                            onValueChange={handleToggleDailyReminders}
                            disabled={updatingReminders}
                            isLast
                        />
                    </View>
                </View>

                {/* ── Security ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SECURITY</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon={Lock}
                            label="Change Password"
                            onPress={handleChangePassword}
                            isLast
                        />
                    </View>
                </View>

                {/* ── Danger Zone ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DANGER ZONE</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon={Trash2}
                            label="Delete Account"
                            onPress={handleDeleteAccount}
                            isLast
                            isDanger
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea:      { flex: 1, backgroundColor: '#fff' },
    centered:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle:   { fontSize: 18, fontFamily: 'InterBold', color: '#0F1729' },
    backBtn:       { width: 40, height: 40, justifyContent: 'center' },
    scrollContent: { paddingBottom: 40 },

    // Avatar
    avatarSection:     { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff' },
    avatarWrapper:     { position: 'relative', marginBottom: 16 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 4, borderColor: '#F1F5F9',
    },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#E2E8F0',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 4, borderColor: '#F1F5F9',
    },
    // spinner overlay on top of avatar while uploading
    uploadOverlay: {
        position: 'absolute',
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0, right: 0,
        backgroundColor: '#2869BD',
        width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: '#fff',
        zIndex: 3,
    },
    userName:      { fontSize: 20, fontFamily: 'InterBold', color: '#1E293B' },
    userEmail:     { fontSize: 14, fontFamily: 'InterRegular', color: '#64748B', marginTop: 4 },
    uploadingText: { fontSize: 12, color: '#2869BD', marginTop: 6, fontFamily: 'InterRegular' },

    // Sections
    section:       { marginTop: 25, paddingHorizontal: 20 },
    sectionTitle: {
        fontSize: 13, fontFamily: 'InterSemiBold',
        color: '#94A3B8', letterSpacing: 1,
        marginBottom: 10, marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9',
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
    },
    noBorder:            { borderBottomWidth: 0 },
    rowLeft:             { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    dangerIconContainer: { backgroundColor: '#FEF2F2' },
    rowLabel:            { fontSize: 15, fontFamily: 'InterMedium', color: '#1E293B' },
    rowRight:            { flexDirection: 'row', alignItems: 'center' },
    rowValue: {
        fontSize: 14, fontFamily: 'InterRegular',
        color: '#64748B', marginRight: 8, maxWidth: 140,
    },
    dangerText:    { color: '#EF4444' },
    errorText:     { fontSize: 15, color: '#EF4444', textAlign: 'center', marginBottom: 16 },
    retryBtn:      { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F1F5F9' },
    retryBtnText:  { fontSize: 14, fontFamily: 'InterMedium', color: '#1E293B' },
});

export default AccountSettingsScreen;
