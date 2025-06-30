import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
        // paddingBottom: headHeight,
    },
    content: {
        height: "100%",
        padding: 10,
    },
    form: {
        marginTop: 10,
        rowGap: 10,
    },
    button: {
        marginTop: 30,
        zIndex: 99
    },
    dataDeleteMsg: {
        color: Colors.textColor,
        fontSize: 13,
    },
    founder: {
        color: Colors.textColor,
        fontSize: 13,
        textAlign: "center",
        marginTop: "auto",
        marginBottom: 45,
    },
});