import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import type { Podcast } from '@/constants/mockData';

interface PodcastCardProps {
    podcast: Podcast;
    onPress?: () => void;
    onToggleFavorite?: (id: string) => void;
}

export default function PodcastCard({ podcast, onPress, onToggleFavorite }: PodcastCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={onPress}
        >
            {/* Thumbnail — Fixed 16:9 Aspect Ratio */}
            <View style={styles.thumbnailWrapper}>
                <Image
                    source={{ uri: podcast.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />

                {/* Duration pill — top-left */}
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{podcast.duration}</Text>
                </View>

                {/* Right-edge vertical icons */}
                <View style={styles.rightIcons}>
                    <TouchableOpacity
                        style={styles.overlayIconBtn}
                        activeOpacity={0.7}
                        onPress={() => onToggleFavorite?.(podcast.id)}
                    >
                        <Ionicons
                            name={podcast.isFavorite ? "checkmark-circle" : "add"}
                            size={20}
                            color={podcast.isFavorite ? Colors.accent : Colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.overlayIconBtn} activeOpacity={0.7}>
                        <Ionicons name="volume-mute" size={18} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Large play button — bottom-right */}
                <TouchableOpacity
                    style={styles.playCircle}
                    activeOpacity={0.8}
                    onPress={onPress}
                >
                    <Ionicons name="play" size={24} color="#000" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            </View>

            {/* Metadata row below thumbnail */}
            <View style={styles.metaRow}>
                <Image
                    source={{ uri: podcast.creatorAvatar }}
                    style={styles.channelLogo}
                />
                <View style={styles.metaText}>
                    <Text style={styles.title} numberOfLines={2}>{podcast.title}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {podcast.creatorName}
                        {podcast.views ? ` • ${podcast.views}` : ''}
                        {podcast.year ? ` • ${podcast.year}` : ''}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: Spacing.xxl,
    },
    thumbnailWrapper: {
        position: 'relative',
        marginHorizontal: Spacing.lg,
        aspectRatio: 16 / 9, // Fixed 16:9 ratio
        borderRadius: Radius.lg,
        overflow: 'hidden', // Ensure image respects border radius
        backgroundColor: '#000',
    },
    thumbnail: {
        width: '100%',
        height: '100%', // Fills the wrapper
    },
    durationBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.sm,
    },
    durationText: {
        color: Colors.textPrimary,
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
    rightIcons: {
        position: 'absolute',
        right: Spacing.sm,
        top: Spacing.sm,
        gap: Spacing.sm,
    },
    overlayIconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playCircle: {
        position: 'absolute',
        bottom: Spacing.md,
        right: Spacing.md,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    metaRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    channelLogo: {
        width: 40,
        height: 40,
        borderRadius: Radius.sm,
        backgroundColor: Colors.surfaceLight,
        marginTop: 2,
    },
    metaText: {
        flex: 1,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        lineHeight: 20,
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    subtitle: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
});
