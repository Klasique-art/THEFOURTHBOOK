import React, { ReactNode } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";

import { useColors } from "@/config/colors";

interface AppTextProps extends TextProps {
    children: ReactNode;
    styles?: string;
    className?: string;
    color?: string;
    style?: StyleProp<TextStyle>;
}

const AppText: React.FC<AppTextProps> = ({
    children,
    className = "",
    style,
    color,
    ...otherProps
}) => {
    const colors = useColors();

    // Default to textPrimary color if no color specified
    const textColor = color || colors.textPrimary;

    return (
        <Text
            className={className}
            style={[{ color: textColor }, style]}
            {...otherProps}
        >
            {children}
        </Text>
    );
};

export default AppText;
