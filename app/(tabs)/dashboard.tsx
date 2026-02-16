import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { Screen } from '@/components';
import {
    ContributionHistoryTimeline,
    ContributionStatusCard,
    DashboardQuickActions,
    DrawEntryStatus,
    ParticipationStatsGrid
} from '@/components/dashboard';
import { DashboardHeader } from '@/components/home';
import { useColors } from '@/config';
import { mockDashboardStats } from '@/data/dummy.draws';
import { mockContributions } from '@/data/contributions.dummy';
import { mockParticipationStats } from '@/data/participationStats.dummy';
import { APP_CONFIG } from '@/data/static.home';
import { mockCurrentUser } from '@/data/userData.dummy';

export default function DashboardScreen() {
    const colors = useColors();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRefreshing(false);
    }, []);

    // Calculate greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <Screen>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                <View className=" pt-2">
                    <DashboardHeader
                        userName={mockCurrentUser.first_name}
                        greeting={greeting}
                    />

                    <ContributionStatusCard stats={mockParticipationStats} />

                    <DrawEntryStatus
                        isEntered={!!mockParticipationStats.current_draw_entry_id}
                        currentPool={mockDashboardStats.total_pool}
                        threshold={APP_CONFIG.DISTRIBUTION_THRESHOLD}
                        winnersCount={APP_CONFIG.WINNERS_PER_DRAW}
                    />

                    <DashboardQuickActions />

                    <ParticipationStatsGrid stats={mockParticipationStats} />

                    <ContributionHistoryTimeline contributions={mockContributions} />
                </View>
            </ScrollView>
        </Screen>
    );
}

