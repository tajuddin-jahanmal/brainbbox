import { StyleSheet } from "react-native";
import Colors, { ScreemHeight, ScreenWidth } from "../../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
        // paddingBottom: headHeight + 40,
    },
    content: {
        height: "100%",
        padding: 10,
    },
    form: {
        marginTop: 10,
        rowGap: 8,
    },
    addCustomer: {
        marginTop: 30,
    },
    contactsContainer: {
        width: "100%",
        height: ScreemHeight / 1.6,
        backgroundColor: "#e8e8e8",
        padding: 5,
        position: "absolute",
        top: 120,
        zIndex: 99,
    },
    contact: {
        marginBottom: 5,
    },
    phoneNumber: {
        color: Colors.textColor,
        fontSize: 12,
        marginLeft: 5,
    },
    disNone: {
        height: 0,
        display: 'none',
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
});