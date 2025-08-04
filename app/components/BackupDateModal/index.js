import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import Colors from "../../constant";
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
    const [fields, setFields] = useState(initState);
    // const [selectedDate, setSelectedDate] = useState(new Date());
    // const datePickerRef = useRef(null);

    const onChange = (value, type) =>
    {
        setFields(perv => ({
            ...perv,
            [type]: value,
        }));
    };

    const handleDatePress = (type) => {
        // setSelectedDate(new Date());
        onChange({ visible: true, type }, "showDatePicker");
    };

    // const handleIOSDateSelection = () => {
    //     dateChanger({ type: "set" }, selectedDate);
    //     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
    // };

    const dateChanger = (event, date) =>
    {
        // Always close the picker on iOS
        // if (Platform.OS === 'ios') {
        //     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
        // }

        // if (event.type === "dismissed")
        // {
        //     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
        //     return;
        // }

        let selectedDate = new Date(date);
        const type = fields.showDatePicker.type;

        if (type === "from")
        {
            if (fields.to)
            {
                if ((fields.to - selectedDate) <= -1)
                    return setFields(prev => ({ ...prev, from: "", to: "", showDatePicker: { visible: false, type: "" } }));
            }

            setFields(prev => ({ ...prev, from: selectedDate, showDatePicker: { visible: false, type: "" } }));
        } else {
            selectedDate.setHours(23, 59, 59, 999);
            if (fields.from && (fields.from - selectedDate) <= -1)
                return setFields(prev => ({ ...prev, to: selectedDate, showDatePicker: { visible: false, type: "" } }));

            setFields(prev => ({ ...prev, to: "", showDatePicker: { visible: false, type: "" } }));
        }

        // On Android, we need to explicitly hide the picker after selection
        if (Platform.OS === 'android') {
            setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
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
                            {/* Android Date Picker */}
                            {fields.showDatePicker.visible && (
                                <DatePicker
                                    modal
                                    mode="date"
                                    open={fields.showDatePicker.visible}
                                    date={new Date()}
                                    onConfirm={(date) => {
                                        dateChanger(null, date);
                                    }}
                                    onCancel={() => {
                                        setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
                                    }}
                                />
                            )}

                            <Card
                                style={Style.fromTo}
                                onPress={() => handleDatePress("from")}>
                                <Text style={isRTL && {textAlign: "right"}}>{language.from}: {fields.from >= 1 && dateMaker(fields.from)}</Text>
                            </Card>
                            <Card
                                style={Style.fromTo}
                                onPress={() => fields.from && handleDatePress("to")}>
                                <Text style={isRTL && {textAlign: "right"}}>{language.to}: {fields.to >= 1 && dateMaker(fields.to)}</Text>
                            </Card>
                        </View>

                        {/* iOS Date Picker Modal */}
                        {/* <Modal
                            visible={fields.showDatePicker.visible && Platform.OS === 'ios'}
                            transparent={false}
                            animationType="slide"
                            onRequestClose={() => setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}))}
                        >
                            <View style={styles.iosDatePickerContainer}>
                                <RNDateTimePicker 
                                    ref={datePickerRef}
                                    value={selectedDate}
                                    onChange={dateChanger}
                                    display="inline"
                                    mode="date"
                                    themeVariant="light"
                                    style={styles.iosDatePicker}
                                />
                                <View style={styles.iosButtonContainer}>
                                    <Button 
                                        style={styles.iosDoneButton}
                                        onPress={handleIOSDateSelection}
                                    >
                                        {language.done}
                                    </Button>
                                </View>
                            </View>
                        </Modal> */}

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

const styles = {
    iosDatePickerContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    iosDatePicker: {
        flex: 1,
        backgroundColor: 'white',
    },
    iosButtonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iosDoneButton: {
        backgroundColor: Colors.primary,
    },
};

export default React.memo(BackupDateModal, (next, prev) => (
    next.visible === prev.visible
));
