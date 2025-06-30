import { StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
    toggleSwitch: {
        width: 55,
        height: 30,
        borderRadius: 20,
        justifyContent: 'center',
        backgroundColor: '#ddd',
      },
      toggleSwitchOn: {
        // backgroundColor: '#05c46b',
        backgroundColor: Colors.primary,
      },
      switchHandle: {
        width: 20,
        height: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        elevation: 3,
      },
});