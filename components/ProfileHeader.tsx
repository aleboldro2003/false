import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import type { UserProfile } from '@/constants/mockData';

interface ProfileHeaderProps {
    user: UserProfile;
    onEditPress?: () => void;
    onFollowToggle?: () => void;
    isFollowing?: boolean;
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

export default function ProfileHeader({ user, onEditPress, onFollowToggle, isFollowing }: ProfileHeaderProps) {
    return (
        <View style={styles.wrapper}>
            {/* Header image */}
            <View style={styles.headerImageWrapper}>
                <Image source={{ uri: user.headerImage }} style={styles.headerImage} resizeMode="cover" />
                <View style={styles.headerOverlay} />
            </View>

            {/* Avatar overlapping the header */}
            <View style={styles.avatarRow}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                {user.isOwn ? (
                    <TouchableOpacity
                        style={styles.editBtn}
                        activeOpacity={0.7}
                        onPress={onEditPress}
                    >
                        <Text style={styles.editBtnText}>Edit profile</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.followBtn, isFollowing && styles.followingBtn]}
                        activeOpacity={0.7}
                        onPress={onFollowToggle}
                    >
                        <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bio section */}
            <View style={styles.bioSection}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.handle}>{user.handle}</Text>
                <Text style={styles.bio}>{user.bio}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: Colors.background,
    },
    headerImageWrapper: {
        height: 150,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: -40,
        paddingHorizontal: Spacing.lg,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: Radius.full,
        borderWidth: 3,
        borderColor: Colors.background,
        backgroundColor: Colors.surface,
    },
    editBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    editBtnText: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    followBtn: {
        backgroundColor: Colors.textPrimary,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    followBtnText: {
        color: Colors.background,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    followingBtnText: {
        color: Colors.textPrimary,
    },
    bioSection: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    handle: {
        color: Colors.textTertiary,
        fontSize: FontSize.md,
        marginTop: 2,
    },
    bio: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        lineHeight: 22,
        marginTop: Spacing.md,
    },
});
