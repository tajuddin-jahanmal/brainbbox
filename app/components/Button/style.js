import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        width: "100%",
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        // This code is for Shadow
        // ...(Platform.select({
        //     ios: {
        //         shadowColor: "#000",
        //         shadowOffset: { width: 0, height: 2 },
        //         shadowOpacity: 0.15,
        //         shadowRadius: 4,
        //     },
        //     android: {
        //         elevation: 4,
        //     },
        //     default: {
        //         // react-native-web (optional)
        //         boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        //     },
        // }))
    },
    iconTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
    },
    title: {
        color: Colors.white,
        fontSize: 16,
    },
});