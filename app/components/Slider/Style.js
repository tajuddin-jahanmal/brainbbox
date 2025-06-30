import { StyleSheet } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export default StyleSheet.create({
    container: {
        width: "100%",
        height: 180,
        backgroundColor: Colors.white,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        zIndex: 99
    },
    slider: {
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        zIndex: 99,
    },
    // imageContainer: {
    //     width: ScreenWidth - 20,
    //     height: "100%",
    // },
    image: {
        width: "100%",
        height: "100%",
    },
});