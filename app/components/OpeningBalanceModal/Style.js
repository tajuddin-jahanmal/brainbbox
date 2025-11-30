import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
        position: "relative",
        zIndex: 999,
    },
    card: {
        backgroundColor: "#f4f4f4ff",
        paddingVertical: 20,
        paddingHorizontal: 15,
        zIndex: 10,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        color: Colors.textColor,
        marginBottom: 10,
    },
    balanceContainer: {
        flexDirection: "row",
        marginVertical: 5,
    },
    currencyCode: {
        backgroundColor: "white",
        textAlign: "center",
        textAlignVertical: "center",
        width: 50,
        borderRadius: 10,
        marginRight: 5,
    },
    balance: {
        width: "85%",
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
    save: {
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