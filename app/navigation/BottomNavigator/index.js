import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors, { isAndroid } from "../../constant";
import CashBook, { CashBookOptions } from "../../screens/CashBook";
import AddCustomer, { AddCustomerOptions } from "../../screens/Customers/AddCustomer";
import General, { GeneralOptions } from "../../screens/General";
import Home, { HomeOptions } from "../../screens/Home";
import Opposite, { OppositeOptions } from "../../screens/Opposite";

const Tab = createBottomTabNavigator();

const BottomNavigator = () =>
{
    const insets = useSafeAreaInsets();
    const isNotchedDevice = insets.bottom > 0;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarStyle: !isAndroid ? {
                    height: isNotchedDevice ? undefined : 60,
                    paddingBottom: isNotchedDevice ? insets.bottom : 10,
                    paddingTop: 5,
                    backgroundColor: 'white',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                } : {},
            }}
        >
            <Tab.Screen name="Home" component={Home} options={HomeOptions} />
            <Tab.Screen name="AddCustomer" component={AddCustomer} options={AddCustomerOptions} />
            <Tab.Screen name="CashBook" component={CashBook} options={CashBookOptions} />
            <Tab.Screen name="Opposite" component={Opposite} options={OppositeOptions} />
            <Tab.Screen name="General" component={General} options={GeneralOptions} />
        </Tab.Navigator>
    );
};

export default BottomNavigator;
