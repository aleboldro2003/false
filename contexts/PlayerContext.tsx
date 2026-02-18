import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { useVideoPlayer, VideoPlayer } from 'expo-video';

export interface Track {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    videoUrl: string;
    duration: number;  // seconds
    elapsed: number;   // seconds
    artistImage?: string;
}

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    setCurrentTrack: (track: Track) => void;
    togglePlayback: () => void;
    player: VideoPlayer | null;
}

const PlayerContext = createContext<PlayerContextType>({
    currentTrack: null,
    isPlaying: false,
    setCurrentTrack: () => { },
    togglePlayback: () => { },
    player: null,
});

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Singleton Video Player
    const player = useVideoPlayer(currentTrack?.videoUrl || '', player => {
        player.loop = false;
        // Don't auto-play here, we control it via effects or user interaction
    });

    const togglePlayback = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
        // Removed optimistic setIsPlaying, rely on listener
    };

    // Sync Player State -> Context State (Optional, but good for UI consistency)
    useEffect(() => {
        const subscription = player.addListener('playingChange', (event) => {
            setIsPlaying(event.isPlaying);
        });
        return () => {
            subscription.remove();
        };
    }, [player]);

    // Sync Track Change -> Player
    // useVideoPlayer handles source changes automatically when the first arg changes.
    // But we might need to ensure it plays if it was playing before, or reset state.
    useEffect(() => {
        if (currentTrack?.videoUrl) {
            // If we switch tracks, maybe we want to auto-play only if we were already playing?
            // Or just let user decide. For now, let's keep simple.
            if (isPlaying) {
                player.play();
            }
        }
    }, [currentTrack]);

    return (
        <PlayerContext.Provider
            value={{ currentTrack, isPlaying, setCurrentTrack, togglePlayback, player }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}
