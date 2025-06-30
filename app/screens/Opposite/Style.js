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
    search: {
        marginBottom: 10,
    },
    fromToContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    fromTo: {
        width: "48%",
    },
    showTxtContainer: {
        // backgroundColor: 'blue',
        alignSelf: "flex-end",
        padding: 5,
        
    },
    showTxt: {
        color: Colors.primary,
    },
    hideTxtContainer: {
        position: "absolute",
        right: 10,
        top: 8,
    },
    cashInOutContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginVertical: 10,
    },
    cashInOut: {
        rowGap: 5,
    },
    cashInOutMony: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 15,
    },
    cashIn: {
        color: Colors.green,
    },
    cashOut: {
        color: Colors.primary,
    },
    date: {
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.8)"
    },
    cashIn: {
        color: Colors.green,
    },
    cashOut: {
        color: Colors.primary,
    },
    cashsCotainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        columnGap: 10,
        marginTop: "auto",
    },
    cashButton: {
        width:"48.5%"
    },
    cashInButton: {
        backgroundColor: Colors.green,
    },
    card: {
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
    },
    repeat: {
        padding: 15,
        paddingHorizontal: 30,
        shadowColor: "black",
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    flexRow: {
        flexDirection: "row",
        marginVertical: 3,
    },
    notFoundContainer: {
        marginTop: 30,
    },
    notFound: {
        fontSize: 20,
        color: Colors.textColor,
        textAlign: "center",
    },
});