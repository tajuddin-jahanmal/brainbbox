import { StyleSheet } from "react-native";
import Colors, { ScreenWidth } from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
    },
    content: {
        flex: 1,
        padding: 10,
    },
    selectorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    dropDown: {
        color: Colors.textColor,
        width: ScreenWidth - 20,
        border: "none",
        borderColor: "white",
        backgroundColor: "white",
    },
    dropdopMenu: {
        color: Colors.textColor,
        width: ScreenWidth - 20,
        borderColor: "white",
        backgroundColor: "white",
        position: "absolute",
        zIndex: 99,
        top: 45,
    },
    card: {
        marginBottom: 10,
    },
    flexRow: {
        width: "92%",
        flexDirection: "row",
        marginVertical: 3,
    },
    time: {
        marginLeft: 25,
    },
    changeCurrencyContainer: {
        marginTop: 30,
        marginHorizontal: 30,
    },
    changeCurrency: {
        fontSize: 18,
        color: Colors.textColor,
        textAlign: "center",
    },
});