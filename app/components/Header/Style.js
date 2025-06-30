import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        // paddingTop: headHeight,
        flexDirection: 'row',
        alignItems: "center",
        paddingHorizontal: 10,
        zIndex: 99,
    },
    backIcon: {
        padding: 6,
        paddingLeft: -3,
    },
    titleContainer: {
        width: '100%',
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
    },
    title: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "bold",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    searchIcon: {
        justifyContent: 'flex-start',
        // backgroundColor: 'cyan',
        padding: 10,
    },
    logoutIcon: {
        padding: 10,
        marginRight: 26,
    }
});