import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import type { Post } from '@/constants/mockData';

interface PostItemProps {
    post: Post;
    showThreadLine?: boolean;
    onPress?: () => void;
    isComment?: boolean;
    onLike?: () => void;
    onCommentPress?: () => void;
    onRepost?: () => void;
    onAvatarPress?: () => void;
}

function PostVideo({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, player => {
        player.loop = true;
    });

    return (
        <VideoView
            style={styles.media}
            player={player}
            contentFit="cover" // User wants "original size" + no borders -> Cover usually works better if aspect ratio is close.
            nativeControls
        />
    );
}

export default function PostItem({ post, showThreadLine = false, onPress, isComment = false, onLike, onCommentPress, onRepost, onAvatarPress }: PostItemProps) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { activeOpacity: 0.7, onPress } : {};
    const [aspectRatio, setAspectRatio] = React.useState(16 / 9);

    React.useEffect(() => {
        if (post.mediaUrl && post.mediaType !== 'video') {
            Image.getSize(post.mediaUrl, (width, height) => {
                if (width && height) {
                    const ratio = width / height;
                    setAspectRatio(ratio);
                }
            }, (err) => {
                console.log('Image size error, defaulting to square:', err.message);
                setAspectRatio(1);
            });
        } else if (post.mediaType === 'video') {
            // Default to 16:9 for generic video player look if we can't detect.
            // But user wants "original size".
            // Since we can't easily detect, we use a flexible default.
            // 4:5 is a good compromise for vertical/square.
            // If we use 1 with "cover", it crops 16:9 sides.
            // If we use 1 with "contain" and no bg, it shows whitespace.
            // Let's assume most user videos are vertical (Reels/TikTok style) or square?
            // "False" app seems social -> Vertical.
            // Let's try 0.8 (4:5) which fits both okay.
            // OR even better: 9/16 (0.56) if we assume vertical-first.
            // But if horizontal?
            // Let's stick to 1 (Square) for safety, or 16/9 if it looks like a "broadcast".
            // User complained about "bordi neri" (black borders).
            // "contain" + aspect ratio mismatch = borders (transparent now).
            // "cover" + aspect ratio mismatch = cropped.
            // The only way is to know the ratio.
            // I'll try to use a default of 16/9?
            // Wait, the user said "vide/foto... lasciali con la size originale".
            // I will default videos to 9/16 (vertical phone) because usually that's the problem.
            setAspectRatio(9 / 16);
        }
    }, [post.mediaUrl, post.mediaType]);

    return (
        <Container style={[styles.container, isComment && styles.commentContainer]} {...containerProps}>
            {/* Left column — avatar + thread line */}
            <View style={styles.leftColumn}>
                <TouchableOpacity activeOpacity={0.8} onPress={onAvatarPress}>
                    <Image
                        source={{ uri: post.avatar }}
                        style={[styles.avatar, isComment && styles.commentAvatar]}
                    />
                </TouchableOpacity>
                {showThreadLine && <View style={styles.threadLine} />}
            </View>

            {/* Right column — content */}
            <View style={styles.rightColumn}>
                {/* Header row */}
                <View style={styles.headerRow}>
                    <Text style={styles.username} numberOfLines={1}>{post.username}</Text>
                    <Text style={styles.handle} numberOfLines={1}>{post.handle}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.time}>{post.time}</Text>
                </View>

                {/* Body */}
                <Text style={styles.body}>{post.text}</Text>

                {/* Media Attachment */}
                {post.mediaUrl && (
                    <View style={[styles.mediaContainer, { aspectRatio }]}>
                        {post.mediaType === 'video' ? (
                            <PostVideo uri={post.mediaUrl} />
                        ) : (
                            <Image
                                source={{ uri: post.mediaUrl }}
                                style={styles.media}
                                resizeMode="cover" // "cover" + correct aspectRatio = "original size"
                            />
                        )}
                    </View>
                )}

                {/* Action bar */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        onPress={onCommentPress}
                    >
                        <Ionicons name="chatbubble-outline" size={isComment ? 16 : 18} color={Colors.textTertiary} />
                        {post.comments > 0 && (
                            <Text style={styles.actionCount}>{post.comments}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        onPress={onRepost}
                    >
                        <Ionicons
                            name="repeat-outline"
                            size={isComment ? 18 : 20}
                            color={post.isReposted ? Colors.success : Colors.textTertiary}
                        />
                        {post.reposts > 0 && (
                            <Text style={[styles.actionCount, post.isReposted && { color: Colors.success }]}>
                                {post.reposts}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.6}
                        onPress={onLike}
                    >
                        <Ionicons
                            name={post.likedByMe ? "heart" : "heart-outline"}
                            size={isComment ? 16 : 18}
                            color={post.likedByMe ? Colors.danger : Colors.textTertiary}
                        />
                        {post.likes > 0 && (
                            <Text style={styles.actionCount}>{post.likes}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                        <Ionicons name="share-outline" size={isComment ? 16 : 18} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    commentContainer: {
        paddingLeft: Spacing.lg + 8,
    },
    leftColumn: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 44,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
    },
    commentAvatar: {
        width: 36,
        height: 36,
    },
    threadLine: {
        flex: 1,
        width: 2,
        backgroundColor: Colors.threadLine,
        marginTop: Spacing.sm,
        borderRadius: 1,
    },
    rightColumn: {
        flex: 1,
        paddingBottom: Spacing.xs,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    username: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        flexShrink: 1,
    },
    handle: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
        marginLeft: Spacing.xs,
        flexShrink: 1,
    },
    dot: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
        marginHorizontal: Spacing.xs,
    },
    time: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
    body: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    mediaContainer: {
        width: '100%',
        // aspectRatio: 16 / 9, // REMOVED fixed ratio
        borderRadius: Radius.sm, // "leggera" -> 8 is good, or 12. Using Radius.sm (8) for slight curve? Or Radius.md (12)? Radius.md is standard. Radius.sm is "leggera".
        overflow: 'hidden',
        marginBottom: Spacing.md,
        // backgroundColor: '#000', // REMOVED black background
    },
    media: {
        width: '100%',
        height: '100%',
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xxl,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionCount: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
});
