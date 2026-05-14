import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const H_PAD       = 16;
const CARD_GAP    = 12;
const CARD_WIDTH  = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1;
const INFO_HEIGHT = 52;

export const styles = StyleSheet.create({

    // ─── Layout ────────────────────────────────────────────────────────────
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // ─── Header ────────────────────────────────────────────────────────────
    header: {
        paddingHorizontal: H_PAD,
        paddingTop: 14,
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#65758B',
        marginTop: 2,
    },

    // ─── Category tabs 
    chipsScroll: {
        flexGrow: 0,
        marginBottom: 14,
    },
    chipsRow: {
        paddingHorizontal: H_PAD,
        paddingVertical: 2,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',

    },
    chip: {
        height: 36,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: {
        backgroundColor: '#2869BD',
    },
    chipText: {
        fontSize: 13,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#65758B',
        includeFontPadding: false,
    },
    chipTextActive: {
        color: '#fff',
    },

    // ─── FlatList grid 
    listContent: {
        paddingHorizontal: H_PAD,
        paddingTop: 4,
    },
    columnWrapper: {
        gap: CARD_GAP,
        marginBottom: CARD_GAP,
    },
    listFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    // ─── Outfit card ────
    card: {
        width: CARD_WIDTH,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: 'transparent',
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        // Android
        elevation: 2,
    },
    // Blue outline when card is active (X visible)
    cardActive: {
        borderColor: '#2869BD',
    },
    imageWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#E5E7EB',
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    imageFallback: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    imageFallbackText: {
        fontSize: 28,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#94A3B8',
    },

    // ── Delete badge (X icon)
    // Positioned top-right corner; scale-animated in/out
    deleteBadge: {
        position: 'absolute',
        top: 7,
        right: 7,
        zIndex: 10,
    },
    deleteBadgeInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        // Small shadow so it pops over the image
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        elevation: 4,
    },

    // ─── Info block ────
    itemInfo: {
        width: CARD_WIDTH,
        height: INFO_HEIGHT,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 13,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
        marginBottom: 3,
    },
    itemMeta: {
        fontSize: 11,
        fontFamily: 'InterRegular',
        color: '#65758B',
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fireBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF7ED',
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    fireBtnActive: {
        backgroundColor: '#FFEDD5',
    },
    fireCount: {
        fontSize: 10,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#EA580C',
    },

    // ─── Skeleton loader ────────────
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: H_PAD,
        gap: CARD_GAP,
        paddingTop: 4,
    },
    skeletonCard: {
        width: CARD_WIDTH,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    skeletonImage: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#E9EAEC',
    },
    skeletonTextBlock: {
        width: CARD_WIDTH,
        height: INFO_HEIGHT,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 10,
        gap: 7,
        justifyContent: 'center',
    },
    skeletonLine: {
        height: 10,
        width: '75%',
        backgroundColor: '#E0E2E6',
        borderRadius: 6,
    },

    // ─── Empty / Error state ─────
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 8,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 6,
    },
    emptyTitle: {
        fontSize: 17,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        fontFamily: 'InterRegular',
        color: '#65758B',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryBtn: {
        marginTop: 14,
        backgroundColor: '#2869BD',
        borderRadius: 12,
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
    retryBtnText: {
        color: '#fff',
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        fontSize: 14,
    },

    
    viewOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 41, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    viewBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    viewBadgeText: {
        color: '#0F1729',
        fontSize: 12,
        fontFamily: 'InterBold',
        fontWeight: '700',
    },
});
