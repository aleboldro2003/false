import MiniPlayer from '@/components/MiniPlayer';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
