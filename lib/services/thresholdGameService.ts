import client from '@/lib/client';
import {
    DistributionCycleCurrentResponse,
    DistributionGameActiveResponse,
    DistributionGameSubmissionState,
    SubmitDistributionGameAnswerPayload,
    SubmitDistributionGameAnswerResponse,
} from '@/types/threshold-game.types';

type Envelope<T> = {
    success?: boolean;
    data?: T;
};

const unwrap = <T>(payload: T | Envelope<T>): T => {
    if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
        const data = (payload as Envelope<T>).data;
        if (data !== undefined) return data;
    }
    return payload as T;
};

const toApiErrorMessage = (error: any): string => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const detail =
        data?.message ||
        data?.detail ||
        data?.error ||
        error?.message ||
        'Request failed.';

    if (status === 409) return 'You already submitted an answer for this game.';
    if (status === 422) return 'Game is not open for submissions.';
    if (status === 403) {
        return 'You are not eligible for this cycle. You need a qualifying contribution/payment in this cycle before you can play the threshold game.';
    }
    if (status === 404) return 'No active threshold game found right now.';
    if (status === 400) return typeof detail === 'string' ? detail : 'Invalid answer payload.';
    return typeof detail === 'string' ? detail : 'Request failed.';
};

export const thresholdGameService = {
    async getCurrentCycle(): Promise<DistributionCycleCurrentResponse> {
        const response = await client.get<Envelope<DistributionCycleCurrentResponse> | DistributionCycleCurrentResponse>(
            '/distribution/cycle/current/'
        );
        return unwrap(response.data);
    },

    async getActiveGame(cycleId?: string): Promise<DistributionGameActiveResponse> {
        try {
            const query = cycleId ? `?cycle_id=${encodeURIComponent(cycleId)}` : '';
            const response = await client.get<Envelope<DistributionGameActiveResponse> | DistributionGameActiveResponse>(
                `/distribution-games/active/${query}`
            );
            return unwrap(response.data);
        } catch (error: any) {
            throw new Error(toApiErrorMessage(error));
        }
    },

    async submitAnswer(
        gameId: string,
        payload: SubmitDistributionGameAnswerPayload
    ): Promise<SubmitDistributionGameAnswerResponse> {
        try {
            const response = await client.post<
                Envelope<SubmitDistributionGameAnswerResponse> | SubmitDistributionGameAnswerResponse
            >(`/distribution-games/${gameId}/submissions/`, payload);
            return unwrap(response.data);
        } catch (error: any) {
            throw new Error(toApiErrorMessage(error));
        }
    },

    async getMySubmission(gameId: string): Promise<DistributionGameSubmissionState> {
        try {
            const response = await client.get<
                Envelope<DistributionGameSubmissionState> | DistributionGameSubmissionState
            >(`/distribution-games/${gameId}/my-submission/`);
            return unwrap(response.data);
        } catch (error: any) {
            throw new Error(toApiErrorMessage(error));
        }
    },
};
