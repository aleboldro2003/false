import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Colors } from '@/constants/theme';
import MiniPlayer from '@/components/MiniPlayer';

export default function TabLayout() {
  return (
    <NativeTabs
      blurEffect="systemChromeMaterialDark"
      backgroundColor="rgba(0,0,0,0.74)"
      iconColor={{ default: '#8E8E93', selected: '#FFFFFF' }}
      labelStyle={{
        default: { color: '#8E8E93', fontSize: 10, fontWeight: '500' },
        selected: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
      }}
      shadowColor={Colors.border}
      minimizeBehavior="automatic"
      disableTransparentOnScrollEdge
    >
      <NativeTabs.BottomAccessory>
        <MiniPlayer />
      </NativeTabs.BottomAccessory>

      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="podcasts">
        <NativeTabs.Trigger.Label>Podcast</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'play.circle', selected: 'play.circle.fill' }} md="play_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <NativeTabs.Trigger.Label>Crea</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} md="add_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Cerca</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profilo</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
