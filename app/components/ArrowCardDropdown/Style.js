import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    arrowCard: {
        marginTop: 5,
        padding: 0,
        backgroundColor: Colors.white,
    },
    disabledArrowCard: {
        backgroundColor: Colors.disabledBG,
    },
    titleContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
    },
    chevron: {
        transform: [{rotate: "90deg"}],
    },
    contentContainer: {
        padding: 0,
        marginHorizontal: 10,
    },
    content: {
        backgroundColor: "rgba(0, 0, 0, 0.03)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 13,
        marginVertical: 1,
    },
    subContent: {
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        flexDirection: "row",
        marginVertical: 1,
        marginLeft: 5,
    },
});