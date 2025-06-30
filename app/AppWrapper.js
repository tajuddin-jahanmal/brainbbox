import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import ExchangeMoneyProvider from "./ExchangeMoneyContext";
import MainNavigator from "./navigation/MainNavigator";
// import linking from "./utils/Linking";

const AppWrapper = () =>
{
	return (
		<ExchangeMoneyProvider>
			{/* <NavigationContainer linking={linking}> */}
			<NavigationContainer>
				<MainNavigator />
			</NavigationContainer>
		</ExchangeMoneyProvider>
	)
};

export default AppWrapper;

// Error Codes
// 1: LoginWithFG Page
// 2: Home Page
// 3: AddCustomer Page
// 4: Customers Page
// 5: Opposite Page
// 6: Profile Page
// 7: Register Page