import Toast from "react-native-toast-message";
import ExchangeMoneyProvider from "./ExchangeMoneyContext";
import MainNavigator from "./navigation/MainNavigator";
// import linking from "./utils/Linking";

const AppWrapper = () =>
{
	return (
		<ExchangeMoneyProvider>
			{/* <NavigationContainer linking={linking}> */}
			{/* <NavigationContainer> */}
				<MainNavigator />
			{/* </NavigationContainer> */}
			<Toast />
		</ExchangeMoneyProvider>
	)
};

export default AppWrapper;

// Error Codes
// 1: SocialLogin Page
// 2: Home Page
// 3: AddCustomer Page
// 4: Customers Page
// 5: Opposite Page
// 6: Profile Page
// 7: Register Page

// AppWrapper Added NavigationContaer
// Route "./components/Alerts/index.js" is missing the required default export. Ensure a React component is exported as default.
// In new old zip the sweetAlert is null
// In CashIn i replace the SelectList
// In CashOut i replace the SelectList