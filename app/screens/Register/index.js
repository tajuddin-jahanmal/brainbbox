import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useState } from "react";
import { Alert, Text, View } from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Input from "../../components/Input";
import UpScreenLoader from "../../components/UpScreenLoader";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import serverPath from '../../utils/serverPath';
import validator from '../../validator/customer';
import Style from "./Style";

const Register = (props) =>
{
    const context = useContext(ExchangeMoneyContext);
    const isFocused = useIsFocused();
    const initState = {
        firstName: context.user.name || "",
        lastName: "",
		countryCode: "+93",
        phone: "",
        email: context.user.email || "",
        type: "own",
        showCountryCode: false,
    };

    const [ fields, setFields ] = useState(initState);
    const [ isLoading, setIsLoading ] = useState(false);
    
    const onChange = (value, type) =>
    {
        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    const RegisterHandler = async() =>
    {
        try {
            const fieldsClone = {...fields};
            delete fieldsClone.showCountryCode;
            const {message} = validator(fields);
            if(message)
                return Alert.alert('Info!', message);
            // if(!fields.phone.match(/^(07[94031]\d{7})$/))
            //     return Alert.alert("Info!", "Incorrect number entered!");

            setIsLoading(true);
            const response = await fetch(serverPath("/customer"), {
                method: "POST",
                headers: {
                    "Content-Type": "Application/JSON"
                },
                body: JSON.stringify({ ...fieldsClone, providerId: context.user.id })
            })

            const objData = await response.json();

            if (objData.status === "success")
            {
                context.setState(prev => ({...prev, customer: objData.data, login: true}));

                const response2 = await fetch(serverPath("/cashbook"), {
					method: "POST",
					headers: {
							"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({ providerId: context.user.id, ownerId: objData.data.id, customerId: objData.data.id })
				});

				const objData2 = await response2.json();
				if (objData2.status === "failure")
					Alert.alert("Info!", objData2.message)
            }


            if (objData.status === "failure")
                Alert.alert("Info!", objData.message)


            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            // Alert.alert('Info!', error.message);
            Alert.alert('Info!', "Error Code: 7");
        }
    }

    return isFocused ? (
        <View style={Style.container}>
            <Header title={language.register} noBack />
            <View style={Style.content}>
                <View style={Style.form}>
                    {
                        !context?.user?.name &&
                        <Input placeholder={language.firstName} value={fields.firstName} onChangeText={(text) => onChange(text, "firstName")}  disabled={isLoading}/>
                    }
                    {/* <Input placeholder={language.lastName} value={fields.lastName} onChangeText={(text) => onChange(text, "lastName")}  disabled={isLoading}/> */}
                    <View style={Style.phoneContainer}>
                        <Card style={Style.countryCard} onPress={() => onChange(true, "showCountryCode")}>
                            <Text>{fields.countryCode}</Text>
                        </Card>
                        <Input placeholder={language.phone} value={fields.phone} onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''), "phone")} keyboardType="numeric" disabled={isLoading} style={{width: "84%"}} maxLength={12} />
                    </View>
                    {/* <Input placeholder={language.email} value={fields.email} onChangeText={(text) => onChange(text, "email")}  disabled={isLoading}/> */}
                    <Button style={Style.button} onPress={RegisterHandler} disabled={isLoading || !context.isConnected}>{language.register}</Button>
                </View>
            </View>
            <CountryPicker
                show={fields.showCountryCode}
                pickerButtonOnPress={(item) => {
                    onChange(item.dial_code, "countryCode");
                    onChange(false, "showCountryCode");
                }}
                showSearchBar={true}
                inputPlaceholder="Search your country"
            />
            {
                isLoading &&
                <UpScreenLoader />
            }
        </View>
    ) : null;
};

export default Register;