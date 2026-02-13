import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/config/colors';

export default function WalletScreen() {
    const colors = useColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
                Wallet
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Manage your finances
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
    },
});
