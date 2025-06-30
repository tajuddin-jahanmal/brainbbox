import AntDesign from '@expo/vector-icons/AntDesign';
import { useIsFocused } from "@react-navigation/core";
import * as Contacts from "expo-contacts";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, ToastAndroid, View } from "react-native";
import { DataProvider, LayoutProvider } from "recyclerlistview";
import { AddCustomerValidationAlert } from "../../../components/Alerts";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import PhoneInput from "../../../components/PhoneInput";
import UpScreenLoader from "../../../components/UpScreenLoader";
import { ScreenWidth } from "../../../constant";
import Customers from "../../../DB/Customer";
import { ExchangeMoneyContext } from "../../../ExchangeMoneyContext";
import language from "../../../localization";
import useStore from "../../../store/store";
import { generateNumericId } from "../../../utils/idGenerator";
import serverPath from "../../../utils/serverPath";
import { SortCustomers } from "../../../utils/SortData";
import AddCustomerValidator from "../../../validator/AddCustomer";
import Style from "./Style";

const AddCustomer = (props) =>
{
	const isFocused = useIsFocused()
	const initState = {
		firstName: "",
		lastName: "",
		phone: "",
		countryCode: "+93",
		email: "",
		type: "customer",
		showAlert: { visible: false, message: "" },
		newStyle: Style.disNone,
	};

	const [ globalState, dispatch ] = useStore();
	const context = useContext(ExchangeMoneyContext)
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const { goBack } = props.navigation;
    const [ isLoading, setIsLoading ] = useState(false);

    const onChange = (value, type) =>
    {
		if (isLoading)
			return;
	
		setFields(prev => ({
			...prev,
			[type]: value,
		}));

		// if (type === "phone" && fields.newStyle.length <= 0)
		// 	onChange(Style.disNone, "newStyle");
    };


    useEffect(() =>
    {
		(async () => {
			if(!isFocused)
				return;

			if (globalState.contacts.length <= 0)
			{
				const { status } = await Contacts.requestPermissionsAsync();
				if (status === 'granted') {
					const { data } = await Contacts.getContactsAsync({
						fields: [Contacts?.Fields?.FirstName, Contacts?.Fields?.LastName, Contacts?.Fields?.PhoneNumbers],
					});

					if (globalState.contacts.length <= 0 && data.length >= 1)
					{
						let filterContacts = [];
						if (data.length > 0) {
							data.forEach(per => {
									if(!per.phoneNumbers)
										return;
									filterContacts.push({ firstName: per.firstName, lastName: per.lastName, phone: per.phoneNumbers[0].number });
								});
						};

						dispatch("setContacts", filterContacts)
					}
				}
			};
		})();
    }, [globalState.contacts, isFocused]);

	// It is used in REcyclerListView
    const phonePressHandler = (item) =>
    {
		const { firstName, lastName, phone } = item;
		onChange(firstName, "firstName");
		onChange(lastName, "lastName");
		onChange(phone, "phone");
		onChange(Style.disNone, "newStyle");
    };

	const addCustomerHandler = async () =>
	{
		try {
			const error = AddCustomerValidator(fields);

			if (error)
				return onChange({visible: true, message: error}, "showAlert")
			
			// if(!fields.phone.match(/^(07[94031]\d{7})$/))
			// 	return onChange({visible: true, message: "Incorrect number entered!"}, "showAlert");

			const data = {
				firstName: fields.firstName,
				lastName: fields.lastName,
				email: fields.email,
				countryCode: fields.countryCode,
				phone: fields.phone,
				type: fields.type,
				providerId: context?.user?.id,
			}


			if (context.isGuest)
			{
				let customersClone = [...globalState.customers];
				for (const cus of customersClone) {
					if ((cus?.customer?.phone || cus?.phone) == data.phone) {
						Alert.alert("Info!", "Cashbbok is already exist!");
						return;
					}
				}

				let newCustomer = {...data};
				delete newCustomer.providerId;
				delete newCustomer.type;
				newCustomer.id = generateNumericId();
				newCustomer.userId = null;
				const cashbook = {id: generateNumericId(), customer: newCustomer, customerId: newCustomer.id, owner: context.customer, ownerId: context.customer.id, summary: []};

				Customers.createCustomer(
					cashbook.id,
					cashbook.customer?.firstName,
					cashbook.customer?.lastName,
					cashbook.customer?.countryCode,
					cashbook.customer?.phone,
					cashbook.customer?.email,
					JSON.stringify(cashbook?.summary),
					cashbook.customer?.active,
					cashbook.customer?.userId
				);
				setFields(initState);
				dispatch("setCustomers", SortCustomers([...globalState.customers, cashbook]));
				goBack();

				return;
			}

			setIsLoading(true);
			const response = await fetch(serverPath("/customer"), {
			// const response = await fetch("http://192.168.0.176:8080/admin/khata/customer", {
				method: "POST",
				headers: {
						"Content-Type": "Application/JSON",
				},
				body: JSON.stringify(data)
			});

			const objData = await response.json();

			// New Customer
			// LOG  {"active": true,
			// "createdAt": "2025-01-07T01:03:25.331Z",
			// "email": "",
			// "firstName": "Cs",
			// "id": 105,
			// "lastName": "",
			// "phone": "0708092814",
			// "updatedAt": "2025-01-07T01:03:25.331Z",
			// "userId": null} Obj Data 1

			// Cashbook
			// LOG  {"active": true,
			// "createdAt": "2025-01-07T01:03:25.767Z",
			// "customerId": 105,
			// "id": 82,
			// "ownerId": 32,
			// "summary": [],
			// "updatedAt": "2025-01-07T01:03:25.767Z"} Obj Data 2

			// GET cashbook from sever
			// LOG  {"active": true,
			// "createdAt": "2025-01-07T01:03:25.000Z",
			// "customer": {"active": true, "createdAt": "2025-01-07T01:03:25.000Z", "email": "", "firstName": "Cs", "id": 105, "lastName": "", "phone": "0708092814", "updatedAt": "2025-01-07T01:03:25.000Z", "userId": null}, 
			// "customerId": 105, 
			// "id": 82, 
			// "owner": {"active": true, "createdAt": "2024-05-04T11:48:15.000Z", "email": "", "firstName": "Taj", "id": 32, "lastName": "Coco", "phone": "0708166120", "updatedAt": "2024-09-09T13:36:57.000Z", "userId": 23},
			// "ownerId": 32,
			// "summary": [],
			// "updatedAt": "2025-01-07T01:03:25.000Z"} newCustomer

			if (objData.status === "success")
			{
				const response2 = await fetch(serverPath("/cashbook"), {
					method: "POST",
					headers: {
							"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({ providerId: context.user.id, ownerId: context.customer.id, customerId: objData.data.id })
				});

				const objData2 = await response2.json();

				if (objData2.status === "success")
				{
					setFields({...initState, contacts: fields.contacts});
					const cashbookResponse = await fetch(serverPath("/get/cashbook"), {
						method: "POST",
						headers: { "Content-Type": "Application/JSON" },
						body: JSON.stringify({providerId: context.user.id, ownerId: context.customer.id})
					});
					const cashbookObjData = await cashbookResponse.json();
					if (cashbookObjData.status === "success")
					{
						let filterCustomers = cashbookObjData?.data?.filter(customer => customer.customerId !== context.customer.id);
						const newCustomer = filterCustomers.find(cus => cus.customerId === objData2.data.customerId);
						Customers.createCustomer(
							newCustomer.id,
							newCustomer.customer.firstName,
							newCustomer.customer.lastName,
							newCustomer.customer.countryCode,
							newCustomer.customer.phone,
							newCustomer.customer.email,
							JSON.stringify(newCustomer?.summary),
							newCustomer.customer.active,
							newCustomer.customer.userId
						);
						setFields(initState);
						dispatch("setCustomers", SortCustomers(filterCustomers));
						goBack();
					}
					
					ToastAndroid.show("Customer successfully added", ToastAndroid.SHORT);
				}

				if (objData2.status === "failure")
					Alert.alert("Info!", objData2.message)
			}
				
			if (objData.status === "failure")
				Alert.alert("Info!", objData.message)

			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			console.log(error.message, "error.message Add Customer 3");
			Alert.alert('Info!', "Error Code: 3");
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
	})

	const rowRenderer = (type, item) =>
	{
		return (
			<Card style={Style.contact} onPress={() => phonePressHandler(item)} activeOpacity={0.8}>
				<Text>{item.firstName} {item.lastName}</Text>
				<Text style={Style.phoneNumber}>{item.phone}</Text>
			</Card>
		)
	}

	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.addCustomer} goBack={goBack} noBack />
			<View style={Style.content}>
				<View style={Style.form}>
					<Input placeholder={language.firstName} value={fields.firstName} onChangeText={(text) => onChange(text, "firstName")} disabled={isLoading} />
					<Input placeholder={language.lastName} value={fields.lastName} onChangeText={(text) => onChange(text, "lastName")} disabled={isLoading} />

					{/* <Input placeholder="Phone" value={fields.phone} onChangeText={(text) => onChange(text, "phone")} keyboardType="numeric" maxLength={15} onPressIn={() => {
						if (fields.phone.length === 0)
							onChange("", "newStyle");
					}} disabled={isLoading} /> */}

					{/* <SelectList
						setSelected={(val) => {
							onChange(val, "phone");
						}} 
						data={globalState.contacts}
						save="phone"
						searchPlaceholder="Phone"
						isForPhone={true}
					/> */}
					<PhoneInput
						placeholder={language.phone}
						phoneHandler={(countryCode, phone) => {
							onChange(countryCode, "countryCode")
							onChange(phone, "phone")
						}}
					/>
				
					<Input placeholder={language.email} value={fields.email} onChangeText={(text) => onChange(text, "email")} disabled={isLoading} keyboardType="email-address" />

					{/* {
						dataProvider._data?.length >= 1 &&
						<Card activeOpacity={1} style={{...Style.contactsContainer, ...fields.newStyle}}>
							<RecyclerListView
								dataProvider={dataProvider}
								layoutProvider={layoutProvider}
								rowRenderer={rowRenderer}
							/>
						</Card>
					} */}

					<Button style={Style.addCustomer} onPress={addCustomerHandler} isLoading={isLoading} disabled={isLoading || (context.isGuest ? false : !context.isConnected)}>{language.addCustomer}</Button>
				</View>
			</View>

			<AddCustomerValidationAlert
					onConfirm={() => onChange({ visible: false, message: "" }, "showAlert")}
					onCancel={() => onChange({ visible: false, message: "" }, "showAlert")}
					show={fields.showAlert.visible}
					message={fields.showAlert.message}
			/>
			{
				isLoading && 
				<UpScreenLoader />
			}
		</View>
	): null
};

export default AddCustomer;

export const AddCustomerOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<View>
				<AntDesign name={"adduser"} color={tabInfo.color} size={tabInfo.size} />
			</View>
		)
	}
}