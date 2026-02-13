import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import { useColors } from '@/config';
import { DrawWinner } from '@/data/dummy.draws';

interface RecentWinnersCarouselProps {
    winners: DrawWinner[];
}

const RecentWinnersCarousel = ({ winners }: RecentWinnersCarouselProps) => {
    const colors = useColors();
    const width = Dimensions.get('window').width - 32; // Account for padding

    const WinnerCard = ({ winner }: { winner: DrawWinner }) => {
        const formattedAmount = `$${winner.prize_amount.toLocaleString()}`;
        const formattedDate = winner.won_at
            ? new Date(winner.won_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent';

        return (
            <View
                className="rounded-2xl p-5 mr-3"
                style={{
                    backgroundColor: colors.backgroundAlt,
                    width: width * 0.85,
                }}
            >
                <View className="flex-row items-center mb-4">
                    <View
                        className="w-16 h-16 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.accent50 }}
                    >
                        <Ionicons name="person" size={32} color={colors.accent} />
                    </View>
                    <View className="flex-1 ml-3">
                        <Text
                            className="text-lg font-bold mb-1"
                            style={{ color: colors.textPrimary }}
                        >
                            {winner.user_identifier}
                        </Text>
                        <View className="flex-row items-center">
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: winner.payout_status === 'completed'
                                        ? colors.success + '20'
                                        : colors.warning + '20'
                                }}
                            >
                                <Text
                                    className="text-xs font-bold uppercase"
                                    style={{
                                        color: winner.payout_status === 'completed'
                                            ? colors.success
                                            : colors.warning
                                    }}
                                >
                                    {winner.payout_status}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.warning + '20' }}
                    >
                        <Ionicons name="trophy" size={20} color={colors.warning} />
                    </View>
                </View>

                <View
                    className="rounded-xl p-4"
                    style={{ backgroundColor: colors.accent50 }}
                >
                    <Text
                        className="text-sm mb-2"
                        style={{ color: colors.primary }}
                    >
                        Prize Amount
                    </Text>
                    <Text
                        className="text-3xl font-bold mb-1"
                        style={{ color: colors.success }}
                    >
                        {formattedAmount}
                    </Text>
                    <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={12} color={colors.white} />
                        <Text
                            className="text-xs ml-1"
                            style={{ color: colors.white }}
                        >
                            {formattedDate}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (winners.length === 0) {
        return (
            <View className="mb-6">
                <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.textPrimary }}
                >
                    Our Recent Winners
                </Text>
                <View
                    className="rounded-2xl p-8 items-center"
                    style={{ backgroundColor: colors.backgroundAlt }}
                >
                    <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} />
                    <Text
                        className="text-center mt-3"
                        style={{ color: colors.textSecondary }}
                    >
                        No winners yet, but that could change with the next draw. Will it be you?
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
                <Text
                    className="text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                >
                    Celebrating Our Winners
                </Text>
                <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                >
                    {winners.length} lives changed
                </Text>
            </View>

            <Carousel
                width={width}
                height={250}
                data={winners}
                renderItem={({ item }: { item: DrawWinner }) => <WinnerCard winner={item} />}
                loop={winners.length > 1}
                autoPlay={winners.length > 1}
                autoPlayInterval={4000}
                scrollAnimationDuration={800}
            />
        </View>
    );
};

export default RecentWinnersCarousel;
