import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useAppAlert } from '../../context/AlertContext';

// ─── Firebase Modular v22 imports ─────────────────────────────────────────────
import { getApp } from '../../firebase/app';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from '../../firebase/firestore';
import { getAuth } from '../../firebase/auth';
import { invalidateProfileCache } from './ProfileScreen';
// ─────────────────────────────────────────────────────────────────────────────

interface StyleCategory {
    id: string;
    title: string;
    description: string;
    emoji: string;
}

interface OccasionItem {
    id: string;
    label: string;
}

interface ColorItem {
    id: string;
    color: string;
    label: string;
}

const styleCategories: StyleCategory[] = [
    { id: 'casual',     title: 'Casual',     description: 'Everyday relaxed looks',   emoji: '👕' },
    { id: 'formal',     title: 'Formal',     description: 'Professional & polished',  emoji: '👔' },
    { id: 'gym',        title: 'Gym',        description: 'Active & sporty wear',     emoji: '🏋️' },
    { id: 'streetwear', title: 'Streetwear', description: 'Urban & trendy styles',    emoji: '🧢' },
    { id: 'boho',       title: 'Boho',       description: 'Free-spirited & artistic', emoji: '🌸' },
    { id: 'minimalist', title: 'Minimalist', description: 'Clean & simple aesthetic', emoji: '⬜' },
];

const occasions: OccasionItem[] = [
    { id: 'any_occasion', label: 'Any Occasion' },
    { id: 'work',    label: 'Work'      },
    { id: 'date',    label: 'Date Night' },
    { id: 'weekend', label: 'Weekend'   },
    { id: 'party',   label: 'Party'     },
    { id: 'travel',  label: 'Travel'    },
    { id: 'outdoor', label: 'Outdoor'   },
    { id: 'brunch',  label: 'Brunch'    },
    { id: 'gym',     label: 'Gym'       },
];

const colors: ColorItem[] = [
    { id: 'any_color', color: 'transparent', label: 'Any Color' },
    { id: 'black', color: '#1a1a1a', label: 'Black' },
    { id: 'white', color: '#f5f5f5', label: 'White' },
    { id: 'navy',  color: '#1e3a5f', label: 'Navy'  },
    { id: 'beige', color: '#d4b896', label: 'Beige' },
    { id: 'grey',  color: '#9ca3af', label: 'Grey'  },
    { id: 'green', color: '#4ade80', label: 'Green' },
    { id: 'red',   color: '#ef4444', label: 'Red'   },
    { id: 'brown', color: '#92400e', label: 'Brown' },
];

