import RNDateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import language from "../../localization";
import Button from "../Button";
import Card from "../Card";
import Style from "./Style";

const BackupDateModal = (props) =>
{
	const isRTL = language.isRtl;

    const initState = {
		showDatePicker: { visible: false, type: "" },
		from: "",
		to: "",
	};
	const [ fields, setFields ] = useState(initState);

    const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));
	};

    const dateChanger = (event, date) =>
	{
		if (event.type === "dismissed")
		{
			setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
			return;
		}

        let selectedDate = new Date(date);

		if (fields.showDatePicker.type === "from")
		{
			if (fields.to)
			{
				if ((fields.to - selectedDate) <= -1)
					return setFields(prev => ({ ...prev, from: "", to: "", showDatePicker: { visible: false, type: "" } }));
			}

			setFields(prev => ({ ...prev, from: selectedDate, to: fields.to, showDatePicker: { visible: false, type: "" } }));
		} else {
            selectedDate.setHours(23, 59, 59, 999);
			if ((fields.from - selectedDate) <= -1)
				return setFields(prev => ({ ...prev, from: fields.from, to: selectedDate, showDatePicker: { visible: false, type: "" } }));

			setFields(prev => ({ ...prev, from: fields.from, to: "", showDatePicker: { visible: false, type: "" } }));
		}
	}

    const dateMaker = (date) =>
	{
		const newDate = new Date(date.toString());
		return newDate.getFullYear() + "/" + Number.parseInt(newDate.getMonth()+1) + "/" + newDate.getDate()
	}

    const dismissHandler = () =>
    {
        setFields(initState);
        props.onDismiss();
    }

    const backUpHandler = () =>
    {
        if (fields.from && fields.to)
        {
            props.backupDates(fields.from, fields.to);
            dismissHandler();
        }
    };

    return (
        <View>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
            >
                <View style={Style.content}>
                    <Card style={Style.card} activeOpacity={1}>
                        <Text style={[Style.tranInfo, isRTL && {textAlign: "right"}]}>{language.PickdateToCreateYourAppBackup}</Text>

                        <View style={[Style.fromToContainer, isRTL && {flexDirection: 'row-reverse'}]}>
                            { fields.showDatePicker.visible && <RNDateTimePicker value={new Date()} onChange={(event, date) => dateChanger(event, date)} />  }
                            <Card
                                style={Style.fromTo}
                                onPress={() => onChange({visible: true, type: "from"}, "showDatePicker")}>
                                <Text style={isRTL && {textAlign: "right"}}>{language.from}: {fields.from >= 1 && dateMaker(fields.from)}</Text>
                            </Card>
                            <Card
                                style={Style.fromTo}
                                onPress={() => (fields.from) && onChange({visible: true, type: "to"}, "showDatePicker")}>
                                <Text style={isRTL && {textAlign: "right"}}>{language.to}: {fields.to >= 1 && dateMaker(fields.to)}</Text>
                            </Card>
                        </View>
                        <Text style={[Style.storeBackupMsg, isRTL && {textAlign: "right"}]}>{language.yourAppBackupWillStore}</Text>

                        <View style={Style.buttonsContainer}>
                            <Button style={Style.dismiss} onPress={dismissHandler}>{language.dismiss}</Button>
                            <Button style={Style.backup} onPress={backUpHandler}>{language.backup}</Button>
                        </View>
                    </Card>
                </View>
                <TouchableOpacity style={Style.backdrop} onPress={dismissHandler} activeOpacity={1}>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

export default React.memo(BackupDateModal, (next, prev) => (
    next.visible === prev.visible
));