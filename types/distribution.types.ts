export interface DistributionBeneficiary {
    winner_id: string;
    user_identifier: string;
    prize_amount: number;
    payout_status: 'pending' | 'processing' | 'completed' | 'failed';
    cycle_id: string;
    selected_at: string;
}

export interface DistributionHistoryItem {
    cycle_id: string;
    period: string;
    status: 'active' | 'completed' | 'processing';
    total_pool: number;
    total_participants: number;
    beneficiaries_count: number;
    distribution_date: string;
}

export interface DistributionHistoryResponse {
    items: DistributionHistoryItem[];
}

export interface DistributionDetailResponse {
    cycle: DistributionHistoryItem;
    beneficiaries: DistributionBeneficiary[];
}

export interface MySelectionItem {
    cycle_id: string;
    period: string;
    distribution_date: string;
    prize_amount: number;
    payout_status: 'pending' | 'processing' | 'completed' | 'failed';
    selected_at: string;
    winner_id: string;
}

export interface MySelectionStatusResponse {
    user_identifier: string;
    total_selection_count: number;
    total_won_amount: number;
    selections: MySelectionItem[];
}
