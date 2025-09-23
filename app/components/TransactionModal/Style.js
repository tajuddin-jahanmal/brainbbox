import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
        position: "relative",
        zIndex: 999
    },
    card: {
        // backgroundColor: "#f1f4f9",
        paddingVertical: 20,
        paddingHorizontal: 15,
        zIndex: 10,
    },
    tranInfo: {
        fontWeight: "bold",
        fontSize: 16,
        color: Colors.textColor,
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "start",
        marginVertical: 3,
        // width: "100%",
    },
    cashIn: {
        color: Colors.green,
        fontWeight: "bold",
    },
    cashOut: {
        color: Colors.primary,
        fontWeight: "bold",
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: 10,
    },
    dismiss: {
        width: 100,
        backgroundColor: "#616380b8"
    },
    delete: {
        width: 100,
        backgroundColor: Colors.primary
    },
    backdrop: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        width: "100%",
        height: "100%",
        position: "absolute",
    },
});