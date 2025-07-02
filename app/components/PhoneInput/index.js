import Entypo from '@expo/vector-icons/Entypo.js';
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Colors, { isAndroid, ScreenWidth } from "../../constant";
import language from "../../localization";
import useStore from "../../store/store.js";
import Card from "../Card";
import Style from "./style.js";

const PhoneInput = (props) =>
{
    const initState = {
        value: "",
        showDropdown: false,
        countryCode: "+93",
        showCountryCode: false,
    }
    const [ globalState ] = useStore();
    const [ fields, setFields ] = useState(initState);
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const isRTL = language.isRtl;

    useEffect(() =>
    {
        (async () => {
            setDataProvider(dataProvider.cloneWithRows([...globalState?.contacts]));
        })();
    }, [globalState.contacts]);

    const onChange = (value, type) =>
    {
        if (type === "countryCode")
        {
            props.phoneHandler(value, fields.value);
            setFields(prev => ({...prev, [type]: value}));
        }

        if (type === "value")
        {
            setFields(prev => ({...prev, [type]: value}));
            props.phoneHandler(fields.countryCode, value);

            if (!fields.showDropdown)
                onChange(true, "showDropdown");

            if (value.length === 0)
                return setDataProvider(dataProvider.cloneWithRows([...globalState.contacts]));

            const matchContacts = [];
            globalState.contacts.forEach(phoneNumber => {
                if (phoneNumber?.phone?.search(value) >= 0)
                    matchContacts.push(phoneNumber);
            });

            setDataProvider(dataProvider.cloneWithRows([...matchContacts]));
            return;
        }

        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    }

    const phonePressHandler = (item) =>
    {
        // onChange(item.phone.split(" ").join(""), "value");
        onChange(item.phone.replace(/[^0-9]/g, ''), "value");
        onChange(!fields.showDropdown, "showDropdown");
    }

    function formatPhoneNumber(number) {
        try {
            if (/^\+93/.test(number))
                return number.replace(/^\+93/, "0");
            else
                return number;
        } catch (error) {
            console.log(error, "PhoneInput Error");
        }
	}

    const NORMAL = "NORMAL";
	
	const layoutProvider = new LayoutProvider((index) => {
		return NORMAL
	}, (type, dim) =>
	{
		switch (type) {
			case NORMAL:
				dim.width = ScreenWidth,
				dim.height = 60
				break;
			default:
				dim.width = 0,
				dim.height = 0
				break;
		}
	});
    const rowRenderer = (type, item) =>
	{
		return (
			<Card style={Style.contact} onPress={() => phonePressHandler(item)} activeOpacity={0.8}>
				<Text>{item.firstName} {item.lastName}</Text>
				<Text style={Style.phoneNumber}>{item.phone}</Text>
			</Card>
		)
	}


    return (
        <View style={[Style.container, props.style]}>
            <View style={Style.inputContainer}>

                <Card style={Style.countryCard} onPress={() => onChange(true, "showCountryCode")}>
                    <Text>{fields.countryCode}</Text>
                </Card>
                <TextInput
                    placeholder={props.placeholder}
                    style={{...Style.input, ...props.inputStyle, ...{...isRTL && {paddingRight: 55}}}}
                    value={fields.value}
                    onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''), "value")}
                    keyboardType="numeric"
                    onSubmitEditing={() => onChange(!fields.showDropdown, "showDropdown")}
                    placeholderTextColor={isAndroid ? "#808080" : "#C7C7CD"}
                />
                <TouchableOpacity style={Style.downIcon} onPress={() => onChange(!fields.showDropdown, "showDropdown")}>
                    <Entypo
                        name="chevron-down"
                        size={24} color={Colors.textColor}
                        style={fields.showDropdown && { transform: [{ rotate: '180deg'}] }}
                    />
                </TouchableOpacity>

                <CountryPicker
                    show={fields.showCountryCode}
                    pickerButtonOnPress={(item) => {
                        onChange(item.dial_code, "countryCode");
                        onChange(false, "showCountryCode");
                    }}
                    showSearchBar={true}
                    inputPlaceholder="Search your country"
                />

            </View>

           {
                (fields.showDropdown && globalState.contacts.length >= 1) && <View style={Style.recyclerContainer}>
                    {
                        dataProvider?._data.length >= 1 ?
                        <RecyclerListView
                            dataProvider={dataProvider}
                            layoutProvider={layoutProvider}
                            rowRenderer={rowRenderer}
                            keyboardShouldPersistTaps="handled"
                        />
                        :
                        <View style={Style.noContactContainer}>
                            {<Text style={Style.noContact}>{language.noContactFound}</Text>}
                        </View>
                    }
                </View>
           }
        </View>
    )
};

export default React.memo(PhoneInput, (next, prev) => (
    next.value === prev.value &&
    next.placeholder === prev.placeholder &&
    next.disabled === prev.disabled
));

