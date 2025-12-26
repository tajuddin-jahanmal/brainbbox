import Ionicons from '@expo/vector-icons/Ionicons';
import React from "react";
import { TouchableOpacity } from "react-native";
import Style from "./Style";

const Add = (props) =>
{
    return (
        <TouchableOpacity {...props} style={{...Style.add, ...props.style}} activeOpacity={0.6}>
            <Ionicons name="add-outline" size={24} color={"white"} />
        </TouchableOpacity>
    )
};

export default Add;