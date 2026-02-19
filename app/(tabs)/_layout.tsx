import MiniPlayer from '@/components/MiniPlayer';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { usePlayer } from '@/contexts/PlayerContext';
import { tabState } from './tabState';

export default function TabLayout() {
  const router = useRouter();
  const { currentTrack } = usePlayer();

  const updateTabState = (name: string) => {
    tabState.lastActive = name;
  };

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

      {/* 
        Transparent overlay to intercept "Create" tab presses.
        This prevents the native navigation to the "create" tab and opens the modal directly.
        Positioned at the center (1/5th of width) over the tab bar.
      */}
      <TouchableOpacity
        style={styles.createOverlay}
        onPress={() => router.push('/create-post')}
        activeOpacity={1}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  createOverlay: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '20%', // Assuming 5 tabs, 100/5 = 20%
    height: 85,   // Covers standard tab bar height
    zIndex: 10000,
    // backgroundColor: 'rgba(255, 0, 0, 0.2)', // Uncomment for debugging position
  },
});
