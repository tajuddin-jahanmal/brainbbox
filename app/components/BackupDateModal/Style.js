import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
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
    fromToContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    fromTo: {
        width: "48%",
        backgroundColor: "#f1f4f9"
    },
    storeBackupMsg: {
        color: Colors.textColor,
        fontSize: 12,
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: 20,
    },
    dismiss: {
        width: 100,
        backgroundColor: "#616380b8"
    },
    backup: {
        width: 120,
        // backgroundColor: "#e74c3c",
        backgroundColor: Colors.primary,
    },
    backdrop: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        width: "100%",
        height: "100%",
        position: "absolute",
    },
});