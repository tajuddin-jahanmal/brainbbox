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
        paddingVertical: 30,
        paddingHorizontal: 15,
        zIndex: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold"
    },
    qrCodeContainer: {
        alignItems: "center",
        rowGap: 10,
        backgroundColor: Colors.white,
        paddingBottom: 10,
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
})