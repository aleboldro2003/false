import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, profile } = useAuth();
    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);
    const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const canPost = (text.trim().length > 0 || media) && !posting;

    // --- Media Handlers ---
    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) setMedia(result.assets[0]);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera permission is required.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) setMedia(result.assets[0]);
    };

    // --- Upload Logic ---
    const uploadMedia = async (uri: string, type: 'image' | 'video') => {
        if (!user) return null;
        const fileExt = uri.split('.').pop()?.toLowerCase() ?? (type === 'video' ? 'mp4' : 'jpg');
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            // RN FileReader Polyfill for ArrayBuffer
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result instanceof ArrayBuffer) resolve(reader.result);
                    else reject(new Error('Failed to convert blob to array buffer'));
                };
                reader.onerror = (e) => reject(e);
                reader.readAsArrayBuffer(blob);
            });

            const { error } = await supabase.storage
                .from('post-media')
                .upload(filePath, arrayBuffer, {
                    contentType: type === 'video' ? `video/${fileExt}` : `image/${fileExt}`,
                    upsert: false,
                });

            if (error) throw error;
            const { data } = supabase.storage.from('post-media').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const handlePost = async () => {
        if (!canPost || !user) return;
        setPosting(true);
        try {
            let mediaUrl = null;
            let mediaType = null;

            if (media) {
                mediaType = (media.type === 'video' ? 'video' : 'image') as 'video' | 'image';
                mediaUrl = await uploadMedia(media.uri, mediaType);
            }

            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                text: text.trim(),
                type: 'post',
                media_url: mediaUrl,
                media_type: mediaType,
            });

            if (error) throw error;
            // NAVIGATE TO HOME INSTEAD OF BACK
            router.navigate('index');
            setText('');
            setMedia(null);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create post.');
        } finally {
            setPosting(false);
        }
    };

    const avatarUrl = profile?.avatar_url || `https://i.pravatar.cc/100?u=${user?.id}`;
    const username = profile?.username || user?.email?.split('@')[0] || 'username';

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View style={{ width: 26 }} />
                <Text style={styles.headerTitle}>Nuovo false</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal-circle-outline" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.mainRow}>
                    {/* Left Column: Avatar + Thread Line */}
                    <View style={styles.leftCol}>
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        <View style={styles.threadLine} />
                        <Image source={{ uri: avatarUrl }} style={[styles.avatarSmall, { opacity: 0.5 }]} />
                    </View>

                    {/* Right Column: Input + Icons */}
                    <View style={styles.rightCol}>
                        <Text style={styles.username}>{username}</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Cosa c'è di nuovo?"
                            placeholderTextColor={Colors.textTertiary}
                            value={text}
                            onChangeText={setText}
                            multiline
                            // AutoFocus might be annoying if switching tabs frequently, but fine for now
                            autoFocus
                            textAlignVertical="top"
                        />

                        {media && (
                            <View style={styles.mediaPreview}>
                                <Image source={{ uri: media.uri }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeMediaBtn}
                                    onPress={() => setMedia(null)}
                                >
                                    <Ionicons name="close" size={12} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Attachment Icons Row */}
                        <View style={styles.iconsRow}>
                            <TouchableOpacity onPress={pickMedia} style={styles.iconBtn}>
                                <Ionicons name="images-outline" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={takePhoto} style={styles.iconBtn}>
                                <Ionicons name="camera-outline" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="mic-outline" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="list-outline" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TouchableOpacity style={styles.replyOptions}>
                    <Text style={styles.replyOptionsText}>Chiunque può rispondere</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
                    disabled={!canPost}
                    onPress={handlePost}
                >
                    {posting ? (
                        <ActivityIndicator size="small" color={Colors.background} /> // Use background color for contrast on primary btn
                    ) : (
                        <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>Pubblica</Text>
                    )}
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    cancelText: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    mainRow: {
        flexDirection: 'row',
    },
    leftCol: {
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
    },
    avatarSmall: {
        width: 20,
        height: 20,
        borderRadius: Radius.full,
        backgroundColor: Colors.surface,
    },
    threadLine: {
        flex: 1,
        width: 2,
        backgroundColor: Colors.border, // or nice gray
        marginVertical: Spacing.sm,
        minHeight: 40, // Minimum height if content is small
    },
    rightCol: {
        flex: 1,
        paddingBottom: Spacing.xl,
    },
    username: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.xs,
    },
    textInput: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        minHeight: 40,
        marginBottom: Spacing.md,
    },
    mediaPreview: {
        width: '100%', // or fit
        height: 200,
        borderRadius: Radius.md,
        marginBottom: Spacing.md,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: Radius.md,
        resizeMode: 'cover',
    },
    removeMediaBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: Radius.full,
        padding: 4,
    },
    iconsRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    iconBtn: {
        padding: 4,
    },
    addToThreadRow: {
        flexDirection: 'row',
        marginLeft: 40 + Spacing.md, // avatar width + margin
        alignItems: 'center',
        marginTop: -Spacing.lg, // pull up to align with small avatar
        marginBottom: 100, // scrolling space
    },
    addToThreadText: {
        color: Colors.textTertiary,
        fontSize: FontSize.md,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: Colors.background, // Opaque to cover content
    },
    replyOptions: {
        paddingVertical: Spacing.sm,
    },
    replyOptionsText: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
    postBtn: {
        backgroundColor: Colors.textPrimary, // White (in dark mode)
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
    },
    postBtnDisabled: {
        backgroundColor: Colors.surface, // Darker gray
        opacity: 0.5,
    },
    postBtnText: {
        color: Colors.background, // Black text on white btn
        fontWeight: FontWeight.bold,
    },
    postBtnTextDisabled: {
        color: Colors.textTertiary,
    },
});
