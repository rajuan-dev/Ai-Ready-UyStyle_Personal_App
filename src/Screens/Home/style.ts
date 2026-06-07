import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 140,
        paddingTop: 15
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        gap: 11,
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerText: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#65758B',
        width: 171,
    },
    headerIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 50,
    },
    notifWrapper: {
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: -1,
        right: 1,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4343',
    },

    // Quick Fit
    quickFit: {
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quickFitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quickFitIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#2869BD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickFitTitle: {
        fontSize: 18,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#fff',
    },
    quickFitSub: {
        fontSize: 13,
        fontFamily: 'InterRegular',
        color: '#DDDDDD',
        marginTop: 2,
        fontWeight: '400',
    },

    // Today's Pick
    todayPick: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        height: 280,
    },
    todayPickImage: {
        width: '100%',
        height: '100%',
    },
    todayPickOverlay: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        alignItems: 'flex-end',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '80%',
    },
    todayPickLabel: {
        fontSize: 11,
        fontFamily: 'InterSemiBold',
        color: 'rgba(255,255,255,0.75)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    todayPickTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        color: '#fff',
        textAlign: 'right',
        lineHeight: 22,
    },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        marginTop: 12,
        gap: 8,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tabBtnActive: {
        backgroundColor: '#2869BD',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
    },
    tabTextActive: {
        color: '#fff',
    },

    // Sections
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#65758B',
    },
    itemsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
    },
    itemCard: {
        flex: 1,
    },
    itemImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        fontWeight: '600',
        color: '#0F1729',
    },
    itemCategory: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#65758B',
        marginTop: 2,
    },

    // Create Button
    createBtn: {
        marginHorizontal: 20,
        backgroundColor: '#2869BD',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16
    },
    createBtnText: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#fff',
    },


});