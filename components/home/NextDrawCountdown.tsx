import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';


import AppText from '@/components/ui/AppText';
interface NextDrawCountdownProps {
    drawDate: Date;
    prizeAmount: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const NextDrawCountdown = ({ drawDate, prizeAmount }: NextDrawCountdownProps) => {
    const colors = useColors();
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = drawDate.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [drawDate]);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <View className="items-center">
            <View
                className="w-16 h-16 rounded-xl items-center justify-center mb-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
                <AppText className="text-white text-2xl font-bold">
                    {value.toString().padStart(2, '0')}
                </AppText>
            </View>
            <AppText className="text-white/70 text-xs uppercase">
                {label}
            </AppText>
        </View>
    );

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
                    <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                </View>
                <AppText className="text-white text-lg font-bold">
                    Our Next Draw Countdown
                </AppText>
            </View>

            <View className="items-center mb-4">
                <AppText className="text-white/80 text-sm mb-2">
                    Our Collective Prize Pool
                </AppText>
                <AppText className="text-white text-4xl font-bold">
                    {prizeAmount}
                </AppText>
                <AppText className="text-white/70 text-xs mt-1">
                    Changing 5 lives from our community
                </AppText>
            </View>

            <View className="flex-row justify-around mt-4">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <TimeUnit value={timeLeft.minutes} label="Mins" />
                <TimeUnit value={timeLeft.seconds} label="Secs" />
            </View>
        </LinearGradient>
    );
};

export default NextDrawCountdown;
