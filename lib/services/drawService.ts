import client from '@/lib/client';
import { CurrentDraw } from '@/types/draw.types';

type CurrentDrawApiResponse = {
    success: boolean;
    data: {
        id: string;
        draw_id: string;
        month: string;
        status: string;
        payout_status: string;
        lottery_type: string;
        total_pool: string;
        target_pool: string;
        remaining_to_target: string;
        progress_percentage: number;
        closes_when_target_reached: boolean;
        currency: string;
        prize_per_winner: string;
        number_of_winners: number;
        draw_date: string | null;
        registration_closes_at: string | null;
        participants_count: number;
        user_participation?: {
            is_participating: boolean;
        };
    };
};

type DistributionCycleCurrentApiResponse = {
    success?: boolean;
    data?: {
        cycle_id: string;
        period_label: string;
        threshold_amount: number;
        total_pool: number;
        total_participants: number;
        distribution_state: string;
    };
    cycle_id?: string;
    period_label?: string;
    threshold_amount?: number;
    total_pool?: number;
    total_participants?: number;
    distribution_state?: string;
};

const unwrapCycle = (
    payload: DistributionCycleCurrentApiResponse
): {
    cycle_id: string;
    period_label: string;
    threshold_amount: number;
    total_pool: number;
    total_participants: number;
    distribution_state: string;
} => {
    const source = payload.data ?? payload;
    return {
        cycle_id: source.cycle_id ?? 'current_cycle',
        period_label: source.period_label ?? 'Current Cycle',
        threshold_amount: Number(source.threshold_amount ?? 1000000),
        total_pool: Number(source.total_pool ?? 0),
        total_participants: Number(source.total_participants ?? 0),
        distribution_state: source.distribution_state ?? 'collecting',
    };
};

export const drawService = {
    async getCurrentDraw(): Promise<CurrentDraw> {
        try {
            const response = await client.get<CurrentDrawApiResponse>('/draws/current/');
            const draw = response.data.data;

            return {
                id: draw.id,
                draw_id: draw.draw_id,
                month: draw.month,
                status: draw.status,
                payout_status: draw.payout_status,
                lottery_type: draw.lottery_type,
                total_pool: Number(draw.total_pool),
                target_pool: Number(draw.target_pool),
                remaining_to_target: Number(draw.remaining_to_target),
                progress_percentage: Number(draw.progress_percentage ?? 0),
                closes_when_target_reached: Boolean(draw.closes_when_target_reached),
                currency: draw.currency,
                prize_per_winner: Number(draw.prize_per_winner),
                number_of_winners: draw.number_of_winners,
                draw_date: draw.draw_date,
                registration_closes_at: draw.registration_closes_at,
                participants_count: draw.participants_count,
                user_participation: {
                    is_participating: draw.user_participation?.is_participating ?? false,
                },
            };
        } catch (error: any) {
            if (error?.response?.status !== 404) {
                throw error;
            }

            // No open draw; fallback to cycle endpoint for threshold-game states.
            const cycleResponse = await client.get<DistributionCycleCurrentApiResponse>('/distribution/cycle/current/');
            const cycle = unwrapCycle(cycleResponse.data);
            const remaining = Math.max(cycle.threshold_amount - cycle.total_pool, 0);
            const progress = cycle.threshold_amount > 0 ? (cycle.total_pool / cycle.threshold_amount) * 100 : 0;

            return {
                id: cycle.cycle_id,
                draw_id: cycle.cycle_id,
                month: cycle.period_label,
                status: cycle.distribution_state,
                payout_status: 'pending',
                lottery_type: 'monthly',
                total_pool: cycle.total_pool,
                target_pool: cycle.threshold_amount,
                remaining_to_target: remaining,
                progress_percentage: progress,
                closes_when_target_reached: true,
                currency: 'USD',
                prize_per_winner: cycle.threshold_amount / 10,
                number_of_winners: 10,
                draw_date: null,
                registration_closes_at: null,
                participants_count: cycle.total_participants,
                user_participation: {
                    is_participating: false,
                },
            };
        }
    },
};
