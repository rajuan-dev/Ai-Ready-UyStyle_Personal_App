import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Shirt } from 'lucide-react-native';

interface OutfitCollageProps {
    images: string[];
    style?: any;
}

export const OutfitCollage: React.FC<OutfitCollageProps> = ({ images, style }) => {
    // Filter out invalid/empty image URLs
    const validImages = (images || []).filter((url) => typeof url === 'string' && url.trim().length > 0);

    if (validImages.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer, style]}>
                <View style={styles.iconWrapper}>
                    <Shirt size={28} color="#94A3B8" />
                </View>
                <Text style={styles.emptyText}>Empty Look</Text>
            </View>
        );
    }

    if (validImages.length === 1) {
        return (
            <View style={[styles.container, style]}>
                <Image source={{ uri: validImages[0] }} style={styles.image} resizeMode="cover" />
            </View>
        );
    }

    if (validImages.length === 2) {
        return (
            <View style={[styles.container, styles.row, style]}>
                <Image source={{ uri: validImages[0] }} style={[styles.image, styles.flex1, styles.marginRight]} resizeMode="cover" />
                <Image source={{ uri: validImages[1] }} style={[styles.image, styles.flex1]} resizeMode="cover" />
            </View>
        );
    }

    if (validImages.length === 3) {
        return (
            <View style={[styles.container, styles.column, style]}>
                <View style={[styles.flex1, styles.marginBottom]}>
                    <Image source={{ uri: validImages[0] }} style={styles.image} resizeMode="cover" />
                </View>
                <View style={[styles.row, styles.flex1]}>
                    <Image source={{ uri: validImages[1] }} style={[styles.image, styles.flex1, styles.marginRight]} resizeMode="cover" />
                    <Image source={{ uri: validImages[2] }} style={[styles.image, styles.flex1]} resizeMode="cover" />
                </View>
            </View>
        );
    }

    // 4 or more images (show first 4 in 2x2 grid)
    return (
        <View style={[styles.container, styles.column, style]}>
            <View style={[styles.row, styles.flex1, styles.marginBottom]}>
                <Image source={{ uri: validImages[0] }} style={[styles.image, styles.flex1, styles.marginRight]} resizeMode="cover" />
                <Image source={{ uri: validImages[1] }} style={[styles.image, styles.flex1]} resizeMode="cover" />
            </View>
            <View style={[styles.row, styles.flex1]}>
                <Image source={{ uri: validImages[2] }} style={[styles.image, styles.flex1, styles.marginRight]} resizeMode="cover" />
                <Image source={{ uri: validImages[3] }} style={[styles.image, styles.flex1]} resizeMode="cover" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
    flex1: {
        flex: 1,
    },
    flex60: {
        flex: 0.6,
    },
    flex40: {
        flex: 0.4,
    },
    marginRight: {
        marginRight: 2,
    },
    marginBottom: {
        marginBottom: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E2E8F0',
        padding: 8,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 11,
        fontFamily: 'InterMedium',
        fontWeight: '500',
        color: '#94A3B8',
        textAlign: 'center',
    },
});
