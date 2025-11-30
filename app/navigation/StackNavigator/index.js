import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import AccountDeletion from "../../screens/AccountDeletion";
import CashIn from "../../screens/CashIn";
import CashOut from "../../screens/CashOut";
import Currency from "../../screens/Currency";
import CurrencyRate from "../../screens/CurrencyRate";
import Customers from "../../screens/Customers";
import CustomerTransactions from "../../screens/Customers/CustomerTransactions";
import Login from "../../screens/Login";
import OppositeTransactions from "../../screens/Opposite/OppositeTransactions";
import Profile from "../../screens/Profile";
import Register from "../../screens/Register";
import SelfCash from "../../screens/SelfCash";
import SocialLogin from "../../screens/SocialLogin";
import BottomNavigator from "../BottomNavigator";

const Stack = createStackNavigator();

const StackNavigator = () =>
	{
	const context = useContext(ExchangeMoneyContext);

	return (
		context.localAuth ?
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{
				context?.login ?
				<>
					{
						(context.customer || context.isGuest) ?
						<>
							<Stack.Screen name="BottomNavigator" component={BottomNavigator} />
							<Stack.Screen name="SelfCash" component={SelfCash} />
							<Stack.Screen name="CashIn" component={CashIn} />
							<Stack.Screen name="CashOut" component={CashOut} />
							<Stack.Screen name="Customers" component={Customers} />
							<Stack.Screen name="CustomerTransactions" component={CustomerTransactions} />
							<Stack.Screen name="OppositeTransactions" component={OppositeTransactions} />
							<Stack.Screen name="Currency" component={Currency} />
							<Stack.Screen name="CurrencyRate" component={CurrencyRate} />
							<Stack.Screen name="Profile" component={Profile} />
							<Stack.Screen name="AccountDeletion" component={AccountDeletion} />
						</>
						:
						<>
							<Stack.Screen name="Register" component={Register} />
						</>
					}
				</>
				:
				<Stack.Screen name="SocialLogin" component={SocialLogin} />
			}
		</Stack.Navigator>
		:
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Login" component={Login} />
		</Stack.Navigator>
	)
};

export default StackNavigator;