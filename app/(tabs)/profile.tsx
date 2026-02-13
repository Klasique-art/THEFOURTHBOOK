import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config/colors';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
    const colors = useColors();
    const { theme, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
                Profile
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your account settings
            </Text>

            {/* Theme Toggle Button */}
            <TouchableOpacity
                style={[styles.themeButton, {
                    backgroundColor: colors.accent,
                    shadowColor: colors.primary,
                }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={theme === 'dark' ? 'sunny' : 'moon'}
                    size={24}
                    color={colors.white}
                />
                <Text style={[styles.buttonText, { color: colors.white }]}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Text>
            </TouchableOpacity>

            <Text style={[styles.info, { color: colors.textSecondary }]}>
                Current theme: {theme}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    themeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    info: {
        marginTop: 16,
        fontSize: 14,
    },
});
