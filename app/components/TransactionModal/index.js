import React, { useContext } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import { mainServerPath } from "../../utils/serverPath";
import Button from "../Button";
import Card from "../Card";
import Style from "./Style";

const TransactionModal = (props) =>
{
	const isRTL = language.isRtl;
    const context = useContext(ExchangeMoneyContext);
    // console.log("Rendering [TransactionModal.js]");

    let photoUri = null;
    const photo = props?.data?.photo;

    if (typeof photo !== "string" || photo.trim() === "" || photo === "null" || photo === "undefined" ) {}
    else {
        if (photo.trim().startsWith("{")) {
            try {
            const parsed = JSON.parse(photo);
            photoUri = parsed?.uri || null;
            } catch (e) {
            photoUri = null;
            }
        }
        else {
            photoUri = mainServerPath(photo);
        }
    }

    console.log(props.data, 'transaction modal');
    

    return (
        <View>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
            >
                <View style={Style.content}>
                    <Card style={Style.card} activeOpacity={1}>
                        <Text style={[Style.tranInfo, isRTL && {textAlign: 'right'}]}>{language.transactionInfo} </Text>
                        {!props.selfCash && <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{props.opposite ? language.owner : language.customer} {language.name}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {props.customerName}</Text>
                            </Text>
                        </View>}
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.amount}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {props.data?.amount}</Text>
                            </Text>
                        </View>
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.profit}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {props.data?.profit}</Text>
                            </Text>
                        </View>
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.type}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {props.data?.type ? language.cashIn : language.cashOut}</Text>
                            </Text>
                        </View>
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.dateTime}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {(new Date(props.data?.dateTime))?.toLocaleString()}</Text>
                            </Text>
                        </View>
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.info}:
                                <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}> {props.data?.information}</Text>
                            </Text>
                        </View>
                        <View style={{...Style.titleContainer, ...{...isRTL && {justifyContent: "flex-end"}}}}>
                            <Text style={Style[props.data?.type ? "cashIn" : "cashOut"]}>{language.photo}:</Text>
                        </View>
                        <>
                            {photoUri?.length >= 1 && <View style={Style.photoContainer}>
                                <Image
                                    source={{ uri: photoUri }}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            </View>}
                        </>

                        <View style={Style.buttonsContainer}>
                            <Button
                                style={Style.dismiss}
                                onPress={props.onDismiss}
                            >{language.dismiss}</Button>

                            {props.edit &&
                                <Button
                                    style={Style.edit}
                                    onPress={() => { props?.editHandler(); props.onDismiss()}}
                                    disabled={!context.isConnected && true}
                                >{language.edit}</Button>
                            }

                            {props.delete &&
                                <Button
                                    style={Style.delete}
                                    onPress={() => { props?.deleteHandler(); props.onDismiss()}}
                                    disabled={!context.isConnected && true}
                                >{language.delete}</Button>}
                        </View>
                    </Card>
                </View>
                <TouchableOpacity style={Style.backdrop} onPress={props.onDismiss} activeOpacity={1}>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

export default React.memo(TransactionModal, (next, prev) => (
    next.visible === prev.visible
));