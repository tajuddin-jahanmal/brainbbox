import React, { useContext, useState } from "react";
import { View, Text, Modal, TouchableOpacity, Alert } from "react-native";
import Style from "./Style";
import Input from "../Input";
import Button from "../Button";
import { TokenAlert } from "../Alerts";
import Card from "../Card";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import serverPath from "../../utils/serverPath";
import language from "../../localization";

const TokenModal = (props) =>
{
    const initState = {
        token: "",
        showAlert: false,
        isLoading: false,
    }

    const [ fields, setFields ] = useState(initState);
    const context = useContext(ExchangeMoneyContext);

    const onChange = (value, type) =>
    {
        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    const checkHandler = async () =>
    {
        return;
       try {
        if (fields.token.length !== 8)
        return onChange(true, "showAlert");

        onChange(true, "isLoading");
        // const response = await fetch('http://192.168.0.176:8080/token/validation', {
        const response = await fetch(serverPath("/token/validation"), {
            method: "post",
            headers: {
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({token: fields.token, providerId: context.user.id})
        });
        const objData = await response.json();

        console.log(objData);
        if (objData.status === "success")
        {

        }

        if (objData.status === "failure")
            Alert.alert("Info!", objData.message);

        onChange(false, "isLoading");
    } catch (error) {
           onChange(false, "isLoading");
            console.log("ERROR TokenModal: ", error);
       }
    };

    // console.log("Rendering [TokenModal]");

    return (
        <View>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
            >
                <Card style={Style.content} activeOpacity={1}>
                    <Text style={Style.msg}>{language.checkYourTicketHere}</Text>
                    <View style={Style.form}>
                        <Input
                            placeholder={language.checkYourTicket}
                            keyboardType="numeric"
                            style={Style.input}
                            value={fields.token}
                            onChangeText={(text) => onChange(text, "token")}
                            maxLength={10}
                        />
                        <Button style={Style.button} onPress={checkHandler} isLoading={fields.isLoading} disabled={!context.isConnected}>{language.check}</Button>
                    </View>
                </Card>
            <TouchableOpacity style={Style.backdrop} onPress={props.onDismiss} activeOpacity={1}>
            </TouchableOpacity>

            <TokenAlert
                onConfirm={() => onChange(false, "showAlert")}
                onCancel={() => onChange(false, "showAlert")}
                show={fields.showAlert}
            />
            </Modal>
        </View>
    )
};

export default React.memo(TokenModal, (next, prev) => (
    next.visible === prev.visible 
));