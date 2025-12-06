
import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import FloatingTabBar from '@/components/FloatingTabBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
        },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: t('premium'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sponsored-ads"
        options={{
          title: t('sponsoredAds'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="megaphone.fill"
              android_material_icon_name="campaign"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
