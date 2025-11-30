import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
    },
    content: {
        flex: 1,
        padding: 10,
    },
    founder: {
        color: Colors.textColor,
        fontSize: 13,
        textAlign: "center",
        marginTop: "auto",
        marginBottom: 10,
    },
    
    arrowCard: {
        marginTop: 5,
        padding: 0,
    },
    titleContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 13,
    },
});