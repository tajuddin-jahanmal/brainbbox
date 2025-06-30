import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f1f4f9",
        // paddingBottom: headHeight + 40,
    },
    content: {
        height: "100%",
        padding: 10,
    },
    form: {
        marginTop: 10,
        rowGap: 10,
    },
    button: {
        marginTop: 30,
    },
    phoneContainer: {
        position: 'relative',
        flexDirection: "row",
        columnGap: 6,
    },
    countryCard: {
        paddingHorizontal: 15,
        alignItems: "center",
        justifyContent: "center",
    },
});