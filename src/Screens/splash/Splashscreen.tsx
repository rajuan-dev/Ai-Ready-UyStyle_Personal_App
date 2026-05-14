import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Dimensions,
    Image,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('screen');

interface SplashScreenProps {
    onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish?.();
        }, 3000);
        return () => clearTimeout(timer);
    }, []); // Run exactly once on mount

    return (
        <ImageBackground
            source={require('../../../assets/images/bg-onboarding.png')}
            style={styles.background}
        >
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Center Logo Section */}
            <View style={styles.centerContent}>
                <Image
                    source={require('../../../assets/images/logo2.png')}
                    style={styles.logo}
                />
                {/* Tagline */}
                <Text style={styles.tagline}>Your style, simplified.</Text>
            </View>

            {/* Bottom Loading Section */}
            <View style={styles.bottomContent}>
                <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute between center content and bottom loading
        paddingBottom: 60,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80, // offset for better centering
    },
    logo: {
        width: 290,
        height: 105,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    tagline: {
        fontSize: 18,
        color: '#1E293B',
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: 'InterMedium',
        marginTop: 4,
    },
    bottomContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loader: {
        marginBottom: 12,
    },
    loadingText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
        fontFamily: 'InterMedium',
    },
});

export default SplashScreen;