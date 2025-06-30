import { createStackNavigator } from "@react-navigation/stack";

import StackNavigator from "../StackNavigator";

const Stack = createStackNavigator();


const MainNavigator = () =>
{
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StackNavigator" component={StackNavigator} />
        </Stack.Navigator>
    )
};

export default MainNavigator;