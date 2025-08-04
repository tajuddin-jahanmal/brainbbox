import { useIsFocused } from "@react-navigation/core";
import { useContext, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { AccountDeleteAlert, AccountDeleteProcessAlert } from "../../components/Alerts";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import { mainServerPath } from '../../utils/serverPath';
import Style from "./Style";

const DeleteAccount = (props) =>
{
    const isFocused = useIsFocused()
    const initState = {
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        deleteAlert: false,
        deleteProcessAlert: false
    };

    const context = useContext(ExchangeMoneyContext);
    const [ fields, setFields ] = useState(initState);
    const [ isLoading, setIsLoading ] = useState(false);
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
        if (context.localAuth && context.login && isFocused)
        {
            setFields(prev => ({
                ...prev,
                firstName: context.customer?.firstName || "",
                lastName: context.customer?.lastName || "_",
                email: context.customer?.email || context.user?.email || "",
            }));
        }
    }, [isFocused]);

    const accountDeleteHandler = async() =>
    {
        try {
            onChange(false, "deleteAlert");

            let form = {
                firstName: fields.firstName,
                lastName: fields.lastName || "",
                email: fields.email,
                message: fields.message,
            };

            setIsLoading(true)
            const response = await fetch(mainServerPath('/contact'), {
                method: "POST",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify(form)
            });

            const objData = await response.json();
            if(objData.status === 'success')
            {
                setFields(prev => ({
                    ...prev,
                    firstName: context.customer?.firstName || "",
                    lastName: context.customer?.lastName || "",
                    email: context.customer?.email || context.user?.email || "",
                    deleteProcessAlert: true,
                    message: "",
                }));
            }

            if(objData.status === 'failure')
                Alert.alert("Info!", objData.message)

        } catch (error) {
            // Alert.alert('Info!', error.message);
        }
        setIsLoading(false)
    }

    const sendHandler = () =>
    {
        if (fields?.message?.length <= 0)
            return Alert.alert('Info!', language.writeReasonMessage);
        
        onChange(true, "deleteAlert");
    };

    return isFocused ? (
        <View style={Style.container}>
            <Header title={language.deleteAccount} goBack={goBack} />
            <View style={Style.content}>
                <View style={Style.form}>
                    <Input placeholder={language.firstName} value={fields.firstName} onChangeText={(text) => onChange(text, "firstName")}  disabled={true}/>
                    <Input placeholder={language.lastName} value={fields.lastName} onChangeText={(text) => onChange(text, "lastName")}  disabled={true}/>
                    <Input placeholder={language.email} value={fields.email} onChangeText={(text) => onChange(text, "email")} disabled={true} />
                    <Input placeholder={language.MayWeAskWhy} value={fields.message} onChangeText={(text) => onChange(text, "message")} multiline={true} numberOfLines={6} />
                    {/* <Text style={Style.founder}>{language.deleteAccountMessage}</Text> */}
                    <Button style={Style.button} onPress={sendHandler} isLoading={isLoading} disabled={isLoading || !context.isConnected}>{language.send}</Button>
                </View>
            </View>

            <AccountDeleteAlert
                onConfirm={accountDeleteHandler}
                onCancel={() => onChange(false, "deleteAlert")}
                show={fields.deleteAlert}
            />
            <AccountDeleteProcessAlert
                onConfirm={() => onChange(false, "deleteProcessAlert")}
                show={fields.deleteProcessAlert}
            />
        </View>
    ) : null
};

export default DeleteAccount;