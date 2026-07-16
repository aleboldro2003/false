import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function CreatePlaceholder() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/(tabs)');
        const timeout = setTimeout(() => {
            router.push('/create-post');
        }, 0);

        return () => clearTimeout(timeout);
    }, [router]);

    return <View style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
