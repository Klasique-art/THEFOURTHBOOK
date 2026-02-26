import axios, { AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/config/settings';
import { authStorage } from '@/lib/auth';
import { authEvents } from '@/lib/authEvents';

const toErrorPreview = (data: unknown): string | unknown => {
    const truncateToWords = (input: string, maxWords = 500) => {
        const words = input.trim().split(/\s+/);
        if (words.length <= maxWords) return input;
        return `${words.slice(0, maxWords).join(' ')} ...[truncated]`;
    };

    if (typeof data === 'string') return truncateToWords(data, 500);
    try {
        return truncateToWords(JSON.stringify(data), 500);
    } catch {
        return data;
    }
};

const extractFirstErrorText = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractFirstErrorText(item);
            if (found) return found;
        }
        return null;
    }
    if (value && typeof value === 'object') {
        for (const nested of Object.values(value as Record<string, unknown>)) {
            const found = extractFirstErrorText(nested);
            if (found) return found;
        }
    }
    return null;
};

const toReadableError = (error: any): string => {
    const data = error?.response?.data;
    return (
        extractFirstErrorText(data?.error?.details?.error?.details) ||
        extractFirstErrorText(data?.error?.details?.error?.message) ||
        extractFirstErrorText(data?.error?.details?.message) ||
        extractFirstErrorText(data?.error?.details) ||
        extractFirstErrorText(data?.error?.message) ||
        extractFirstErrorText(data?.detail) ||
        extractFirstErrorText(data?.message) ||
        extractFirstErrorText(data?.error) ||
        error?.message ||
        'Request failed'
    );
};

let refreshPromise: Promise<string> | null = null;

const getRefreshedAccessToken = async (): Promise<string> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const refreshToken = await authStorage.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token found.');

            const response = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
                refresh: refreshToken,
            });

            const access = response.data?.access as string | undefined;
            if (!access) throw new Error('Refresh response missing access token.');

            await authStorage.setAccessToken(access);
            return access;
        } catch (error) {
            const status = (error as any)?.response?.status;
            const message = toReadableError(error as any);
            console.log(`[client] token refresh failed: ${message}`);
            if (status >= 500 || !status) {
                console.log('[client] token refresh debug', {
                    message: (error as any)?.message,
                    status,
                    data_preview: toErrorPreview((error as any)?.response?.data),
                });
            }
            throw error;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

client.interceptors.request.use(async (config) => {
    const token = await authStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await getRefreshedAccessToken();
                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };
                return client(originalRequest);
            } catch {
                await authStorage.clearTokens();
                authEvents.emitUnauthorized();
            }
        }

        const status = error?.response?.status;
        const message = toReadableError(error);
        console.log(`[client] request failed (${error?.config?.method?.toUpperCase()} ${error?.config?.url}): ${message}`);
        if (status >= 500 || !status) {
            console.log('[client] request failed debug', {
                url: error?.config?.url,
                method: error?.config?.method,
                message: error?.message,
                status,
                data_preview: toErrorPreview(error?.response?.data),
            });
        }

        return Promise.reject(error);
    }
);

export default client;
