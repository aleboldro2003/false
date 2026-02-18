import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';


export default function CreatePodcastScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [title, setTitle] = useState('');
    // Artist is now derived from authenticated user
    const [cover, setCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [uploading, setUploading] = useState(false);

    const canSubmit = title.trim() && cover && video && !uploading;

    const pickCover = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setCover(result.assets[0]);
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true, // Trimming might be available
            quality: 0.8,
        });
        if (!result.canceled) setVideo(result.assets[0]);
    };

    const uploadFile = async (uri: string, bucket: string, folder: string) => {
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'file';
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result instanceof ArrayBuffer) resolve(reader.result);
                    else reject(new Error('Failed to convert blob to array buffer'));
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            const { error } = await supabase.storage.from(bucket).upload(fileName, arrayBuffer, {
                contentType: bucket === 'podcast-videos' ? `video/${fileExt}` : `image/${fileExt}`,
                upsert: false,
            });

            if (error) throw error;

            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return data.publicUrl;
        } catch (err) {
            console.error('Upload failed:', err);
            throw err;
        }
    };

    const { user, profile } = useAuth(); // Use global auth context

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setUploading(true);

        try {
            if (!user) throw new Error('You must be logged in to post.');

            // Use profile from context (already fetched safely)
            const artistName = profile?.display_name || profile?.username || user.email?.split('@')[0] || 'Unknown Creator';
            console.log('Using artist name:', artistName);

            // 1. Upload Cover
            const coverUrl = await uploadFile(cover!.uri, 'podcast-covers', 'covers');

            // 2. Upload Video
            const videoUrl = await uploadFile(video!.uri, 'podcast-videos', 'videos');

            // 3. Insert into Table
            const { error } = await supabase.from('podcasts').insert({
                title: title.trim(),
                artist: artistName,
                cover_url: coverUrl,
                media_url: videoUrl,
                duration: video?.duration ? Math.round(video.duration / 1000) : 0,
                user_id: user.id, // Linked to authenticated user (Requires SQL update)
            });

            if (error) throw error;

            Alert.alert('Success', 'Podcast uploaded successfully!');
            router.back();
            router.replace('/(tabs)/podcasts');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to upload podcast.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Podcast</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                >
                    {uploading ? (
                        <ActivityIndicator color={Colors.accent} />
                    ) : (
                        <Text style={[styles.submitText, !canSubmit && styles.disabledText]}>Upload</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Text Inputs */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Podcast Title"
                        placeholderTextColor={Colors.textTertiary}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Artist Input Removed */}

                {/* Cover Selection */}
                <View style={styles.mediaSection}>
                    <Text style={styles.label}>Cover Image</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickCover}>
                        {cover ? (
                            <Image source={{ uri: cover.uri }} style={styles.coverPreview} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="image-outline" size={32} color={Colors.textTertiary} />
                                <Text style={styles.placeholderText}>Select Cover</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Video Selection */}
                <View style={styles.mediaSection}>
                    <Text style={styles.label}>Video File</Text>
                    <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
                        {video ? (
                            <View style={styles.videoPreviewContainer}>
                                <Ionicons name="videocam" size={32} color={Colors.accent} />
                                <Text style={styles.videoName} numberOfLines={1}>Video Selected</Text>
                                <Text style={styles.videoSize}>{(video.duration || 0) / 1000}s</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="videocam-outline" size={32} color={Colors.textTertiary} />
                                <Text style={styles.placeholderText}>Select Video</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    submitText: {
        color: Colors.accent,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    disabledText: {
        color: Colors.textTertiary,
    },
    content: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginBottom: Spacing.sm,
        fontWeight: FontWeight.semibold,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
    },
    mediaSection: {
        marginBottom: Spacing.xl,
    },
    imagePicker: {
        width: 150,
        height: 150,
        borderRadius: Radius.md,
        overflow: 'hidden',
        backgroundColor: Colors.surface,
    },
    coverPreview: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    placeholderText: {
        color: Colors.textTertiary,
        fontSize: FontSize.xs,
    },
    videoPicker: {
        width: '100%',
        height: 80,
        borderRadius: Radius.md,
        backgroundColor: Colors.surface,
        overflow: 'hidden',
    },
    videoPreviewContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    videoName: {
        color: Colors.textPrimary,
        flex: 1,
        fontSize: FontSize.md,
    },
    videoSize: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
    },
});
