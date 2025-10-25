import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect } from "react";
import { Text, View } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import Button from "../../components/Button";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import Style from "./Style";


const Login = (props) =>
{
	const isFocused = useIsFocused()
	const { navigate } = props.navigation;
	const context = useContext(ExchangeMoneyContext);

	const biometricHandler = async () =>
	{
		const isCorrect = await context.handleBiometricAuth();
		if (isCorrect.success)
			navigateFunction();
	};

	useEffect(() => {
		(async () =>
		{
			const appLock = JSON.parse(await AsyncStorage.getItem("@appLock"));
			if (appLock === false)
				return navigateFunction();
			biometricHandler();
		})();
	}, []);

	function navigateFunction () {
		context.setNewState(true, "localAuth");
		// navigate("SocialLogin") // i comment this becuase then in context the localAuth is set to true they auto navigate to SocialLogin
	}



	// const biometricHandler = async () =>
	// {
	// 	const isCorrect = await context.handleBiometricAuth();

	// 	if (isCorrect.success)
	// 	{
	// 		context.setNewState(true, "localAuth");
	// 		navigate("SocialLogin")
	// 	}
	// };

	// useEffect(() => {
	// 	biometricHandler();
	// }, []);

	return isFocused ? (
		<View style={{...Style.container}}>
			 <LinearGradient
				colors={['#f00029', '#ffd7d7', '#ffffff']}
				style={Style.linearGradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
			<View style={Style.content}>
				<View style={Style.circle} />
				<View style={[Style.circle, Style.circle2]} />

				<View style={Style.textContainer}>
					<Text style={Style.welcomeTxt}>{language.welcomeToLogin}</Text>
					<Text style={Style.protectTxt}>{language.protectYourData}</Text>
				</View>

				<Button style={Style.button} onPress={biometricHandler}>{language.biometricLogin}</Button>
			</View>
			</LinearGradient>
		</View>
	) : null;
};

export default Login;