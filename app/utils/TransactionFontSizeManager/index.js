import { Dimensions } from "react-native";

function GetResponsiveFontSize(amount) {
  const length = String(amount).length;
  const baseFontSize = 13;

  if (length <= 6) return baseFontSize;       // 6 digits or less = default size
  if (length === 7) return baseFontSize - 1;  // 7 digits = 12
  if (length === 8) return baseFontSize - 2;  // 8 digits = 11
  if (length === 9) return baseFontSize - 3;  // 9 digits = 10
  return baseFontSize - 4;  
};

export default GetResponsiveFontSize;