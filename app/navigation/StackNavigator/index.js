import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import CashIn from "../../screens/CashIn";
import CashOut from "../../screens/CashOut";
import Currency from "../../screens/Currency";
import CurrencyRate from "../../screens/CurrencyRate";
import Customers from "../../screens/Customers";
import CustomerProfile from "../../screens/Customers/CustomerProfile";
import DeleteAccount from "../../screens/DeleteAccount";
import Login from "../../screens/Login";
import LoginWithFG from "../../screens/LoginWithFG";
import OppositeTransactions from "../../screens/Opposite/OppositeTransactions";
import Profile from "../../screens/Profile";
import Register from "../../screens/Register";
import SelfCash from "../../screens/SelfCash";
import BottomNavigator from "../BottomNavigator";

const Stack = createStackNavigator();

const StackNavigator = () =>
	{
	const context = useContext(ExchangeMoneyContext);

	return (
		context.localAuth ?
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{
				context.login ?
				<>
					{
						(context.customer || context.isGuest) ?
						<>
							<Stack.Screen name="BottomNavigator" component={BottomNavigator} />
							<Stack.Screen name="SelfCash" component={SelfCash} />
							<Stack.Screen name="CashIn" component={CashIn} />
							<Stack.Screen name="CashOut" component={CashOut} />
							<Stack.Screen name="Customers" component={Customers} />
							<Stack.Screen name="CustomerProfile" component={CustomerProfile} />
							<Stack.Screen name="OppositeTransactions" component={OppositeTransactions} />
							<Stack.Screen name="Currency" component={Currency} />
							<Stack.Screen name="CurrencyRate" component={CurrencyRate} />
							<Stack.Screen name="Profile" component={Profile} />
							<Stack.Screen name="DeleteAccount" component={DeleteAccount} />
						</>
						:
						<>
							<Stack.Screen name="Register" component={Register} />
						</>
					}
				</>
				:
				<Stack.Screen name="LoginWithFG" component={LoginWithFG} />
			}
		</Stack.Navigator>
		:
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Login" component={Login} />
		</Stack.Navigator>
	)
};

export default StackNavigator;