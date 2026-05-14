// import { StyleSheet } from "react-native";

// export const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },

//     // Header
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingVertical: 12,
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontFamily: 'InterBold',
//         fontWeight: '700',
//         color: '#0F1729',
//     },

//     // Container
//     container: {
//         flex: 1,
//         paddingHorizontal: 20,
//     },
//     subtitle: {
//         fontSize: 13,
//         fontFamily: 'InterRegular',
//         fontWeight: '400',
//         color: '#65758B',
//         marginBottom: 48,
//         marginTop: -6,
//     },

//     // Upload Box
//     uploadBox: {
//         width: '100%',
//         height: 244,
//         backgroundColor: '#F3F4F6',
//         borderRadius: 16,
//         borderWidth: 1.5,
//         borderColor: '#E5E7EB',
//         borderStyle: 'dashed',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     uploadIconWrapper: {
//         width: 64,
//         height: 64,
//         borderRadius: 16,
//         backgroundColor: '#2869BD',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 4,
//     },
//     uploadTitle: {
//         fontSize: 16,
//         fontFamily: 'InterBold',
//         fontWeight: '600',
//         color: '#0F1729',
//         marginTop: 20,
//     },
//     uploadSub: {
//         fontSize: 12,
//         fontFamily: 'InterRegular',
//         fontWeight: '400',
//         color: '#65758B',
//         marginTop: 3,
//     },

//     // Options
//     optionRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 20,
//         gap: 16,
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         borderRadius: 16,
//         paddingHorizontal: 17,
//         marginBottom: 12,
//     },
//     primeryButton: {
//         backgroundColor: '#1E293B',
//     },
//     primeryButtonIcon: {
//         backgroundColor: '#2869BD',
//         borderRadius: 12,
//     },
//     primeryButtonText: {
//         color: '#fff',
//     },
//     optionIcon: {
//         width: 48,
//         height: 48,
//         borderRadius: 16,
//         backgroundColor: '#2869BD',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     optionText: {
//         fontSize: 15,
//         fontFamily: 'InterSemiBold',
//         fontWeight: '600',
//         color: '#0F1729',
//     },
// });






import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#0F1729',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 140,
  },

  // Container
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: 'InterRegular',
    color: '#64748B',
    marginBottom: 16,
  },

    // Upload Box
    uploadBox: {
        width: '100%',
        height: 244,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    uploadIconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#2869BD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    uploadTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        fontWeight: '600',
        color: '#0F1729',
        marginTop: 20,
    },
    uploadSub: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        fontWeight: '400',
        color: '#65758B',
        marginTop: 3,
    },

  // Image Preview
  previewWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 260,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  changeBtn: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  changeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'InterMedium',
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },

  primeryButton: {
    backgroundColor: '#0F1729',
  },

  primeryButtonIcon: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  primeryButtonText: {
    color: '#fff',
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2869BD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  optionText: {
    fontSize: 15,
    fontFamily: 'InterMedium',
    color: '#0F1729',
  },

  // Form
  form: {
    marginTop: 10,
  },

  formTitle: {
    fontSize: 16,
    fontFamily: 'InterBold',
    color: '#0F1729',
    marginBottom: 12,
  },

  fieldGroup: {
    marginBottom: 12,
  },

  fieldLabel: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#64748B',
    marginBottom: 6,
  },

  required: {
    color: '#EF4444',
  },

  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F1729',
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  categoryChipActive: {
    backgroundColor: '#0F1729',
    borderColor: '#0F1729',
  },

  categoryChipText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#64748B',
  },

  categoryChipTextActive: {
    color: '#fff',
  },

  // Progress
  progressWrapper: {
    marginTop: 10,
    marginBottom: 10,
  },

  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: 6,
    backgroundColor: '#0F1729',
  },

  progressText: {
    fontSize: 12,
    fontFamily: 'InterRegular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },

  // Save Button
  saveBtn: {
    backgroundColor: '#0F1729',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  saveBtnText: {
    fontSize: 15,
    fontFamily: 'InterSemiBold',
    color: '#fff',
  },
});