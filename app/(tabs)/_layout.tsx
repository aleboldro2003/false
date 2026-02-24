import MiniPlayer from '@/components/MiniPlayer';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { usePlayer } from '@/contexts/PlayerContext';
import { tabState } from './tabState';

import FallbackMiniPlayer from '@/components/FallbackMiniPlayer';
import { FallbackTabBar } from '@/components/FallbackTabBar';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const { currentTrack } = usePlayer();

  const updateTabState = (name: string) => {
    tabState.lastActive = name;
  };

  // User specifically requested fallback for iOS < 26, we'll check < 18 natively as NativeTabs requires iOS 18+,
  // but we can just add a feature flag or check if Platform.OS === 'android' as well.
  const isIOS18Plus = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;
  const insets = useSafeAreaInsets();

  if (!isIOS18Plus) {
    // Calculate the height of the tab bar: 10 vertical padding + 42 content + safe area bottom padding
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
    const tabBarHeight = 52 + bottomPadding;

    return (
      <View style={styles.wrapper}>
        {/* Absolute Fallback MiniPlayer above custom tab bar */}
        {currentTrack && (
          <FallbackMiniPlayer bottomOffset={tabBarHeight} />
        )}
        <Tabs
          tabBar={(props) => <FallbackTabBar {...props} />}
          screenOptions={{
            sceneStyle: { backgroundColor: Colors.background },
            headerShown: false,
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} listeners={{ focus: () => updateTabState('index') }} />
          <Tabs.Screen name="podcasts" options={{ title: 'Podcasts' }} listeners={{ focus: () => updateTabState('podcasts') }} />
          <Tabs.Screen name="create" options={{ title: 'Create' }} />
          <Tabs.Screen name="search" options={{ title: 'Search' }} listeners={{ focus: () => updateTabState('search') }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile' }} listeners={{ focus: () => updateTabState('profile') }} />
        </Tabs>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <NativeTabs
        minimizeBehavior={currentTrack ? 'onScrollDown' : 'never'}
        blurEffect="systemChromeMaterial"
        iconColor={{
          selected: '#FFFFFF',
          default: '#888888',
        }}
      >
        {currentTrack && (
          <NativeTabs.BottomAccessory>
            <MiniPlayer />
          </NativeTabs.BottomAccessory>
        )}

        <NativeTabs.Trigger
          name="index"
          listeners={{ focus: () => updateTabState('index') }}
        >
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="podcasts"
          listeners={{ focus: () => updateTabState('podcasts') }}
        >
          <NativeTabs.Trigger.Label>Podcasts</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="play.circle.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="create"
        >
          <NativeTabs.Trigger.Label>Create</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus.circle.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="search"
          role="search"
          listeners={{ focus: () => updateTabState('search') }}
        >
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="profile"
          listeners={{ focus: () => updateTabState('profile') }}
        >
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  floatingPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  }
});
