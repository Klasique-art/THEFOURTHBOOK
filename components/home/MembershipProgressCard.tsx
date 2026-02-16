import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';

interface MembershipProgressCardProps {
    currentMembers: number;
    targetMembers: number;
    isActive: boolean;
}

const MembershipProgressCard = ({
    currentMembers,
    targetMembers,
    isActive
}: MembershipProgressCardProps) => {
    const colors = useColors();
    const { t } = useTranslation();
    const progress = (currentMembers / targetMembers) * 100;
    const membersNeeded = targetMembers - currentMembers;

    return (
        <LinearGradient
            colors={[colors.primary, colors.primary100]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 mb-6"
            style={{ borderRadius: 16 }}
        >
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                        <Ionicons name="people" size={20} color="#FFFFFF" />
                    </View>
                    <AppText className="text-lg font-bold" color={colors.white}>
                        Our Community Growth
                    </AppText>
                </View>
                {isActive && (
                    <View className="bg-green-500 px-3 py-1 rounded-full">
                        <AppText className="text-xs font-bold" color={colors.white}>ACTIVE</AppText>
                    </View>
                )}
            </View>

            <View className="mb-4">
                <View className="flex-row items-end justify-between mb-2">
                    <AppText className=" text-4xl font-bold" color={colors.white}>
                        {currentMembers.toLocaleString()}
                    </AppText>
                    <AppText className="text-base mb-1" color={colors.white}>
                        / {targetMembers.toLocaleString()}
                    </AppText>
                </View>
                <AppText className="text-sm" color={colors.white}>
                    Members Strong & Growing
                </AppText>
            </View>

            <View className="mb-4">
                <View
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: colors.accent
                        }}
                    />
                </View>
                <AppText className=" text-xs mt-2" color={colors.white}>
                    {progress.toFixed(1)}% Complete
                </AppText>
            </View>

            {!isActive && (
                <View
                    className="rounded-xl p-3"
                    style={{ backgroundColor: 'rgba(248, 183, 53, 0.2)' }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={16} color={colors.warning} />
                        <AppText className=" text-xs ml-2 flex-1" color={colors.white}>
                            {t("We're almost there! Just {{membersNeeded}} more members until we accelerate threshold-based distributions together!", {
                                membersNeeded: membersNeeded.toLocaleString()
                            })}
                        </AppText>
                    </View>
                </View>
            )}

            {isActive && (
                <View
                    className="rounded-xl p-3"
                    style={{ backgroundColor: 'rgba(26, 118, 13, 0.3)' }}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <AppText className=" text-xs ml-2 flex-1">
                            {t('We did it! Our community unlocked faster threshold-triggered distributions!')}
                        </AppText>
                    </View>
                </View>
            )}
        </LinearGradient>
    );
};

export default MembershipProgressCard;
