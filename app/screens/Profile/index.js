import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import serverPath from '../../utils/serverPath';
import validator from '../../validator/customer';
import Style from "./Style";
// import { clearCashBooksTable,
//     clearCurrenciesTable,
//     clearCustomersTable,
//     clearOppoTransactionsTable,
//     clearOppositeCustomersTable,
//     clearQueueTable,
//     clearSelfCashTable,
//     clearTransactionsTable } from "../../DB";
import Toast from 'react-native-toast-message';
import language from "../../localization";
import useStore from "../../store/store";
// import NetInfo from "@react-native-community/netinfo";

const Profile = (props) =>
{
    const isFocused = useIsFocused()
    const initState = {
        firstName: "",
        lastName: "",
        countryCode: "",
        phone: "",
        email: "",
    };

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: language.success,
            text2: language.profileSuccessfullyChanged,
            swipeable: true,
            visibilityTime: 2000,
        });
    };

    const context = useContext(ExchangeMoneyContext);
    const [ fields, setFields ] = useState(initState);
    const [ isLoading, setIsLoading ] = useState(false);
    const dispatch = useStore()[1];
	const { goBack } = props.navigation;

    const onChange = (value, type) =>
    {
        if (isLoading)
            return;
        
        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    useEffect(() =>
    {
        // if (context.localAuth && context?.login && isFocused && !context.isGuest)
        if (context.localAuth && context?.login && isFocused)
        {
            setFields({
                firstName: context.customer?.firstName || "",
                lastName: context.customer?.lastName || "",
                countryCode: context.customer?.countryCode || "",
                phone: context.customer?.phone || "",
                email: context.customer?.email || "",
            });
        }
    }, [isFocused]);

    const updateHandler = async() =>
    {
        try {
            const credentials = await AsyncStorage.getItem("@user");
            const asyncstorageCustomer = JSON.parse(await AsyncStorage.getItem("@customer"));

            if(!credentials)
                return Alert.alert('warning!', "Please Login To Your Account Again");
                
            const {message} = validator(fields);
            if(message)
                return Alert.alert('Info!', message);

            // if(!fields.phone.match(/^(07[94031]\d{7})$/))
            //     return Alert.alert("Info!", "Incorrect number entered!");
                
            setIsLoading(true)
            const response = await fetch(serverPath('/customer'), {
                method: "PUT",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify({...fields, providerId: context.user.id, id: context?.customer?.id})
            });

            const objData = await response.json();
            if(objData.status === 'success')
            {
                context.setState(prev => ({...prev, customer: {...context.customer, ...objData.data}}))
                asyncstorageCustomer.firstName = fields.firstName;
                asyncstorageCustomer.lastName = fields.lastName;
                await AsyncStorage.setItem("@customer", JSON.stringify(asyncstorageCustomer));
                showToast();
				// ToastAndroid.show("Profile successfully changed", ToastAndroid.SHORT);
            }

            if(objData.status === 'failure')
                Alert.alert("Info!", objData.message)


        } catch (error) {
            // Alert.alert('Info!', error.message);
            Alert.alert('Info!', "Error Code: 6");
        }
        setIsLoading(false)
    }

    return isFocused ? (
        <View style={Style.container}>
            {/* <Header title={language.profile} goBack={goBack} logout logoutOnPress={() => context.logoutHandler()} /> */}
            <Header title={language.profile} goBack={goBack} />
            <View style={Style.content}>
                <View style={Style.form}>
                    <Input placeholder={language.firstName} value={fields.firstName} onChangeText={(text) => onChange(text, "firstName")}  disabled={isLoading || context.isGuest}/>
                    <Input placeholder={language.lastName} value={fields.lastName} onChangeText={(text) => onChange(text, "lastName")}  disabled={isLoading || context.isGuest}/>
                    <Input placeholder={language.phone} value={fields.countryCode + fields.phone} onChangeText={(text) => onChange(text, "phone")} keyboardType="numeric" onPressIn={() => onChange("", "newStyle")}  disabled={true}/>
                    <Input placeholder={language.email} value={fields.email} onChangeText={(text) => onChange(text, "email")}  disabled={true}/>
                    {context.isGuest && <Text style={Style.dataDeleteMsg}>{language.yourDataWillBeAutomatically}</Text>}
                    <Button style={Style.button} onPress={updateHandler} isLoading={isLoading} disabled={isLoading || !context.isConnected || context.isGuest}>{language.update}</Button>
                </View>
                <Text style={Style.founder}>{language.founder}</Text>
            </View>
        </View>
    ) : null
};

export default Profile;

export const ProfileOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<Ionicons name={"person-outline"} color={tabInfo.color} size={tabInfo.size} />
			// <Ionicons name={tabInfo.focused ? "person" : "person-outline"} color={tabInfo.color} size={tabInfo.size} />
		)
	}
};