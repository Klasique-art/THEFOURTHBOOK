export interface CurrentDraw {
    id: string;
    draw_id: string;
    month: string;
    status: string;
    payout_status: string;
    lottery_type: string;
    total_pool: number;
    target_pool: number;
    remaining_to_target: number;
    progress_percentage: number;
    closes_when_target_reached: boolean;
    currency: string;
    prize_per_winner: number;
    number_of_winners: number;
    draw_date: string | null;
    registration_closes_at: string | null;
    participants_count: number;
    user_participation: {
        is_participating: boolean;
    };
}
