import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { usePlayer } from '@/contexts/PlayerContext';
import { VideoView } from 'expo-video';

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PodcastPlayerScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currentTrack, isPlaying, togglePlayback, player } = usePlayer();

    // VideoView Ref for imperative Fullscreen
    const videoViewRef = useRef<VideoView>(null);

    // Local state for UI
    const [sliderValue, setSliderValue] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showNativeControls, setShowNativeControls] = useState(false);

    // We do NOT Initialize useVideoPlayer here anymore.
    // We use 'player' from context.

    useEffect(() => {
        if (!player) return;

        // Initial set
        const initDur = player.duration > 0 ? player.duration : (currentTrack?.duration || 0);
        setDuration(initDur);
        setSliderValue(player.currentTime);
        setIsMuted(player.muted);

        if (player && typeof player === 'object' && 'timeUpdateEventInterval' in player) {
            (player as any).timeUpdateEventInterval = 0.25;
        }

        // Listeners
        const timeSub = player.addListener('timeUpdate', (event) => {
            setSliderValue(event.currentTime);
            // Sync duration if it becomes available or changes
            if (player.duration > 0) {
                setDuration(d => (Math.abs(d - player.duration) > 1 ? player.duration : d));
            }
        });

        const volSub = player.addListener('volumeChange', () => {
            setIsMuted(player.muted);
        });

        return () => {
            timeSub.remove();
            volSub.remove();
        };
    }, [player, currentTrack]);

    if (!currentTrack || !player) return null;

    const handleSeek = (value: number) => {
        player.seekBy(value - player.currentTime);
        setSliderValue(value);
    };

    const toggleMute = () => {
        player.muted = !player.muted;
    };

    const enterFullscreen = () => {
        if (videoViewRef.current) {
            videoViewRef.current.enterFullscreen();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
                    <Ionicons name="chevron-down" size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Now Playing</Text>
                <TouchableOpacity activeOpacity={0.6}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={Colors.textTertiary} />
                </TouchableOpacity>
            </View>

            {/* Video Player Area - Secure, No Native Controls */}
            <View style={styles.videoContainer}>
                {/* Prevent long press context menu by wrapping or overlay */}
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={() => { }} // Prevent default action
                    style={styles.videoWrapper}
                >
                    <VideoView
                        ref={videoViewRef}
                        player={player}
                        style={styles.video}
                        nativeControls={showNativeControls}
                        onFullscreenEnter={() => setShowNativeControls(true)}
                        onFullscreenExit={() => setShowNativeControls(false)}
                        fullscreenOptions={{ enable: true }}
                        allowsPictureInPicture={false}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* Track info */}
            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                <Text style={styles.trackCreator}>{currentTrack.artist}</Text>
            </View>

            {/* Timeline scrubber */}
            <View style={styles.scrubberContainer}>
                <View style={styles.scrubberTrack}>
                    <View
                        style={[
                            styles.scrubberFill,
                            { width: `${duration > 0 ? (sliderValue / duration) * 100 : 0}%` },
                        ]}
                    />
                    {/* Simplified Custom Thumb */}
                    <View
                        style={[
                            styles.scrubberThumb,
                            { left: `${duration > 0 ? (sliderValue / duration) * 100 : 0}%` },
                        ]}
                    />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(sliderValue)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </View>

            {/* Playback controls */}
            <View style={styles.controls}>
                {/* Mute Toggle */}
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={toggleMute}
                    style={styles.controlBtn}
                >
                    <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => handleSeek(Math.max(0, sliderValue - 15))}
                >
                    <Ionicons name="play-back" size={32} color={Colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.playPauseBtn}
                    activeOpacity={0.8}
                    onPress={togglePlayback}
                >
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={32}
                        color={Colors.background}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => handleSeek(Math.min(duration, sliderValue + 15))}
                >
                    <Ionicons name="play-forward" size={32} color={Colors.textPrimary} />
                </TouchableOpacity>

                {/* Fullscreen Button */}
                <TouchableOpacity
                    style={styles.controlBtn}
                    activeOpacity={0.6}
                    onPress={enterFullscreen}
                >
                    <Ionicons name="scan-outline" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xxl,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.lg,
    },
    topBarTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        marginTop: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        backgroundColor: '#000',
        alignSelf: 'center',
        position: 'relative',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    trackInfo: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    trackTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    trackCreator: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    scrubberContainer: {
        marginBottom: Spacing.xxxl,
    },
    scrubberTrack: {
        width: '100%', // Ensure it fills the container
        height: 4,
        backgroundColor: Colors.progressTrack || '#333',
        borderRadius: 2,
        position: 'relative',
        justifyContent: 'center',
    },
    scrubberFill: {
        height: 4,
        backgroundColor: Colors.progressBar || '#FFF',
        borderRadius: 2,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    scrubberThumb: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.textPrimary,
        position: 'absolute',
        top: -5,
        marginLeft: -7,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    timeText: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Changed to space-between for 5 items
        paddingHorizontal: Spacing.md,
    },
    playPauseBtn: {
        width: 64,
        height: 64,
        borderRadius: Radius.full,
        backgroundColor: Colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
