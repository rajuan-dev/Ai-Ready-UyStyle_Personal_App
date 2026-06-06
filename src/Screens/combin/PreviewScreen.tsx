// import React from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     Image,
//     StyleSheet,
//     ScrollView,
//     Dimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { ArrowLeft, Share2, Download } from 'lucide-react-native';

// const { width } = Dimensions.get('window');

// const PreviewScreen = ({ route, navigation }: any) => {
//     // Get items passed from CombineScreen
//     const { items = [] } = route.params || {};

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <ArrowLeft size={24} color="#1E293B" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Preview Look</Text>
//                 <TouchableOpacity style={styles.iconBtn}>
//                     <Share2 size={22} color="#1E293B" />
//                 </TouchableOpacity>
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//                 {items.length === 0 ? (
//                     <View style={styles.emptyState}>
//                         <Text style={styles.emptyText}>No items selected to preview.</Text>
//                     </View>
//                 ) : (
//                     <View style={styles.previewCard}>
//                         {/* Main Collage Area */}
//                         <View style={styles.collageContainer}>
//                             {items.map((item: any, index: number) => (
//                                 <View
//                                     key={item.id}
//                                     style={[
//                                         styles.previewImageWrapper,
//                                         index === 0 && styles.largeImage
//                                     ]}
//                                 >
//                                     <Image source={{ uri: item.image }} style={styles.previewImage} />
//                                     <View style={styles.badge}>
//                                         <Text style={styles.badgeText}>{item.category}</Text>
//                                     </View>
//                                 </View>
//                             ))}
//                         </View>

//                         {/* Details List */}
//                         <View style={styles.detailsContainer}>
//                             <Text style={styles.summaryTitle}>Outfit Summary</Text>
//                             {items.map((item: any) => (
//                                 <View key={item.id} style={styles.detailRow}>
//                                     <Text style={styles.detailCategory}>{item.category}:</Text>
//                                     <Text style={styles.detailLabel}>{item.label}</Text>
//                                 </View>
//                             ))}
//                         </View>
//                     </View>
//                 )}
//             </ScrollView>

//             {/* Bottom Actions */}
//             <View style={styles.bottomBar}>
//                 <TouchableOpacity style={styles.downloadBtn}>
//                     <Download size={20} color="#0F1729" />
//                     <Text style={styles.downloadBtnText}>Save to Gallery</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     style={styles.doneBtn}
//                     onPress={() => navigation.navigate('bottombar')}
//                 >
//                     <Text style={styles.doneBtnText}>Confirm Look</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFF',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 15,
//         backgroundColor: '#fff',
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#0F1729',
//         fontFamily: 'InterBold',
//     },
//     iconBtn: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#F3F4F6',
//     },
//     scrollContent: {
//         padding: 20,
//     },
//     emptyState: {
//         alignItems: 'center',
//         marginTop: 100,
//     },
//     emptyText: {
//         color: '#64748B',
//         fontSize: 16,
//     },
//     previewCard: {
//         backgroundColor: '#fff',
//         borderRadius: 24,
//         padding: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.05,
//         shadowRadius: 10,
//         elevation: 2,
//     },
//     collageContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         gap: 12,
//         justifyContent: 'center',
//     },
//     previewImageWrapper: {
//         width: (width - 100) / 2,
//         height: 150,
//         borderRadius: 12,
//         overflow: 'hidden',
//         backgroundColor: '#F1F5F9',
//     },
//     largeImage: {
//         width: '100%',
//         height: 250,
//     },
//     previewImage: {
//         width: '100%',
//         height: '100%',
//         resizeMode: 'cover',
//     },
//     badge: {
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: 'rgba(255,255,255,0.85)',
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 6,
//     },
//     badgeText: {
//         fontSize: 10,
//         fontWeight: '700',
//         color: '#2869BD',
//         textTransform: 'uppercase',
//     },
//     detailsContainer: {
//         marginTop: 24,
//         paddingTop: 24,
//         borderTopWidth: 1,
//         borderTopColor: '#F1F5F9',
//     },
//     summaryTitle: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: '#0F1729',
//         marginBottom: 12,
//     },
//     detailRow: {
//         flexDirection: 'row',
//         marginBottom: 8,
//     },
//     detailCategory: {
//         width: 90,
//         fontSize: 14,
//         color: '#64748B',
//         fontWeight: '500',
//     },
//     detailLabel: {
//         flex: 1,
//         fontSize: 14,
//         color: '#1E293B',
//         fontWeight: '600',
//     },
//     bottomBar: {
//         padding: 20,
//         paddingBottom: 30,
//         backgroundColor: '#fff',
//         flexDirection: 'row',
//         gap: 12,
//     },
//     downloadBtn: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: 8,
//         borderWidth: 1.5,
//         borderColor: '#E5E7EB',
//         borderRadius: 16,
//         height: 56,
//     },
//     downloadBtnText: {
//         color: '#0F1729',
//         fontWeight: '600',
//         fontSize: 14,
//         fontFamily: 'InterSemiBold',
//     },
//     doneBtn: {
//         flex: 1,
//         backgroundColor: '#2869BD',
//         borderRadius: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: 56,
//     },
//     doneBtnText: {
//         color: '#fff',
//         fontWeight: '600',
//         fontSize: 14,
//         fontFamily: 'InterSemiBold',
//     },
// });

