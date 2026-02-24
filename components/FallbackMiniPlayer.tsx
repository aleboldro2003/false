import { FontSize, FontWeight } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FallbackMiniPlayerProps {
    bottomOffset?: number;
}

export default function FallbackMiniPlayer({ bottomOffset = 60 }: FallbackMiniPlayerProps) {
    const router = useRouter();
    const segments = useSegments();
    const { currentTrack, isPlaying, togglePlayback, player } = usePlayer();
    const [progress, setProgress] = useState(0);

    const isFullScreenPlayer = segments.some(s => s === 'podcast-player');

    const handlePress = () => {
        router.push('/podcast-player');
    };

    useEffect(() => {
        if (!player || !currentTrack) return;

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

        return () => subscription.remove();
    }, [player, currentTrack]);

    if (!currentTrack || !player) return null;

    return (
        <View style={[styles.wrapper, { bottom: bottomOffset }]}>
            <TouchableOpacity
                style={styles.container}
                activeOpacity={0.9}
                onPress={handlePress}
            >
                <View style={styles.content}>
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

                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                        <Text style={styles.creator} numberOfLines={1}>{currentTrack.artist}</Text>
                    </View>

                    <TouchableOpacity style={styles.iconBtn} onPress={togglePlayback}>
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 12,
        paddingBottom: 8, // slight margin above the tab bar
    },
    container: {
        backgroundColor: '#1E1E1E', // Solid dark gray, not transparent
        borderRadius: 16,
        overflow: 'hidden',
        height: 64,
        borderWidth: 1,
        borderColor: '#333333',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: '100%',
    },
    videoWrapper: {
        height: 44,
        width: 44,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    videoView: { width: '100%', height: '100%' },
    thumbnail: { width: '100%', height: '100%' },
    info: { flex: 1, justifyContent: 'center', marginLeft: 12 },
    title: { color: '#FFFFFF', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    creator: { color: '#AAAAAA', fontSize: FontSize.xs, marginTop: 2 },
    iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
    progressTrack: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#333333',
    },
    progressFill: { height: 2, backgroundColor: '#FFFFFF' },
});
