import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    content: {
        backgroundColor: "#f1f4f9",
        paddingVertical: 30,
        zIndex: 9,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
    },
    msg: {
        color: Colors.textColor,
    },
    form: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        width: "73%",
    },
    button: {
        width: "25%",
    },
    backdrop: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        width: "100%",
        height: "100%",
        position: "absolute",
    },
});