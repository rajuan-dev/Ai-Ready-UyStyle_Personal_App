// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     Image,
//     StatusBar,
//     ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { ArrowLeft, Camera } from 'lucide-react-native';
// import { StyleSheet } from 'react-native';

// const ProfileEditScreen = ({ navigation }: any) => {
//     const onBack = () => navigation.goBack();
//     const [name, setName] = useState<string>('Sarah');
//     const [email, setEmail] = useState<string>('sarah@example.com');
//     const [phone, setPhone] = useState<string>('+1 234 567 890');
//     const [bio, setBio] = useState<string>('Fashion lover & style enthusiast');

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
//                     <ArrowLeft size={22} color="#1E293B" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Edit Profile</Text>
//                 <TouchableOpacity activeOpacity={0.7}>
//                     <Text style={styles.saveText}>Save</Text>
//                 </TouchableOpacity>
//             </View>

//             <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//             >
//                 {/* Avatar */}
//                 <View style={styles.avatarSection}>
//                     <View style={styles.avatarWrapper}>
//                         <Image
//                             source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
//                             style={styles.avatar}
//                         />
//                         <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
//                             <Camera size={16} color="#fff" />
//                         </TouchableOpacity>
//                     </View>
//                     <Text style={styles.changePhotoText}>Change Photo</Text>
//                 </View>

//                 {/* Form */}
//                 <View style={styles.form}>
//                     <View style={styles.fieldGroup}>
//                         <Text style={styles.fieldLabel}>Full Name</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={name}
//                             onChangeText={setName}
//                             placeholder="Enter your name"
//                             placeholderTextColor="#94a3b8"
//                         />
//                     </View>

//                     <View style={styles.fieldGroup}>
//                         <Text style={styles.fieldLabel}>Email</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={email}
//                             onChangeText={setEmail}
//                             placeholder="Enter your email"
//                             placeholderTextColor="#94a3b8"
//                             keyboardType="email-address"
//                             autoCapitalize="none"
//                         />
//                     </View>

//                     <View style={styles.fieldGroup}>
//                         <Text style={styles.fieldLabel}>Phone</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={phone}
//                             onChangeText={setPhone}
//                             placeholder="Enter your phone"
//                             placeholderTextColor="#94a3b8"
//                             keyboardType="phone-pad"
//                         />
//                     </View>

//                     <View style={styles.fieldGroup}>
//                         <Text style={styles.fieldLabel}>Bio</Text>
//                         <TextInput
//                             style={[styles.input, styles.textArea]}
//                             value={bio}
//                             onChangeText={setBio}
//                             placeholder="Write something about yourself"
//                             placeholderTextColor="#94a3b8"
//                             multiline
//                             numberOfLines={3}
//                         />
//                     </View>
//                 </View>

//                 {/* Save Button */}
//                 <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}
//                     onPress={navigation.goBack}
//                 >
//                     <Text style={styles.saveBtnText}>Save Changes</Text>
//                 </TouchableOpacity>
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },

//     // Header
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 12,
//     },
//     backBtn: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     headerTitle: {
//         fontSize: 16,
//         fontFamily: 'InterBold',
//         fontWeight: '700',
//         color: '#1E293B',
//     },
//     saveText: {
//         fontSize: 15,
//         fontFamily: 'InterMedium',
//         fontWeight: '500',
//         color: '#2869BD',
//     },

//     scrollContent: {
//         paddingBottom: 40,
//     },

//     // Avatar
//     avatarSection: {
//         alignItems: 'center',
//         paddingTop: 28,
//         paddingBottom: 24,
//     },
//     avatarWrapper: {
//         position: 'relative',
//     },
//     avatar: {
//         width: 90,
//         height: 90,
//         borderRadius: 45,
//     },
//     cameraBtn: {
//         position: 'absolute',
//         bottom: 0,
//         right: 0,
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         backgroundColor: '#2869BD',
//         alignItems: 'center',
//         justifyContent: 'center',
//         borderWidth: 2,
//         borderColor: '#fff',
//     },
//     changePhotoText: {
//         marginTop: 10,
//         fontSize: 14,
//         fontFamily: 'InterMedium',
//         fontWeight: '500',
//         color: '#2869BD',
//     },

