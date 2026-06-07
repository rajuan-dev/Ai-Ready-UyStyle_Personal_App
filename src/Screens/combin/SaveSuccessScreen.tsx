import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';

const SaveSuccessScreen = ({ route, navigation }: any) => {
    const { isOutfit = false, isEdit = false } = route?.params || {};

    const titleText = isOutfit
        ? (isEdit ? 'Outfit updated successfully' : 'Outfit saved successfully')
        : 'Item added successfully';

    const subtitleText = isOutfit
        ? (isEdit ? 'Your outfit changes have been saved.' : 'Your new look is now saved in your wardrobe.')
        : 'Your item is now available in your closet.';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.container}>
                {/* Success Icon */}
                <View style={styles.iconWrapper}>
                    <CheckCircle size={52} color="#22C55E" strokeWidth={1.5} />
                </View>

                {/* Text */}
                <Text style={styles.title}>{titleText}</Text>
                <Text style={styles.subtitle}>{subtitleText}</Text>

                {/* Buttons */}
                {isOutfit ? (
                    <>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('bottombar', { screen: 'Outfits' })}
                        >
                            <Text style={styles.primaryBtnText}>View Saved Outfits</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.ghostBtn}
                            activeOpacity={1}
                            onPress={() => navigation.navigate('bottombar', { screen: 'Home' })}
                        >
                            <Text style={styles.ghostBtnText}>Go to Home</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('combine')}
                        >
                            <Text style={styles.primaryBtnText}>Add Another Item</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.ghostBtn}
                            activeOpacity={1}
                            onPress={() => navigation.navigate('bottombar', { screen: 'Closet' })}
                        >
                            <Text style={styles.ghostBtnText}>Go to Closet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.ghostBtn}
                            activeOpacity={1}
                            onPress={() => navigation.navigate('combine')}
                        >
                            <Text style={styles.ghostBtnText}>Build Outfit</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        gap: 12,
    },

    // Icon
    iconWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    // Text
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F1729',
        fontFamily: 'InterBold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#65758B',
        textAlign: 'center',
        fontFamily: 'InterRegular',
        marginBottom: 48,
        marginTop: -5
    },

    // Primary Button
    primaryBtn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#2869BD',
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        fontFamily: 'InterSemiBold',
    },

    // Ghost Buttons
    ghostBtn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 12,
        backgroundColor: '#fff'
    },
    ghostBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: 'InterSemiBold',
    },
});

export default SaveSuccessScreen;