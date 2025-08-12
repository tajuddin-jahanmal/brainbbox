import { Platform, StyleSheet } from "react-native";
import Colors from "../../constant";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f4f9" },
  content: { height: "100%", padding: 10 },
  form: {
    marginTop: 10,
    rowGap: 10,
    overflow: "visible",        // important so dropdown can extend
  },

  // Wrapper controls stacking on iOS
  dropdownWrapper: {
    zIndex: 1000,               // iOS cares about parent zIndex
    ...(Platform.OS === "android" ? { elevation: 10 } : null),
  },

  dropDown: {
    borderWidth: 0,             // 'border' is invalid in RN
    borderColor: "white",
    backgroundColor: "white",
    color: Colors.textColor,
  },

  dropdownMenu: {
    width: "100%",
    borderColor: "white",
    backgroundColor: "white",
    color: Colors.textColor,
    // iOS: keep relative positioning so it stacks correctly
    ...(Platform.OS === "ios"
      ? { position: "relative", top: 0, zIndex: 1001 }
      : { position: "absolute", top: 45, zIndex: 1001, elevation: 10 }),
  },

  submit: { marginTop: 30},
});
