import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        // flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    backButton: {
        marginTop: 12,
        width: 36,
        height: 36,
    },
    header: {
        marginTop: 15,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontFamily: 'InterBold',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#1E293B',
    },

    form: {
        gap: 20,
    },
    fieldGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#565E74',
    },
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e8edf5',
    },
    input: {
        flex: 1,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#1a1a2e',
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    eyeButton: {
        position: 'absolute',
        right: 14,
        height: 52,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    eyeIcon: {
        fontSize: 18,
    },

    spacer: {
        flex: 1,
        minHeight: 100,
    },

    footer: {
        gap: 16,
    },
    signinfooter: {
        marginTop: 72,
    },
    termsText: {
        fontSize: 12.5,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#566166',
        textAlign: 'center',
        lineHeight: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsText2: {
        fontSize: 12.5,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#566166',
        textAlign: 'center',
        lineHeight: 18,
        justifyContent: 'center',
        alignItems: 'center',
        width: 285,
        marginHorizontal: 'auto',

    },
    termsLink: {
        color: '#1a1a2e',
        fontFamily: 'InterBold',
        fontWeight: '700',
    },
    nextButton: {
        width: '100%',
        backgroundColor: '#2869BD',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '500',
        fontFamily: 'InterMedium',
    },

    // এই styles গুলো তোমার existing style.ts এ add করো

alreadyAccountBanner: {
  backgroundColor: '#EFF6FF',
  borderRadius: 12,
  padding: 14,
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#2869BD',
},
alreadyAccountText: {
  fontSize: 14,
  color: '#1E40AF',
  fontFamily: 'InterMedium',
},
alreadyAccountLink: {
  fontWeight: '700',
  textDecorationLine: 'underline',
  color: '#1D4ED8',
},
forgotPasswordText: {
  fontSize: 14,
  fontFamily: 'InterMedium',
  fontWeight: '500',
  color: '#2869BD',
  textAlign: 'right',
  marginTop: 12,
},
});