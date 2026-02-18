import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import type { Post } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Comment interface
interface Comment {
    id: string;
    avatar: string;
    username: string;
    handle: string;
    time: string;
    text: string;
}

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

function PostVideo({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, player => {
        player.loop = true;
    });

    return (
        <VideoView
            style={styles.media}
            player={player}
            contentFit="cover"
            nativeControls
        />
    );
}

export default function PostDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { postId, autoFocus } = useLocalSearchParams<{ postId: string; autoFocus?: string }>();
    const { user } = useAuth();

    // ... input ref ...
    const inputRef = React.useRef<TextInput>(null);

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Auto-focus input if requested
    useEffect(() => {
        if (autoFocus === 'true' && !loading && inputRef.current) {
            // Small delay to ensure layout
            setTimeout(() => {
                inputRef.current?.focus();
            }, 500);
        }
    }, [autoFocus, loading]);

    const fetchPostDetails = useCallback(async () => {
        if (!postId) return;
        try {
            // 1. Fetch Post
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:author_id (id, username, display_name, avatar_url)
                `)
                .eq('id', postId)
                .single();

            if (postError) throw postError;

            // 2. Fetch Like status (if user is logged in)
            let likedByMe = false;
            if (user) {
                const { count } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
                likedByMe = (count || 0) > 0;
            }

            // 3. Count likes/comments/reposts
            const { count: likesCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
            const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);

            const p = postData;
            const profile = p.profiles || {};

            setPost({
                id: p.id,
                avatar: profile.avatar_url || `https://i.pravatar.cc/100?u=${p.author_id}`,
                username: profile.display_name || profile.username || 'User',
                handle: profile.username ? `@${profile.username}` : '@user',
                time: timeAgo(p.created_at),
                text: p.text || '',
                mediaUrl: p.media_url,
                mediaType: p.media_type,
                isThread: false,
                comments: commentsCount || 0,
                reposts: 0,
                likes: likesCount || 0,
                likedByMe: likedByMe,
            });

            // 4. Fetch Comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select(`
                    *,
                    profiles:author_id (id, username, display_name, avatar_url)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;

            const mappedComments: Comment[] = (commentsData || []).map((c: any) => {
                const cProfile = c.profiles || {};
                return {
                    id: c.id,
                    avatar: cProfile.avatar_url || `https://i.pravatar.cc/100?u=${c.author_id}`,
                    username: cProfile.display_name || cProfile.username || 'User',
                    handle: cProfile.username ? `@${cProfile.username}` : '@user',
                    time: timeAgo(c.created_at),
                    text: c.text || c.content || '', // Support both text and content columns
                };
            });

            setComments(mappedComments);

        } catch (error) {
            console.error('Error fetching details:', error);
            Alert.alert('Error', 'Could not load post details.');
        } finally {
            setLoading(false);
        }
    }, [postId, user]);

    useEffect(() => {
        fetchPostDetails();
    }, [fetchPostDetails]);

    const handleSendComment = async () => {
        if (!commentText.trim() || !user || !postId) return;
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    post_id: postId,
                    author_id: user.id,
                    text: commentText.trim(), // Inserting into 'text' column as expected by DB
                });

            if (error) throw error;

            setCommentText('');
            // Refresh
            fetchPostDetails();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleLike = async () => {
        if (!user || !post) return;
        try {
            // Optimistic update
            const isLiked = post.likedByMe;
            setPost(prev => prev ? ({
                ...prev,
                likedByMe: !isLiked,
                likes: isLiked ? prev.likes - 1 : prev.likes + 1
            }) : null);

            if (isLiked) {
                // Unlike
                await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
            } else {
                // Like
                await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
            }
        } catch (error) {
            // Revert on error
            console.error('Like error:', error);
        }
    };

    const renderCommentItem = ({ item }: { item: Comment }) => (
        <View style={styles.commentRow}>
            <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentHandle}>{item.handle}</Text>
                    <Text style={styles.commentDot}>·</Text>
                    <Text style={styles.commentTime}>{item.time}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
                {/* Mini action bar */}
                <View style={styles.commentActions}>
                    <TouchableOpacity activeOpacity={0.6}>
                        <Ionicons name="chatbubble-outline" size={15} color={Colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6}>
                        <Ionicons name="heart-outline" size={15} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.textTertiary} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <Text style={{ color: Colors.textSecondary }}>Post not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.accent }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Header component containing the Main Post
    const ListHeader = () => (
        <View>
            <View style={styles.originalPost}>
                <View style={styles.postHeader}>
                    <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
                    <View style={styles.postHeaderText}>
                        <Text style={styles.postUsername}>{post.username}</Text>
                        <Text style={styles.postHandle}>{post.handle}</Text>
                    </View>
                </View>
                <Text style={styles.postBody}>{post.text}</Text>

                {post.mediaUrl && (
                    <View style={styles.mediaContainer}>
                        {post.mediaType === 'video' ? (
                            <PostVideo uri={post.mediaUrl} />
                        ) : (
                            <Image
                                source={{ uri: post.mediaUrl }}
                                style={styles.media}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                )}

                <Text style={styles.postTimestamp}>{post.time} ago</Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>
                        <Text style={styles.statBold}>{post.comments}</Text> Comments
                    </Text>
                    <Text style={styles.statText}>
                        <Text style={styles.statBold}>{post.likes}</Text> Likes
                    </Text>
                </View>

                {/* Action bar */}
                <View style={styles.actionBar}>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                        <Ionicons name="chatbubble-outline" size={24} color={Colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                        <Ionicons name="repeat-outline" size={24} color={Colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        onPress={toggleLike}
                    >
                        <Ionicons
                            name={post.likedByMe ? "heart" : "heart-outline"}
                            size={24}
                            color={post.likedByMe ? Colors.danger : Colors.textTertiary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                        <Ionicons name="share-outline" size={24} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Replies</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Top bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Post</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                ListHeaderComponent={ListHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />

            {/* Comment Input */}
            <View style={styles.inputArea}>
                <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    placeholder="Post your reply"
                    placeholderTextColor={Colors.textTertiary}
                    value={commentText}
                    onChangeText={setCommentText}
                />
                <TouchableOpacity
                    onPress={handleSendComment}
                    disabled={!commentText.trim() || submitting}
                    style={{ opacity: !commentText.trim() ? 0.5 : 1 }}
                >
                    <Text style={styles.replyBtn}>Reply</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    topBarTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
    },
    listContent: {
        paddingBottom: 20,
    },
    originalPost: {
        padding: Spacing.lg,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    postAvatar: {
        width: 48,
        height: 48,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
    },
    postHeaderText: {},
    postUsername: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    postHandle: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
        marginTop: 1,
    },
    postBody: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        lineHeight: 26,
        marginBottom: Spacing.lg,
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: Radius.md,
        overflow: 'hidden',
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
    },
    media: {
        width: '100%',
        height: '100%',
    },
    postTimestamp: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
        marginBottom: Spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.xl,
        paddingVertical: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
    },
    statText: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
    statBold: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
    },
    actionBtn: {
        padding: Spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
    },
    commentsHeader: {
        padding: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    commentsTitle: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    commentRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        gap: Spacing.md,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        gap: Spacing.xs,
    },
    commentUsername: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    commentHandle: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
    commentDot: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
    commentTime: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
    commentText: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        lineHeight: 20,
        marginBottom: Spacing.sm,
    },
    commentActions: {
        flexDirection: 'row',
        gap: Spacing.xxl,
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        color: Colors.textPrimary,
        marginRight: Spacing.md,
        minHeight: 40,
    },
    replyBtn: {
        color: Colors.accent,
        fontWeight: FontWeight.bold,
    },
});
