import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    container: {
        position: 'absolute',
        right: 15,
        zIndex: 9999
    },
    thressDotContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.03)",
        padding: 10,
        borderRadius: 50,
    },
    card: {
        position: "absolute",
        top: 40,
        width: 150,
        right: 0,
        padding: 10,
        backgroundColor: Colors.white,
        zIndex: 9999
    },
    contentCard: {
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 6,
    },
});