// export default PreviewScreen;


import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Share,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, CheckCircle2 } from 'lucide-react-native';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
} from '../../firebase/firestore';

const { width } = Dimensions.get('window');
const H_PAD = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

type ClosetItem = {
    id:        string;
    title:     string;
    category:  string;
    color:     string;
    imageURL:  string;
};

type SlotMeta = {
    id:        string;
    label:     string;
    isDefault: boolean;
};

// Default slots mirror CombineScreen


// ─── Component ─────

const PreviewScreen = ({ route, navigation }: any) => {

    // items: ClosetItem[] passed from CombineScreen via navigation params
    const { items = [], isSaved = false }: { items: ClosetItem[], isSaved?: boolean } = route.params || {};

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;

    // ── Share handler ───────────────────────────────────────────────────
    const handleShare = async () => {
        try {
            const itemSummary = items
                .map((item: ClosetItem) => {
                    const slot = resolveSlotLabel(item);
                    return `${slot}: ${item.title}${item.color ? ` (${item.color})` : ''}`;
                })
                .join('\n');

            const message = `👗 Check out my outfit on UStyle!\n\n${itemSummary}\n\nCreated with UStyle`;

            await Share.share({
                message,
                title: isSaved ? 'My Saved Look' : 'My Outfit',
            });
        } catch (error: any) {
            if (error?.message !== 'User did not share') {
                Alert.alert('Share Failed', 'Could not share the outfit. Please try again.');
            }
        }
    };

 
    const [loadingSlots, setLoadingSlots] = useState(true);

    // ── Fetch custom slots from Firebase ────────────────────────────────────
    useEffect(() => {
        if (!user) { setLoadingSlots(false); return; }
        const fetchSlots = async () => {
            try {
                const q    = query(
                    collection(db, 'outfitSlots'),
                    where('userId', '==', user.uid),
                );
                const snap = await getDocs(q);
                const custom: SlotMeta[] = snap.docs.map(d => ({
                    id:        d.id,
                    label:     (d.data() as any).label,
                    isDefault: false,
                }));
               
            } catch (e) {
                console.warn(e);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [user?.uid]);

    // ── Resolve slot label for an item ───────────────────────────────────────
    const resolveSlotLabel = (item: ClosetItem): string => {
        const cat = (item.category ?? '').toLowerCase().trim();
    
       
        if (/top|shirt|sweater|blouse|tee|knit/.test(cat))    return 'Top';
        if (/bottom|jean|trouser|pant|skirt|short/.test(cat)) return 'Bottom';
        if (/shoe|sneaker|boot|loafer|heel|sandal/.test(cat)) return 'Shoes';
        if (/outer|coat|jacket|blazer|trench/.test(cat))      return 'Outerwear';
        return 'Accessory';
    };

    // ── Layout helpers ───────────────────────────────────────────────────────

    const heroItem  = items[0] ?? null;
    const gridItems = items.slice(1);

    const GRID_ITEM_W = (width - H_PAD * 2 - 32 - 10) / 2; 

    if (loadingSlots) {
        return (
            <SafeAreaView style={st.safe}>
                <View style={st.loadingBox}>
                    <ActivityIndicator size="large" color="#2869BD" />
                    <Text style={st.loadingTxt}>Loading outfit…</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={st.safe}>

            {/* ══ HEADER ══ */}
            <View style={st.header}>
                <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <ArrowLeft size={20} color="#0F1729" />
                </TouchableOpacity>
                <Text style={st.headerTitle}>{isSaved ? 'Saved Look' : 'Preview Look'}</Text>
                <TouchableOpacity style={st.iconBtn} activeOpacity={0.8} onPress={handleShare}>
                    <Share2 size={18} color="#0F1729" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[st.scroll, isSaved && { paddingBottom: 40 }]}
            >
                {items.length === 0 ? (
                    /* ── Empty state ── */
                    <View style={st.emptyBox}>
                        <Text style={st.emptyTitle}>No items to preview</Text>
                        <Text style={st.emptySub}>Go back and select some pieces</Text>
                    </View>
                ) : (
                    <View style={st.card}>

                        {/* ── Hero image (first / largest item) ── */}
                        {heroItem && (
                            <View style={st.heroWrapper}>
                                <Image
                                    source={{ uri: heroItem.imageURL }}
                                    style={st.heroImage}
                                    resizeMode="cover"
                                />
                                {/* Slot label badge */}
                                <View style={st.heroBadge}>
                                    <Text style={st.heroBadgeTxt}>
                                        {resolveSlotLabel(heroItem).toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ── Grid items (remaining) ── */}
                        {gridItems.length > 0 && (
                            <View style={st.gridRow}>
                                {gridItems.map((item) => (
                                    <View
                                        key={item.id}
                                        style={[st.gridItem, { width: GRID_ITEM_W, height: GRID_ITEM_W }]}
                                    >
                                        <Image
                                            source={{ uri: item.imageURL }}
                                            style={st.gridImg}
                                            resizeMode="cover"
                                        />
                                        <View style={st.gridBadge}>
                                            <Text style={st.gridBadgeTxt}>
                                                {resolveSlotLabel(item).toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* ── Outfit Summary ── */}
                        <View style={st.summaryBox}>
                            <View style={st.summaryHeader}>
                                <CheckCircle2 size={16} color="#2869BD" />
                                <Text style={st.summaryTitle}>Outfit Summary</Text>
                            </View>

                            {items.map((item) => (
                                <View key={item.id} style={st.summaryRow}>
                                    {/* Thumbnail */}
                                    <Image
                                        source={{ uri: item.imageURL }}
                                        style={st.thumbImg}
                                        resizeMode="cover"
                                    />
                                    {/* Info */}
                                    <View style={st.summaryInfo}>
                                        <Text style={st.summaryItemTitle} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <View style={st.summaryMeta}>
                                            <View style={st.slotPill}>
                                                <Text style={st.slotPillTxt}>
                                                    {resolveSlotLabel(item)}
                                                </Text>
                                            </View>
                                            {item.color ? (
                                                <View style={st.colorPill}>
                                                    <View style={[st.colorDot, { backgroundColor: item.color.toLowerCase() }]} />
                                                    <Text style={st.colorTxt}>{item.color}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                    </View>
                )}
            </ScrollView>

            {!isSaved && (
                <View style={st.bottomBar}>
                    <TouchableOpacity
                        style={st.backOutfitBtn}
                           onPress={() => navigation.navigate('combine')}
                        activeOpacity={0.8}
                    >
                        <Text style={st.backOutfitTxt}>Edit Outfit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={st.confirmBtn}
                     
                           onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text style={st.confirmTxt}>Confirm Look</Text>
                    </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_RADIUS = 20;

const st = StyleSheet.create({

    safe: { flex: 1, backgroundColor: '#F8F9FA' },

    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingTxt: { fontSize: 13, fontFamily: 'InterRegular', color: '#94A3B8' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: H_PAD,
        paddingVertical: 14,
        backgroundColor: '#F8F9FA',
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fff',
        borderWidth: 1.5, borderColor: '#E5E7EB',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    iconBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fff',
        borderWidth: 1.5, borderColor: '#E5E7EB',
        alignItems: 'center', justifyContent: 'center',
    },

    scroll: { paddingHorizontal: H_PAD, paddingBottom: 120, paddingTop: 4 },

    // Empty
    emptyBox: { alignItems: 'center', marginTop: 100, gap: 8 },
    emptyTitle: { fontSize: 16, fontFamily: 'InterBold', fontWeight: '700', color: '#0F1729' },
    emptySub: { fontSize: 13, fontFamily: 'InterRegular', color: '#94A3B8' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: CARD_RADIUS,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        gap: 0,
    },

    // Hero image
    heroWrapper: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(40,105,189,0.90)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    heroBadgeTxt: {
        fontSize: 10,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.8,
    },

    // Grid items
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        padding: 12,
        paddingTop: 10,
    },
    gridItem: {
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        position: 'relative',
    },
    gridImg: { width: '100%', height: '100%' },
    gridBadge: {
        position: 'absolute',
        bottom: 7,
        left: 7,
        backgroundColor: 'rgba(15,23,41,0.70)',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    gridBadgeTxt: {
        fontSize: 9,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.6,
    },

    // Summary section
    summaryBox: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 14,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 2,
    },
    summaryTitle: {
        fontSize: 15,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },

    // Summary row per item
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    thumbImg: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    summaryInfo: {
        flex: 1,
        gap: 6,
    },
    summaryItemTitle: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
    },
    summaryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slotPill: {
        backgroundColor: '#EBF1FB',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    slotPillTxt: {
        fontSize: 11,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#2869BD',
    },
    colorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    colorTxt: {
        fontSize: 11,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#565E74',
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: H_PAD,
        paddingVertical: 14,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F1F3',
    },
    backOutfitBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backOutfitTxt: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
    },
    confirmBtn: {
        flex: 1.6,
        paddingVertical: 15,
        borderRadius: 16,
        backgroundColor: '#2869BD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmTxt: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#fff',
    },
});

export default PreviewScreen;
