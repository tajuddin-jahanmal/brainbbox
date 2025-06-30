import AsyncStorage from "@react-native-async-storage/async-storage";
import language from "../../localization";

async function LanguageFunction ()
{
    const isLanguageExist = JSON.parse(await AsyncStorage.getItem("@language"));
    if (isLanguageExist === null)
      await AsyncStorage.setItem("@language", JSON.stringify({language: "en"}));

    if (isLanguageExist)
    {
      switch (isLanguageExist.language) {
        case "en":
          language.setLanguage("en");
          await AsyncStorage.setItem("@language", JSON.stringify({language: "en"}));
          break;
        case "ps":
          language.setLanguage("ps");
          await AsyncStorage.setItem("@language", JSON.stringify({language: "ps"}));
          break;
        case "pe":
          language.setLanguage("pe");
          await AsyncStorage.setItem("@language", JSON.stringify({language: "pe"}));
          break;
      }
    }
};

export default LanguageFunction;