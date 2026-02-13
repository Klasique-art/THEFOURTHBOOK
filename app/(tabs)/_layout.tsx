import { Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/components/layout/CustomTabBar';

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="dashboard" />
            <Tabs.Screen name="draws" />
            <Tabs.Screen name="wallet" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
