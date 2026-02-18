import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, profile, refreshProfile } = useAuth();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [username, setUsername] = useState(profile?.username || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');

    // --- Helper: Convert Blob to ArrayBuffer (Fix for RN) ---
    const uriToArrayBuffer = async (uri: string): Promise<{ buffer: ArrayBuffer; fileExt: string }> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve({ buffer: reader.result, fileExt });
                } else {
                    reject(new Error('Failed to convert blob to array buffer'));
                }
            };
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(blob);
        });
    };

    // --- Avatar ---
    const pickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) uploadAvatar(result.assets[0].uri);
    };

    const uploadAvatar = async (uri: string) => {
        if (!user) return;
        setUploadingAvatar(true);
        try {
            const { buffer, fileExt } = await uriToArrayBuffer(uri);
            const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

            const { error } = await supabase.storage
                .from('avatars')
                .upload(filePath, buffer, { contentType: `image/${fileExt}`, upsert: false });

            if (error) throw error;
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            Alert.alert('Upload failed', error.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // --- Banner ---
    const pickBanner = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3, 1], // Wide aspect for banner
            quality: 0.8,
        });
        if (!result.canceled) uploadBanner(result.assets[0].uri);
    };

    const uploadBanner = async (uri: string) => {
        if (!user) return;
        setUploadingBanner(true);
        try {
            const { buffer, fileExt } = await uriToArrayBuffer(uri);
            const filePath = `${user.id}/banner_${Date.now()}.${fileExt}`;

            // Assume 'banners' bucket exists as per instruction, or fallback to 'avatars' folder
            // We used 'banners' bucket in migration.
            const { error } = await supabase.storage
                .from('banners')
                .upload(filePath, buffer, { contentType: `image/${fileExt}`, upsert: false });

            if (error) throw error;
            const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
            setBannerUrl(data.publicUrl);
        } catch (error: any) {
            Alert.alert('Upload failed', error.message);
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updates = {
                id: user.id,
                display_name: displayName,
                username,
                bio,
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
                updated_at: new Date(),
            };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            await refreshProfile();
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.textPrimary} />
                    ) : (
                        <Text style={styles.saveText}>Done</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* --- Banner Section --- */}
                <TouchableOpacity style={styles.bannerContainer} onPress={pickBanner} activeOpacity={0.8}>
                    {bannerUrl ? (
                        <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Ionicons name="image-outline" size={32} color={Colors.textTertiary} />
                            <Text style={styles.bannerText}>Add Banner</Text>
                        </View>
                    )}
                    {uploadingBanner && (
                        <View style={styles.overlay}>
                            <ActivityIndicator color="#FFF" />
                        </View>
                    )}
                </TouchableOpacity>

                {/* --- Avatar Section (Overlapping Banner) --- */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}` }}
                            style={styles.avatar}
                        />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                        {uploadingAvatar && (
                            <View style={[styles.overlay, { borderRadius: Radius.full }]}>
                                <ActivityIndicator color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Display Name"
                            placeholderTextColor={Colors.textTertiary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            placeholderTextColor={Colors.textTertiary}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Write a bio..."
                            placeholderTextColor={Colors.textTertiary}
                            multiline
                            maxLength={150}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    cancelText: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
    },
    saveText: {
        color: Colors.accent,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    content: {
    },
    bannerContainer: {
        width: '100%',
        height: 120,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerPlaceholder: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    bannerText: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: -40, // Pull up to overlap banner
        marginBottom: Spacing.xl,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: Radius.full,
        borderWidth: 4,
        borderColor: Colors.background,
        backgroundColor: Colors.surface,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.textPrimary, // contrasting badge
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.lg,
    },
    inputGroup: {
        gap: Spacing.xs,
    },
    label: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    input: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        paddingVertical: Spacing.xs,
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
});
