import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
    },
    content: {
        height: "100%",
        padding: 10,
    },
    form: {
        marginTop: 10,
        rowGap: 10,
    },
    dropDown: {
        color: Colors.textColor,
        border: "none",
        borderColor: "white",
        backgroundColor: "white",
    },
    dropdopMenu: {
        color: Colors.textColor,
        width: "100%",
        borderColor: "white",
        backgroundColor: "white",
        position: "absolute",
        zIndex: 99,
        top: 45,
    },
    submit: {
        marginTop: 30,
    }
});