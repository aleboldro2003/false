import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FallbackTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Determine icon based on route name matching our standard Tabs layout
                let iconName: keyof typeof Ionicons.glyphMap = 'help';
                if (route.name === 'index') iconName = 'home';
                else if (route.name === 'podcasts') iconName = 'play-circle';
                else if (route.name === 'create') iconName = 'add-circle';
                else if (route.name === 'search') iconName = 'search';
                else if (route.name === 'profile') iconName = 'person';

                // Title defaults to route name, check options first
                const title = options.title !== undefined ? options.title : route.name;

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tab}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={iconName}
                            size={26}
                            color={isFocused ? '#FFFFFF' : '#666666'}
                        />
                        <Text style={[styles.label, { color: isFocused ? '#FFFFFF' : '#666666' }]}>
                            {title}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#000000', // Explicit black background
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
        paddingTop: 10,
        elevation: 0,
        shadowOpacity: 0,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 4,
    }
});
