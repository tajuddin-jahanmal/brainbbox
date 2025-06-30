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
    // selectCurrencyContainer: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    // },
    // dropDown: {
    //     color: Colors.textColor,
    //     width: ScreenWidth / 2 - 20,
    //     border: "none",
    //     borderColor: Colors.white,
    //     backgroundColor: Colors.white,
    // },
    // dropdopMenu: {
    //     color: Colors.textColor,
    //     width: ScreenWidth / 2 - 20,
    //     borderColor: Colors.white,
    //     backgroundColor: Colors.white,
    //     position: "absolute",
    //     zIndex: 99,
    //     top: 45,
    // },
    flatListContent: {
        gap: 5,
    },
    chartContainer: {
        marginVertical: 10,
    },
    province: {
        color: Colors.textColor,
        fontWeight: "bold",
    },
    rateContainerHeader: {
        flexDirection: "row",
        // justifyContent: "space-around",
        // alignItems: "center",
        marginBottom: 3,
        shadowColor: '#1d1b1b87',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    rateContainer: {
        // flexDirection: "row",
        // justifyContent: "space-around",
        marginBottom: 3,
        backgroundColor: "rgba(255, 255, 255, 0.8)",

        // shadowColor: '#1d1b1b0f',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 2,
        // elevation: 1,
    },
    rateWrapper: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    dateTime: {
        fontSize: 10,
        color: "rgba(0, 0, 0, 0.8)",
        // padding: 10,
        // textAlignVertical: "center",
        // borderRadius: 8,
        // width: "36%",
    },
    provinceCard: {
        shadowColor: '#1d1b1b0f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    currenciesContainer: {
        width: "33%",
        flexDirection: "row",
        alignContent: "center",
        justifyContent: 'center',
    },
    item: {
        textAlign: 'center',
        width: "33%",
        color: Colors.textColor,
        fontWeight: 'bold',
    },
    backgroundImage: {
        width: '100%',
        // height: ScreemHeight / 2.2,
        flex: 1,
        // opacity: 0.5
        borderRadius: 10,
        overflow: 'hidden',
    },
    currenyItem: {
        width: "33%",
        color: Colors.textColor,
        textAlign: "center",
        fontWeight: 'bold',
    },
    inputContainer: {
        // flexDirection: "row",
        marginTop: 10,
    },
    inputWrapper: {
        width: "70%",
        flexDirection: "row",
        // rowGap: 5,
        marginBottom: 10,
        // zIndex: 99,
    },
    currencyTxt: {
        color: Colors.textColor,
        fontWeight: "bold",
        padding: 5,
    },
    selectCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dropDown: {
        color: Colors.textColor,
        width: 100,
        border: "none",
        borderColor: Colors.white,
        backgroundColor: Colors.white,
        zIndex: 99,
    },
    dropdopMenu: {
        color: Colors.textColor,
        // width: 70,
        height: 110,
        borderColor: Colors.white,
        backgroundColor: Colors.white,
        position: "absolute",
        zIndex: 99,
        top: -45,
        left: -5,

        shadowColor: '#1d1b1b0f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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