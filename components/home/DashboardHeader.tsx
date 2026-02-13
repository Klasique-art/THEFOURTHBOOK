import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { useColors } from '@/config';

interface DashboardHeaderProps {
    userName: string;
    greeting?: string;
}

const DashboardHeader = ({ userName, greeting }: DashboardHeaderProps) => {
    const colors = useColors();
    const currentHour = new Date().getHours();

    const autoGreeting = greeting || (
        currentHour < 12 ? 'Good Morning' :
            currentHour < 18 ? 'Good Afternoon' :
                'Good Evening'
    );

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                    <Text
                        className="text-base mb-1"
                        style={{ color: colors.textSecondary }}
                    >
                        {autoGreeting}
                    </Text>
                    <Text
                        className="text-3xl font-bold"
                        style={{ color: colors.textPrimary }}
                    >
                        {userName}
                    </Text>
                </View>
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.accent50 }}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.white} />
                </View>
            </View>
            <Text
                className="text-sm italic mt-1"
                style={{ color: colors.textSecondary }}
            >
                "There Is Power, Real Power In Numbers!"
            </Text>
        </View>
    );
};

export default DashboardHeader;
