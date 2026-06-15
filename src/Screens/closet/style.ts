import { StyleSheet } from "react-native";
const H_PAD       = 16;
export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // ── Header 
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    headerLeftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
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
    headerIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
    },

    // ── Search 
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#1E293B',
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


    grid: {
        paddingHorizontal: 16,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#65758B',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    itemInfo: {
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        padding: 12,
    },
    itemName: {
        fontSize: 13,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
        marginBottom: 2,
    },
    itemMeta: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#65758B',
    },

    // ── Loading 
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        color: '#64748B',
    },

    // ── Empty State 
    emptyWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
        gap: 10,
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        fontFamily: 'InterSemiBold',
        color: '#0F1729',
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});