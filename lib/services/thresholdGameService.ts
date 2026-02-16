import { mockCurrentUser } from '@/data/userData.dummy';
import { mockActiveDistributionGame, mockDistributionCycleCurrent } from '@/data/thresholdGame.dummy';
import {
    DistributionCycleCurrentResponse,
    DistributionGameActiveResponse,
    DistributionGameSubmissionState,
    SubmitDistributionGameAnswerPayload,
    SubmitDistributionGameAnswerResponse,
} from '@/types/threshold-game.types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const submissionStore = new Map<string, DistributionGameSubmissionState>();

const getDefaultSubmission = (): DistributionGameSubmissionState => ({
    has_submitted: false,
    selected_option_id: null,
    submitted_at: null,
    locked: false,
});

export const thresholdGameService = {
    async getCurrentCycle(): Promise<DistributionCycleCurrentResponse> {
        await wait(300);
        const submission = submissionStore.get(mockCurrentUser.user_id) ?? getDefaultSubmission();

        return {
            ...mockDistributionCycleCurrent,
            game: {
                ...mockDistributionCycleCurrent.game,
                has_user_submitted: submission.has_submitted,
            },
        };
    },

    async getActiveGame(cycleId?: string): Promise<DistributionGameActiveResponse> {
        await wait(450);

        if (cycleId && cycleId !== mockActiveDistributionGame.cycle_id) {
            throw new Error('No active game found for this cycle.');
        }

        const submission = submissionStore.get(mockCurrentUser.user_id) ?? getDefaultSubmission();

        return {
            ...mockActiveDistributionGame,
            submission,
        };
    },

    async submitAnswer(
        gameId: string,
        payload: SubmitDistributionGameAnswerPayload
    ): Promise<SubmitDistributionGameAnswerResponse> {
        await wait(500);

        if (gameId !== mockActiveDistributionGame.game_id) {
            throw new Error('Game not found.');
        }

        const existing = submissionStore.get(mockCurrentUser.user_id);
        if (existing?.has_submitted) {
            throw new Error('You already submitted an answer for this game.');
        }

        const optionExists = mockActiveDistributionGame.options.some(
            (option) => option.option_id === payload.selected_option_id
        );
        if (!optionExists) {
            throw new Error('Invalid option selected.');
        }

        const submittedAt = new Date().toISOString();
        submissionStore.set(mockCurrentUser.user_id, {
            has_submitted: true,
            selected_option_id: payload.selected_option_id,
            submitted_at: submittedAt,
            locked: true,
        });

        return {
            submission_id: `sub_${Date.now()}`,
            game_id: gameId,
            member_id: mockCurrentUser.user_id,
            selected_option_id: payload.selected_option_id,
            submitted_at: submittedAt,
            locked: true,
        };
    },

    async getMySubmission(gameId: string): Promise<DistributionGameSubmissionState> {
        await wait(250);

        if (gameId !== mockActiveDistributionGame.game_id) {
            throw new Error('Game not found.');
        }

        return submissionStore.get(mockCurrentUser.user_id) ?? getDefaultSubmission();
    },
};
