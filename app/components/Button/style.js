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