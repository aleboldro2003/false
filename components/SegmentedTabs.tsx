import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface SegmentedTabsProps {
    tabs: string[];
    activeIndex: number;
    onTabChange: (index: number) => void;
}

export default function SegmentedTabs({ tabs, activeIndex, onTabChange }: SegmentedTabsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.tabRow}>
                {tabs.map((tab, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, isActive && styles.tabActive]}
                            activeOpacity={0.7}
                            onPress={() => onTabChange(index)}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {/* Bottom border */}
            <View style={styles.bottomBorder} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
    },
    tabRow: {
        flexDirection: 'row',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#FFFFFF',
    },
    tabText: {
        color: '#888888',
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: FontWeight.semibold,
    },
    bottomBorder: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.border,
    },
});
