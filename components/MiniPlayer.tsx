import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { VideoView } from 'expo-video';
import { BlurView } from 'expo-blur';

export default function MiniPlayer() {
    const router = useRouter();
    const segments = useSegments();
    const { currentTrack, isPlaying, togglePlayback, player } = usePlayer();
    const [progress, setProgress] = useState(0);

    // Check if we are on the full screen player
    const isFullScreenPlayer = segments.some(s => s === 'podcast-player');

    const handlePress = () => {
        router.push('/podcast-player');
    };

    useEffect(() => {
        if (!player || !currentTrack) return;

        // Initial set
        const updateProgress = () => {
            if (currentTrack?.duration) {
                setProgress(player.currentTime / currentTrack.duration);
            }
        };
        updateProgress();

        const subscription = player.addListener('timeUpdate', (event) => {
            if (currentTrack?.duration) {
                setProgress(event.currentTime / currentTrack.duration);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [player, currentTrack]);

    // Don't render if there's no track or player
    if (!currentTrack || !player) return null;

    // Determine the background image source (cover art)
    const bgImageSource = currentTrack.coverUrl ? { uri: currentTrack.coverUrl } : null;

    return (
        <TouchableOpacity
            style={[styles.container]}
            activeOpacity={0.9}
            onPress={handlePress}
        >
            {/* Background Image with Blur */}
            {bgImageSource && (
                <View style={styles.backgroundContainer}>
                    <Image source={bgImageSource} style={styles.backgroundImage} blurRadius={30} />
                    <View style={styles.darkOverlay} />
                </View>
            )}

            <View style={styles.content}>
                {/* 16:9 Video View or Thumbnail */}
                <View style={styles.videoWrapper}>
                    {!isFullScreenPlayer && currentTrack.videoUrl ? (
                        <VideoView
                            player={player}
                            style={styles.videoView}
                            nativeControls={false}
                            allowsPictureInPicture={false}
                            contentFit="cover"
                        />
                    ) : (
                        <Image
                            source={{ uri: currentTrack.thumbnail || currentTrack.coverUrl }}
                            style={styles.thumbnail}
                        />
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                    <Text style={styles.creator} numberOfLines={1}>{currentTrack.artist}</Text>
                </View>

                {/* Play/Pause icon */}
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.6} onPress={togglePlayback}>
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={22}
                        color={'#FFFFFF'}
                    />
                </TouchableOpacity>
            </View>

            {/* Progress bar — thin white line at the very bottom edge */}
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 8,
        marginBottom: 8,
        borderRadius: Radius.md,
        overflow: 'hidden',
        height: 64, // Fixed height for consistent look
        backgroundColor: '#1A1A1A', // Fallback color
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'center', // Center content vertically
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)', // Darken the blurred image for text legibility
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm, // Reduced padding for 16:9 fit
        gap: Spacing.sm,
        height: '100%',
    },
    videoWrapper: {
        width: 80, // Approximate 16:9 width for height ~45-50
        aspectRatio: 16 / 9,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    videoView: {
        width: '100%',
        height: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#FFFFFF', // Always white due to dark background
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    creator: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressFill: {
        height: 2,
        backgroundColor: '#FFFFFF',
    },
});
