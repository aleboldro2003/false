import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileHeader from '@/components/ProfileHeader';
import SegmentedTabs from '@/components/SegmentedTabs';
import PostItem from '@/components/PostItem';
import type { Post, UserProfile } from '@/constants/mockData';

const TABS = ['Posts', 'Replies'];

// Helper for time ago
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

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // Stats & Follow State
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);

    const userId = Array.isArray(id) ? id[0] : id;

    // Fetch Profile Data
    useEffect(() => {
        if (!userId) return;

        async function fetchProfile() {
            setLoadingProfile(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) setProfile(data);
            setLoadingProfile(false);
        }

        fetchProfile();
        fetchStats();
        checkIfFollowing();
    }, [userId]);

    // Fetch Follow/Following Stats
    const fetchStats = useCallback(async () => {
        if (!userId) return;
        const [{ count: followers }, { count: following }] = await Promise.all([
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
            supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
        ]);
        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
    }, [userId]);

    // Check if current user is following this profile
    const checkIfFollowing = useCallback(async () => {
        if (!currentUser || !userId) return;
        const { data } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .single();
        setIsFollowing(!!data);
    }, [currentUser, userId]);

    // Toggle Follow
    const handleToggleFollow = async () => {
        if (!currentUser) return; // Prompt login
        if (loadingFollow) return;
        setLoadingFollow(true);

        try {
            if (isFollowing) {
                await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentUser.id)
                    .eq('following_id', userId);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
            } else {
                await supabase
                    .from('follows')
                    .insert({ follower_id: currentUser.id, following_id: userId });
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        } catch (e) {
            console.warn('Toggle follow error:', e);
        } finally {
            setLoadingFollow(false);
        }
    };

    // UserProfile Object for Header
    const userProfileObj: UserProfile = useMemo(() => ({
        avatar: profile?.avatar_url || `https://i.pravatar.cc/100?u=${userId}`,
        headerImage: profile?.banner_url || 'https://picsum.photos/seed/header/800/300',
        name: profile?.display_name || profile?.username || 'User',
        handle: profile?.username ? `@${profile.username}` : '@user',
        bio: profile?.bio || '',
        followers: followerCount,
        following: followingCount,
        isOwn: currentUser?.id === userId,
    }), [profile, userId, followerCount, followingCount, currentUser]);

    // Fetch Posts
    const fetchPostsData = useCallback(async () => {
        if (!userId) return;
        setLoadingPosts(true);
        try {
            // posts.author_id matches the user
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: Post[] = (data || []).map((row: any) => ({
                id: row.id,
                avatar: userProfileObj.avatar,
                username: userProfileObj.name,
                handle: userProfileObj.handle,
                time: timeAgo(row.created_at),
                text: row.text || row.content || '',
                mediaUrl: row.media_url,
                mediaType: row.media_type,
                isThread: false,
                comments: 0,
                reposts: 0,
                likes: 0,
            }));
            setPosts(mapped);
        } catch (err) {
            console.warn('Fetch user posts error:', err);
        } finally {
            setLoadingPosts(false);
        }
    }, [userId, userProfileObj]);

    // Added Logic: Fetch Reposts (placeholder for now, can implement fetching from 'reposts' table)
    const fetchRepostsData = useCallback(async () => {
        // Logic to fetch reposts would go here.
        // For now we just clear the list or show same posts to demonstrate tab switching
        setPosts([]);
    }, []);

    useEffect(() => {
        if (activeTab === 0) fetchPostsData();
        else fetchRepostsData();
    }, [activeTab, fetchPostsData, fetchRepostsData]);

    const renderHeader = () => (
        <>
            <ProfileHeader user={userProfileObj} />

            {/* Action Bar (Follow / Edit) */}
            <View style={styles.actionBar}>
                {userProfileObj.isOwn ? (
                    <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                        <Text style={styles.btnText}>Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.followBtn, isFollowing && styles.followingBtn]}
                        onPress={handleToggleFollow}
                        disabled={loadingFollow}
                    >
                        {loadingFollow ? (
                            <ActivityIndicator size="small" color={isFollowing ? Colors.textPrimary : '#000'} />
                        ) : (
                            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <Text style={styles.statNumber}>
                    {followingCount} <Text style={styles.statLabel}>Following</Text>
                </Text>
                <Text style={styles.statNumber}>
                    {followerCount} <Text style={styles.statLabel}>Followers</Text>
                </Text>
            </View>

            <SegmentedTabs
                tabs={TABS}
                activeIndex={activeTab}
                onTabChange={setActiveTab}
            />
        </>
    );

    if (loadingProfile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.textPrimary} />
            </View>
        );
    }

    return (
        <View style={[styles.container]}>
            <View style={[styles.navBar, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{userProfileObj.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostItem post={item} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshing={loadingPosts}
                onRefresh={activeTab === 0 ? fetchPostsData : fetchRepostsData}
                ListEmptyComponent={
                    !loadingPosts ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts yet</Text>
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        alignItems: 'flex-start',
    },
    navTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    listContent: {
        paddingBottom: 80,
    },
    actionBar: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    editBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingVertical: 6,
        alignItems: 'center',
    },
    btnText: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
    },
    followBtn: {
        backgroundColor: Colors.textPrimary, // White
        borderRadius: Radius.full,
        paddingVertical: 8,
        alignItems: 'center',
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    followBtnText: {
        color: Colors.background, // Black
        fontWeight: FontWeight.bold,
    },
    followingBtnText: {
        color: Colors.textPrimary, // White
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    statNumber: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.bold,
        fontSize: FontSize.md,
    },
    statLabel: {
        color: Colors.textTertiary,
        fontWeight: FontWeight.regular,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textTertiary,
    },
});
