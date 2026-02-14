import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';
interface DrawEntryStatusProps {
    isEntered: boolean;
    nextDrawDate: string;
}

const DrawEntryStatus = ({ isEntered, nextDrawDate }: DrawEntryStatusProps) => {
    const colors = useColors();
    const date = new Date(nextDrawDate);

    return (
        <View
            className="mb-6 rounded-xl border border-dashed p-4"
            style={{
                borderColor: isEntered ? colors.success : colors.border,
                backgroundColor: isEntered ? 'rgba(26, 118, 13, 0.05)' : 'transparent'
            }}
        >
            <View className="flex-row items-start">
                <Ionicons
                    name={isEntered ? "trophy" : "alert-circle-outline"}
                    size={24}
                    color={isEntered ? colors.success : colors.textSecondary}
                    style={{ marginTop: 2 }}
                />
                <View className="ml-3 flex-1">
                    <AppText
                        className="text-base font-bold mb-1"
                        style={{ color: colors.textPrimary }}
                    >
                        {isEntered ? "You're entered in the next draw!" : "Contribute to enter next draw"}
                    </AppText>
                    <AppText
                        className="text-sm mb-2"
                        style={{ color: colors.textSecondary }}
                    >
                        {isEntered
                            ? `Draw happens on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                            : "Don't miss your chance to be one of our 5 monthly winners sharing $1,000,000!"}
                    </AppText>

                    {isEntered && (
                        <View className="flex-row items-center mt-1">
                            <AppText
                                className="text-xs font-bold px-2 py-1 rounded overflow-hidden"
                                style={{
                                    backgroundColor: colors.accent,
                                    color: colors.white
                                }}
                            >
                                $1,000,000 Pool
                            </AppText>
                            <AppText
                                className="text-xs ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                5 Winners • $200k Each
                            </AppText>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default DrawEntryStatus;
