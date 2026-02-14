import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

import { NextDrawCountdown } from '@/components/home';
import { useColors } from '@/config';


import AppText from '@/components/ui/AppText';
interface CurrentCycleBannerProps {
    nextDrawDate: string;
    totalPool: number;
    beneficiariesCount: number;
}

const CurrentCycleBanner = ({ nextDrawDate, totalPool, beneficiariesCount }: CurrentCycleBannerProps) => {
    const colors = useColors();

    return (
        <LinearGradient
            colors={[colors.primary, '#2C3E50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4 mb-6 mt-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, borderRadius: 20 }}
        >
            <View className="flex-row justify-between items-start mb-6">
                <View>
                    <AppText className="text-white/80 text-sm mb-1 uppercase tracking-wider font-bold">
                        Current Cycle Pool
                    </AppText>
                    <AppText className="text-white text-4xl font-extrabold">
                        ${totalPool.toLocaleString()}
                    </AppText>
                </View>
                <View className="bg-white/20 p-2 rounded-full">
                    <Ionicons name="infinite" size={24} color="#FFF" />
                </View>
            </View>

            <View className="bg-black/20 rounded-2xl p-2 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <AppText className="text-white/90 font-bold">Next Selection In</AppText>
                    <Ionicons name="time-outline" size={16} color="#FFF" />
                </View>
                {/* Reusing existing countdown logic */}
                <NextDrawCountdown
                    drawDate={new Date(nextDrawDate)}
                    prizeAmount={`$${totalPool.toLocaleString()}`}
                />
            </View>

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="people" size={18} color="#FFF" />
                    <AppText className="text-white ml-2 font-medium">
                        {beneficiariesCount} Beneficiaries to be selected
                    </AppText>
                </View>
            </View>
        </LinearGradient>
    );
};

export default CurrentCycleBanner;
