import { StyleSheet } from "react-native";
import Colors, { ScreemHeight } from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
    },
    content: {
        // height: "100%",
        flex: 1,
        padding: 10,
    },
    userInfo: {
        // flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    userName: {
        fontSize: 17,
        fontWeight: "700",
    },
    redCircle: {
        backgroundColor: Colors.primary,
        // width: ScreenWidth * 2,
        // height: ScreenWidth * 2,
        width: ScreemHeight + 100,
        height: ScreemHeight + 100,
        borderRadius: 500,
        position: "absolute",
        top: -ScreemHeight / 1.3,        
        zIndex: 9,
        alignSelf: "center"



        // backgroundColor: Colors.primary,
        // width: ScreenWidth,
        // height: ScreenWidth,
        // borderRadius: 500,
        // position: "absolute",
        // top: -ScreemHeight / 0.9,
        // zIndex: 9,
    },
    currencies: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: 'center',
        marginTop: 0,
        marginBottom: 20,
        position: "relative",
        zIndex: 99
    },
    currencyCard: {
        // backgroundColor: Colors.primary,
        // width: "30%",
        // alignItems: "flex-start",
        // paddingVertical: 7,
    },
    currency: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 15,
    },
    cardsContainer: {
        marginTop: 10,
        flexDirection: "row",
        // justifyContent: 'space-between',
        zIndex: 9
    },
    serviceCard: {
        width: "30%",
        height: 100,
        alignItems: "center",
        justifyContent: 'center',
        marginRight: 20,
        shadowColor: '#1d1b1b0f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    serviceTitle: {
        marginTop: 5,
        fontSize: 15,
        color: Colors.textColor
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
});