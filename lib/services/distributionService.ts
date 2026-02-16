import { mockDistributionCycles } from '@/data/dummy.draws';
import {
    DistributionBeneficiary,
    DistributionDetailResponse,
    DistributionHistoryItem,
    DistributionHistoryResponse,
    MySelectionItem,
    MySelectionStatusResponse,
} from '@/types/distribution.types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toHistoryItem = (cycle: any): DistributionHistoryItem => ({
    cycle_id: cycle.cycle_id,
    period: cycle.period,
    status: cycle.status,
    total_pool: cycle.total_pool,
    total_participants: cycle.total_participants,
    beneficiaries_count: cycle.beneficiaries_count,
    distribution_date: cycle.distribution_date,
});

const toBeneficiary = (item: any): DistributionBeneficiary => ({
    winner_id: item.winner_id,
    user_identifier: item.user_identifier,
    prize_amount: item.prize_amount,
    payout_status: item.payout_status,
    cycle_id: item.cycle_id ?? '',
    selected_at: item.selected_at ?? new Date().toISOString(),
});

export const distributionService = {
    async getDistributionHistory(): Promise<DistributionHistoryResponse> {
        await wait(450);
        return {
            items: mockDistributionCycles.map(toHistoryItem),
        };
    },

    async getDistributionDetail(cycleId: string): Promise<DistributionDetailResponse> {
        await wait(450);
        const cycle = mockDistributionCycles.find((item) => item.cycle_id === cycleId);

        if (!cycle) {
            throw new Error('Distribution cycle not found.');
        }

        return {
            cycle: toHistoryItem(cycle),
            beneficiaries: (cycle.beneficiaries ?? []).map(toBeneficiary),
        };
    },

    async getMySelectionStatus(userIdentifier: string): Promise<MySelectionStatusResponse> {
        await wait(350);

        const selections: MySelectionItem[] = mockDistributionCycles
            .flatMap((cycle) =>
                (cycle.beneficiaries ?? [])
                    .filter((beneficiary) => beneficiary.user_identifier === userIdentifier)
                    .map((beneficiary) => ({
                        cycle_id: cycle.cycle_id,
                        period: cycle.period,
                        distribution_date: cycle.distribution_date,
                        prize_amount: beneficiary.prize_amount,
                        payout_status: beneficiary.payout_status,
                        selected_at: beneficiary.selected_at ?? cycle.distribution_date,
                        winner_id: beneficiary.winner_id,
                    }))
            )
            .sort((a, b) => new Date(b.selected_at).getTime() - new Date(a.selected_at).getTime());

        const totalWonAmount = selections.reduce((sum, item) => sum + item.prize_amount, 0);

        return {
            user_identifier: userIdentifier,
            total_selection_count: selections.length,
            total_won_amount: totalWonAmount,
            selections,
        };
    },
};
