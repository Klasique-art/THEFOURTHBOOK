import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

import { useColors } from "@/config/colors";
import AppText from "./AppText";

interface NavProps {
    title?: string;
    onPress?: () => void;
    showProfile?: boolean;
    profileImage?: string;
}

const Nav = ({ title = "", onPress, showProfile = false, profileImage }: NavProps) => {
    const colors = useColors();

    return (
        <View
            style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
            }}
            className="w-full flex-row items-center justify-between py-3 px-4 mb-2 rounded-2xl shadow-sm border"
        >
            <TouchableOpacity
                style={{ backgroundColor: `${colors.primary}15` }}
                className="w-10 h-10 rounded-full items-center justify-center"
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="back"
                accessibilityHint="press to go back"
                onPress={() => {
                    if (onPress) {
                        onPress();
                    } else {
                        router.back();
                    }
                }}
            >
                <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </TouchableOpacity>

            <AppText styles="flex-1 text-center font-semibold text-base">{title}</AppText>

            {showProfile && profileImage ? (
                <View style={{ borderColor: colors.primary }} className="border w-10 h-10 rounded-full">
                    <Image
                        source={{ uri: profileImage }}
                        className="w-full h-full rounded-full"
                        accessibilityLabel="User profile picture"
                    />
                </View>
            ) : (
                <View className="w-10" />
            )}
        </View>
    );
};

export default Nav;
