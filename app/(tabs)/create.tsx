import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

// This screen is never shown — the tab press is intercepted
// to open the CreatePost modal instead.
export default function CreatePlaceholder() {
    return <View style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