//     // Form
//     form: {
//         paddingHorizontal: 20,
//         gap: 16,
//     },
//     fieldGroup: {
//         gap: 6,
//     },
//     fieldLabel: {
//         fontSize: 14,
//         fontFamily: 'InterRegular',
//         fontWeight: '500',
//         color: '#565E74',
//     },
//     input: {
//         backgroundColor: '#F3F4F6',
//         borderRadius: 12,
//         paddingHorizontal: 20,
//         paddingVertical: 14,
//         fontSize: 14,
//         fontFamily: 'InterRegular',
//         color: '#1E293B',
//     },
//     textArea: {
//         height: 90,
//         textAlignVertical: 'top',
//     },

//     // Save Button
//     saveBtn: {
//         marginHorizontal: 20,
//         marginTop: 28,
//         backgroundColor: '#2869BD',
//         borderRadius: 14,
//         paddingVertical: 15,
//         alignItems: 'center',
//     },
//     saveBtnText: {
//         fontSize: 14,
//         fontFamily: 'InterSemiBold',
//         fontWeight: '600',
//         color: '#fff',
//     },
// });

// export default ProfileEditScreen;



import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Camera,
    User,
    Upload,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    X,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';
import { getApp } from '../../firebase/app';
import { getAuth, updateProfile } from '../../firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
} from '../../firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from '../../firebase/storage';
import { invalidateProfileCache } from './ProfileScreen';
import { useAppAlert } from '../../context/AlertContext';
import { recordCrashlyticsError } from '../../services';

// ── Validation ───────────────────────────────────────────
const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

// ── Android Camera Permission Helper ─────────────────────
const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: 'Camera Permission',
                message: 'This app requires access to your camera to take a profile photo.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'Allow',
            },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
    }
};