const StylePreferenceScreen = ({ navigation }: any) => {
    const onBack = () => navigation.goBack();

    const [selectedStyles,    setSelectedStyles]    = useState<string[]>([]);
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
    const [selectedColors,    setSelectedColors]    = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);

    const { showError } = useAppAlert();

    // ─── Firestore doc reference (Modular v22) ────────────────────────────────
    const getUserDocRef = () => {
        const app  = getApp();
        const user = getAuth(app).currentUser;
        if (!user) return null;
        const db = getFirestore(app);
        // Path: stylePrefs/{uid}  → separate top-level collection
        return doc(db, 'stylePrefs', user.uid);
    };

    // ─── Toggle helpers ───────────────────────────────────────────────────────
    const toggleStyle = (id: string) => {
        setSelectedStyles(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleOccasion = (id: string) => {
        if (id === 'any_occasion') {
            setSelectedOccasions(prev => prev.includes('any_occasion') ? [] : ['any_occasion']);
        } else {
            setSelectedOccasions(prev => {
                const filtered = prev.filter(o => o !== 'any_occasion');
                if (filtered.includes(id)) {
                    return filtered.filter(o => o !== id);
                } else {
                    return [...filtered, id];
                }
            });
        }
    };

    const toggleColor = (id: string) => {
        if (id === 'any_color') {
            setSelectedColors(prev => prev.includes('any_color') ? [] : ['any_color']);
        } else {
            setSelectedColors(prev => {
                const filtered = prev.filter(c => c !== 'any_color');
                if (filtered.includes(id)) {
                    return filtered.filter(c => c !== id);
                } else {
                    return [...filtered, id];
                }
            });
        }
    };

    // ─── Fetch existing preferences on mount ──────────────────────────────────
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const docRef = getUserDocRef();
                if (!docRef) {
                    // User not authenticated yet — skip without crashing
                    return;
                }
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const stylesList = data?.styles || data?.style || data?.stylePreferences || [];
                    const occasionsList = data?.occasions || data?.occasion || [];
                    const colorsList = data?.colors || data?.color || [];
                    setSelectedStyles(stylesList);
                    setSelectedOccasions(occasionsList);
                    setSelectedColors(colorsList);
                }
            } catch (error: any) {
                console.error('Error fetching preferences:', error);
                showError('Load Failed', 'Could not load your preferences. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [showError]);

    // ─── Save to Firestore ────────────────────────────────────────────────────
    const handleSave = async () => {
        if (saving) return;

        setSaving(true);
        try {
            const docRef = getUserDocRef();
            if (!docRef) {
                showError('Error', 'You must be logged in to save preferences.');
                return;
            }

            await setDoc(
                docRef,
                {
                    styles:    selectedStyles,
                    occasions: selectedOccasions,
                    colors:    selectedColors,
                    updatedAt: serverTimestamp(),
                },
                { merge: true },
            );

            invalidateProfileCache(); // Force refresh on profile screen

            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                navigation.goBack();
            }, 800);

        } catch (error: any) {
            console.error('Error saving preferences:', error);
            Alert.alert(
                'Save Failed',
                error?.message ?? 'Something went wrong. Please try again.',
            );
        } finally {
            setSaving(false);
        }
    };

    // ─── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2869BD" />
                    <Text style={styles.loadingText}>Loading preferences…</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ─── UI ───────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                    <ArrowLeft size={22} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Style Preferences</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={handleSave} disabled={saving}>
                    <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
                        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Style Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Style</Text>
                    <Text style={styles.sectionSub}>Select all that match your vibe</Text>
                    <View style={styles.styleGrid}>
                        {styleCategories.map((item) => {
                            const isSelected = selectedStyles.includes(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                                    activeOpacity={0.8}
                                    onPress={() => toggleStyle(item.id)}
                                >
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <Check size={10} color="#fff" />
                                        </View>
                                    )}
                                    <Text style={styles.styleEmoji}>{item.emoji}</Text>
                                    <Text style={[styles.styleCardTitle, isSelected && styles.styleCardTitleSelected]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.styleCardDesc, isSelected && styles.styleCardDescSelected]}>
                                        {item.description}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Occasions Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Occasions</Text>
                    <Text style={styles.sectionSub}>When do you need outfit inspiration?</Text>
                    <View style={styles.chipRow}>
                        {occasions.map((item) => {
                            const isSelected = selectedOccasions.includes(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                    activeOpacity={0.8}
                                    onPress={() => toggleOccasion(item.id)}
                                >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Favorite Colors Section ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Favorite Colors</Text>
                    <Text style={styles.sectionSub}>Pick your go-to palette</Text>
                    <View style={styles.colorRow}>
                        {colors.map((item) => {
                            const isSelected = selectedColors.includes(item.id);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.colorItem}
                                    activeOpacity={0.8}
                                    onPress={() => toggleColor(item.id)}
                                >
                                    <View style={[
                                        styles.colorCircle,
                                        { backgroundColor: item.color },
                                        item.id === 'any_color' && { borderWidth: 1.5, borderColor: '#94a3b8', borderStyle: 'dashed' },
                                        isSelected && styles.colorCircleSelected,
                                    ]}>
                                        {item.id === 'any_color' ? (
                                            isSelected ? (
                                                <Check size={14} color="#2869BD" />
                                            ) : (
                                                <Text style={{ fontSize: 16 }}>🎨</Text>
                                            )
                                        ) : (
                                            isSelected && (
                                                <Check size={14} color={item.id === 'white' ? '#1E293B' : '#fff'} />
                                            )
                                        )}
                                    </View>
                                    <Text style={[styles.colorLabel, isSelected && styles.colorLabelSelected]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Save Button ── */}
                <TouchableOpacity
                    style={[styles.saveBtn, (saving || saved) && styles.saveBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={saving || saved}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>
                            {saved ? 'Saved ✓' : 'Save Preferences'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'InterRegular',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#1E293B',
    },
    saveText: {
        fontSize: 15,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#2869BD',
    },
    saveTextDisabled: {
        color: '#94a3b8',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#1E293B',
    },
    sectionSub: {
        fontSize: 13,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#94a3b8',
        marginTop: 3,
        marginBottom: 16,
    },
    styleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    styleCard: {
        width: '47%',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        position: 'relative',
    },
    styleCardSelected: {
        backgroundColor: '#EBF1FB',
        borderColor: '#2869BD',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2869BD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    styleEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    styleCardTitle: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#1E293B',
    },
    styleCardTitleSelected: {
        color: '#2869BD',
    },
    styleCardDesc: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#94a3b8',
        marginTop: 3,
    },
    styleCardDescSelected: {
        color: '#5a8fd4',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    chipSelected: {
        backgroundColor: '#EBF1FB',
        borderColor: '#2869BD',
    },
    chipText: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#565E74',
    },
    chipTextSelected: {
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#2869BD',
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    colorItem: {
        alignItems: 'center',
        gap: 6,
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorCircleSelected: {
        borderColor: '#2869BD',
        shadowColor: '#2869BD',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    colorLabel: {
        fontSize: 11,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#94a3b8',
    },
    colorLabelSelected: {
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#2869BD',
    },
    saveBtn: {
        marginHorizontal: 20,
        marginTop: 32,
        backgroundColor: '#2869BD',
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        backgroundColor: '#93b8e8',
    },
    saveBtnText: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#fff',
    },
});

export default StylePreferenceScreen;