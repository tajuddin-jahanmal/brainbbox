import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
import QRcodeGenerator from '../../components/QRcodeGenerator';
import Colors from "../../constant";
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
        showSocialLinks: false,
        socialLinks: {
            whatsapp: "",
            facebook: "",
            instagram: "",
            telegram: "",
            linkedin: "",
            youtube: "",
            tiktok: "",
            twitter: ""
        },
        showQrCodeModal: false,
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
    const isRTL = language.isRtl;

    const socialLinksConfig = [
        { key: "whatsapp", label: language.whatsappNumber, keyboard: "phone-pad" },
        { key: "facebook", label: language.facebookLink },
        { key: "instagram", label: language.instagramLink },
        { key: "telegram", label: language.telegramLink },
        { key: "linkedin", label: language.linkedinLink },
        { key: "youtube", label: language.youtubeLink },
        { key: "tiktok", label: language.tiktokLink },
        { key: "twitter", label: language.twitterLink },
    ];

    const onChange = (value, type) =>
    {
        if (isLoading)
            return;
        
        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    const onChangeSocial = (text, key) => {
        setFields(prev => ({
            ...prev,
            socialLinks: {
            ...prev.socialLinks,
            [key]: text
            }
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
                showSocialLinks: false,
                socialLinks: {
                    whatsapp: context.customer?.socialLinks?.whatsapp || "",
                    facebook: context.customer?.socialLinks?.facebook || "",
                    instagram: context.customer?.socialLinks?.instagram || "",
                    telegram: context.customer?.socialLinks?.telegram || "",
                    linkedin: context.customer?.socialLinks?.linkedin || "",
                    youtube: context.customer?.socialLinks?.youtube || "",
                    tiktok: context.customer?.socialLinks?.tiktok || "",
                    twitter: context.customer?.socialLinks?.twitter || ""
                },
                showQrCodeModal: false,
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
            
            const fieldsClone = {...fields};

            delete fieldsClone.showSocialLinks;
            delete fieldsClone.showQrCodeModal;

            const {message} = validator(fieldsClone);
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
                body: JSON.stringify({...fieldsClone, providerId: context.user.id, id: context?.customer?.id})
            });

            const objData = await response.json();
            if(objData.status === 'success')
            {
                context.setState(prev => ({...prev, customer: {...context.customer, ...objData.data}}))
                asyncstorageCustomer.firstName = fieldsClone.firstName;
                asyncstorageCustomer.lastName = fieldsClone.lastName;
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
                <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={Style.form}>
                        <Input placeholder={language.firstName} value={fields.firstName} onChangeText={(text) => onChange(text, "firstName")}  disabled={isLoading || context.isGuest}/>
                        <Input placeholder={language.lastName} value={fields.lastName} onChangeText={(text) => onChange(text, "lastName")}  disabled={isLoading || context.isGuest}/>
                        <Input placeholder={language.phone} value={fields.countryCode + fields.phone} onChangeText={(text) => onChange(text, "phone")} keyboardType="numeric" onPressIn={() => onChange("", "newStyle")}  disabled={true}/>
                        <Input placeholder={language.email} value={fields.email} onChangeText={(text) => onChange(text, "email")}  disabled={true}/>

                        {
                            (!context.isGuest && fields.showSocialLinks) &&
                            <View style={{gap: 8}}>
                                {
                                    socialLinksConfig.map(({ key, label, keyboard }) => (
                                    <Input
                                        key={key}
                                        placeholder={label}
                                        value={fields?.socialLinks[key]}
                                        keyboardType={keyboard || "default"}
                                        onChangeText={(text) => onChangeSocial(text, key)}
                                        disabled={isLoading || !context.isConnected}
                                    />
                                ))}
                            </View>
                        }

                        {
                            !context.isGuest &&
                            <View style={Style.textsContainer}>
                                <TouchableOpacity onPress={() =>  onChange(!fields.showSocialLinks, "showSocialLinks")}>
                                    <Text style={{color: Colors.primary}}>{fields.showSocialLinks ? language.hideSocialLinks : language.showSocialLinks}</Text>
                                </TouchableOpacity>

                                {fields.showSocialLinks && <TouchableOpacity onPress={() =>  onChange(!fields.showQrCodeModal, "showQrCodeModal")}>
                                    <Text style={{color: Colors.primary}}>{language.generateQrCode}</Text>
                                </TouchableOpacity>}
                            </View>
                        }

                        {
                            context.isGuest &&
                            <Text style={Style.dataDeleteMsg}>{language.yourDataWillBeAutomatically}</Text>
                        }
                        <Button style={Style.button} onPress={updateHandler} isLoading={isLoading} disabled={isLoading || !context.isConnected || context.isGuest}>{language.update}</Button>
                        <QRcodeGenerator
                            socialLinks={fields.socialLinks}
                            visible={fields.showQrCodeModal}
                            onDismiss={() => onChange(false, "showQrCodeModal")}
                        />
                    </View>
                </ScrollView>
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