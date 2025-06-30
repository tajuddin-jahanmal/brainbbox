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
    cashInOutContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    hideTxtContainer: {
        position: "absolute",
        right: 10,
        top: 8,
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
        fontWeight: "bold"
    },
    cashOut: {
        color: Colors.primary,
        fontWeight: "bold"
    },
    card: {
        // marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // borderColor: "#f0002959",
        // borderWidth: 1,
    },
    flexRow: {
        width: "92%",
        flexDirection: "row",
        marginVertical: 3,
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
    dateTime: {
        fontWeight: "bold"
    },
    margin: {
        marginLeft: 30,
    },
    dateCashinOutContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-evenly',
        marginBottom: 6
    },
    date: {
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.8)"
    },
    date: {
        fontSize: 12,
        color: "rgba(0, 0, 0, 0.8)"
    },
    fromToContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginBottom: 10,
    },
    fromTo: {
        width: "48%",
    },
    showTxtContainer: {
        alignSelf: "flex-end",
        padding: 5,
    },
    showTxt: {
        color: Colors.primary,
    },
    actionCard: {
        marginTop: -30,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
		cashIn: {
			color: Colors.green,
			fontWeight: "bold"
	},
	cashOut: {
			color: Colors.primary,
			fontWeight: "bold"
	},
    paginateCardContainer: {
        flexDirection: "row",
         alignItems: "center",
         justifyContent: "space-between",
    },
    paginateCardStyle: {
        width: 60,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
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
    noDataContainer: {
        marginTop: 30,
    },
    noData: {
        fontSize: 20,
        color: Colors.textColor,
        textAlign: "center",
    },
});