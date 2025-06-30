import Feather from '@expo/vector-icons/Feather';
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { ScreenWidth } from "../../constant";
import OppositeCustomer from "../../DB/OppositeCustomer";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import serverPath from "../../utils/serverPath";
import { SortCustomers } from "../../utils/SortData";
import Style from "./Style";

const Opposite = (props) =>
{
	const isFocused = useIsFocused();
	const { navigate } = props.navigation;
	const initState = {
		search: "",
		showTotalCashinOut: false,
		totalCashInOut: { cashIn: 0, cashOut: 0 },
	}

	const [ globalState, dispatch ] = useStore();
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const [isLoading, setIsLoading] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const isRTL = language.isRtl;

	const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));

		if (type === "search" && value.length === 0)
			return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.oppositeCustomers)]));

		if (type === "search" && value.length >= 1)
		{
			let result = [];

			// globalState.oppositeCustomers.forEach(customer => {
			// 	if (context.customer.firstName)
			// 		if (customer?.owner?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
			// 	else 
			// 		if (customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
			// });

			globalState.oppositeCustomers.forEach(customer => {
				let firstNameMatch = customer?.owner?.firstName?.toLowerCase()?.includes(value?.toLowerCase()) ||
									 customer?.firstName?.toLowerCase()?.includes(value?.toLowerCase());
			
				let lastNameMatch = customer?.owner?.lastName?.toLowerCase()?.includes(value?.toLowerCase()) ||
									customer?.lastName?.toLowerCase()?.includes(value?.toLowerCase());
			
				if (firstNameMatch || lastNameMatch)
					result.push(customer);
			});
			

			return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(result)]));
		};
	};


	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return;
			if (!context.isGuest)
			{
				try {
					console.log("useEffect [Opposite]");
					const oppositeCustomerData = await OppositeCustomer.getOppositeCustomers();
					if (globalState.oppositeCustomers.length >= 1)
					{
						setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.oppositeCustomers)]));
						return;
					};

					if (context.isConnected && globalState.oppositeCustomers.length <= 0)
					{
						const response = await fetch(serverPath("/get/cashbook"), {
							method: "POST",
							headers: {
								"Content-Type": "Application/JSON",
							},
							body: JSON.stringify({providerId: context.user.id, customerId: context.customer.id})
						});
			
						const objData = await response.json();
						if (objData.status === "success" && objData.data.length >= 1)
						{
							await OppositeCustomer.clearOppositeCustomers();
							let filterData = [];
							objData.data.forEach(oppCustomer =>
							{
								if (oppCustomer.ownerId !== context.customer.id)
								{
									filterData.push(oppCustomer);
									OppositeCustomer.createOppositeCustomer(
										oppCustomer.id,
										oppCustomer.owner.firstName,
										oppCustomer.owner.lastName,
										oppCustomer.owner.phone,
										oppCustomer.owner.email,
										JSON.stringify(oppCustomer?.summary),
										oppCustomer.owner.active,
										oppCustomer.owner.userId
									);
								};
							});
							if (filterData.length >= 1)
							{
								dispatch("setOppositeCustomers", filterData);
								setDataProvider(dataProvider.cloneWithRows([...SortCustomers(filterData)]));
							}
							setIsLoading(false);
							return;
						};

						if (objData.status === "failure")
							return Alert.alert("Info!", objData.message)
						return;
					}

					if (globalState.oppositeCustomers.length <= 0)
					{
						const filterData = [];
						setIsLoading(true);
						if (oppositeCustomerData.length >= 1)
						{
							oppositeCustomerData.forEach(per => { filterData.push({...per, summary: JSON.parse(per.summary)}) });
							dispatch("setOppositeCustomers", filterData);
							setDataProvider(dataProvider.cloneWithRows([...SortCustomers(filterData)]));
						}
						setIsLoading(false);
						return;
					}

					return;
				} catch (error) {
					setIsLoading(false);
					// Alert.alert("Info!", error.message)
					Alert.alert("Info!", "Error Code: 5")
				}
			}
		})();
	}, [globalState.oppositeCustomers, isFocused]);
	// }, [globalState.oppositeCustomers, isFocused]);

	const makeCustomerName = (item) => {
		const firstName = item.owner?.firstName || item?.firstName || "";
		const lastName = item.owner?.lastName || item?.lastName || "";
		return `${firstName} ${lastName}`.trim();
	};
	
	const NORMAL = "NORMAL";
	
	const layoutProvider = new LayoutProvider((index) => {
		return NORMAL
	}, (type, dim) =>
	{
		switch (type) {
			case NORMAL:
				dim.width = ScreenWidth,
				dim.height = 75
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
			<Card style={Style.card} onPress={() => navigate("OppositeTransactions", { cashbookId: item?.summary[0]?.cashbookId || item?._id || item?.id, })}>
				<View style={{width: "100%"}}>
					<View
						style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
					>
						<Text>{language.customer}: <Text numberOfLines={1}>{makeCustomerName(item)}</Text></Text>
					</View>
					<View
						style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
					>
						<Text>{language.phone}: <Text>{item?.owner?.countryCode || item?.countryCode}{item.owner?.phone || item.phone}</Text></Text>
					</View>
				</View>
			</Card>
		)
	}
	
	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.opposite} noBack />
			
			<View style={Style.content}>
				<Input placeholder={language.search} style={Style.search} value={fields.search} disalbed={globalState.oppositeCustomers.length <= 0 ? true : false} onChangeText={(text) => onChange(text, "search")} />
				{
					dataProvider._data.length >= 1 ?
					<RecyclerListView
						dataProvider={dataProvider}
						layoutProvider={layoutProvider}
						rowRenderer={rowRenderer}
						keyboardShouldPersistTaps="handled"
					/>					
					:
					<View style={Style.notFoundContainer}>
						<Text style={Style.notFound}>{language.customerNotFound}</Text>
					</View>
				}
				
			</View>
		</View>
	) : null
};

export default Opposite;


export const OppositeOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<View>
				<Feather name="repeat" size={tabInfo.size} color={tabInfo.color} />
			</View>
		)
	}
}