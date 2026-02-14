import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Screen } from '@/components';
import {
    CurrentCycleBanner,
    DrawsNavigationGrid,
    LatestDistributionCard
} from '@/components/draws';
import { mockDistributionCycles } from '@/data/dummy.draws';

export default function DrawsScreen() {
    const router = useRouter();

    // Get current/latest data
    const latestCycle = mockDistributionCycles[0];
    const nextDrawDate = '2026-02-28T18:00:00Z'; 

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
                        nextDrawDate={nextDrawDate}
                        totalPool={1000000}
                        beneficiariesCount={5}
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

// Remove old styles
const styles = {};

