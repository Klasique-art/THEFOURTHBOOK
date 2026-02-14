import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppBottomSheet, type AppBottomSheetRef, AppModal, ConfirmAction, Screen } from '@/components';
import { ProfileHeader, SettingsList } from '@/components/profile';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { mockCurrentUser } from '@/data/userData.dummy';

export default function ProfileScreen() {
    const colors = useColors();
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const logoutSheetRef = useRef<AppBottomSheetRef>(null);

    const languageOptions = useMemo(() => ['English', 'French', 'Spanish'], []);

    const accountSettings = [
        { id: 'account', label: 'Account Details', icon: 'person-outline', route: '/settings/account' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
    ];

    const appSettings = [
        { id: 'appearance', label: 'Appearance', icon: 'color-palette-outline', route: '/settings/appearance' },
        { id: 'security', label: 'Security', icon: 'lock-closed-outline', route: '/settings/security' },
        {
            id: 'language',
            label: 'Language',
            icon: 'globe-outline',
            value: selectedLanguage,
            action: () => setIsLanguageModalVisible(true)
        },
    ];

    const supportSettings = [
        { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', route: '/settings/support' },
        { id: 'about', label: 'About App', icon: 'information-circle-outline', route: '/settings/about' },
    ];

    const handleLogout = () => {
        logoutSheetRef.current?.open();
    };

    const handleLogoutCancel = () => {
        logoutSheetRef.current?.close();
    };

    const handleLogoutConfirm = () => {
        console.log('Logging out...');
        logoutSheetRef.current?.close();
    };

    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="pt-2">
                    <ProfileHeader
                        name={`${mockCurrentUser.first_name} ${mockCurrentUser.last_name}`}
                        email={mockCurrentUser.email}
                        joinDate={mockCurrentUser.created_at}
                        isVerified={mockCurrentUser.kyc_status === 'verified'}
                    />

                    <SettingsList title="Account" items={accountSettings as any} />
                    <SettingsList title="App Settings" items={appSettings as any} />
                    <SettingsList title="Support" items={supportSettings as any} />

                    <SettingsList
                        items={[
                            {
                                id: 'logout',
                                label: 'Log Out',
                                icon: 'log-out-outline',
                                action: handleLogout,
                                isDestructive: true
                            }
                        ] as any}
                    />
                </View>
            </ScrollView>

            <AppModal
                visible={isLanguageModalVisible}
                onClose={() => setIsLanguageModalVisible(false)}
                title="Select Language"
            >
                <View
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    {languageOptions.map((option, index) => {
                        const isSelected = option === selectedLanguage;
                        return (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    setSelectedLanguage(option);
                                    setIsLanguageModalVisible(false);
                                }}
                                className={`px-4 py-4 flex-row items-center justify-between ${index !== languageOptions.length - 1 ? 'border-b' : ''}`}
                                style={{ borderColor: colors.border }}
                                accessibilityRole="button"
                                accessibilityLabel={`Use ${option}`}
                            >
                                <AppText
                                    className="text-base font-medium"
                                    style={{ color: isSelected ? colors.accent : colors.textPrimary }}
                                >
                                    {option}
                                </AppText>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </AppModal>

            <AppBottomSheet
                ref={logoutSheetRef}
                snapPoints={['42%']}
                onClose={handleLogoutCancel}
            >
                <ConfirmAction
                    title="Log Out"
                    desc="Are you sure you want to log out of your account?"
                    confirmBtnTitle="Log Out"
                    isDestructive
                    onConfirm={handleLogoutConfirm}
                    onCancel={handleLogoutCancel}
                />
            </AppBottomSheet>
        </Screen>
    );
}



