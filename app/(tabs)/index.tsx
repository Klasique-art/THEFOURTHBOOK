import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { Screen } from '@/components';
import {
    MembershipProgressCard,
    NextDrawCountdown,
    QuickActionsGrid,
    QuickStatsGrid,
    RecentWinnersCarousel,
} from '@/components/home';
import { useColors } from '@/config';
import { mockDashboardStats, mockRecentWinners } from '@/data/dummy.draws';
import { APP_CONFIG, homeQuickActions } from '@/data/static.home';

export default function HomeScreen() {
    const router = useRouter();
    const colors = useColors();
    const [refreshing, setRefreshing] = React.useState(false);

    // Calculate next draw date
    const nextDrawDate = new Date(mockDashboardStats.next_draw_date);

    // Map quick actions with navigation handlers
    const quickActionsWithHandlers = homeQuickActions.map(action => ({
        ...action,
        onPress: () => {
            if (action.route) {
                router.push(action.route as any);
            } else if (action.action === 'share') {
                // TODO: Open share modal
            } else if (action.action === 'referral') {
                // TODO: Show referral code
            } else if (action.action === 'how_it_works') {
                // TODO: Navigate to how it works
            }
        },
    }));

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        // TODO: Fetch fresh data from API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRefreshing(false);
    }, []);

    return (
        <Screen className='pt-2'>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >

                <MembershipProgressCard
                    currentMembers={mockDashboardStats.total_members}
                    targetMembers={APP_CONFIG.TARGET_MEMBERS}
                    isActive={mockDashboardStats.total_members >= APP_CONFIG.TARGET_MEMBERS}
                />

                <QuickStatsGrid
                    totalContributions={`$${mockDashboardStats.total_pool.toLocaleString()}`}
                    yourContributions={mockDashboardStats.user_contributions}
                    totalWinners={mockDashboardStats.total_winners}
                    nextDrawDate={nextDrawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />

                <NextDrawCountdown
                    drawDate={nextDrawDate}
                    prizeAmount={`$${APP_CONFIG.MONTHLY_PRIZE_POOL.toLocaleString()}`}
                />

                <RecentWinnersCarousel winners={mockRecentWinners} />

                <QuickActionsGrid actions={quickActionsWithHandlers} />
            </ScrollView>
        </Screen>
    );
}
