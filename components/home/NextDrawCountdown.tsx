import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Easing, View } from 'react-native';

import { useColors } from '@/config';
import AppButton from '@/components/ui/AppButton';

import AppText from '@/components/ui/AppText';
interface NextDrawCountdownProps {
    currentPool: number;
    threshold: number;
    beneficiariesCount: number;
    onPlayGame?: () => void;
}

const NextDrawCountdown = ({ currentPool, threshold, beneficiariesCount, onPlayGame }: NextDrawCountdownProps) => {
    const colors = useColors();
    const [simulatedPool, setSimulatedPool] = React.useState(currentPool);
    const progressPercent = Math.min((simulatedPool / threshold) * 100, 100);
    const remaining = Math.max(threshold - simulatedPool, 0);
    const prizePerBeneficiary = threshold / beneficiariesCount;
    const isThresholdMet = simulatedPool >= threshold;

    const fillAnim = React.useRef(new Animated.Value(progressPercent)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.timing(fillAnim, {
            toValue: progressPercent,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [fillAnim, progressPercent]);

    React.useEffect(() => {
        if (!isThresholdMet) {
            return;
        }

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 700,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        loop.start();
        return () => loop.stop();
    }, [isThresholdMet, pulseAnim]);

    const handleSimulateThreshold = () => {
        setSimulatedPool(threshold);
    };

    return (
        <LinearGradient
            colors={[colors.accent, colors.accent100]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-2 mb-6"
            style={{ borderRadius: 16 }}
        >
            <View className="flex-row items-center mb-4">
                <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-1"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                    <Ionicons name="speedometer-outline" size={16} color="#FFFFFF" />
                </View>
                <AppText className="text-lg font-bold" color={colors.white}>
                    Distribution Trigger Progress
                </AppText>
            </View>

            {isThresholdMet ? (
                <Animated.View
                    className="rounded-2xl p-4"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        transform: [{ scale: pulseAnim }],
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="mr-3 flex-1">
                            <AppText className="text-lg font-bold" color={colors.white}>
                                Threshold Met
                            </AppText>
                            <AppText className="text-xs mt-1" color={colors.white}>
                                Play this game to get higher chance of winning the next distribution.
                            </AppText>
                        </View>
                        <Ionicons name="trophy" size={24} color={colors.white} />
                    </View>

                    <AppButton
                        title="Play Game"
                        icon="game-controller"
                        onClick={onPlayGame}
                        fullWidth
                        style={{ marginTop: 12, backgroundColor: colors.primary }}
                    />
                </Animated.View>
            ) : (
                <>
                    <View className="items-center mb-4">
                        <AppText className="text-sm mb-2" color={colors.white}>
                            Current Collective Pool
                        </AppText>
                        <AppText className="text-4xl font-bold" color={colors.white}>
                            ${simulatedPool.toLocaleString()}
                        </AppText>
                        <AppText className="text-xs mt-1" color={colors.white}>
                            Distribution runs automatically at ${threshold.toLocaleString()}
                        </AppText>
                    </View>

                    <View className="mb-3">
                        <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }}>
                            <Animated.View
                                className="h-full rounded-full"
                                style={{
                                    width: fillAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                        </View>
                        <View className="mt-2 flex-row items-center justify-between">
                            <AppText className="text-xs" color={colors.white}>
                                {progressPercent.toFixed(1)}% reached
                            </AppText>
                            <AppText className="text-xs" color={colors.white}>
                                ${remaining.toLocaleString()} remaining
                            </AppText>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                        <AppText className="text-xs" color={colors.white}>
                            {beneficiariesCount} beneficiaries
                        </AppText>
                        <AppText className="text-xs" color={colors.white}>
                            ${prizePerBeneficiary.toLocaleString()} each
                        </AppText>
                    </View>

                    <AppButton
                        title="Test: hit $1M now"
                        variant="outline"
                        size="sm"
                        icon="flash"
                        onClick={handleSimulateThreshold}
                        fullWidth
                        style={{ marginTop: 12, borderColor: colors.white }}
                    />
                </>
            )}
        </LinearGradient>
    );
};

export default NextDrawCountdown;

