import { FontSize, FontWeight } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, Platform, PlatformColor, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    return (
        <TouchableOpacity
            style={[styles.container]}
            activeOpacity={0.9}
            onPress={handlePress}
        >
            <View style={styles.content}>
                {/* 16:9 Video View or Thumbnail */}
                <View style={styles.videoWrapper}>
                    {!isFullScreenPlayer && currentTrack.videoUrl ? (
                        <VideoView
                            player={player}
                            style={styles.videoView}
                            nativeControls={false}
                            allowsPictureInPicture={false}
                            allowsVideoFrameAnalysis={false}
                            contentFit="cover"
                        />
                    ) : (
                        <Image
                            source={{ uri: currentTrack.coverUrl }}
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
                        color={Platform.OS === 'ios' ? PlatformColor('label') : '#FFFFFF'}
                    />
                </TouchableOpacity>
            </View>

            {/* Progress bar — thin line at the very bottom edge */}
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 12, // Floating effect
        marginBottom: 12,
        borderRadius: 32, // More rounded, pill-like (Apple style)
        overflow: 'hidden',
        height: '100%',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        paddingVertical: '1%'
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: '100%',
    },
    videoWrapper: {
        height: 'auto',
        width: '20%',
        borderRadius: 8,
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
        marginLeft: 12,
    },
    title: {
        color: Platform.OS === 'ios' ? PlatformColor('label') : '#FFFFFF',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    creator: {
        color: Platform.OS === 'ios' ? PlatformColor('secondaryLabel') : 'rgba(255,255,255,0.8)',
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    progressTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Platform.OS === 'ios' ? PlatformColor('separator') : 'rgba(255,255,255,0.2)',
    },
    progressFill: {
        height: 2,
        backgroundColor: Platform.OS === 'ios' ? PlatformColor('label') : '#FFFFFF',
    },
});
