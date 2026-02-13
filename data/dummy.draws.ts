// Mock draw winners data matching API structure
export interface DrawWinner {
    winner_id: string;
    user_identifier: string; // Masked user ID like "USER_****1234"
    prize_amount: number;
    payout_status: 'pending' | 'processing' | 'completed' | 'failed';
    draw_id?: string;
    won_at?: string; // ISO date string
}

export const mockRecentWinners: DrawWinner[] = [
    {
        winner_id: 'win_abc123',
        user_identifier: 'USER_****1234',
        prize_amount: 200000.00,
        payout_status: 'completed',
        draw_id: 'draw_jan_2026',
        won_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'win_def456',
        user_identifier: 'USER_****5678',
        prize_amount: 200000.00,
        payout_status: 'completed',
        draw_id: 'draw_jan_2026',
        won_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'win_ghi789',
        user_identifier: 'USER_****9012',
        prize_amount: 200000.00,
        payout_status: 'completed',
        draw_id: 'draw_jan_2026',
        won_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'win_jkl012',
        user_identifier: 'USER_****3456',
        prize_amount: 200000.00,
        payout_status: 'completed',
        draw_id: 'draw_jan_2026',
        won_at: '2026-01-28T18:00:00Z',
    },
    {
        winner_id: 'win_mno345',
        user_identifier: 'USER_****7890',
        prize_amount: 200000.00,
        payout_status: 'completed',
        draw_id: 'draw_jan_2026',
        won_at: '2026-01-28T18:00:00Z',
    },
];

// Mock dashboard stats
export interface DashboardStats {
    total_pool: number;
    total_members: number;
    total_winners: number;
    next_draw_date: string; // ISO date string
    user_contributions: number;
}

export const mockDashboardStats: DashboardStats = {
    total_pool: 649000,
    total_members: 32450,
    total_winners: 15,
    next_draw_date: '2026-02-28T18:00:00Z',
    user_contributions: 3,
};
