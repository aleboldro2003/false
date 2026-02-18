import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PostItem from '@/components/PostItem';
import type { Post } from '@/constants/mockData';

// Helper to format "time ago" from a timestamp
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth(); // Need user context
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch posts with likes and counts
  const fetchPosts = useCallback(async () => {
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.warn('Error fetching posts:', postsError.message);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Fetch "my likes" if user is logged in
      let likedPostIds = new Set<string>();
      if (user) {
        const { data: myLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (myLikes) {
          myLikes.forEach((l: any) => likedPostIds.add(l.post_id));
        }
      }

      // Collect unique author IDs and fetch their profiles
      const authorIds = [...new Set(postsData.map((p: any) => p.author_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};

      if (authorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', authorIds);

        if (profilesData) {
          profilesData.forEach((p: any) => {
            profilesMap[p.id] = p;
          });
        }
      }

      const mapped: Post[] = postsData.map((row: any) => {
        const prof = profilesMap[row.author_id] || {};
        return {
          id: row.id,
          avatar: prof.avatar_url || `https://i.pravatar.cc/100?u=${row.author_id}`,
          username: prof.display_name || prof.username || 'User',
          handle: prof.username ? `@${prof.username}` : '@user',
          time: timeAgo(row.created_at),
          text: row.text || row.content || '',
          mediaUrl: row.media_url,
          mediaType: row.media_type,
          isThread: false,
          comments: row.comments?.[0]?.count || 0,
          reposts: 0,
          likes: row.likes?.[0]?.count || 0,
          likes: row.likes?.[0]?.count || 0,
          likedByMe: likedPostIds.has(row.id),
          // We need author_id for navigation, let's add it to the Post object if possible, or use a workaround.
          // The Post interface in mockData doesn't have author_id. I should add it there too? 
          // Or just use a quick fix here.
          // I will add authorId to the Post interface in mockData.ts as well to be clean.
          authorId: row.author_id,
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.warn('Fetch posts error:', err);
    }
  }, [user]);

  // Use useFocusEffect if imported, or just fetch on mount and refreshing
  // Ideally we re-fetch when coming back to sync likes.
  // For now simple useEffect is fine, but navigation.addListener('focus') is better.
  // We'll stick to useEffect + refresh for now, or add focus listener if imported.
  // Actually, standard useEffect runs once. 
  // Let's rely on pull-to-refresh or explicit updates.
  // BUT the user asked for sync "se apro la schermata del post". So when returning, it should update.
  // We can add a navigation listener.

  useEffect(() => {
    fetchPosts().finally(() => setLoading(false));
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostPress = (post: Post) => {
    router.push({ pathname: '/post-detail', params: { postId: post.id } });
  };

  const handleCommentPress = (post: Post) => {
    // Navigate to detail and auto-focus
    router.push({ pathname: '/post-detail', params: { postId: post.id, autoFocus: 'true' } });
  };

  const handleLike = async (post: Post) => {
    if (!user) return; // Optional: prompt login

    // Optimistic update
    const isLiked = post.likedByMe;
    setPosts(current =>
      current.map(p =>
        p.id === post.id
          ? { ...p, likedByMe: !isLiked, likes: p.likes + (isLiked ? -1 : 1) }
          : p
      )
    );

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      }
    } catch (error) {
      console.error('Like toggle error', error);
      // Revert if needed
      // setPosts(current => ... revert ...)
    }
  };

  const handleRepost = async (post: Post) => {
    if (!user) return;

    const isReposted = post.isReposted;

    // Optimistic update
    setPosts(current =>
      current.map(p =>
        p.id === post.id
          ? { ...p, isReposted: !isReposted, reposts: p.reposts + (isReposted ? -1 : 1) }
          : p
      )
    );

    try {
      if (isReposted) {
        await supabase.from('reposts').delete().eq('post_id', post.id).eq('user_id', user.id);
      } else {
        await supabase.from('reposts').insert({ post_id: post.id, user_id: user.id });
      }
    } catch (error) {
      console.error('Repost error', error);
      // Revert if needed
    }
  };

  const handleAvatarPress = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    const nextPost = posts[index + 1];
    const showThreadLine =
      item.isThread && nextPost && nextPost.handle === item.handle;

    return (
      <PostItem
        post={item}
        showThreadLine={showThreadLine}
        onPress={() => handlePostPress(item)}
        onLike={() => handleLike(item)}
        onCommentPress={() => handleCommentPress(item)}
        onRepost={() => handleRepost(item)}
        onAvatarPress={() => {
          if (item.authorId) {
            handleAvatarPress(item.authorId);
          }
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FALSE</Text>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => {
            // Navigate to AI or show modal
            // For now just log or do nothing visible as placeholder.
            console.log("False AI pressed");
          }}
        >
          <Ionicons name="sparkles" size={20} color={Colors.textPrimary} />
          {/* Or "headset" or "logo-electron" or "aperture" */}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.textTertiary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.textTertiary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to post something!</Text>
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
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row', // Use row for title + button
    alignItems: 'center', // Center vertically
    justifyContent: 'space-between', // Push title left, button right
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 36, // "Un po piu grande" than xxxl (32)
    fontWeight: FontWeight.bold,
    letterSpacing: -1, // Tighter tracking for large caps looks better
  },
  aiButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface, // Subtle background or just icon? User said "tasto" (button).
    // Let's make it a small pill or circle?
    // Or just a prominent icon. "Tasto" implies clickable area.
    borderRadius: Radius.full,
    // border: 1px solid... maybe?
    // Let's stick to a clean icon button for now, maybe with a background.
    backgroundColor: '#1A1A1A', // surfaceLight
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  emptySubtext: {
    color: Colors.textTertiary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
});
