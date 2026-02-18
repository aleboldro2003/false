import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

const RECENT_SEARCHES = [
    'dark mode design', 'minimalist UI', 'podcast apps',
    'React Native 2026', 'typography system', 'design tokens',
];

const TRENDING = [
    { tag: '#MinimalistDesign', posts: '12.4K posts' },
    { tag: '#DarkModeUI', posts: '8.9K posts' },
    { tag: '#ReactNative', posts: '45.2K posts' },
    { tag: '#DesignSystem', posts: '6.1K posts' },
    { tag: '#ProductDesign', posts: '23.7K posts' },
    { tag: '#UIEngineering', posts: '3.8K posts' },
];

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Search bar */}
            <View style={styles.searchBarRow}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={Colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search False"
                        placeholderTextColor={Colors.textTertiary}
                        value={query}
                        onChangeText={setQuery}
                        selectionColor={Colors.accent}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.6}>
                            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={TRENDING}
                keyExtractor={(item) => item.tag}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trending</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.trendingItem} activeOpacity={0.6}>
                        <View>
                            <Text style={styles.trendingTag}>{item.tag}</Text>
                            <Text style={styles.trendingCount}>{item.posts}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchBarRow: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        paddingVertical: 4,
    },
    sectionHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    listContent: {
        paddingBottom: 160,
    },
    trendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    trendingTag: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        marginBottom: 2,
    },
    trendingCount: {
        color: Colors.textTertiary,
        fontSize: FontSize.sm,
    },
});
