import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constant";
import Style from "./style";

const darken = (color, amount = 0.2) => {
    let col = color.replace('#', '');
    const num = parseInt(col, 16);

    let r = (num >> 16) - 255 * amount;
    let g = ((num >> 8) & 0x00FF) - 255 * amount;
    let b = (num & 0x0000FF) - 255 * amount;

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase();
};

const Button  = (props) =>
{
    const userColor = props.style?.backgroundColor || Colors.primary;
    const finalColor = props.disabled ? darken(userColor, 0.20) : userColor;

    return (
        <TouchableOpacity
            {...props}
            style={[
                Style.button,
                props.style,
                { backgroundColor: finalColor }
            ]}
            activeOpacity={props.activeOpacity || 0.6}
        >
            {
				props.isLoading ?
				<ActivityIndicator color={Colors.white} />
				:
                <View style={Style.iconTitleContainer}>
                    {props.icon}
                    <Text style={Style.title}>{props.children}</Text>
                </View>
			}
        </TouchableOpacity>
    )
};

export default React.memo(Button, (next, prev) => (
    next.children === prev.children &&
    next.isLoading === prev.isLoading &&
	next.style === prev.style &&
	next.isActive === prev.isActive &&
	next.onPress === prev.onPress
));