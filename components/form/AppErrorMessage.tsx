import { useColors } from '@/config/colors';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import AppText from '@/components/ui/AppText';
type Props = {
    error?: string;
    visible?: boolean;
};

const AppErrorMessage = ({ error, visible }: Props) => {
    const colors = useColors();

    if (!error || !visible) return null;

    return (
        <View
            className="flex flex-row items-start gap-2 rounded-lg p-3"
            style={{
                backgroundColor: colors.backgroundAlt,
                borderWidth: 1,
                borderColor: colors.error
            }}
            accessibilityRole="alert"
        >
            <MaterialIcons
                name="error-outline"
                size={18}
                color={colors.error}
                style={{ marginTop: 2 }}
            />
            <AppText
                className="flex-1 text-sm font-nunmedium leading-tight"
                style={{ color: colors.error }}
            >
                {error}
            </AppText>
        </View>
    );
};

export default AppErrorMessage;
