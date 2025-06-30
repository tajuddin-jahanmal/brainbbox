import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Colors from "../../constant";
import CashBook, { CashBookOptions } from "../../screens/CashBook";
import AddCustomer, { AddCustomerOptions } from "../../screens/Customers/AddCustomer";
import General, { GeneralOptions } from "../../screens/General";
import Home, { HomeOptions } from "../../screens/Home";
import Opposite, { OppositeOptions } from "../../screens/Opposite";

const Tab = createBottomTabNavigator();

const BottomNavigator = () =>
{
    return (
        <Tab.Navigator screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
            }}>
            <Tab.Screen name="Home" component={Home} options={HomeOptions} />
            <Tab.Screen name="AddCustomer" component={AddCustomer} options={AddCustomerOptions} />
            <Tab.Screen name="CashBook" component={CashBook} options={CashBookOptions} />
            <Tab.Screen name="Opposite" component={Opposite} options={OppositeOptions} />
            {/* <Tab.Screen name="Profile" component={Profile} options={ProfileOptions} /> */}
            <Tab.Screen name="General" component={General} options={GeneralOptions} />
        </Tab.Navigator>
    )
};

export default BottomNavigator;