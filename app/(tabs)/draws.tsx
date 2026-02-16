import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Screen } from '@/components';
import {
    CurrentCycleBanner,
    DrawsNavigationGrid,
    LatestDistributionCard
} from '@/components/draws';
import { mockDashboardStats, mockDistributionCycles } from '@/data/dummy.draws';
import { APP_CONFIG } from '@/data/static.home';

export default function DrawsScreen() {
    const router = useRouter();

    // Get current/latest data
    const latestCycle = mockDistributionCycles[0];

    const handleViewHistory = () => {
        router.push('/draws/history' as any);
    };

    return (
        <Screen>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="pt-2">

                    <CurrentCycleBanner
                        currentPool={mockDashboardStats.total_pool}
                        threshold={APP_CONFIG.DISTRIBUTION_THRESHOLD}
                        beneficiariesCount={APP_CONFIG.WINNERS_PER_DRAW}
                        onPlayGame={() => router.push('/draws/threshold-game' as any)}
                    />

                    <LatestDistributionCard
                        cycle={latestCycle}
                        onPress={handleViewHistory}
                    />

                    <DrawsNavigationGrid />
                </View>
            </ScrollView>
        </Screen>
    );
}

