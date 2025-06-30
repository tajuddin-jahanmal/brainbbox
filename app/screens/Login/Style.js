import { StyleSheet } from "react-native";
import Colors, { ScreenWidth } from "../../constant";

export default StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#f1f4f9",
        // paddingTop: headHeight,
    },
    linearGradient: {
        flex: 1,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    welcomeTxt: {
        // color: Colors.textColor,
        color: Colors.white,
        fontSize: 20,
        marginTop: 30,
        marginLeft: 10,
    },
    protectTxt: {
        marginLeft: 10,
        color: Colors.white,
    },
    textContainer: {
        zIndex: 999,
    },
    circle: {
        width: ScreenWidth / 1.3,
        height: ScreenWidth / 1.3,
        // backgroundColor: "#d0d8db",
        backgroundColor: "transparent",
        position: "absolute",
        top: -ScreenWidth / 3.5,
        left: -ScreenWidth / 3,
        // borderColor: "#d0d8db",
        borderColor: "rgba(208, 216, 219, 0.3)",
        borderWidth: 15,
        borderRadius: ScreenWidth / 2,
        zIndex: 9,
    },
    circle2: {
        zIndex: 9,
        position: "absolute",
        top: -ScreenWidth / 2,
        left: ScreenWidth / 1.3,
    },
    button: {
        marginTop: 'auto',
    },
});