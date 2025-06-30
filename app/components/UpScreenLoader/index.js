import React from "react";
import { ActivityIndicator, View } from "react-native";
import Constant from "../../constant";

const UpScreenLoader = (props) =>
{
    return (
        <View style={{position: "absolute", zIndex: 999, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.3)", justifyContent: "center", alignItems: "center"}}>
            <View style={{width: 200, height: 100, backgroundColor: "white", elevation: 2, borderRadius: 10, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator size={"small"} color={Constant.primary} />
            </View>
        </View>
    )
}

export default UpScreenLoader;