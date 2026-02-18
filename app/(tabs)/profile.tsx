import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProfileHeader from '@/components/ProfileHeader';
import SegmentedTabs from '@/components/SegmentedTabs';
import PostItem from '@/components/PostItem';
import PodcastCard from '@/components/PodcastCard';
import type { Post, UserProfile, Podcast } from '@/constants/mockData';
import { useRouter } from 'expo-router';

const TABS = ['Posts', 'Replies', 'Reposts', 'Podcasts'];

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [userReplies, setUserReplies] = useState<Post[]>([]);
    const [userReposts, setUserReposts] = useState<Post[]>([]);
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const userProfile = useMemo(() => {
        if (!user) return null;
        return {
            avatar: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=' + user.id,
            headerImage: profile?.banner_url || 'https://picsum.photos/seed/header/800/300',
            name: profile?.display_name || user.user_metadata?.full_name || 'User',
            handle: (profile?.username || user.user_metadata?.username) ? `@${profile?.username || user.user_metadata?.username}` : '@user',
            bio: profile?.bio || user.user_metadata?.bio || 'No bio yet.',
            followers: followerCount,
            following: followingCount,
            isOwn: true,
        } as UserProfile;
    }, [user, profile, followerCount, followingCount]);

    const fetchFollowCounts = useCallback(async () => {
        if (!user) return;
        const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
        const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
        setFollowingCount(following || 0);
        setFollowerCount(followers || 0);
    }, [user]);

    const fetchUserPosts = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                  *,
                  likes:likes(count),
                  comments:comments(count)
                `)
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: Post[] = (data || []).map((row: any) => ({
                id: row.id,
                avatar: profile?.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/100?u=${user.id}`,
                username: profile?.display_name || user.user_metadata?.full_name || 'User',
                handle: (profile?.username || user.user_metadata?.username) ? `@${profile?.username || user.user_metadata?.username}` : '@user',
                time: timeAgo(row.created_at),
                text: row.text || row.content || '',
                mediaUrl: row.media_url,
                mediaType: row.media_type,
                isThread: false,
                comments: row.comments?.[0]?.count || 0,
                reposts: 0,
                likes: row.likes?.[0]?.count || 0,
                authorId: row.author_id,
            }));
            setUserPosts(mapped);
        } catch (err) {
            console.warn('Fetch user posts error:', err);
        }
    }, [user, profile]);

    const fetchUserReplies = useCallback(async () => {
        // Placeholder for replies
        setUserReplies([]);
    }, []);

    const fetchPodcasts = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('podcasts')
                .select('*') // Need to join profile?
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: Podcast[] = (data || []).map((row: any) => ({
                id: row.id,
                title: row.title,
                description: row.description,
                thumbnail: row.image_url,
                creatorName: profile?.display_name || user.user_metadata?.full_name || 'Me',
                creatorAvatar: profile?.avatar_url || user.user_metadata?.avatar_url,
                duration: '00:00', // Need format
                videoUrl: row.video_url,
            }));
            setPodcasts(mapped);
        } catch (err) {
            console.warn('Fetch podcasts error:', err);
        }
    }, [user, profile]);

    const fetchUserReposts = useCallback(async () => {
        if (!user) return;
        try {
            // Fetch reposts with post details
            const { data, error } = await supabase
                .from('reposts')
                .select('created_at, posts(*, profiles:posts_author_id_fkey(*))') // Fetch post and author profile using explicit FK
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Error fetching reposts:', error.message);
                return;
            }

            const repostsData = data || [];
            const mapped: Post[] = repostsData.map((row: any) => {
                const p = row.posts;
                if (!p) return null;
                // The profile is now embedded in the post as 'profiles' (or whatever alias we used, here it's implicit or array)
                // With explicit FK, it might come as 'profiles' object or array.
                // Usually it returns a single object if it's a many-to-one.
                const prof = p.profiles || {};

                return {
                    id: p.id,
                    avatar: prof.avatar_url || `https://i.pravatar.cc/100?u=${p.author_id}`,
                    username: prof.display_name || prof.username || 'User',
                    handle: prof.username ? `@${prof.username}` : '@user',
                    time: timeAgo(row.created_at),
                    text: p.text || p.content || '',
                    mediaUrl: p.media_url,
                    mediaType: p.media_type,
                    isThread: false,
                    comments: 0,
                    reposts: 0,
                    likes: 0,
                    isReposted: true,
                    authorId: p.author_id,
                };
            }).filter(Boolean);

            setUserReposts(mapped);
        } catch (err) {
            console.warn('Fetch reposts error:', err);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 0) {
            setLoadingPosts(true);
            fetchUserPosts().finally(() => setLoadingPosts(false));
        } else if (activeTab === 1) { // Replies
            setLoadingPosts(true);
            fetchUserReplies().finally(() => setLoadingPosts(false));
        } else if (activeTab === 2) { // Reposts
            setLoadingPosts(true);
            fetchUserReposts().finally(() => setLoadingPosts(false));
        } else if (activeTab === 3) { // Podcasts
            setLoadingPosts(true);
            fetchPodcasts().finally(() => setLoadingPosts(false));
        } else {
            setLoadingPosts(false);
        }
    }, [activeTab, fetchUserPosts, fetchUserReplies, fetchUserReposts, fetchPodcasts]);

    // Initial load
    useEffect(() => {
        fetchFollowCounts();
    }, [fetchFollowCounts]);

    const handleLogOut = () => {
        Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: signOut },
        ]);
    };

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    const handleAvatarPress = (authorId?: string) => {
        if (authorId) router.push(`/user/${authorId}`);
    };

    // No-op handlers for profile view for now, or implement if needed
    const handleLike = () => { };
    const handleRepost = () => { };

    const renderPostItem = ({ item }: { item: Post }) => (
        <PostItem
            post={item}
            onAvatarPress={() => handleAvatarPress(item.authorId)}
            onLike={handleLike}
            onRepost={handleRepost}
        />
    );

    const renderPodcastItem = ({ item }: { item: Podcast }) => (
        <PodcastCard podcast={item} />
    );

    const ListHeader = () => (
        <>
            <ProfileHeader
                user={userProfile}
                onEditPress={handleEditProfile}
            />
            <View style={styles.statsLogoutRow}>
                <View style={styles.statsGroup}>
                    <Text style={styles.statNumber}>
                        {followingCount}{' '}
                        <Text style={styles.statLabel}>Following</Text>
                    </Text>
                    <Text style={styles.statNumber}>
                        {followerCount}{' '}
                        <Text style={styles.statLabel}>Followers</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    activeOpacity={0.7}
                    onPress={handleLogOut}
                >
                    <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
            <SegmentedTabs
                tabs={TABS}
                activeIndex={activeTab}
                onTabChange={setActiveTab}
            />
        </>
    );

    if (!user) return null;

    return (
        <View style={styles.container}>
            <FlatList
                data={activeTab === 3 ? podcasts : (activeTab === 2 ? userReposts : (activeTab === 1 ? userReplies : userPosts)) as any[]}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => {
                    if (activeTab === 3) return renderPodcastItem({ item: item as Podcast });
                    return renderPostItem({ item: item as Post });
                }}
                ListHeaderComponent={ListHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loadingPosts}
                        onRefresh={
                            activeTab === 0 ? fetchUserPosts :
                                activeTab === 1 ? fetchUserReplies :
                                    activeTab === 2 ? fetchUserReposts :
                                        fetchPodcasts
                        }
                        tintColor={Colors.textTertiary}
                    />
                }
                ListEmptyComponent={
                    !loadingPosts ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 0 ? 'No posts yet' :
                                    activeTab === 1 ? 'No replies yet' :
                                        activeTab === 2 ? 'No reposts yet' :
                                            'No podcasts'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingBottom: 160,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsLogoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    statsGroup: {
        flexDirection: 'row',
        gap: Spacing.xl,
    },
    statNumber: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    statLabel: {
        color: Colors.textTertiary,
        fontWeight: FontWeight.regular,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
    },
    logoutText: {
        color: Colors.danger,
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: Colors.textTertiary,
        fontSize: FontSize.md,
    },
});
