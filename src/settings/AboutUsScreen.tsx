import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Shirt, ShieldCheck, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface AboutSectionProps {
    title: string;
    content: string;
    icon: React.ComponentType<any>;
}

const AboutSection = ({ title, content, icon: Icon }: AboutSectionProps) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
                <Icon size={18} color="#2869BD" />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionText}>{content}</Text>
    </View>
);

const AboutUsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Introduction Box */}
                <View style={styles.introBox}>
                    <View style={styles.logoContainer}>
                        <Shirt size={48} color="#2869BD" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.introTitle}>Ustyle</Text>
                    <Text style={styles.versionText}>Version 1.0.0 (Build 25)</Text>
                    <Text style={styles.introText}>
                        Ustyle is your ultimate digital wardrobe companion. We leverage cutting-edge mobile technologies and AI-powered recommendations to simplify your daily styling decisions and help you look your best.
                    </Text>
                </View>

                {/* Content Sections */}
                <AboutSection
                    icon={Sparkles}
                    title="Our Vision"
                    content="We believe getting dressed should be inspiring, effortless, and fun. By organizing your closet digitally, we empower you to maximize your wardrobe, discover fresh combinations, and reduce clothing waste through conscious wear."
                />

                <AboutSection
                    icon={Shirt}
                    title="Smart Virtual Closet"
                    content="Easily photograph and catalog your clothes, accessories, and shoes. Ustyle allows you to view your entire closet at a glance, group items into outfits, and save your favorite looks for quick retrieval."
                />

                <AboutSection
                    icon={ShieldCheck}
                    title="AI Styling Assistant"
                    content="Our styling engine analyzes your preferences, color choices, and occasions to recommend custom-tailored outfits. It is designed to inspire your daily outfit choices directly from your existing wardrobe."
                />

                {/* Developer / Commitment Card */}
                <View style={styles.footerCard}>
                    <Heart size={24} color="#fff" fill="#fff" />
                    <View style={styles.footerTextContainer}>
                        <Text style={styles.footerTitle}>Built with Passion</Text>
                        <Text style={styles.footerSub}>Dedicated to delivering a seamless personal styling experience.</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'InterBold',
        color: '#0F1729',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    // Intro Section
    introBox: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#F8FAFC',
        textAlign: 'center',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    introTitle: {
        fontSize: 24,
        fontFamily: 'InterBold',
        color: '#1E293B',
        marginTop: 16,
    },
    versionText: {
        fontSize: 13,
        fontFamily: 'InterMedium',
        color: '#94A3B8',
        marginTop: 4,
    },
    introText: {
        fontSize: 15,
        fontFamily: 'InterRegular',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 16,
    },
    // Sections
    section: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EBF1FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'InterSemiBold',
        color: '#0F1729',
    },
    sectionText: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        color: '#475569',
        lineHeight: 22,
    },
    // Footer Card
    footerCard: {
        margin: 24,
        padding: 20,
        backgroundColor: '#2869BD',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    footerTitle: {
        fontSize: 16,
        fontFamily: 'InterBold',
        color: '#fff',
    },
    footerSub: {
        fontSize: 12,
        fontFamily: 'InterRegular',
        color: '#EBF1FB',
    },
});

export default AboutUsScreen;
