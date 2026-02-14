import React from 'react';
import { View } from 'react-native';

import { Screen, Nav } from '@/components';
import { SettingsList } from '@/components/profile';
import { useToast } from '@/context/ToastContext';

export default function SecurityScreen() {
    const { showToast } = useToast();

    const securityOptions = [
        { id: 'password', label: 'Change Password', icon: 'key-outline', route: '/settings/security/change-password' },
        {
            id: 'toast-success',
            label: 'Test Success Toast',
            icon: 'checkmark-circle-outline',
            action: () => showToast('Success toast is working', { variant: 'success' }),
        },
        {
            id: 'toast-error',
            label: 'Test Error Toast',
            icon: 'alert-circle-outline',
            action: () => showToast('Error toast is working', { variant: 'error' }),
        },
        {
            id: 'toast-info',
            label: 'Test Info Toast',
            icon: 'information-circle-outline',
            action: () => showToast('Info toast is working', { variant: 'info' }),
        },
    ];

    return (
        <Screen>
            <Nav title="Security" />
            <View className="pt-4">
                <SettingsList items={securityOptions as any} />
            </View>
        </Screen>
    );
}
