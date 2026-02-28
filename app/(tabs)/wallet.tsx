import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { getCalendars, getLocales } from 'expo-localization';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Screen } from '@/components';
import StatusModal from '@/components/ui/StatusModal';
import {
    AutoRenewalToggle,
    PaymentMethodList,
    PaymentStatusCard,
    TransactionHistoryList,
} from '@/components/wallet';
import { Contribution, PaymentMethod } from '@/data/contributions.dummy';
import { PAYMENT_CALLBACK_URL } from '@/config/settings';
import { paymentService } from '@/lib/services/paymentService';
import { thresholdGameService } from '@/lib/services/thresholdGameService';
import { ApiPaymentMethod, PaymentHistoryItem } from '@/types/payment.types';
import { DistributionState } from '@/types/threshold-game.types';

const PENDING_PAYMENT_REFERENCE_KEY = 'thefourthbook_pending_payment_reference';
const SUPPORTED_CHECKOUT_CURRENCIES = ['GHS', 'KES', 'NGN', 'USD', 'XOF', 'ZAR'] as const;
const DEFAULT_CHECKOUT_CURRENCY: (typeof SUPPORTED_CHECKOUT_CURRENCIES)[number] = 'USD';

const COUNTRY_TO_SUPPORTED_CURRENCY: Record<string, (typeof SUPPORTED_CHECKOUT_CURRENCIES)[number]> = {
    GH: 'GHS',
    KE: 'KES',
    NG: 'NGN',
    ZA: 'ZAR',
    BJ: 'XOF',
    BF: 'XOF',
    CI: 'XOF',
    GW: 'XOF',
    ML: 'XOF',
    NE: 'XOF',
    SN: 'XOF',
    TG: 'XOF',
};

const TIMEZONE_TO_SUPPORTED_CURRENCY: Record<string, (typeof SUPPORTED_CHECKOUT_CURRENCIES)[number]> = {
    'Africa/Accra': 'GHS',
    'Africa/Lagos': 'NGN',
    'Africa/Nairobi': 'KES',
    'Africa/Johannesburg': 'ZAR',
    'Africa/Abidjan': 'XOF',
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

const getErrorMessage = (error: any, fallback: string) => {
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
        fallback
    );
};

