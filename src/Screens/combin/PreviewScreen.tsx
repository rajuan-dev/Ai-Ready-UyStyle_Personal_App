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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, CheckCircle2 } from 'lucide-react-native';
import { useAppAlert } from '../../context/AlertContext';
import { getApp } from '../../firebase/app';
import { getAuth } from '../../firebase/auth';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
} from '../../firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '../../firebase/storage';

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
// Default slots mirror CombineScreen

// ─── HTML Generator ────────────────────────────────────────────────────────────
const generateShareHTML = (items: ClosetItem[]) => {
    const itemsHTML = items.map(item => {
        const imageUrl = item.imageURL || (item as any).image || '';
        const cat = (item.category ?? '').toLowerCase().trim();
        let slot = 'Accessory';
        if (/top|shirt|sweater|blouse|tee|knit/.test(cat))    slot = 'Top';
        else if (/bottom|jean|trouser|pant|skirt|short/.test(cat)) slot = 'Bottom';
        else if (/shoe|sneaker|boot|loafer|heel|sandal/.test(cat)) slot = 'Shoes';
        else if (/outer|coat|jacket|blazer|trench/.test(cat))      slot = 'Outerwear';

        // Render clean inline SVG hanger icon as a fallback if image is missing/broken
        const imgTag = (imageUrl && imageUrl.trim().length > 0)
            ? `<img src="${imageUrl}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <div class="placeholder-box" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: #94A3B8;">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 1.7a2 2 0 00-1.6 0L10 3.46a2 2 0 01-1.6 0L4 1.7a2 2 0 00-2 0V17a2 2 0 002 2h16a2 2 0 002-2V5.15a2 2 0 00-.62-1.69z"/><path d="M12 7v10"/></svg>
               </div>`
            : `<div class="placeholder-box" style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #94A3B8;">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 1.7a2 2 0 00-1.6 0L10 3.46a2 2 0 01-1.6 0L4 1.7a2 2 0 00-2 0V17a2 2 0 002 2h16a2 2 0 002-2V5.15a2 2 0 00-.62-1.69z"/><path d="M12 7v10"/></svg>
               </div>`;

        return `
        <div class="item-card">
            <div class="item-image-wrapper">
                ${imgTag}
            </div>
            <div class="item-details">
                <span class="item-category">${slot}</span>
                <span class="item-title">${item.title} ${item.color ? `<span class="item-color">(${item.color})</span>` : ''}</span>
            </div>
        </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USTYLE Outfit Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0F1729;
            color: #F8FAFC;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            width: 100%;
            max-width: 460px;
            padding: 28px 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            text-align: center;
        }
        .header {
            margin-bottom: 28px;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #38BDF8;
            text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
            margin-bottom: 4px;
        }
        .subtitle {
            font-size: 11px;
            color: #94A3B8;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        
        .items-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-bottom: 32px;
        }
        .item-card {
            background: rgba(15, 23, 42, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 20px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            text-align: left;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .item-image-wrapper {
            width: 100%;
            aspect-ratio: 1.0;
            border-radius: 12px;
            overflow: hidden;
            background: #1E293B;
            border: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .item-image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .item-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 2px 0 2px;
        }
        .item-category {
            font-size: 11px;
            color: #38BDF8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .item-title {
            font-size: 14px;
            color: #F1F5F9;
            font-weight: 500;
            max-width: 70%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: right;
        }
        .item-color {
            color: #94A3B8;
            font-size: 12px;
            margin-left: 4px;
        }
        
        .footer-btn {
            display: block;
            background: #2563EB;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 28px;
            border-radius: 14px;
            font-weight: 600;
            font-size: 14px;
            transition: background 0.2s, transform 0.1s;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            width: 100%;
        }
        .footer-btn:hover {
            background: #1D4ED8;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 class="logo">✦ USTYLE ✦</h1>
            <p class="subtitle">Shared Outfit</p>
        </div>
        
        <div class="items-list">
            ${itemsHTML}
        </div>
        
        <a href="https://ustyle-2d7b5.web.app/" class="footer-btn">Open USTYLE App</a>
    </div>
</body>
</html>`;
};



// ─── Component ─────

const PreviewScreen = ({ route, navigation }: any) => {

    // items: ClosetItem[] passed from CombineScreen via navigation params
    const { items = [], isSaved = false, outfitId }: { items: ClosetItem[], isSaved?: boolean, outfitId?: string } = route.params || {};

    const app  = getApp();
    const auth = getAuth(app);
    const db   = getFirestore(app);
    const user = auth.currentUser;

    const { showConfirm, showSuccess, showError } = useAppAlert();
    const [sharing, setSharing] = useState(false);

    const handleDeleteOutfit = () => {
        if (!outfitId) {
            Alert.alert('Error', 'Outfit ID is missing.');
            return;
        }
        showConfirm(
            'Delete Outfit',
            'Are you sure you want to delete this saved look? This cannot be undone.',
            async () => {
                try {
                    await deleteDoc(doc(db, 'outfits', outfitId));
                    showSuccess('Deleted', 'Saved look has been removed.');
                    navigation.goBack();
                } catch (e) {
                    console.warn(e);
                    showError('Error', 'Failed to delete outfit. Please try again.');
                }
            }
        );
    };

    const handleEditOutfit = () => {
        navigation.navigate('combine', { editItems: items, outfitId });
    };

    // ── Share handler ───────────────────────────────────────────────────
    const handleShare = async () => {
        if (sharing) return;
        setSharing(true);
        try {
            const itemSummary = items
                .map((item: ClosetItem) => {
                    const slot = resolveSlotLabel(item);
                    return `• ${slot}: ${item.title}${item.color ? ` (${item.color})` : ''}`;
                })
                .join('\n');

            // Generate HTML preview file content
            const htmlContent = generateShareHTML(items);
            const storage = getStorage(app);
            const shareId = `${Date.now()}`;
            // Store HTML preview under closet/{uid}/shares/ to align with per-user rules
            const storagePath = user?.uid 
                ? `closet/${user.uid}/shares/${shareId}.html`
                : `shares/${shareId}.html`;
            const shareRef = ref(storage, storagePath);

            // Create a native React Native Blob from the HTML string directly (without fetch/data URL)
            const blob = new Blob([htmlContent], { type: 'text/html' });

            // Upload the HTML file to Firebase Storage using native blob
            await uploadBytesResumable(shareRef, blob, {
                contentType: 'text/html',
            });
            const downloadURL = await getDownloadURL(shareRef);

            const brandedText = `✦ USTYLE OUTFIT ✦\n\nCheck out this look I put together:\n\n${itemSummary}\n\nCreated with USTYLE - Your Personal AI Wardrobe.`;

            if (Platform.OS === 'ios') {
                // On iOS, pass url explicitly to display rich link preview
                await Share.share({
                    message: brandedText,
                    url: downloadURL,
                    title: 'USTYLE Look',
                });
            } else {
                // On Android, append the download URL to the message body
                const messageWithLink = `${brandedText}\n\nLook Preview: ${downloadURL}`;
                await Share.share({
                    message: messageWithLink,
                    title: 'USTYLE Look',
                });
            }
        } catch (error: any) {
            const isDismissed = error?.message?.includes('User did not share') || 
                                error?.message?.includes('dismissed') || 
                                error?.message?.includes('cancelled');
            if (!isDismissed) {
                console.warn('[Share] error:', error);
                Alert.alert('Share Failed', 'Could not share the outfit. Please try again.');
            }
        } finally {
            setSharing(false);
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
                await getDocs(q);
            } catch (e) {
                console.warn(e);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [db, user]);

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
                <TouchableOpacity 
                    style={st.iconBtn} 
                    activeOpacity={0.8} 
                    onPress={handleShare}
                    disabled={sharing}
                >
                    {sharing ? (
                        <ActivityIndicator size="small" color="#2869BD" />
                    ) : (
                        <Share2 size={18} color="#0F1729" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={st.scroll}
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
                                    source={{ uri: heroItem.imageURL || (heroItem as any).image }}
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
                                            source={{ uri: item.imageURL || (item as any).image }}
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
                                        source={{ uri: item.imageURL || (item as any).image }}
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

            {isSaved ? (
                <View style={st.bottomBar}>
                    <TouchableOpacity
                        style={st.deleteOutfitBtn}
                        onPress={handleDeleteOutfit}
                        activeOpacity={0.8}
                    >
                        <Text style={st.deleteOutfitTxt}>Delete Look</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={st.editOutfitBtn}
                        onPress={handleEditOutfit}
                        activeOpacity={0.85}
                    >
                        <Text style={st.editOutfitTxt}>Edit Look</Text>
                    </TouchableOpacity>
                </View>
            ) : (
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
    deleteOutfitBtn: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#FCA5A5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteOutfitTxt: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#DC2626',
    },
    editOutfitBtn: {
        flex: 1.6,
        paddingVertical: 15,
        borderRadius: 16,
        backgroundColor: '#2869BD',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editOutfitTxt: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#fff',
    },
});

export default PreviewScreen;