const ProfileEditScreen = ({ navigation }: any) => {

    // ── Form state ───────────────────────────────────────
    const [name,            setName]            = useState('');
    const [email,           setEmail]           = useState('');
    const [phone,           setPhone]           = useState('');
    const [bio,             setBio]             = useState('');

    // ── Image state ──────────────────────────────────────
    const [avatarUri,       setAvatarUri]       = useState<string | null>(null); // local picked preview
    const [avatarUrl,       setAvatarUrl]       = useState<string | null>(null); // firestore stored url
    const [imageFile,       setImageFile]       = useState<any>(null);
    const [isPhotoDeleted,  setIsPhotoDeleted]  = useState<boolean>(false);     // explicit user deletion flag

    // ── UI state ─────────────────────────────────────────
    const [loading,             setLoading]             = useState(true);
    const [saving,              setSaving]              = useState(false);
    const [uploadPct,           setUploadPct]           = useState(0);
    const [pickerModalVisible,  setPickerModalVisible]  = useState(false);       // custom modal state

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;

    const { showSuccess, showError, showAlert } = useAppAlert();

    // ── Derived photo state ──────────────────────────────
    const displayAvatar = isPhotoDeleted ? null : (avatarUri || avatarUrl);
    const hasPhoto      = Boolean(displayAvatar);

    // ── Load existing data from Firestore ─────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    setName(data?.fullName  || '');
                    setEmail(data?.email    || user.email || '');
                    setPhone(data?.phone    || '');
                    setBio(data?.bio        || '');
                    setAvatarUrl(data?.photoURL || null);
                }
            } catch (e) {
                console.log('Fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [db, user]);

    // ── Validation ────────────────────────────────────────
    const validate = (): boolean => {
        if (!name.trim()) {
            showAlert({ title: 'Validation', message: 'Name is required.', type: 'info' });
            return false;
        }
        if (!email.trim() || !isValidEmail(email)) {
            showAlert({ title: 'Validation', message: 'Please enter a valid email address.', type: 'info' });
            return false;
        }
        return true;
    };

    // ── Custom Photo Picker Triggers ──────────────────────
    const handlePickImage = () => {
        setPickerModalVisible(true);
    };

    const handleDeletePhoto = () => {
        setPickerModalVisible(false);
        Alert.alert(
            'Remove Profile Photo',
            'Are you sure you want to remove your profile photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setAvatarUri(null);
                        setImageFile(null);
                        setIsPhotoDeleted(true);
                    },
                },
            ]
        );
    };

    const openCamera = async () => {
        setPickerModalVisible(false);
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            showAlert({
                title: 'Permission Denied',
                message: 'Camera permission is required to take a photo. Please allow camera access in device settings.',
                type: 'info',
            });
            return;
        }

        launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: false, cameraType: 'front' },
            handleImageResponse
        );
    };

    const openGallery = () => {
        setPickerModalVisible(false);
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
            handleImageResponse
        );
    };

    const handleImageResponse = (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode) {
            console.log('ImagePicker error:', response.errorCode, response.errorMessage);
            showAlert({
                title: 'Error',
                message: response.errorMessage || 'Failed to select image.',
                type: 'error',
            });
            return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
            setAvatarUri(asset.uri); 
            setImageFile(asset);
            setIsPhotoDeleted(false);
        }
    };

    // ── Upload image to Firebase Storage ─────────────────
    const uploadImage = async (uid: string): Promise<string> => {
        if (!imageFile?.uri) return avatarUrl || '';

        const storage  = getStorage(app);
        const fileRef  = ref(storage, `profilePhotos/${uid}.jpg`);
        const response = await fetch(imageFile.uri);
        const blob     = await response.blob();

        return new Promise((resolve, reject) => {
            const task = uploadBytesResumable(fileRef, blob);

            task.on(
                'state_changed',
                (snapshot) => {
                    const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadPct(Math.round(pct));
                },
                (error) => reject(error),
                async () => {
                    const snapshot = task.snapshot;
                    if (!snapshot) {
                        reject(new Error('Upload failed'));
                        return;
                    }
                    const url = await getDownloadURL(snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    // ── Delete image from Firebase Storage ───────────────
    const deleteStoragePhoto = async (uid: string) => {
        try {
            const storage = getStorage(app);
            const fileRef = ref(storage, `profilePhotos/${uid}.jpg`);
            await deleteObject(fileRef);
        } catch (e: any) {
            // Ignore error if file did not exist on Firebase Storage
            console.log('[Storage] Delete photo notice:', e?.message || e);
        }
    };

    // ── Save Changes ──────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        if (!user) return;

        setSaving(true);
        try {
            let finalPhotoURL = '';

            if (isPhotoDeleted) {
                // Delete photo from Firebase Storage
                await deleteStoragePhoto(user.uid);
                finalPhotoURL = '';
            } else if (imageFile) {
                // Upload new photo to Firebase Storage
                finalPhotoURL = await uploadImage(user.uid);
            } else {
                // Keep existing photo URL
                finalPhotoURL = avatarUrl || '';
            }

            // Step 1: Update Firestore user document
            await updateDoc(doc(db, 'users', user.uid), {
                fullName: name.trim(),
                phone:    phone.trim(),
                bio:      bio.trim(),
                photoURL: finalPhotoURL,
            });

            // Step 2: Update Firebase Auth Profile
            try {
                await updateProfile(user, { photoURL: finalPhotoURL });
            } catch (authErr) {
                console.log('[Auth] updateProfile photoURL error:', authErr);
            }

            // Step 3: Update local state & reset deletion flag
            setAvatarUrl(finalPhotoURL || null);
            setAvatarUri(null);
            setImageFile(null);
            setIsPhotoDeleted(false);

            invalidateProfileCache(); // Force refresh on profile screen
            showSuccess('Success', 'Profile updated successfully!', () => {
                navigation.goBack();
            });
        } catch (error: any) {
            recordCrashlyticsError(error, 'profile_edit');
            showError('Error', error.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
            setUploadPct(0);
        }
    };

    // ── Loading Screen ───────────────────────────────────
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2869BD" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.7}
                >
                    {saving
                        ? <ActivityIndicator size="small" color="#2869BD" />
                        : <Text style={styles.saveText}>Save</Text>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={handlePickImage}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Profile Photo"
                    >
                        {displayAvatar ? (
                            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <User size={40} color="#94A3B8" />
                            </View>
                        )}
                        <View style={styles.cameraBtn}>
                            <Camera size={15} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Dynamic Action Buttons: Upload/Change & Delete */}
                    <View style={styles.photoActionsContainer}>
                        <TouchableOpacity
                            style={styles.photoActionBtnPrimary}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                        >
                            {hasPhoto ? (
                                <Camera size={15} color="#2869BD" style={styles.btnIcon} />
                            ) : (
                                <Upload size={15} color="#2869BD" style={styles.btnIcon} />
                            )}
                            <Text style={styles.photoActionTextPrimary}>
                                {hasPhoto ? 'Change Photo' : 'Upload Photo'}
                            </Text>
                        </TouchableOpacity>

                        {hasPhoto && (
                            <TouchableOpacity
                                style={styles.photoActionBtnDelete}
                                onPress={handleDeletePhoto}
                                activeOpacity={0.8}
                            >
                                <Trash2 size={15} color="#EF4444" style={styles.btnIcon} />
                                <Text style={styles.photoActionTextDelete}>Delete Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Upload Progress Bar */}
                    {saving && imageFile && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${uploadPct}%` }]} />
                            </View>
                            <Text style={styles.uploadPctText}>{uploadPct}% Uploaded</Text>
                        </View>
                    )}
                </View>

                {/* Form */}
                <View style={styles.form}>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Full Name <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Email <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.inputReadOnly]}
                            value={email}
                            placeholder="Enter your email"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email changes are locked for now to keep Firebase login stable.</Text>
                    </View>

                    {/* Phone */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+880 1700 000000"
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Write something about yourself"
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={3}
                            maxLength={150}
                        />
                    </View>

                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <View style={styles.savingRow}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={[styles.saveBtnText, { marginLeft: 8 }]}>
                                {imageFile ? `Uploading ${uploadPct}%` : 'Saving...'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Custom Designed Photo Picker Modal Sheet */}
            <Modal
                visible={pickerModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPickerModalVisible(false)}
                >
                    <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                        {/* Sheet Drag Indicator Handle */}
                        <View style={styles.modalHandle} />

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>
                                    {hasPhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Select how you would like to set your picture
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => setPickerModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Options List */}
                        <View style={styles.modalOptions}>
                            {/* Take Photo Card */}
                            <TouchableOpacity
                                style={styles.modalOptionCard}
                                activeOpacity={0.75}
                                onPress={openCamera}
                            >
                                <View style={[styles.modalOptionIconBox, { backgroundColor: '#EFF6FF' }]}>
                                    <Camera size={22} color="#2869BD" />
                                </View>
                                <View style={styles.modalOptionContent}>
                                    <Text style={styles.modalOptionTitle}>Take Photo</Text>
                                    <Text style={styles.modalOptionSub}>Use your camera to capture a new picture</Text>
                                </View>
                                <ChevronRight size={18} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Choose from Gallery Card */}
                            <TouchableOpacity
                                style={styles.modalOptionCard}
                                activeOpacity={0.75}
                                onPress={openGallery}
                            >
                                <View style={[styles.modalOptionIconBox, { backgroundColor: '#F0FDF4' }]}>
                                    <ImageIcon size={22} color="#16A34A" />
                                </View>
                                <View style={styles.modalOptionContent}>
                                    <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                                    <Text style={styles.modalOptionSub}>Select an existing photo from your library</Text>
                                </View>
                                <ChevronRight size={18} color="#94A3B8" />
                            </TouchableOpacity>

                            {/* Remove Photo Card (If photo exists) */}
                            {hasPhoto && (
                                <TouchableOpacity
                                    style={[styles.modalOptionCard, styles.modalOptionCardDanger]}
                                    activeOpacity={0.75}
                                    onPress={handleDeletePhoto}
                                >
                                    <View style={[styles.modalOptionIconBox, { backgroundColor: '#FEF2F2' }]}>
                                        <Trash2 size={22} color="#EF4444" />
                                    </View>
                                    <View style={styles.modalOptionContent}>
                                        <Text style={[styles.modalOptionTitle, { color: '#EF4444' }]}>Remove Photo</Text>
                                        <Text style={styles.modalOptionSub}>Delete your current profile photo</Text>
                                    </View>
                                    <ChevronRight size={18} color="#FCA5A5" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            activeOpacity={0.8}
                            onPress={() => setPickerModalVisible(false)}
                        >
                            <Text style={styles.modalCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex:            1,
        backgroundColor: '#fff',
    },
    centered: {
        flex:           1,
        justifyContent: 'center',
        alignItems:     'center',
    },

    // ── Header ───────────────────────────────────────────
    header: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal:  20,
        paddingVertical:    12,
    },
    backBtn: {
        width:          36,
        height:         36,
        borderRadius:   18,
        alignItems:     'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize:   16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color:      '#1E293B',
    },
    saveText: {
        fontSize:   15,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color:      '#2869BD',
    },

    scrollContent: {
        paddingBottom: 40,
    },

    // ── Avatar Section ───────────────────────────────────
    avatarSection: {
        alignItems:    'center',
        paddingTop:     24,
        paddingBottom:  20,
    },
    avatarWrapper: {
        position:     'relative',
        marginBottom:  16,
    },
    avatar: {
        width:        100,
        height:       100,
        borderRadius: 50,
        borderWidth:  3,
        borderColor:  '#F1F5F9',
    },
    avatarPlaceholder: {
        width:           100,
        height:          100,
        borderRadius:    50,
        backgroundColor: '#F1F5F9',
        alignItems:      'center',
        justifyContent:  'center',
        borderWidth:      3,
        borderColor:     '#E2E8F0',
    },
    cameraBtn: {
        position:        'absolute',
        bottom:           2,
        right:            2,
        width:            32,
        height:           32,
        borderRadius:     16,
        backgroundColor: '#2869BD',
        alignItems:      'center',
        justifyContent:  'center',
        borderWidth:      2.5,
        borderColor:     '#fff',
        elevation:        3,
    },

    // ── Action Buttons (Upload / Change & Delete) ────────
    photoActionsContainer: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            10,
    },
    photoActionBtnPrimary: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'center',
        paddingHorizontal:  16,
        paddingVertical:    9,
        borderRadius:       20,
        backgroundColor:   '#EFF6FF',
        borderWidth:        1,
        borderColor:       '#BFDBFE',
    },
    photoActionTextPrimary: {
        fontSize:   13,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color:      '#2869BD',
    },
    photoActionBtnDelete: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'center',
        paddingHorizontal:  14,
        paddingVertical:    9,
        borderRadius:       20,
        backgroundColor:   '#FEF2F2',
        borderWidth:        1,
        borderColor:       '#FECACA',
    },
    photoActionTextDelete: {
        fontSize:   13,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color:      '#EF4444',
    },
    btnIcon: {
        marginRight: 6,
    },

    // ── Progress Bar ─────────────────────────────────────
    progressContainer: {
        alignItems: 'center',
        marginTop:  12,
    },
    progressTrack: {
        width:           160,
        height:            5,
        backgroundColor: '#E2E8F0',
        borderRadius:      3,
        overflow:        'hidden',
    },
    progressFill: {
        height:          5,
        backgroundColor: '#2869BD',
        borderRadius:    3,
    },
    uploadPctText: {
        fontSize:   11,
        fontFamily: 'InterRegular',
        color:      '#64748B',
        marginTop:   4,
    },

    // ── Form ─────────────────────────────────────────────
    form: {
        paddingHorizontal: 20,
        gap:               16,
    },
    fieldGroup: {
        gap: 6,
    },
    fieldLabel: {
        fontSize:   14,
        fontFamily: 'InterRegular',
        fontWeight: '500',
        color:      '#565E74',
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor:   '#F3F4F6',
        borderRadius:       12,
        paddingHorizontal:  20,
        paddingVertical:    14,
        fontSize:           14,
        fontFamily:        'InterRegular',
        color:             '#1E293B',
    },
    inputReadOnly: {
        color: '#64748B',
    },
    textArea: {
        height:            90,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize:   12,
        color:      '#94A3B8',
        fontFamily: 'InterRegular',
        marginTop:   2,
    },

    // ── Save Button ──────────────────────────────────────
    saveBtn: {
        marginHorizontal: 20,
        marginTop:        28,
        backgroundColor:  '#2869BD',
        borderRadius:      14,
        paddingVertical:   15,
        alignItems:       'center',
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        fontSize:   14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color:      '#fff',
    },
    savingRow: {
        flexDirection: 'row',
        alignItems:    'center',
    },

    // ── Modal Sheet Styles ──────────────────────────────
    modalOverlay: {
        flex:            1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent:  'flex-end',
    },
    modalSheet: {
        backgroundColor:     '#FFFFFF',
        borderTopLeftRadius:  28,
        borderTopRightRadius: 28,
        paddingHorizontal:    24,
        paddingTop:           12,
        paddingBottom:        Platform.OS === 'ios' ? 36 : 24,
        shadowColor:         '#000',
        shadowOffset:        { width: 0, height: -4 },
        shadowOpacity:       0.15,
        shadowRadius:        12,
        elevation:           10,
    },
    modalHandle: {
        width:           38,
        height:          4,
        borderRadius:    2,
        backgroundColor: '#E2E8F0',
        alignSelf:       'center',
        marginBottom:    16,
    },
    modalHeader: {
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   20,
    },
    modalTitle: {
        fontSize:   18,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color:      '#0F172A',
    },
    modalSubtitle: {
        fontSize:   13,
        fontFamily: 'InterRegular',
        color:      '#64748B',
        marginTop:   2,
    },
    modalCloseBtn: {
        width:           32,
        height:          32,
        borderRadius:    16,
        backgroundColor: '#F1F5F9',
        alignItems:      'center',
        justifyContent:  'center',
    },
    modalOptions: {
        gap:          12,
        marginBottom: 20,
    },
    modalOptionCard: {
        flexDirection:   'row',
        alignItems:      'center',
        padding:         14,
        borderRadius:    16,
        backgroundColor: '#F8FAFC',
        borderWidth:     1,
        borderColor:     '#F1F5F9',
    },
    modalOptionCardDanger: {
        backgroundColor: '#FFF5F5',
        borderColor:     '#FEE2E2',
    },
    modalOptionIconBox: {
        width:          44,
        height:         44,
        borderRadius:   12,
        alignItems:     'center',
        justifyContent: 'center',
        marginRight:    14,
    },
    modalOptionContent: {
        flex: 1,
    },
    modalOptionTitle: {
        fontSize:   15,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color:      '#1E293B',
    },
    modalOptionSub: {
        fontSize:   12,
        fontFamily: 'InterRegular',
        color:      '#64748B',
        marginTop:   2,
    },
    modalCancelBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius:    14,
        paddingVertical: 14,
        alignItems:      'center',
    },
    modalCancelBtnText: {
        fontSize:   15,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color:      '#475569',
    },
});

export default ProfileEditScreen;