export default function WalletScreen() {
    const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(false);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
    const [hasPaidCurrentMonth, setHasPaidCurrentMonth] = useState(false);
    const [nextDueDate, setNextDueDate] = useState<string>(new Date().toISOString());
    const [transactions, setTransactions] = useState<Contribution[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [canPayNow, setCanPayNow] = useState(true);
    const [payDisabledReason, setPayDisabledReason] = useState<string | null>(null);
    const [checkoutCurrency, setCheckoutCurrency] = useState<(typeof SUPPORTED_CHECKOUT_CURRENCIES)[number]>(DEFAULT_CHECKOUT_CURRENCY);
    const [checkoutQuoteLabel, setCheckoutQuoteLabel] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        variant: 'success' | 'error' | 'info';
    }>({
        visible: false,
        title: '',
        message: '',
        variant: 'info',
    });

    const currentMonthAmount = 20.00;

    useEffect(() => {
        const locale = getLocales()?.[0];
        const timezone = getCalendars()?.[0]?.timeZone;
        const detectedCurrency = locale?.currencyCode?.toUpperCase?.();
        const region = locale?.regionCode?.toUpperCase?.();

        let chosen = DEFAULT_CHECKOUT_CURRENCY;

        if (detectedCurrency && SUPPORTED_CHECKOUT_CURRENCIES.includes(detectedCurrency as any)) {
            chosen = detectedCurrency as (typeof SUPPORTED_CHECKOUT_CURRENCIES)[number];
        } else if (region && COUNTRY_TO_SUPPORTED_CURRENCY[region]) {
            chosen = COUNTRY_TO_SUPPORTED_CURRENCY[region];
        } else if (timezone && TIMEZONE_TO_SUPPORTED_CURRENCY[timezone]) {
            chosen = TIMEZONE_TO_SUPPORTED_CURRENCY[timezone];
        }

        console.log(
            `[Wallet] currency detection :: locale_currency=${detectedCurrency ?? 'n/a'}, region=${region ?? 'n/a'}, timezone=${timezone ?? 'n/a'}, chosen=${chosen}`
        );

        setCheckoutCurrency(chosen);
    }, []);

    const stateToReason = (state: DistributionState): string | null => {
        if (state === 'collecting') return null;
        if (state === 'threshold_met_game_pending' || state === 'threshold_met_game_open' || state === 'threshold_met_game_closed') {
            return 'Contributions are closed. Cycle target has been reached and threshold game/distribution steps are in progress.';
        }
        if (state === 'distribution_processing') {
            return 'Contributions are paused while distribution is being processed.';
        }
        if (state === 'distribution_completed') {
            return 'This cycle is completed. Contributions will reopen for the next cycle.';
        }
        return 'Contributions are currently unavailable for this cycle.';
    };

    const paymentStatus: 'paid' | 'unpaid' | 'processing' = useMemo(() => {
        if (isProcessing) return 'processing';
        return hasPaidCurrentMonth ? 'paid' : 'unpaid';
    }, [hasPaidCurrentMonth, isProcessing]);

    const openStatusModal = (title: string, message: string, variant: 'success' | 'error' | 'info') => {
        setStatusModal({ visible: true, title, message, variant });
    };

    const closeStatusModal = () => {
        setStatusModal((prev) => ({ ...prev, visible: false }));
    };

    const toWalletMethod = (method: ApiPaymentMethod): PaymentMethod => ({
        id: String(method.id),
        type: (method.type as PaymentMethod['type']) || 'card',
        brand: ((method.card_brand || 'unknown').toLowerCase() as PaymentMethod['brand']) || 'unknown',
        last4: method.card_last4 || method.account_number?.slice(-4) || '----',
        expiry_month: method.exp_month || undefined,
        expiry_year: method.exp_year || undefined,
        is_default: method.is_default,
    });

    const toContribution = (payment: PaymentHistoryItem): Contribution => {
        const normalizedStatus = String(payment.status || '').toLowerCase();
        const statusMap: Record<string, Contribution['status']> = {
            success: 'completed',
            completed: 'completed',
            pending: 'pending',
            failed: 'failed',
            failure: 'failed',
            error: 'failed',
            cancelled: 'failed',
            canceled: 'failed',
            abandoned: 'failed',
            refunded: 'refunded',
        };
        let mappedStatus = statusMap[normalizedStatus] || 'pending';
        if (mappedStatus === 'pending') {
            const createdMs = new Date(payment.created_at).getTime();
            const ageMinutes = Number.isNaN(createdMs) ? 0 : (Date.now() - createdMs) / 60000;
            if (ageMinutes > 5) {
                mappedStatus = 'failed';
            }
        }
        const rawAmount = Number(payment.amount);
        const isMonthlySubscription = String(payment.purpose || '').toLowerCase() === 'monthly_subscription';
        const normalizedAmount =
            isMonthlySubscription || mappedStatus === 'failed'
                ? 20
                : Number.isFinite(rawAmount)
                    ? rawAmount
                    : 20;

        return {
            contribution_id: payment.payment_id,
            amount: normalizedAmount,
            currency: payment.currency,
            status: mappedStatus,
            type: 'contribution',
            payment_method: payment.payment_method?.card_brand || payment.payment_method?.bank_name || 'Payment',
            payment_method_last4:
                payment.payment_method?.card_last4 || payment.payment_method?.account_number?.slice(-4) || '----',
            created_at: payment.created_at,
            completed_at: payment.completed_at,
            draw_month: payment.month,
            draw_entry_id: null,
        };
    };

    const loadWalletData = useCallback(async () => {
        try {
            const [status, apiMethods, history, cycle] = await Promise.all([
                paymentService.getCurrentMonthStatus(),
                paymentService.getPaymentMethods(),
                paymentService.getPaymentHistory(),
                thresholdGameService.getCurrentCycle(),
            ]);

            const mappedMethods = apiMethods.map(toWalletMethod);
            setMethods(mappedMethods);
            setSelectedMethodId(mappedMethods.find((m) => m.is_default)?.id ?? mappedMethods[0]?.id ?? null);

            setHasPaidCurrentMonth(Boolean(status.has_paid));
            setIsAutoRenewalEnabled(Boolean(status.auto_renew_enabled));

            const resolvedDueDate =
                status.next_payment_date ||
                new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
            setNextDueDate(resolvedDueDate);

            setTransactions(history.map(toContribution).slice(0, 20));
            const reason = stateToReason(cycle.distribution_state);
            setCanPayNow(!reason);
            setPayDisabledReason(reason);
        } catch (error: any) {
            openStatusModal('Wallet Error', getErrorMessage(error, 'Could not load wallet data.'), 'error');
            // Fail-safe to avoid payment loopholes when cycle state is unknown.
            setCanPayNow(false);
            setPayDisabledReason('Could not verify if contributions are open. Please try again shortly.');
        }
    }, []);

    useEffect(() => {
        void loadWalletData();
    }, [loadWalletData]);

    const verifyPendingPaymentIfAny = useCallback(async () => {
        const pendingReference = await AsyncStorage.getItem(PENDING_PAYMENT_REFERENCE_KEY);
        if (!pendingReference) return;

        try {
            await paymentService.verifyPayment(pendingReference);
            await AsyncStorage.removeItem(PENDING_PAYMENT_REFERENCE_KEY);
            await loadWalletData();
            openStatusModal('Success', 'Your contribution was confirmed after returning to the app.', 'success');
        } catch {
            // Payment may still be processing on provider side; keep pending reference for later retry.
        }
    }, [loadWalletData]);

    useFocusEffect(
        useCallback(() => {
            void verifyPendingPaymentIfAny();
        }, [verifyPendingPaymentIfAny])
    );

    const handlePayNow = async () => {
        if (!canPayNow) {
            openStatusModal('Contributions Closed', payDisabledReason ?? 'Contributions are currently unavailable for this cycle.', 'info');
            return;
        }

        setIsProcessing(true);
        try {
            const appReturnUrl = PAYMENT_CALLBACK_URL || Linking.createURL('payments/callback');
            const callbackUrlForBackend = /^https?:\/\//i.test(appReturnUrl) ? appReturnUrl : undefined;
            console.log(`[Wallet] app return URL (for browser session): ${appReturnUrl}`);
            if (!callbackUrlForBackend) {
                console.log('[Wallet] callback_url not sent to backend because it is not an http/https URL.');
            }
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const primaryPayload = {
                payment_method_id: selectedMethodId ? Number(selectedMethodId) : undefined,
                auto_renew: isAutoRenewalEnabled,
                month,
                callback_url: callbackUrlForBackend,
                currency: checkoutCurrency,
                allow_currency_fallback: false,
            };
            console.log(`[Wallet] initialize payload (primary): ${JSON.stringify(primaryPayload)}`);

            let initialized;
            try {
                initialized = await paymentService.initializeMonthlyPayment(primaryPayload);
            } catch (error: any) {
                if (error?.response?.status !== 500) throw error;

                // Backend currently throws TypeError for some optional fields in initialize.
                const fallbackPayload = {
                    auto_renew: isAutoRenewalEnabled,
                    callback_url: callbackUrlForBackend,
                    currency: checkoutCurrency,
                    allow_currency_fallback: false,
                };
                console.log(`[Wallet] initialize payload (fallback): ${JSON.stringify(fallbackPayload)}`);
                initialized = await paymentService.initializeMonthlyPayment(fallbackPayload);
            }

            const initializedAmount = Number(initialized.amount);
            const initializedCurrency = initialized.currency || checkoutCurrency;
            const exchangeRate = initialized.exchange_rate;
            if (Number.isFinite(initializedAmount)) {
                const quote = `${initializedAmount.toLocaleString('en-US')} ${initializedCurrency}${exchangeRate ? ` (rate: ${exchangeRate})` : ''}`;
                setCheckoutQuoteLabel(`Checkout quote: ${quote}`);
            } else {
                setCheckoutQuoteLabel(`Checkout quote currency: ${initializedCurrency}`);
            }
            await AsyncStorage.setItem(PENDING_PAYMENT_REFERENCE_KEY, initialized.reference);

            const checkoutResult = await WebBrowser.openAuthSessionAsync(
                initialized.authorization_url,
                appReturnUrl
            );

            const tryVerify = async () => {
                await paymentService.verifyPayment(initialized.reference);
                await AsyncStorage.removeItem(PENDING_PAYMENT_REFERENCE_KEY);
                await loadWalletData();
                openStatusModal('Success', 'Your contribution for this month has been received!', 'success');
            };

            try {
                await tryVerify();
            } catch {
                if (checkoutResult.type === 'cancel') {
                    openStatusModal(
                        'Payment Not Confirmed Yet',
                        'Checkout was closed before callback. If you completed payment, open Wallet again in a few seconds to refresh verification.',
                        'info'
                    );
                    return;
                }
                throw new Error('Payment could not be confirmed yet.');
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Payment could not be completed.');
            if (message.toLowerCase().includes('currency') && message.toLowerCase().includes('not enabled')) {
                if (checkoutCurrency !== DEFAULT_CHECKOUT_CURRENCY) {
                    setCheckoutCurrency(DEFAULT_CHECKOUT_CURRENCY);
                }
                openStatusModal(
                    'Unsupported Currency',
                    `The selected currency (${checkoutCurrency}) is not enabled for this merchant. Allowed: ${SUPPORTED_CHECKOUT_CURRENCIES.join(', ')}. Switched to ${DEFAULT_CHECKOUT_CURRENCY}. Please retry payment.`,
                    'info'
                );
                return;
            }
            openStatusModal('Payment Failed', message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleAutoRenewal = async (value: boolean) => {
        try {
            const updated = await paymentService.updateAutoRenew({ auto_renew: value });
            setIsAutoRenewalEnabled(updated.auto_renew);
        } catch (error: any) {
            openStatusModal(
                'Auto-Renew Failed',
                getErrorMessage(error, 'Could not update auto-renew preference.'),
                'error'
            );
        }
    };

    const handleSelectMethod = async (id: string) => {
        try {
            setSelectedMethodId(id);
            await paymentService.setDefaultPaymentMethod(Number(id));
            await loadWalletData();
        } catch (error: any) {
            openStatusModal(
                'Payment Method',
                getErrorMessage(error, 'Could not set default payment method.'),
                'error'
            );
        }
    };

    return (
        <Screen>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="pt-2">
                    <PaymentStatusCard
                        status={paymentStatus}
                        amount={currentMonthAmount}
                        nextDueDate={nextDueDate}
                        onPayPress={handlePayNow}
                        isProcessing={isProcessing}
                        canPayNow={canPayNow}
                        payDisabledReason={payDisabledReason}
                        checkoutQuoteLabel={checkoutQuoteLabel}
                    />

                    <PaymentMethodList
                        methods={methods.map((m) => ({
                            ...m,
                            is_default: m.id === selectedMethodId,
                        }))}
                        onSelectMethod={handleSelectMethod}
                    />

                    <AutoRenewalToggle
                        isEnabled={isAutoRenewalEnabled}
                        onToggle={handleToggleAutoRenewal}
                    />

                    <TransactionHistoryList
                        transactions={transactions}
                    />
                </View>
            </ScrollView>

            <StatusModal
                visible={statusModal.visible}
                title={statusModal.title}
                message={statusModal.message}
                variant={statusModal.variant}
                onClose={closeStatusModal}
            />
        </Screen>
    );
}
