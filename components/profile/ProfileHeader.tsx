import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';
interface ProfileHeaderProps {
    name: string;
    email: string;
    joinDate: string;
    isVerified?: boolean;
}

const ProfileHeader = ({ name, email, joinDate, isVerified }: ProfileHeaderProps) => {
    const colors = useColors();
    const { t } = useTranslation();

    return (
        <View className="items-center my-8">
            <View className="relative mx-auto p-3">
                {isVerified && (
                    <View
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2"
                        style={{ borderColor: colors.background }}
                        accessible={true}
                        accessibilityLabel={t('Verified account')}
                    >
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                )}
            </View>

            <AppText
                className="text-2xl font-bold mb-1"
                style={{ color: colors.textPrimary }}
            >
                {name}
            </AppText>
            <AppText
                className="text-base mb-2"
                style={{ color: colors.textSecondary }}
            >
                {email}
            </AppText>
            <View
                className="px-3 py-1 rounded-full border"
                style={{
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundAlt
                }}
            >
                <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Member since {new Date(joinDate).getFullYear()}
                </AppText>
            </View>
        </View>
    );
};

export default ProfileHeader;
