import React, { useRef } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Share from "react-native-share";
import ViewShot, { captureRef } from 'react-native-view-shot';
import Colors from "../../constant";
import language from "../../localization";
import Button from "../Button";
import Card from "../Card";
import Style from "./Style";


const ReminderModal = (props) =>
{
	const isRTL = language.isRtl;
    const data = props?.data;
    const date = new Date().toLocaleString();
    const viewRef = useRef();
    // console.log("Rendering [ReminderModal.js]");

    const shareHandler = async () =>
    {
        try {
            // await new Promise(resolve => setTimeout(resolve, 1000));

            const uri = await captureRef(viewRef.current, {
                format: 'jpg',
                quality: 0.8,
            });

            await Share.open({
                url: 'file://' + uri, // prepend file:// for local image
                type: 'image/jpeg',
                failOnCancel: false,
            });
        } catch (error) {
            console.error("Sharing error:", error);
        }

        props.onDismiss();
    }

    return (
        <View>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
            >
                <View style={Style.content}>
                    <ViewShot ref={viewRef} options={{ format: "jpg", quality: 0.9 }} collapsable={false}>
                    <Card style={Style.card} activeOpacity={1} collapsable={false}>
                        <Text style={[Style.paymentRe, isRTL && {textAlign: 'right'}]}>{language.paymentReminder}</Text>

                        <View style={Style.details}>
                            <Text style={[Style.cash, data.cash < 0 && {color: Colors.primary}]}>{Math.abs(data.cash)} {data.currencyCode}</Text>
                            <Text style={Style.date}>{date}</Text>
                            <Text style={[Style.reminded, isRTL && {textAlign: 'right'}]}>{language.remindeBy}: {data.ownerFullName}</Text>
                            <Text style={[Style.reminded, isRTL && {textAlign: 'right'}]}>{language.to}: {data.customerFullName}</Text>
                        </View>
                    </Card>
                    </ViewShot>
                    <Card style={Style.buttonsCard} activeOpacity={1} collapsable={false}>
                        <View style={Style.buttonsContainer}>
                            <Button style={Style.dismiss} onPress={props.onDismiss}>{language.dismiss}</Button>
                            <Button style={Style.share} onPress={shareHandler}>{language.share}</Button>
                        </View>
                    </Card>
                </View>
                <TouchableOpacity style={Style.backdrop} onPress={props.onDismiss} activeOpacity={1}>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

export default React.memo(ReminderModal, (next, prev) => (
    next.visible === prev.visible
));