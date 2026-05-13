import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

const STEPS = [
    {
        title: 'Your Digital Closet',
        subtitle: 'Get quick outfit suggestions based on your day.',
        image: require('../../../assets/images/onboardin.png'),
    },
    {
        title: 'Build Outfits Fast',
        subtitle: 'Mix and match your pieces for daily wear or special events.',
        image: require('../../../assets/images/onboarding3.png'),
    },
    {
        title: 'Style Made Personal',
        subtitle: 'Discover looks curated just for you, every single day.',
        image: require('../../../assets/images/onboarding3.png'), // uses the same hanger image as requested
    },
];

type RootStackParamList = {
    signup: undefined;
    signin: undefined;
};

export default function OnBoardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < STEPS.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            navigation.replace('signup');
        }
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false } // width cannot be animated with useNativeDriver: true
    );

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const renderItem = ({ item, index }: { item: typeof STEPS[0]; index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        // Cool image scaling and fade animation
        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        // Subtle vertical slide up for text
        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [40, 0, 40],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.slide}>
                <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
                    <Image
                        source={item.image}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity, transform: [{ translateY }] }]}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </Animated.View>
            </View>
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/images/bg-onboarding.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Swipeable Top Section */}
            <View style={styles.carouselWrapper}>
                <Animated.FlatList
                    ref={flatListRef}
                    data={STEPS}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    keyExtractor={(_, idx) => idx.toString()}
                    bounces={false}
                    scrollEventThrottle={16}
                />
            </View>

            {/* Static Bottom Sheet */}
            <View style={styles.bottomBar}>
                {/* Pagination dots with dynamic expanding animation */}
                <View style={styles.dotsContainer}>
                    {STEPS.map((_, idx) => {
                        const inputRange = [
                            (idx - 1) * width,
                            idx * width,
                            (idx + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 26, 10],
                            extrapolate: 'clamp',
                        });

                        const dotOpacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.4, 1, 0.4],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={idx}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity: dotOpacity },
                                    idx === currentIndex ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Next / Finish Button */}
                <TouchableOpacity
                    style={styles.nextButton}
                    activeOpacity={0.85}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>

                {/* Conditional "I Already Have An Account" Link */}
                {currentIndex < STEPS.length - 1 ? (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.replace('signin')}
                        style={styles.loginContainer}
                    >
                        <Text style={styles.loginText}>I Already Have An Account</Text>
                    </TouchableOpacity>
                ) : (
                    // Placeholder to maintain sheet layout height consistency
                    <View style={styles.loginContainerPlaceholder} />
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    carouselWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    slide: {
        width: width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    imageContainer: {
        width: width * 0.85,
        height: height * 0.35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 34,
        fontWeight: '800',
        textAlign: 'center',
        fontFamily: 'InterBold',
        marginBottom: 12,
    },
    subtitle: {
        color: '#E2E8F0',
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'InterRegular',
        fontWeight: '400',
        lineHeight: 26,
        opacity: 0.9,
    },
    bottomBar: {
        backgroundColor: '#16202E',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: 22,
        paddingBottom: 40, // fits safe area nicely
        alignItems: 'center',
        minHeight: 200, // ensures layout stays locked and steady
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        height: 10,
        borderRadius: 5,
    },
    activeDot: {
        backgroundColor: '#3B82F6',
    },
    inactiveDot: {
        backgroundColor: '#FFFFFF',
    },
    nextButton: {
        width: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'InterMedium',
    },
    loginContainer: {
        marginTop: 20,
        paddingVertical: 4,
    },
    loginContainerPlaceholder: {
        marginTop: 20,
        height: 24, // matching same size as loginContainer to prevent layout jumps
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: 'InterRegular',
        opacity: 0.95,
    },
});
