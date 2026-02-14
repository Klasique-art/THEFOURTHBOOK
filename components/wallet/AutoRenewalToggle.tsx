import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';
interface AutoRenewalToggleProps {
    isEnabled: boolean;
    onToggle: (value: boolean) => void;
}

const AutoRenewalToggle = ({ isEnabled, onToggle }: AutoRenewalToggleProps) => {
    const colors = useColors();

    return (
        <View
            className="p-4 rounded-xl mb-6 border flex-row items-center justify-between"
            style={{
                backgroundColor: colors.backgroundAlt,
                borderColor: colors.border
            }}
        >
            <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                    <Ionicons name="refresh-circle" size={20} color={colors.accent} style={{ marginRight: 6 }} />
                    <AppText
                        className="font-bold text-base"
                        style={{ color: colors.textPrimary }}
                    >
                        Auto-Contribute
                    </AppText>
                </View>
                <AppText style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                    Automatically contribute $20 on the 1st of each month to never miss a cycle.
                </AppText>
            </View>
            <Switch
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={isEnabled ? '#FFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onToggle}
                value={isEnabled}
            />
        </View>
    );
};

export default AutoRenewalToggle;
