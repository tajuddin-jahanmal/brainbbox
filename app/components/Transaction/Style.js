import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 59,
        padding: 0,
    },
    dateAmountContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "85%",
    },
    dateAmountContainer2: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "65%",
    },
    testStyle: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        paddingHorizontal: 10,
    },
    dateTime: {
        fontSize: 10,
        color: "rgba(0, 0, 0, 0.8)",
        padding: 10,
        textAlignVertical: "center",
        borderRadius: 8,
        width: "36%",
    },
    sameCode: {
        fontWeight: "bold",
        fontSize: 13,
        padding: 10,
        textAlignVertical: "center",
        borderRadius: 6,
        width: "21.3%",
        textAlign: "center",
        // color: Colors.textColor
        color: "rgba(0, 0, 0, 0.7)",
    },
    width32: {
        width: "32%",
    },
    cashIn: {
        // color: Colors.green,
        backgroundColor: "rgba(12, 147, 12, 0.06)",
    },
    cashOut: {
        // color: Colors.primary,
        backgroundColor: "rgba(240, 0, 41, 0.06)",
    },
    runningBalance: {
        // color: Colors.blue,
        color: Colors.green,
        backgroundColor: "rgba(77, 135, 178, 0.09)",
    },
    primaryColor: {
        color: Colors.primary,
    }
});