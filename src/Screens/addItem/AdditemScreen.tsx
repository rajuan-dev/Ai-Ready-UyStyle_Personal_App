import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    ActionSheetIOS,
    Animated,
    Keyboard,
    PermissionsAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    ArrowUpFromLine,
    Camera,
    Image as ImageIcon,
    X,
    Plus,
    Check,
    XIcon,
    ChevronLeft,
} from 'lucide-react-native';
import { styles } from './style';
import {
    launchCamera,
    launchImageLibrary,
    ImagePickerResponse,
} from 'react-native-image-picker';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import { useAppAlert } from '../../context/AlertContext';
import { addNotification } from '../../utils/notifications';
import { invalidateFavoriteLooksCache } from '../FavoriteLooksScreen/FavoriteLooksScreen';
import { invalidateClosetCache } from '../closet/ClosetScreen';
import {
  logAddClosetItem,
  logCrashlytics,
  recordCrashlyticsError,
} from '../../services';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
} from '../../firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    refFromURL,
    deleteObject,
} from '../../firebase/storage';
import { getTabScreenBottomPadding } from '../../theme/layout';

// ─── Default built-in categories ─────────────────────────────────────────────
const DEFAULT_CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories', 'Others'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
    id: string;
    name: string;
    isCustom: boolean;
}

interface CategoryCardProps {
    visible: boolean;
    initialValue?: string;
    onSubmit: (name: string) => void;
    onCancel: () => void;
    loading: boolean;
    mode: 'create' | 'edit';
}

// ─── CategoryCard ─────────────────────────────────────────────────────────────
const CategoryCard: React.FC<CategoryCardProps> = ({
    visible, initialValue = '', onSubmit, onCancel, loading, mode,
}) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setValue(initialValue);
            Animated.spring(slideAnim, {
                toValue: 1, useNativeDriver: true, bounciness: 6,
            }).start(() => inputRef.current?.focus());
        } else {
            Animated.timing(slideAnim, {
                toValue: 0, duration: 180, useNativeDriver: true,
            }).start();
        }
    }, [visible, initialValue]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                categoryCardStyles.card,
                {
                    opacity: slideAnim,
                    transform: [{
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1], outputRange: [-8, 0],
                        }),
                    }],
                },
            ]}
        >
            <Text style={categoryCardStyles.cardTitle}>
                {mode === 'create' ? '✦ New Category' : '✎ Edit Category'}
            </Text>
            <TextInput
                ref={inputRef}
                style={categoryCardStyles.cardInput}
                value={value}
                onChangeText={setValue}
                placeholder="e.g. Swimwear, Loungewear…"
                placeholderTextColor="#94a3b8"
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={() => value.trim() && onSubmit(value.trim())}
            />
            <Text style={categoryCardStyles.charCount}>{value.length}/30</Text>
            <View style={categoryCardStyles.cardActions}>
                <TouchableOpacity
                    style={categoryCardStyles.cancelBtn}
                    onPress={() => { Keyboard.dismiss(); onCancel(); }}
                    activeOpacity={0.75}
                >
                    <Text style={categoryCardStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        categoryCardStyles.confirmBtn,
                        (!value.trim() || loading) && categoryCardStyles.confirmBtnDisabled,
                    ]}
                    onPress={() => value.trim() && onSubmit(value.trim())}
                    disabled={!value.trim() || loading}
                    activeOpacity={0.8}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <>
                            <Check size={14} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={categoryCardStyles.confirmText}>
                                {mode === 'create' ? 'Create' : 'Save'}
                            </Text>
                          </>
                    }
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ─── Camera Permission Helper ─────────────────────────────────────────────────
/**
 * Checks and requests camera permission on both iOS and Android.
 * Returns true if permission is granted, false otherwise.
 */
const requestCameraPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            // Android: use PermissionsAndroid directly (works without react-native-permissions too)
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'Closet needs access to your camera to take photos of clothing items.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Deny',
                    buttonPositive: 'Allow',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;

            // User denied — show guidance
            Alert.alert(
                'Camera Access Denied',
                'To take photos, go to Settings → Apps → [App Name] → Permissions → Camera and enable it.',
                [{ text: 'OK' }],
            );
            return false;
        }

        // iOS: react-native-image-picker handles the permission dialog automatically
        // on first launch. If the user previously denied it we guide them to Settings.
        // We detect denial by attempting a launch with a very short timeout trick —
        // instead, we just let launchCamera handle it and rely on didCancel / errorCode.
        // Nothing extra needed here for iOS.
        return true;
    } catch (err) {
        console.warn('[Camera Permission]', err);
        return false;
    }
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdditemScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const initialItem = route.params?.initialItem;
    const returnScreen = route.params?.returnScreen;

    // ── Image state
    const [imageUri,  setImageUri]  = useState<string | null>(initialItem?.imageURL || null);
    const [imageFile, setImageFile] = useState<any>(null);

    // ── Form state
    const [title,    setTitle]    = useState(initialItem?.title || '');
    const [category, setCategory] = useState(initialItem?.category || '');
    const [color,    setColor]    = useState(initialItem?.color || '');

    // ── Category state
    const [categories,      setCategories]      = useState<Category[]>([]);
    const [showCreateCard,  setShowCreateCard]  = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryLoading, setCategoryLoading] = useState(false);

    // ── Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadPct, setUploadPct] = useState(0);

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;

    const { showSuccess, showError, showAlert, showConfirm } = useAppAlert();

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        if (returnScreen === 'Closet') {
            navigation.navigate('bottombar', { screen: 'Closet' });
            return;
        }

        navigation.navigate('Add');
    }, [navigation, returnScreen]);

    // ── Fetch categories from Firestore
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'categories'), where('userId', '==', user.uid));
        const unsub = onSnapshot(q, (snapshot) => {
            const defaults: Category[] = DEFAULT_CATEGORIES.map(name => ({
                id: '', name, isCustom: false,
            }));
            const custom: Category[] = snapshot.docs.map(d => ({
                id: d.id,
                name: d.data().name as string,
                isCustom: true,
            }));
            setCategories([...defaults, ...custom]);
        });
        return () => unsub();
    }, [user]);

    // ── Helpers
    const isDuplicate = (name: string, excludeId?: string) =>
        categories.some(
            c => c.name.toLowerCase() === name.toLowerCase() && c.id !== (excludeId ?? '__never__'),
        );

    const handleCreateCategory = async (name: string) => {
        if (isDuplicate(name)) { showAlert({ title: 'Duplicate', message: `"${name}" already exists.`, type: 'info' }); return; }
        if (!user) return;
        setCategoryLoading(true);
        try {
            await addDoc(collection(db, 'categories'), {
                userId: user.uid, name: name.trim(), createdAt: serverTimestamp(),
            });
            setCategory(name.trim());
            setShowCreateCard(false);
        } catch (e: any) {
            showError('Error', e.message);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleEditCategory = async (name: string) => {
        if (!editingCategory) return;
        if (isDuplicate(name, editingCategory.id)) { showAlert({ title: 'Duplicate', message: `"${name}" already exists.`, type: 'info' }); return; }
        setCategoryLoading(true);
        try {
            await updateDoc(doc(db, 'categories', editingCategory.id), { name: name.trim() });
            if (category === editingCategory.name) setCategory(name.trim());
            setEditingCategory(null);
        } catch (e: any) {
            showError('Error', e.message);
        } finally {
            setCategoryLoading(false);
        }
    };

    // ── Delete category
    const confirmDelete = (cat: Category) => {
        showConfirm(
            'Delete Category',
            `Remove "${cat.name}"? Items already tagged will keep this value.`,
            async () => {
                try {
                    await deleteDoc(doc(db, 'categories', cat.id));
                    if (category === cat.name) setCategory('');
                } catch (e: any) {
                    showError('Error', e.message);
                }
            }
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Camera — request permission first, then launch
    // ─────────────────────────────────────────────────────────────────────────
    const openCamera = async () => {
        const allowed = await requestCameraPermission();
        if (!allowed) return;

        launchCamera(
            {
                mediaType: 'photo',
                saveToPhotos: false,
                quality: 1,           // PhotoQuality only accepts 0|0.1|0.2…|1
                cameraType: 'back',
            },
            handleImageResponse,
        );
    };

    const openGallery = () =>
        launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 1 }, handleImageResponse);

    // ── Show action sheet / alert to choose source
    const handleAddImage = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    // index 0 = Cancel (destructive-ish), 1 = Take Photo, 2 = Gallery
                    options: ['Cancel', '📷 Take Photo', '📁 Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (index) => {
                    if (index === 1) openCamera();
                    if (index === 2) openGallery();
                },
            );
        } else {
            Alert.alert('Add Photo', 'Choose an option', [
                { text: 'Cancel',                 style: 'cancel' },
                { text: '📷 Take Photo',           onPress: openCamera },
                { text: '📁 Choose from Gallery',  onPress: openGallery },
            ]);
        }
    };

    const handleImageResponse = (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) { setImageUri(asset.uri); setImageFile(asset); }
    };

    const clearImage = () => { setImageUri(null); setImageFile(null); };

    // ── Upload image to Firebase Storage
    const uploadImage = async (uid: string): Promise<string> => {
        const storage  = getStorage(app);
        const fileRef  = ref(storage, `closet/${uid}/${Date.now()}.jpg`);
        const response = await fetch(imageFile.uri);
        const blob     = await response.blob();

        return new Promise((resolve, reject) => {
            const task = uploadBytesResumable(fileRef, blob);
            task.on(
                'state_changed',
                (snap) => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
                reject,
                async () => {
                    const url = await getDownloadURL(task.snapshot!.ref);
                    resolve(url);
                },
            );
        });
    };

    // ── Validate form
    const validate = (): boolean => {
        if (!imageUri)     { showAlert({ title: 'Required', message: 'Please select an image first.', type: 'info' });       return false; }
        if (!title.trim()) { showAlert({ title: 'Required', message: 'Please enter a title for the item.', type: 'info' });  return false; }
        if (!category)     { showAlert({ title: 'Required', message: 'Please select or create a category.', type: 'info' }); return false; }
        return true;
    };

    // ── Save item to Firestore
    const handleSave = async () => {
        if (!validate() || !user) return;
        setUploading(true);
        try {
            let finalImageURL = initialItem?.imageURL || '';
            if (imageFile) {
                finalImageURL = await uploadImage(user.uid);
            }

             if (initialItem) {
                await updateDoc(doc(db, 'closetItems', initialItem.id), {
                    title:  title.trim(),
                    category,
                    color:  color.trim(),
                    imageURL: finalImageURL,
                });
                invalidateFavoriteLooksCache(initialItem.id);
                invalidateClosetCache();
                await addNotification(
                    user.uid,
                    'Closet Updated',
                    `Successfully updated "${title.trim()}" details in your ${category} collection.`,
                    'system',
                    undefined,
                    { itemId: initialItem.id }
                );
                showSuccess('Updated!', 'Item details have been updated.', () => {
                    handleBack();
                });
            } else {
                const docRef = await addDoc(collection(db, 'closetItems'), {
                    userId: user.uid,
                    title:  title.trim(),
                    category,
                    color:  color.trim(),
                    imageURL: finalImageURL,
                    createdAt: serverTimestamp(),
                });
                // ── Analytics: new closet item saved
                logAddClosetItem(category);
                logCrashlytics(`closet_item_saved category=${category}`);
                invalidateFavoriteLooksCache(docRef.id);
                invalidateClosetCache();
                await addNotification(
                    user.uid,
                    'Closet Updated',
                    `Successfully added "${title.trim()}" to your ${category} collection.`,
                    'system',
                    undefined,
                    { itemId: docRef.id }
                );
                showSuccess('Success!', 'Item added to your closet.', () => {
                    setImageUri(null); setImageFile(null);
                    setTitle(''); setCategory(''); setColor('');
                    setUploadPct(0);
                });
            }
        } catch (e: any) {
            recordCrashlyticsError(e, 'add_closet_item');
            showError('Error', e.message);
        } finally {
            setUploading(false); setUploadPct(0);
        }
    };

    // ── Delete item (Firestore + Storage) ──────────────────────────────────────
    const handleDeleteItem = () => {
        if (!initialItem || !user) return;

        showConfirm(
            'Delete Clothing Item',
            'Are you sure you want to permanently delete this item from your closet? This action cannot be undone.',
            async () => {
                setUploading(true);
                try {
                    // 1. Delete photo from Firebase Storage
                    if (initialItem.imageURL && initialItem.imageURL.includes('firebasestorage')) {
                        try {
                            const storage = getStorage(app);
                            const fileRef = refFromURL(storage, initialItem.imageURL);
                            await deleteObject(fileRef);
                            console.log('[Storage] Photo deleted from Firebase Storage.');
                        } catch (storageErr) {
                            console.warn('[Storage deletion warning]', storageErr);
                        }
                    }

                    // 2. Delete orphaned like document
                    try {
                        const likeRef = doc(db, 'likes', `${user.uid}_${initialItem.id}`);
                        await deleteDoc(likeRef);
                    } catch (likeErr) {
                        console.warn('[Like deletion warning]', likeErr);
                    }

                    // 3. Delete Firestore closetItem document
                    await deleteDoc(doc(db, 'closetItems', initialItem.id));
                    invalidateFavoriteLooksCache(initialItem.id);
                    invalidateClosetCache();
                    await addNotification(
                        user.uid,
                        'Closet Updated',
                        `Successfully removed "${initialItem.title}" from your closet.`,
                        'system',
                        'Closet'
                    );

                    showSuccess('Deleted!', 'Clothing item has been removed from your closet.', () => {
                        handleBack();
                    });
                } catch (e: any) {
                    showError('Error', `Failed to delete item: ${e.message}`);
                } finally {
                    setUploading(false);
                }
            }
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={[styles.header, initialItem && { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                {initialItem && (
                    <TouchableOpacity 
                        onPress={handleBack}
                        activeOpacity={0.7}
                        style={{
                            padding: 4,
                            marginLeft: -4,
                        }}
                    >
                        <ChevronLeft size={24} color="#0F1729" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{initialItem ? 'Edit Item' : 'Add New Item'}</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: getTabScreenBottomPadding(insets.bottom) },
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.subtitle}>
                        {initialItem ? 'Update your clothing piece details below.' : 'Upload a clothing piece to add it to your closet.'}
                    </Text>

                    {/* ── Image Preview / Upload Box ── */}
                    {imageUri ? (
                        <View style={styles.previewWrapper}>
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.removeBtn} onPress={clearImage} activeOpacity={0.8}>
                                <X size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.changeBtn} onPress={handleAddImage} activeOpacity={0.8}>
                                <Text style={styles.changeBtnText}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8} onPress={handleAddImage}>
                            <View style={styles.uploadIconWrapper}>
                                <ArrowUpFromLine size={26} color="#fff" />
                            </View>
                            <Text style={styles.uploadTitle}>Tap to upload photo</Text>
                            <Text style={styles.uploadSub}>Take a photo or choose from gallery</Text>
                        </TouchableOpacity>
                    )}

                    {/* ── Camera / Gallery Buttons ── */}
                    {!imageUri && (
                        <>
                            {/* Take Photo button — requests permission before opening camera */}
                            <TouchableOpacity
                                style={[styles.optionRow, styles.primeryButton]}
                                onPress={openCamera}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIcon, styles.primeryButtonIcon]}>
                                    <Camera size={20} color="#fff" />
                                </View>
                                <Text style={[styles.optionText, styles.primeryButtonText]}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionRow} onPress={openGallery} activeOpacity={0.8}>
                                <View style={styles.optionIcon}>
                                    <ImageIcon size={20} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>Choose from Gallery</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ── Item Details Form ── */}
                    {imageUri && (
                        <View style={styles.form}>
                            <Text style={styles.formTitle}>Item Details</Text>

                            {/* Title */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>
                                    Title <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g. White Cotton T-Shirt"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Category */}
                            <View style={styles.fieldGroup}>
                                <View style={categoryStyles.labelRow}>
                                    <Text style={styles.fieldLabel}>
                                        Category <Text style={styles.required}>*</Text>
                                    </Text>
                                    {category !== '' && (
                                        <Text style={categoryStyles.selectedBadge}>{category}</Text>
                                    )}
                                </View>

                                <View style={styles.categoryRow}>
                                    {categories.map((cat) => (
                                        <View key={cat.id || cat.name} style={categoryStyles.chipWrapper}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.categoryChip,
                                                    category === cat.name && styles.categoryChipActive,
                                                    categoryStyles.chip,
                                                ]}
                                                onPress={() => {
                                                    setCategory(cat.name);
                                                    setShowCreateCard(false);
                                                    setEditingCategory(null);
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.categoryChipText,
                                                    category === cat.name && styles.categoryChipTextActive,
                                                ]}>
                                                    {cat.name}
                                                </Text>
                                            </TouchableOpacity>

                                            {cat.isCustom && (
                                                <View style={categoryStyles.chipActions}>
                                                    <TouchableOpacity
                                                        style={categoryStyles.chipActionBtn}
                                                        onPress={() => confirmDelete(cat)}
                                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                                    >
                                                        <XIcon size={15} color="#ef4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={[
                                            categoryStyles.createChip,
                                            showCreateCard && categoryStyles.createChipActive,
                                        ]}
                                        onPress={() => {
                                            setEditingCategory(null);
                                            setShowCreateCard(prev => !prev);
                                        }}
                                        activeOpacity={0.75}
                                    >
                                        <Plus size={15} color={showCreateCard ? '#fff' : '#0f172a'} />
                                        <Text style={[
                                            categoryStyles.createChipText,
                                            showCreateCard && categoryStyles.createChipTextActive,
                                        ]}>
                                            Create New
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <CategoryCard
                                    visible={showCreateCard}
                                    mode="create"
                                    onSubmit={handleCreateCategory}
                                    onCancel={() => setShowCreateCard(false)}
                                    loading={categoryLoading}
                                />

                                <CategoryCard
                                    visible={!!editingCategory}
                                    mode="edit"
                                    initialValue={editingCategory?.name ?? ''}
                                    onSubmit={handleEditCategory}
                                    onCancel={() => setEditingCategory(null)}
                                    loading={categoryLoading}
                                />
                            </View>

                            {/* Color */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Color</Text>
                                <TextInput
                                    style={styles.input}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="e.g. Blue"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Save */}
                            <TouchableOpacity
                                style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
                                onPress={handleSave}
                                disabled={uploading}
                                activeOpacity={0.85}
                            >
                                {uploading ? (
                                    <View style={{ alignItems: 'center' }}>
                                        <ActivityIndicator color="#fff" />
                                        {uploadPct > 0 && (
                                            <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
                                                {uploadPct}%
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.saveBtnText}>{initialItem ? 'Save Changes' : 'Add to Closet'}</Text>
                                )}
                            </TouchableOpacity>

                            {/* Delete Button (Only visible in Edit Mode) */}
                            {initialItem && (
                                <TouchableOpacity
                                    style={[deleteStyles.deleteBtn, uploading && deleteStyles.deleteBtnDisabled]}
                                    onPress={handleDeleteItem}
                                    disabled={uploading}
                                    activeOpacity={0.85}
                                >
                                    <Text style={deleteStyles.deleteBtnText}>Delete Item</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdditemScreen;

// ─── Local styles ─────────────────────────────────────────────────────────────
import { StyleSheet } from 'react-native';

const categoryStyles = StyleSheet.create({
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    selectedBadge: {
        fontSize: 11,
        color: '#0f172a',
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
        fontWeight: '600',
    },
    chip: {
        marginBottom: 0,
    },
    chipWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        marginRight: 8,
        marginBottom: 10,
    },
    chipActions: {
        position: 'absolute',
        top: -15,
        right: -1,
        flexDirection: 'row',
        gap: 4,
        zIndex: 10,
    },
    chipActionBtn: {
        padding: 2,
    },
    createChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginBottom: 30,
        borderRadius: 99,
        padding: 10,
        backgroundColor: '#94a3b8',
    },
    createChipActive: {
        backgroundColor: '#0f172a',
        height: 40,
        padding: 10,
        borderRadius: 100,
    },
    createChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    createChipTextActive: {
        color: '#fff',
        textAlign: 'center',
    },
});

const categoryCardStyles = StyleSheet.create({
    card: {
        marginTop: 4,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    cardInput: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '500',
    },
    charCount: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: 4,
        marginBottom: 2,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    confirmBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    confirmText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
});

const deleteStyles = StyleSheet.create({
    deleteBtn: {
        backgroundColor: '#FFF1F2',
        borderWidth: 1.5,
        borderColor: '#FFE4E6',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteBtnDisabled: {
        opacity: 0.6,
    },
    deleteBtnText: {
        fontSize: 15,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#E11D48',
    },
});
