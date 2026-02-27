import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    View,
} from 'react-native';

import { AppButton, Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { thresholdGameService } from '@/lib/services/thresholdGameService';
import { DistributionGameActiveResponse } from '@/types/threshold-game.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ThresholdGameScreen = () => {
    const colors = useColors();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [game, setGame] = React.useState<DistributionGameActiveResponse | null>(null);
    const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);

    const screenIn = React.useRef(new Animated.Value(0)).current;
    const scanAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const ctaPulseAnim = React.useRef(new Animated.Value(1)).current;
    const successAnim = React.useRef(new Animated.Value(0)).current;
    const orbAnimOne = React.useRef(new Animated.Value(0)).current;
    const orbAnimTwo = React.useRef(new Animated.Value(0)).current;
    const orbAnimThree = React.useRef(new Animated.Value(0)).current;
    const optionEntranceAnims = React.useRef<Animated.Value[]>([]);

    const hasSubmitted = Boolean(game?.submission.has_submitted || submittedAt);

    React.useEffect(() => {
        let mounted = true;

        const loadGame = async () => {
            try {
                const cycle = await thresholdGameService.getCurrentCycle();
                if (cycle.distribution_state !== 'threshold_met_game_open') {
                    throw new Error('Threshold game is not open right now.');
                }

                if (!cycle.game.exists || !cycle.game.game_id) {
                    throw new Error('No active threshold game right now.');
                }

                const response = await thresholdGameService.getActiveGame(cycle.cycle_id);
                if (!mounted) {
                    return;
                }

                const submission = await thresholdGameService.getMySubmission(response.game_id);
                if (!mounted) {
                    return;
                }

                setGame(response);
                setSelectedOptionId(submission.selected_option_id ?? response.submission.selected_option_id);
                setSubmittedAt(submission.submitted_at ?? response.submission.submitted_at);
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Could not load game.');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadGame();
        return () => {
            mounted = false;
        };
    }, []);

    React.useEffect(() => {
        const entrance = Animated.timing(screenIn, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });

        const scanLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        );

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        );

        const ctaPulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(ctaPulseAnim, { toValue: 1.03, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(ctaPulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        );

        const orbOneLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbAnimOne, { toValue: 1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orbAnimOne, { toValue: 0, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        );
        const orbTwoLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbAnimTwo, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orbAnimTwo, { toValue: 0, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        );
        const orbThreeLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(orbAnimThree, { toValue: 1, duration: 5600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(orbAnimThree, { toValue: 0, duration: 5600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ])
        );

        entrance.start();
        scanLoop.start();
        pulseLoop.start();
        ctaPulseLoop.start();
        orbOneLoop.start();
        orbTwoLoop.start();
        orbThreeLoop.start();

        return () => {
            scanLoop.stop();
            pulseLoop.stop();
            ctaPulseLoop.stop();
            orbOneLoop.stop();
            orbTwoLoop.stop();
            orbThreeLoop.stop();
        };
    }, [screenIn, scanAnim, pulseAnim, ctaPulseAnim, orbAnimOne, orbAnimTwo, orbAnimThree]);

    React.useEffect(() => {
        if (!game) {
            return;
        }

        optionEntranceAnims.current = game.options.map(() => new Animated.Value(0));
        Animated.stagger(
            90,
            optionEntranceAnims.current.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 420,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [game]);

    const handleSubmit = async () => {
        if (!game || !selectedOptionId || hasSubmitted) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await thresholdGameService.submitAnswer(game.game_id, {
                selected_option_id: selectedOptionId,
                client_submitted_at: new Date().toISOString(),
            });

            setSubmittedAt(result.submitted_at);
            setGame((prev) =>
                prev
                    ? {
                        ...prev,
                        submission: {
                            has_submitted: true,
                            selected_option_id: result.selected_option_id,
                            submitted_at: result.submitted_at,
                            locked: result.locked,
                        },
                    }
                    : prev
            );

            Animated.spring(successAnim, {
                toValue: 1,
                speed: 14,
                bounciness: 8,
                useNativeDriver: true,
            }).start();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Screen>
            <Nav title="Threshold Game" />
            <View className="absolute inset-0 overflow-hidden">
                <Animated.View
                    className="absolute rounded-full"
                    style={{
                        width: 220,
                        height: 220,
                        top: 110,
                        left: -50,
                        backgroundColor: `${colors.accent}20`,
                        transform: [
                            { translateY: orbAnimOne.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) },
                            { translateX: orbAnimOne.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
                        ],
                    }}
                />
                <Animated.View
                    className="absolute rounded-full"
                    style={{
                        width: 170,
                        height: 170,
                        top: 300,
                        right: -30,
                        backgroundColor: `${colors.primary}1F`,
                        transform: [
                            { translateY: orbAnimTwo.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
                            { translateX: orbAnimTwo.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
                        ],
                    }}
                />
                <Animated.View
                    className="absolute rounded-full"
                    style={{
                        width: 140,
                        height: 140,
                        bottom: 60,
                        left: 50,
                        backgroundColor: `${colors.warning}25`,
                        transform: [
                            { translateY: orbAnimThree.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
                            { translateX: orbAnimThree.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
                        ],
                    }}
                />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                    <AppText className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
                        Loading game...
                    </AppText>
                </View>
            ) : (
                <Animated.View
                    style={{
                        flex: 1,
                        opacity: screenIn,
                        transform: [
                            {
                                translateY: screenIn.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [18, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 60 }}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primary100]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 18, padding: 14, marginTop: 8 }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 pr-2">
                                    <AppText className="text-xs font-semibold uppercase tracking-wider" color={colors.warning}>
                                        Threshold Met Challenge
                                    </AppText>
                                    <AppText className="text-lg font-bold mt-1" color={colors.white}>
                                        {game?.title ?? 'Guess The Ball Position'}
                                    </AppText>
                                </View>
                                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                    <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.accent}33` }}>
                                        <Ionicons name="sparkles" size={18} color={colors.warning} />
                                    </View>
                                </Animated.View>
                            </View>
                        </LinearGradient>

                        <View
                            className="mt-4 overflow-hidden"
                            style={{
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: `${colors.accent}50`,
                                backgroundColor: colors.backgroundAlt,
                            }}
                        >
                            <ImageBackground
                                source={{ uri: game?.image_url }}
                                resizeMode="cover"
                                style={{ height: 220, justifyContent: 'flex-end' }}
                            >
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)']}
                                    style={{ flex: 1, justifyContent: 'flex-end', padding: 14 }}
                                >
                                    <Animated.View
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: 0,
                                            height: 2,
                                            backgroundColor: `${colors.warning}AA`,
                                            transform: [
                                                {
                                                    translateY: scanAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [4, 200],
                                                    }),
                                                },
                                            ],
                                        }}
                                    />
                                    <View
                                        className="self-start px-3 py-1 rounded-full"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        <AppText className="text-xs font-semibold" color={colors.white}>
                                            Spot The Missing Ball
                                        </AppText>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </View>

                        <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                                Question
                            </AppText>
                            <AppText className="text-lg font-bold mt-1">
                                {game?.prompt_text}
                            </AppText>
                        </View>

                        <View className="mt-4">
                            {game?.options.map((option, index) => {
                                const isSelected = selectedOptionId === option.option_id;
                                const entranceAnim = optionEntranceAnims.current[index];
                                const entranceStyle = entranceAnim
                                    ? {
                                        opacity: entranceAnim,
                                        transform: [
                                            {
                                                translateY: entranceAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [20, 0],
                                                }),
                                            },
                                        ],
                                    }
                                    : undefined;
                                return (
                                    <Animated.View
                                        key={option.option_id}
                                        style={entranceStyle}
                                    >
                                        <AnimatedPressable
                                            onPress={() => !hasSubmitted && setSelectedOptionId(option.option_id)}
                                            style={{
                                                borderRadius: 16,
                                                borderWidth: 1.5,
                                                borderColor: isSelected ? colors.accent : `${colors.border}`,
                                                paddingHorizontal: 14,
                                                paddingVertical: 14,
                                                marginBottom: 10,
                                                backgroundColor: isSelected ? `${colors.accent}20` : colors.background,
                                                opacity: hasSubmitted && !isSelected ? 0.55 : 1,
                                            }}
                                        >
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center flex-1 pr-2">
                                                    <View
                                                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                                        style={{
                                                            backgroundColor: isSelected ? colors.accent : colors.backgroundAlt,
                                                        }}
                                                    >
                                                        <AppText className="font-bold text-sm" color={isSelected ? colors.white : colors.textPrimary}>
                                                            {option.label}
                                                        </AppText>
                                                    </View>
                                                    <AppText className="text-base font-semibold">{option.text}</AppText>
                                                </View>
                                                {isSelected && (
                                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                                )}
                                            </View>
                                        </AnimatedPressable>
                                    </Animated.View>
                                );
                            })}
                        </View>

                        <Animated.View style={{ transform: [{ scale: hasSubmitted ? 1 : ctaPulseAnim }] }}>
                            <AppButton
                                title={hasSubmitted ? 'Answer Submitted' : 'Confirm Answer'}
                                icon={hasSubmitted ? 'checkmark-done-circle' : 'rocket'}
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                disabled={!selectedOptionId || hasSubmitted}
                                fullWidth
                                style={{ marginTop: 6 }}
                            />
                        </Animated.View>

                        {error && (
                            <View
                                className="mt-4 rounded-xl p-3"
                                style={{ backgroundColor: `${colors.error}15`, borderWidth: 1, borderColor: `${colors.error}3A` }}
                            >
                                <AppText className="text-sm" style={{ color: colors.error }}>
                                    {error}
                                </AppText>
                            </View>
                        )}

                        {hasSubmitted && (
                            <Animated.View
                                className="mt-4 rounded-2xl p-4"
                                style={{
                                    backgroundColor: `${colors.success}18`,
                                    borderColor: `${colors.success}55`,
                                    borderWidth: 1,
                                    opacity: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                                    transform: [
                                        {
                                            scale: successAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.92, 1],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="trophy" size={20} color={colors.success} />
                                    <AppText className="ml-2 text-base font-bold" style={{ color: colors.success }}>
                                        Locked In
                                    </AppText>
                                </View>
                                <AppText className="text-sm mt-2">
                                    Your answer is confirmed. Admin will later pick 10 random users from correct answers for boosted winning chance.
                                </AppText>
                            </Animated.View>
                        )}
                    </ScrollView>
                </Animated.View>
            )}
        </Screen>
    );
};

export default ThresholdGameScreen;
