import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    TextInput,
    LayoutAnimation,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Search,
    Mail,
    ChevronDown,
    ChevronUp,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const SUPPORT_EMAIL = 'pat@ustylefashion.com';


const faqs = [
    {
        id: '1',
        question: 'How do I add new clothes?',
        answer: 'Go to the "Closet" tab and tap the "+" icon at the top right. You can take a photo of your garment or upload one from your gallery.',
    },
    {
        id: '2',
        question: 'Can I share my outfits?',
        answer: 'Yes! Once you create a look in the "Combine" screen, go to the "Preview" page and tap the share icon at the top right to send it to friends.',
    },
    {
        id: '3',
        question: 'What are style preferences?',
        answer: 'Style preferences help our AI suggest better outfits. You can update these in your Profile under "Style Preferences" at any time.',
    },
    {
        id: '4',
        question: 'How do I delete an item?',
        answer: 'Open the item details from your closet and tap the "Delete" icon. This will permanently remove the item from your digital wardrobe.',
    },
];

const SupportCard = ({ icon: Icon, title, sub, color, onPress }: any) => (
    <TouchableOpacity style={styles.supportCard} activeOpacity={0.7} onPress={onPress}>
        <View style={[styles.supportIconContainer, { backgroundColor: color + '15' }]}>
            <Icon size={24} color={color} />
        </View>
        <View>
            <Text style={styles.supportTitle}>{title}</Text>
            <Text style={styles.supportSub}>{sub}</Text>
        </View>
    </TouchableOpacity>
);

const HelpScreen = () => {
    const navigation = useNavigation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search help articles..."
                            placeholderTextColor="#94A3B8"
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                {/* Quick Support Cards */}
                <View style={styles.supportGrid}>
                    <SupportCard
                        icon={Mail}
                        title="Email Support"
                        sub={SUPPORT_EMAIL}
                        color="#10B981"
                        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=UStyle%20Support`)}
                    />
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            style={styles.faqItem}
                            onPress={() => toggleExpand(faq.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{faq.question}</Text>
                                {expandedId === faq.id ? (
                                    <ChevronUp size={20} color="#64748B" />
                                ) : (
                                    <ChevronDown size={20} color="#64748B" />
                                )}
                            </View>
                            {expandedId === faq.id && (
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
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
        fontSize: 20,
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
    // Search
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontFamily: 'InterRegular',
        fontSize: 15,
        color: '#1E293B',
    },
    // Support Grid
    supportGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    supportCard: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    supportIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 12,
    },
    supportTitle: {
        fontSize: 14,
        fontFamily: 'InterSemiBold',
        color: '#1E293B',
    },
    supportSub: {
        fontSize: 11,
        fontFamily: 'InterMedium',
        color: '#94A3B8',
        marginTop: 4,
    },
    // FAQ
    faqSection: {
        marginTop: 32,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'InterBold',
        color: '#0F1729',
        marginBottom: 16,
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontFamily: 'InterSemiBold',
        color: '#1E293B',
        flex: 1,
        marginRight: 10,
    },
    faqAnswer: {
        fontSize: 14,
        fontFamily: 'InterRegular',
        color: '#64748B',
        lineHeight: 22,
        marginTop: 12,
    },
});

export default HelpScreen;