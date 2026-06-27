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
    ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
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
} from '../../firebase/storage';
import { invalidateProfileCache } from './ProfileScreen';
import { useAppAlert } from '../../context/AlertContext';
import { recordCrashlyticsError } from '../../services';

// ── Validation ───────────────────────────────────────────
const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

const ProfileEditScreen = ({ navigation }: any) => {

    // ── Form state ───────────────────────────────────────
    const [name,      setName]      = useState('');
    const [email,     setEmail]     = useState('');
    const [phone,     setPhone]     = useState('');
    const [bio,       setBio]       = useState('');

    // ── Image state ──────────────────────────────────────
    const [avatarUri,  setAvatarUri]  = useState<string | null>(null); // local preview
    const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null); // firestore url
    const [imageFile,  setImageFile]  = useState<any>(null);

    // ── UI state ─────────────────────────────────────────
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [uploadPct,  setUploadPct]  = useState(0);

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;

    const { showSuccess, showError, showAlert } = useAppAlert();

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

    // ── Image Picker ──────────────────────────────────────
    const handlePickImage = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options:           ['Cancel', 'Open Gallery', 'Camera'],
                    cancelButtonIndex:  0,
                },
                (index) => {
                    if (index === 1) openGallery();
                    if (index === 2) openCamera();
                }
            );
        } else {
            Alert.alert('Profile Photo', 'Choose an option', [
                { text: 'Cancel',       style: 'cancel'  },
                { text: 'Open Gallery', onPress: openGallery },
                { text: 'Camera',       onPress: openCamera  },
            ]);
        }
    };

    const openCamera = () => {
        launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
            handleImageResponse
        );
    };

    const openGallery = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
            handleImageResponse
        );
    };

    const handleImageResponse = (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) {
            setAvatarUri(asset.uri); 
            setImageFile(asset);
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

    // ── Save Changes ──────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        if (!user) return;

        setSaving(true);
        try {
           
            const photoURL = imageFile
                ? await uploadImage(user.uid)
                : (avatarUrl || '');

            // Step 2: Firestore update
            await updateDoc(doc(db, 'users', user.uid), {
                fullName: name.trim(),
                phone:    phone.trim(),
                bio:      bio.trim(),
                photoURL,
            });

            invalidateProfileCache(); // Force refresh on profile screen
            showSuccess('Success', 'Profile updated successfully!', () => {
                navigation.goBack();
            });
        } catch (error: any) {
            recordCrashlyticsError(error, 'profile_edit');
            showError('Error', error.message);
        } finally {
            setSaving(false);
            setUploadPct(0);
        }
    };

    // ── Loading Screen ─────
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2869BD" />
            </View>
        );
    }

    const displayAvatar = avatarUri || avatarUrl;

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
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                    >
                        {displayAvatar ? (
                            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <User size={38} color="#94A3B8" />
                            </View>
                        )}
                        <View style={styles.cameraBtn}>
                            <Camera size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Photo</Text>

                    {/* Upload Progress Bar */}
                    {saving && imageFile && (
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${uploadPct}%` }]} />
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

    // ── Avatar ───────────────────────────────────────────
    avatarSection: {
        alignItems:    'center',
        paddingTop:     28,
        paddingBottom:  24,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width:        90,
        height:       90,
        borderRadius: 45,
    },
    avatarPlaceholder: {
        width:           90,
        height:          90,
        borderRadius:    45,
        backgroundColor: '#E2E8F0',
        alignItems:      'center',
        justifyContent:  'center',
    },
    cameraBtn: {
        position:        'absolute',
        bottom:           0,
        right:            0,
        width:            30,
        height:           30,
        borderRadius:     15,
        backgroundColor: '#2869BD',
        alignItems:      'center',
        justifyContent:  'center',
        borderWidth:      2,
        borderColor:     '#fff',
    },
    changePhotoText: {
        marginTop:  10,
        fontSize:   14,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color:      '#2869BD',
    },

    // ── Progress Bar ─────────────────────────────────────
    progressTrack: {
        width:           140,
        height:            4,
        backgroundColor: '#E2E8F0',
        borderRadius:      2,
        marginTop:        10,
        overflow:        'hidden',
    },
    progressFill: {
        height:          4,
        backgroundColor: '#2869BD',
        borderRadius:    2,
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
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'InterRegular',
        marginTop: 2,
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
});

export default ProfileEditScreen;
