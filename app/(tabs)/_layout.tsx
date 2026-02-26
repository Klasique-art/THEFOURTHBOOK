import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/components/layout/CustomTabBar';
import { useAuth } from '@/context/AuthContext';

export default function TabsLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

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
