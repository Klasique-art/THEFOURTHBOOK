import { useFocusEffect } from '@react-navigation/native';
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
import type { DrawWinner } from '@/data/dummy.draws';
import { APP_CONFIG, homeQuickActions } from '@/data/static.home';
import { drawService } from '@/lib/services/drawService';
import { distributionService } from '@/lib/services/distributionService';
import type { CurrentDraw } from '@/types/draw.types';

export default function HomeScreen() {
    const router = useRouter();
    const colors = useColors();
    const [refreshing, setRefreshing] = React.useState(false);
    const [currentDraw, setCurrentDraw] = React.useState<CurrentDraw | null>(null);
    const [recentWinners, setRecentWinners] = React.useState<DrawWinner[]>([]);

    const currencyFormatter = React.useMemo(
        () =>
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }),
        []
    );

    const formatDateLabel = React.useCallback((value: string | null | undefined) => {
        if (!value) return 'Target-based';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return 'Target-based';
        return parsed.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, []);

    const formatPeriodLabel = React.useCallback((value: string | null | undefined) => {
        if (!value) return 'Current Cycle';
        const match = value.match(/^(\d{4})-(\d{2})$/);
        if (!match) return value;
        const [, year, month] = match;
        const parsed = new Date(Number(year), Number(month) - 1, 1);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }, []);

    const fetchCurrentDraw = React.useCallback(async () => {
        try {
            const draw = await drawService.getCurrentDraw();
            setCurrentDraw(draw);
        } catch (error) {
            console.error('[HomeScreen] fetchCurrentDraw failed', error);
        }
    }, []);

    const fetchRecentWinners = React.useCallback(async () => {
        try {
            const history = await distributionService.getDistributionHistory();
            const latestCompleted = history.items.find((item) => item.status === 'completed');

            if (!latestCompleted) {
                setRecentWinners([]);
                return;
            }

            const details = await distributionService.getDistributionDetail(latestCompleted.cycle_id);
            const winners = (details.beneficiaries ?? []).map((beneficiary) => ({
                ...beneficiary,
                won_at: beneficiary.selected_at,
            }));
            setRecentWinners(winners);
        } catch (error) {
            console.error('[HomeScreen] fetchRecentWinners failed', error);
            setRecentWinners([]);
        }
    }, []);

    const fetchHomeData = React.useCallback(async () => {
        await Promise.allSettled([fetchCurrentDraw(), fetchRecentWinners()]);
    }, [fetchCurrentDraw, fetchRecentWinners]);

    const quickActionsWithHandlers = React.useMemo(
        () =>
            homeQuickActions.map((action) => ({
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
            })),
        [router]
    );

    React.useEffect(() => {
        void fetchHomeData();
    }, [fetchHomeData]);

    useFocusEffect(
        React.useCallback(() => {
            const poller = setInterval(() => {
                void fetchCurrentDraw();
            }, 15000);
            return () => clearInterval(poller);
        }, [fetchCurrentDraw])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchHomeData();
        } finally {
            setRefreshing(false);
        }
    }, [fetchHomeData]);

    const totalPool = currentDraw?.total_pool ?? 0;
    const participantsCount = currentDraw?.participants_count ?? 0;
    const winnersCount = currentDraw?.number_of_winners ?? 0;
    const prizePerWinner = currentDraw
        ? winnersCount > 0
            ? currentDraw.target_pool / winnersCount
            : currentDraw.prize_per_winner
        : 0;
    const cycleCloseLabel = currentDraw
        ? currentDraw.closes_when_target_reached
            ? `At ${currencyFormatter.format(currentDraw.target_pool)} target`
            : formatDateLabel(currentDraw.registration_closes_at)
        : 'Loading...';

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
                        title="Refreshing latest draw stats"
                    />
                }
            >

                <MembershipProgressCard
                    drawId={currentDraw?.draw_id ?? '---'}
                    monthLabel={formatPeriodLabel(currentDraw?.month)}
                    status={currentDraw?.status ?? 'pending'}
                    payoutStatus={currentDraw?.payout_status ?? 'pending'}
                    lotteryType={currentDraw?.lottery_type ?? 'monthly'}
                    isParticipating={Boolean(currentDraw?.user_participation?.is_participating)}
                    progressPercentage={currentDraw?.progress_percentage ?? 0}
                    remainingToTargetLabel={currencyFormatter.format(currentDraw?.remaining_to_target ?? 0)}
                />

                <QuickStatsGrid
                    totalPool={currencyFormatter.format(totalPool)}
                    participantsCount={participantsCount}
                    prizePerWinner={currencyFormatter.format(prizePerWinner)}
                    numberOfWinners={winnersCount}
                    cycleCloseLabel={cycleCloseLabel}
                />

                <NextDrawCountdown
                    currentPool={totalPool}
                    threshold={currentDraw?.target_pool ?? APP_CONFIG.DISTRIBUTION_THRESHOLD}
                    beneficiariesCount={winnersCount || APP_CONFIG.WINNERS_PER_DRAW}
                    onPlayGame={() => router.push('/draws/threshold-game' as any)}
                />

                <RecentWinnersCarousel winners={recentWinners} />

                <QuickActionsGrid actions={quickActionsWithHandlers} />
            </ScrollView>
        </Screen>
    );
}
