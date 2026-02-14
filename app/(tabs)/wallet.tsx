import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Screen } from '@/components';
import {
    AutoRenewalToggle,
    PaymentMethodList,
    PaymentStatusCard,
    TransactionHistoryList
} from '@/components/wallet';
import { mockContributions, mockPaymentMethods } from '@/data/contributions.dummy';

export default function WalletScreen() {
    const router = useRouter();

    // Simulated State
    const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(false);
    const [selectedMethodId, setSelectedMethodId] = useState(mockPaymentMethods.find(m => m.is_default)?.id || mockPaymentMethods[0].id);
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'processing'>('unpaid');
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock Data
    const currentMonthAmount = 20.00;
    const nextDueDate = '2026-03-01';

    const handlePayNow = () => {
        setIsProcessing(true);
        setPaymentStatus('processing');

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentStatus('paid');
            Alert.alert("Success", "Your contribution for this month has been received!");
        }, 2000);
    };

    const handleAddMethod = () => {
        Alert.alert("Add Payment Method", "This would open a Paystack/Card entry modal.");
    };

    const handleToggleAutoRenewal = (value: boolean) => {
        setIsAutoRenewalEnabled(value);
        if (value) {
            Alert.alert("Auto-Renewal Enabled", "We'll automatically deduct $20 on the 1st of each month.");
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
                    />

                    <PaymentMethodList
                        methods={mockPaymentMethods.map(m => ({
                            ...m,
                            is_default: m.id === selectedMethodId
                        }))}
                        onAddPress={handleAddMethod}
                        onSelectMethod={setSelectedMethodId}
                    />

                    {/* <AutoRenewalToggle
                        isEnabled={isAutoRenewalEnabled}
                        onToggle={handleToggleAutoRenewal}
                    /> */}

                    <TransactionHistoryList
                        transactions={mockContributions}
                    />
                </View>
            </ScrollView>
        </Screen>
    );
}

