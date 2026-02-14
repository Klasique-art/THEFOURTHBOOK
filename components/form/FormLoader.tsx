import { useColors } from '@/config/colors';
import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import AppText from '@/components/ui/AppText';
interface FormLoaderProps {
    visible: boolean;
    message?: string;
}

const FormLoader = ({ visible, message = 'Processing...' }: FormLoaderProps) => {
    const colors = useColors();

    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            statusBarTranslucent
        >
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            >
                <View
                    className="rounded-2xl p-8 mx-4 items-center"
                    style={{
                        backgroundColor: colors.background,
                        borderWidth: 2,
                        borderColor: colors.accent,
                        maxWidth: 320,
                        width: '100%',
                    }}
                >
                    {/* Loading Indicator */}
                    <ActivityIndicator
                        size="large"
                        color={colors.accent}
                        style={{ marginBottom: 16 }}
                    />

                    {/* Loading Text */}
                    <View className="items-center gap-2">
                        <AppText
                            className="text-xl font-nunbold text-center"
                            style={{ color: colors.textPrimary }}
                        >
                            {message}
                        </AppText>
                        <AppText
                            className="text-sm font-nunmedium text-center"
                            style={{ color: colors.textSecondary }}
                        >
                            Please wait a moment
                        </AppText>
                    </View>

                    {/* Animated Dots */}
                    <View className="flex-row items-center gap-2 mt-4">
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                        />
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                        />
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FormLoader;
