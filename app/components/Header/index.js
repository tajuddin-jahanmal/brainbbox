import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constant";
import Style from "./Style";
// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Header = (props) =>
{
    // console.log("Rendering [Header.js]");
    return (
        <View {...props} style={{...Style.container, ...props.style}}>
            {!props.noBack && <TouchableOpacity style={Style.backIcon} activeOpacity={0.5} onPress={() => props.goBack()}>
                <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>}
            <View style={Style.titleContainer}>
                <Text style={Style.title}>{props.title}</Text>

                {
                    props.search &&
                    <TouchableOpacity style={Style.searchIcon} activeOpacity={0.6} onPress={props.searchOnPress}>
                        <FontAwesome name="search" size={16} color={Colors.white} />
                    </TouchableOpacity>   
                }
                {
                    props.logout &&
                    <TouchableOpacity style={Style.logoutIcon} activeOpacity={0.6} onPress={props.logoutOnPress}>
                        <MaterialIcons name="logout" size={20} color={Colors.white} />
                    </TouchableOpacity>   
                }
            </View>
        </View>
    )
};

export default React.memo(Header, (next, prev) => (
    next.title === prev.title &&
    next.noBack === prev.noBack
));