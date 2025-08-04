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
        justifyContent: "space-between",
        // marginVertical: 10,
        zIndex: 9,
    },
    cashInOutContent: {
        width: "90%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    cashInOut: {
        rowGap: 5,
        alignItems: "center",
    },
    cashInOutMony: {
        textAlign: "center",
        fontWeight: "bold",
        // fontSize: 15,
    },
    cashIn: {
        color: Colors.green,
        fontWeight: "bold"
    },
    cashOut: {
        color: Colors.primary,
        fontWeight: "bold",
    },
    margin: {
        marginLeft: 30,
    },
    dateTime: {
        fontWeight: "bold",
        width: "33.3%",
        textAlign: "center",
    },
    card: {
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // borderColor: "#f0002959",
        // borderWidth: 1,
    },
    transCard: {
        // marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
        // borderColor: "#f0002959",
        // borderWidth: 1,
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
    date: {
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.8)"
    },
    dateCashinOutContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-evenly',
        marginBottom: 6,
        marginTop: 10,
    },
    flexRow: {
        width: "92%",
        flexDirection: "row",
        marginVertical: 3,
    },
    date: {
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.8)"
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
        zIndex: -9,
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
    paginateCardContainer: {
        flexDirection: "row",
         alignItems: "center",
         justifyContent: "space-between",
    },
    paginateCardStyle: {
        width: 70,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
    },
    dropDown: {
        color: Colors.textColor,
        width: 20,
        // border: "none",
        // borderColor: "white",
        backgroundColor: "white",
    },
    dropdopMenu: {
        color: Colors.textColor,
        width: ScreenWidth - 20,
        borderColor: "white",
        backgroundColor: "white",
        position: "absolute",
        zIndex: 9999,
        top: 45,
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