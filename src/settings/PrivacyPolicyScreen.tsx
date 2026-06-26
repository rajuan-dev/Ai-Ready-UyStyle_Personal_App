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
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Bell, MessageCircle, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PolicySection = ({ title, content, icon: Icon }: any) => (
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

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Introduction */}
                <View style={styles.introBox}>
                    <ShieldCheck size={40} color="#2869BD" strokeWidth={1.5} />
                    <Text style={styles.introTitle}>Your Privacy Matters</Text>
                    <Text style={styles.lastUpdated}>Last Updated: June 2026</Text>
                    <Text style={styles.introText}>
                        We value your trust and are committed to protecting your personal data.
                        This policy explains how we collect, use, disclose, and safeguard your information when you use Ustyle.
                    </Text>
                </View>

                {/* Content Sections */}
                <PolicySection
                    icon={Lock}
                    title="Data Collection"
                    content="We collect information you provide directly to us, such as when you create an account, upload photos of your wardrobe items (clothing, shoes, and accessories), or communicate with our style AI. This includes your name, email address, password, style preferences, and wardrobe images."
                />

                <PolicySection
                    icon={EyeOff}
                    title="How We Use Data"
                    content="Your wardrobe data is used solely to organize your closet and provide personalized outfit recommendations. We do not sell your personal data to third parties. Our AI analyzes your style choices and clothing details to improve your overall in-app experience."
                />

                <PolicySection
                    icon={Bell}
                    title="Third Party Services"
                    content="We use industry-leading third-party services, primarily Google Firebase, for user authentication, database management, and media storage. These services process your data strictly under security guidelines and will never use your information for external purposes without consent."
                />

                <PolicySection
                    icon={ShieldCheck}
                    title="Data Security"
                    content="We implement robust, industry-standard administrative, technical, and physical security measures to protect your personal information. All communications and files are encrypted in transit and at rest using modern secure socket layers and storage protocols."
                />

                <PolicySection
                    icon={Trash2}
                    title="Data Retention & Deletion"
                    content="We retain your personal data and wardrobe images only as long as your account is active. You have full control over your data. You can delete individual closet items or permanently delete your entire account and all associated wardrobe data at any time under Account Settings or by reaching support at support@ustyle.com."
                />

                {/* Contact Footer */}
                <View style={styles.footerCard}>
                    <MessageCircle size={24} color="#fff" />
                    <View style={styles.footerTextContainer}>
                        <Text style={styles.footerTitle}>Have Questions?</Text>
                        <Text style={styles.footerSub}>Contact our privacy team</Text>
                    </View>
                    <TouchableOpacity style={styles.contactBtn}>
                        <Text style={styles.contactBtnText}>Email Us</Text>
                    </TouchableOpacity>
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
    introTitle: {
        fontSize: 22,
        fontFamily: 'InterBold',
        color: '#1E293B',
        marginTop: 12,
    },
    lastUpdated: {
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
    // Policy Sections
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
        color: '#E0E7FF',
    },
    contactBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    contactBtnText: {
        fontSize: 13,
        fontFamily: 'InterSemiBold',
        color: '#2869BD',
    },
});

export default PrivacyPolicyScreen;