import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
        zIndex: 99,
    },
    card: {
        // backgroundColor: "#f1f4f9",
        paddingVertical: 20,
        paddingHorizontal: 15,
        zIndex: 10,
    },
    buttonsCard: {
        paddingTop: 5,
        paddingBottom: 20,
        paddingHorizontal: 15,
        zIndex: 10,
        marginTop: -6,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    paymentRe: {
        fontWeight: "bold",
        fontSize: 16,
        color: Colors.textColor,
        marginBottom: 10,
    },
    details: {
        alignItems: 'center',
    },
    cash: {
        fontSize: 22,
        color: Colors.green,
        fontWeight: "bold",
    },
    date: {
        color: Colors.textColor,
    },
    reminded: {
        fontSize: 16,
        color: Colors.textColor,
        marginTop: 10,
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
    share: {
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