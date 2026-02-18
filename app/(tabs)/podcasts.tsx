import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { usePlayer } from '@/contexts/PlayerContext';
import PodcastCard from '@/components/PodcastCard';
import type { Podcast } from '@/constants/mockData';

type FilterType = 'new' | 'for_you' | 'favorites';

export default function PodcastsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { setCurrentTrack } = usePlayer();
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('new');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Fetch favorites for the current user
    const fetchFavorites = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('podcast_id')
            .eq('user_id', user.id);

        if (!error && data) {
            setFavoriteIds(new Set(data.map((item: any) => item.podcast_id)));
        }
    }, []);

    const fetchPodcasts = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch podcasts and join with profiles to get avatar_url
            // For now, we fetch ALL and filter client-side for "favorites".
            // "New" and "For You" show all for now as requested.
            const { data, error } = await supabase
                .from('podcasts')
                .select(`
                    *,
                    profiles:user_id (
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Error fetching podcasts:', error.message);
                return;
            }

            // Map DB rows to Podcast interface
            const mapped: Podcast[] = (data || []).map((row: any) => ({
                id: row.id,
                thumbnail: row.cover_url || 'https://picsum.photos/seed/pod/800/450',
                creatorAvatar: row.profiles?.avatar_url || 'https://picsum.photos/seed/pod/100/100',
                creatorName: row.artist || 'Unknown',
                title: row.title || 'Untitled',
                description: '',
                duration: row.duration ? `${Math.floor(row.duration / 60)}:${(row.duration % 60).toString().padStart(2, '0')}` : '0:00',
                durationSeconds: row.duration || 0,
                views: row.views || undefined,
                year: undefined,
                videoUrl: row.media_url,
            }));

            setPodcasts(mapped);
            await fetchFavorites();
        } catch (err) {
            console.warn('Fetch podcasts error:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFavorites]);

    useEffect(() => {
        fetchPodcasts();
    }, [fetchPodcasts]);

    const handlePodcastPress = (podcast: Podcast) => {
        setCurrentTrack({
            id: podcast.id,
            title: podcast.title,
            artist: podcast.creatorName,
            coverUrl: podcast.thumbnail,
            videoUrl: podcast.videoUrl || '',
            artistImage: podcast.creatorAvatar,
            duration: podcast.durationSeconds || 0,
            elapsed: 0,
        });

        router.push('/podcast-player');
    };

    const toggleFavorite = async (podcastId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // Optional: prompt login
            return;
        }

        const isFav = favoriteIds.has(podcastId);
        let error;

        if (isFav) {
            const { error: delErr } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('podcast_id', podcastId);
            error = delErr;
        } else {
            const { error: insErr } = await supabase
                .from('favorites')
                .insert({ user_id: user.id, podcast_id: podcastId });
            error = insErr;
        }

        if (!error) {
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (isFav) newSet.delete(podcastId);
                else newSet.add(podcastId);
                return newSet;
            });
        } else {
            console.warn('Toggle favorite error:', error.message);
        }
    };

    // Filter Logic
    const displayedPodcasts = podcasts.filter(p => {
        if (activeFilter === 'favorites') {
            return favoriteIds.has(p.id);
        }
        return true; // 'new' and 'for_you' show all
    }).map(p => ({
        ...p,
        isFavorite: favoriteIds.has(p.id)
    }));

    const renderItem = ({ item }: { item: Podcast }) => (
        <PodcastCard
            podcast={item}
            onPress={() => handlePodcastPress(item)}
            onToggleFavorite={toggleFavorite}
        />
    );

    const FilterButton = ({ label, value }: { label: string, value: FilterType }) => {
        const isActive = activeFilter === value;
        return (
            <TouchableOpacity
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setActiveFilter(value)}
            >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>PODCAST</Text>
                <TouchableOpacity onPress={() => router.push('/create-podcast')}>
                    <Ionicons name="add-circle" size={32} color={Colors.accent} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <FilterButton label="Novità" value="new" />
                <FilterButton label="Per te" value="for_you" />
                <FilterButton label="Preferiti" value="favorites" />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.textTertiary} />
                </View>
            ) : (
                <FlatList
                    data={displayedPodcasts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeFilter === 'favorites' ? 'No favorites yet' : 'No podcasts found'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: 36,
        fontWeight: FontWeight.bold,
        letterSpacing: -1,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    filterBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterBtnActive: {
        backgroundColor: Colors.surfaceLight, // Or a highlight color
        borderColor: Colors.textSecondary,
    },
    filterText: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    filterTextActive: {
        color: Colors.textPrimary,
    },
    listContent: {
        paddingBottom: 160,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        color: Colors.textTertiary,
        fontSize: FontSize.md,
    },
});
