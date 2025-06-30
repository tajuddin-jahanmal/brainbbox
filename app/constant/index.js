import Constants from "expo-constants";
import { Dimensions, Platform } from "react-native";

export default {
    primary: "#f00029",
    secondary: "#f1f4f9",
    blue: "#4d87b2",
    textColor: "#616380",
    white: "#ffffff",
    green: "#0c930c",
    active: "#f5c518",
}

export const headHeight = Constants.statusBarHeight;
export const ScreenWidth = Dimensions.get("screen").width;
export const ScreemHeight = Dimensions.get("screen").height;
export const isAndroid = Platform.OS === "android";
