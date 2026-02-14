import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { useColors } from '@/config/colors';

import AppText from './AppText';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface AppToastProps {
    visible: boolean;
    message: string;
    variant?: ToastVariant;
    duration?: number;
    onHide: () => void;
}

const AppToast = ({
    visible,
    message,
    variant = 'info',
    duration = 2800,
    onHide,
}: AppToastProps) => {
    const colors = useColors();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    const variantStyles = {
        success: { color: colors.success, icon: 'checkmark-circle' as const },
        error: { color: colors.error, icon: 'close-circle' as const },
        warning: { color: colors.warning, icon: 'warning' as const },
        info: { color: colors.info, icon: 'information-circle' as const },
    };

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -16,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) onHide();
        });
    }, [onHide, opacity, translateY]);

    useEffect(() => {
        if (!visible) return;

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 5,
            }),
        ]).start();

        const timer = setTimeout(() => {
            hideToast();
        }, duration);

        return () => clearTimeout(timer);
    }, [visible, duration, hideToast, opacity, translateY]);

    if (!visible) return null;

    const active = variantStyles[variant];

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
            }}
            className="mx-4 rounded-xl border px-4 py-3"
        >
            <View
                className="flex-row items-center rounded-xl border px-3 py-3"
                style={{
                    backgroundColor: colors.background,
                    borderColor: active.color,
                }}
            >
                <Ionicons name={active.icon} size={20} color={active.color} />
                <AppText
                    className="ml-2 flex-1 text-sm font-nunmedium"
                    style={{ color: colors.textPrimary }}
                >
                    {message}
                </AppText>
                <Pressable
                    onPress={hideToast}
                    accessibilityLabel="Dismiss toast"
                    accessibilityRole="button"
                    className="ml-2 p-1"
                >
                    <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>
        </Animated.View>
    );
};

export default AppToast;
