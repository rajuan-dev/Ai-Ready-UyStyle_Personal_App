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
        paddingBottom: 120,
    },

    // Profile Header
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 16,
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    profileName: {
        fontSize: 20,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    profileSub: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#65758B',
    },
    editBtn: {
        width: 40,
        height: 40,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        borderRadius: 14,
        paddingVertical: 16,
        marginBottom: 16,
        gap: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 8,
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#65758B',
    },

    // Style Preferences
    stylePrefs: {
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stylePrefLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stylePrefIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#2869BD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stylePrefTitle: {
        fontSize: 16,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#1E293B',
    },
    stylePrefSub: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#65758B',
        marginTop: 2,
        fontWeight: '400',
    },
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
    favRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    favCard: {
        width: 112,
        height: 112,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    favImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // Menu
    menuSection: {
        marginHorizontal: 20,
        borderRadius: 8,
        gap: 8
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    menuLabel: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#0F1729',
    },
    menuLabelDanger: {
        color: '#EF4444',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
    },
avatarPlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent:  'center',
    alignItems:      'center',
},
emptyFavContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 8,
},
emptyFavText: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    fontWeight: '500',
    color: '#94A3B8',
},
});
