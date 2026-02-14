// Mock beneficiary/distribution data matching API structure
export interface Beneficiary {
    winner_id: string;
    user_identifier: string; // Masked user ID like "USER_****1234"
    prize_amount: number;
    payout_status: 'pending' | 'processing' | 'completed' | 'failed';
    cycle_id?: string;
    selected_at?: string; // ISO date string
}

// Backward-compatible winner type used by existing home carousel components.
export interface DrawWinner extends Beneficiary {
    won_at?: string;
}

export interface DistributionCycle {
    cycle_id: string;
    period: string; // e.g. "January 2026"
    status: 'active' | 'completed' | 'processing';
    total_pool: number;
    total_participants: number;
    beneficiaries_count: number;
    distribution_date: string;
    beneficiaries?: Beneficiary[];
}

export const mockRecentBeneficiaries: Beneficiary[] = [
    {
        winner_id: 'ben_abc123',
        user_identifier: 'USER_****1234',
        prize_amount: 200000.00,
        payout_status: 'completed',
        cycle_id: 'cyc_jan_2026',
        selected_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'ben_def456',
        user_identifier: 'USER_****5678',
        prize_amount: 200000.00,
        payout_status: 'completed',
        cycle_id: 'cyc_jan_2026',
        selected_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'ben_ghi789',
        user_identifier: 'USER_****9012',
        prize_amount: 200000.00,
        payout_status: 'completed',
        cycle_id: 'cyc_jan_2026',
        selected_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'ben_jkl012',
        user_identifier: 'USER_****3456',
        prize_amount: 200000.00,
        payout_status: 'completed',
        cycle_id: 'cyc_jan_2026',
        selected_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'ben_mno345',
        user_identifier: 'USER_****7890',
        prize_amount: 200000.00,
        payout_status: 'completed',
        cycle_id: 'cyc_jan_2026',
        selected_at: '2026-01-28T18:00:00Z',
    },
];

export const mockDistributionCycles: DistributionCycle[] = [
    {
        cycle_id: 'cyc_jan_2026',
        period: 'January 2026',
        status: 'completed',
        total_pool: 1000000,
        total_participants: 50000,
        beneficiaries_count: 5,
        distribution_date: '2026-01-28T18:00:00Z',
        beneficiaries: mockRecentBeneficiaries,
    },
    {
        cycle_id: 'cyc_dec_2025',
        period: 'December 2025',
        status: 'completed',
        total_pool: 1000000,
        total_participants: 50000,
        beneficiaries_count: 5,
        distribution_date: '2025-12-28T18:00:00Z',
    },
];

// Mock dashboard stats
// Re-exporting for backward compatibility with existing components
export const mockDashboardStats = {
    total_pool: 649000,
    total_members: 32450,
    total_winners: 15,
    next_draw_date: '2026-02-28T18:00:00Z',
    user_contributions: 3,
};

// Also export as mockRecentWinners for backward compatibility
export const mockRecentWinners: DrawWinner[] = mockRecentBeneficiaries.map((beneficiary) => ({
    ...beneficiary,
    won_at: beneficiary.selected_at,
}));
