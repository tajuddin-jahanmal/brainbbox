import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constant";
import Style from "./style";

const Button  = (props) =>
{
    return (
        <TouchableOpacity {...props} style={{...Style.button, ...props.style}} activeOpacity={props.activeOpacity || 0.6}>
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