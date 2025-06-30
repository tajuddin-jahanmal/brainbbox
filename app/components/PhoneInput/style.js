import { StyleSheet } from "react-native";
import Colors, { ScreemHeight } from "../../constant";

export default StyleSheet.create({
    inputContainer: {
        position: 'relative',
        flexDirection: "row",
        columnGap: 6,
    },
    input: {
        backgroundColor: "white",
        color: Colors.textColor,
        // width: "100%",
        width: "85%",
        minHeight: 50,
        padding: 0,
		paddingHorizontal: 15,
        borderRadius: 10,
    },
    countryCard: {
        paddingHorizontal: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    downIcon: {
        position: "absolute",
        top: 8,
        right: 10,
        backgroundColor: Colors.secondary,
        padding: 6,
        borderRadius: 5,
    },
    contact: {
        marginBottom: 5,
    },
    phoneNumber: {
        color: Colors.textColor,
        fontSize: 12,
        marginLeft: 5,
    },
    recyclerContainer: {
        marginTop: 6,
        width: "100%",
        height: ScreemHeight / 4,
        backgroundColor: "#e8e8e8",
        padding: 5,
        zIndex: 99,
        borderRadius: 8,
    },
    noContactContainer: {
        marginTop: ScreemHeight / 9,
    },
    noContact: {
        fontSize: 18,
        color: Colors.textColor,
        textAlign: "center",
    },
});
