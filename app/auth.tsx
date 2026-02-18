import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password: password.trim(),
                    options: {
                        data: {
                            username: username.trim() || email.split('@')[0],
                        },
                    },
                });
                if (signUpError) throw signUpError;
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password.trim(),
                });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Branding */}
                <View style={styles.brandingSection}>
                    <Text style={styles.logo}>False</Text>
                    <Text style={styles.tagline}>
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {isSignUp && (
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Choose a username"
                                placeholderTextColor={Colors.textTertiary}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    )}

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={Colors.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        activeOpacity={0.8}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.background} />
                        ) : (
                            <Text style={styles.primaryBtnText}>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Toggle */}
                <TouchableOpacity
                    style={styles.toggleRow}
                    activeOpacity={0.6}
                    onPress={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                >
                    <Text style={styles.toggleText}>
                        {isSignUp
                            ? 'Already have an account? '
                            : "Don't have an account? "}
                        <Text style={styles.toggleLink}>
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.xxxl,
    },
    brandingSection: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl + 16,
    },
    logo: {
        color: Colors.textPrimary,
        fontSize: 42,
        fontWeight: FontWeight.bold,
        letterSpacing: -1.5,
    },
    tagline: {
        color: Colors.textTertiary,
        fontSize: FontSize.lg,
        marginTop: Spacing.sm,
    },
    form: {
        gap: Spacing.lg,
    },
    inputWrapper: {
        gap: Spacing.xs,
    },
    inputLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        marginLeft: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md + 2,
        height: 50,
    },
    errorText: {
        color: Colors.danger,
        fontSize: FontSize.sm,
        textAlign: 'center',
    },
    primaryBtn: {
        backgroundColor: Colors.textPrimary,
        borderRadius: Radius.md,
        paddingVertical: Spacing.md + 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop: Spacing.sm,
    },
    primaryBtnDisabled: {
        opacity: 0.6,
    },
    primaryBtnText: {
        color: Colors.background,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    toggleRow: {
        alignItems: 'center',
        marginTop: Spacing.xxxl,
    },
    toggleText: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
    toggleLink: {
        color: Colors.textPrimary,
        fontWeight: FontWeight.semibold,
    },
});
