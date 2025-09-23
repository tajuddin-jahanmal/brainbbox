import AntDesign from '@expo/vector-icons/AntDesign';
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CustomeDropdown from "../../components/CustomeDropdown";
import Header from "../../components/Header";
import Transaction from "../../components/Transaction";
import TransactionModal from "../../components/TransactionModal";
import { ScreenWidth } from "../../constant";
import CustomerDB from "../../DB/Customer";
import TransactionDB from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import GetResponsiveFontSize from "../../utils/TransactionFontSizeManager";
import Style from "./Style";

const CashBook = (props) =>
{
	const isFocused = useIsFocused();
	const { navigate } = props.navigation;
	const initState = {
		from: "",
		to: "",
		search: "",
		modalCustomerName: "",
		showTotalCashinOut: true,
		transactionModal: {visible: false, data: {}},
		showDatePicker: { visible: false, type: "" },
		totalCashInOut: { cash: 0, cashIn: 0, cashOut: 0, },
		currentPage: 1,
		totalDataLength: 0,
	}

	const [ globalState, dispatch ] = useStore();
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const [isLoading, setIsLoading] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const paginateDataLength = 50;
	const lastIndex = fields.currentPage * paginateDataLength;

	const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));

		// if (type === "search" && value.length === 0)
		// 	return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));

		// if (type === "search" && value.length >= 1)
		// {
		// 	let result = [];

		// 	globalState.customers.forEach(customer => {
		// 		if (context.customer.firstName)
		// 			if (customer?.customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
		// 		else 
		// 			if (customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
		// 	});

		// 	return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(result)]));
		// };
	};


	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
	// 		if(!isFocused)
	// 			return
	// 		try {
	// 			// if (globalState.customers.length <= 0 && context.isConnected)
	// 			const customerData = await Customers.getCustomers();
	// 			if (globalState.customers.length <= 0 && customerData.length >= 1)
	// 			{
	// 				setIsLoading(true);
	// 				const filterData = [];
	// 				customerData.forEach(per => { filterData.push({...per, summary: JSON.parse(per.summary)}) });
	// 				dispatch("setCustomers", filterData);
	// 				setDataProvider(dataProvider.cloneWithRows([...filterData]));

	// 				setIsLoading(false);
	// 				return;
	// 			}

	// 			setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));
	// 		} catch (error) {
	// 			setIsLoading(false);
	// 			Alert.alert("Info!", error.message)
	// 		}
	// 	})();
	// }, [globalState.customers, isFocused]);
	
	useEffect(() => {
		(async () =>
		{
			const customerData = await CustomerDB.getCustomers();
			// if (globalState.customers?.length <= 0 && customerData?.length >= 1)
			if (globalState.customers?.length <= 0 && customerData?.length >= 1 && isFocused)
			{
				const filterData = [];
				customerData.forEach(per => { filterData.push({...per, summary: JSON.parse(per.summary)}) });
				dispatch("setCustomers", filterData);
			}
			if(globalState.customers?.length > 0 && isFocused)
			{
				let cash = { cashIn: 0, cashOut: 0 };
				globalState.customers.forEach(customer => {
					customer.summary?.forEach(per => {
						if(per.currencyId == context.currency?.id)
						{
							cash.cashIn = (cash.cashIn + per.cashIn)
							cash.cashOut = (cash.cashOut + per.cashOut)
						}
					})
				});
				setFields(prev => ({
					...prev,
					totalCashInOut: { cash: cash.cashIn - cash.cashOut, cashIn: cash.cashIn, cashOut: cash.cashOut }
				}))
			}
		})();
	}, [globalState.customers, context.currency.id, isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return;
			
			const data = await TransactionDB.getTransactionsByDate(context.currency.id);
			if (data?.length >= 1)
				setDataProvider(dataProvider.cloneWithRows([...paginationFunction(data)]));

			if (data?.length === 0 && dataProvider._data?.length >= 1)
				setDataProvider(dataProvider.cloneWithRows([]));

			// const response = await fetch(serverPath("/get/all_transactions"), {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "Application/JSON",
			// 	},
			// 	body: JSON.stringify({ currencyId: context.currency.id, type: "owner", providerId: context.user.id })
			// });

			// const objData = await response.json();
			// if (objData.status === "success")
			// 	setDataProvider(dataProvider.cloneWithRows([...paginationFunction(objData.data)]));
	
			// if (objData.status === "failure")
			// 	return Alert.alert("Info!", objData.message);
		})();
	}, [globalState.transactions, fields.currentPage, isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return;
			
			const data = await TransactionDB.getTransactionsByDate(context.currency.id);
			if (data?.length >= 1)
			{
				setFields(prev => ({
					...prev,
					currentPage: 1,
					totalDataLength: 0,
				}));
				setDataProvider(dataProvider.cloneWithRows([...paginationFunction(data)]));
			}
		})();
	}, [context.currency.id]);

	const paginationFunction = (data) =>
	{
		const firstIndex = lastIndex - paginateDataLength;
		const recorder = data.slice(firstIndex, lastIndex);
		onChange(data?.length, "totalDataLength");
		return recorder;
	};

	const dateMaker = (date) =>
	{
		const newDate = new Date(date.toString());
		return newDate.getFullYear() + "/" + Number.parseInt(newDate.getMonth()+1) + "/" + newDate.getDate()
	}

	const nextPage = () =>
	{
		if (fields.currentPage !== Math.ceil(fields.totalDataLength / paginateDataLength))
			onChange(fields.currentPage + 1, "currentPage");
	};

	const prevPage = () =>
	{
		if (fields.currentPage !== 1)
			onChange(fields.currentPage - 1, "currentPage");
	}

	const transactionHandler = (item) =>
	{
		const customer = globalState.customers.find(cus => (cus._id || cus.id) === item.cashbookId);
		onChange(((customer?.customer?.firstName || customer?.firstName) +" "+ (customer.customer?.lastName || customer?.lastName || "")), "modalCustomerName");
		onChange({visible: true, data: item}, "transactionModal");
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
			<Transaction
				item={item}
				onPress={() => transactionHandler(item)}
			/>
		)
	}

	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.cashBook} noBack />
			
			<View style={Style.content}>
				{/* <Input placeholder="Search" value={fields.search} onChangeText={(text) => onChange(text, "search")} /> */}
				<View>
					{
						!fields.showTotalCashinOut &&
						<TouchableOpacity style={Style.showTxtContainer} onPress={() => onChange(true, "showTotalCashinOut")}>
							<Text style={Style.showTxt}>{language.show}</Text>
						</TouchableOpacity>
					}

					{
						fields.showTotalCashinOut &&
						<Card style={Style.cashInOutContainer} activeOpacity={1}>
							<View style={Style.cashInOutContent}>
								{/* <View style={Style.cashInOut}>
									<Text>{language.cashIn}</Text>
									<Text style={{...Style.cashInOutMony, ...Style.cashIn, ...{fontSize: GetResponsiveFontSize(fields.totalCashInOut.cashIn)}}}>{fields.totalCashInOut.cashIn} {context.currency.code}</Text>
								</View> */}
								<View style={Style.cashInOut}>
									<Text>{language.cash}</Text>
									<Text style={{...Style.cashInOutMony, ...fields.totalCashInOut.cash < 0 ? Style.cashOut : Style.cashIn, ...{fontSize: GetResponsiveFontSize(fields.totalCashInOut.cash)}}}>{fields.totalCashInOut.cash} {context.currency.code}</Text>
								</View>
								{/* <View style={Style.cashInOut}>
									<Text>{language.cashOut}</Text>
									<Text style={{...Style.cashInOutMony, ...Style.cashOut, ...{fontSize: GetResponsiveFontSize(fields.totalCashInOut.cashOut)}}}>{fields.totalCashInOut.cashOut} {context.currency.code}</Text>
								</View> */}
							</View>

							<CustomeDropdown />

							{/* <TouchableOpacity style={Style.hideTxtContainer} onPress={() => onChange(false, "showTotalCashinOut")}>
								<Text style={Style.showTxt}>Hide</Text>
							</TouchableOpacity> */}
						</Card>
					}
				</View>

				<Card style={Style.dateCashinOutContainer}>
					<Text style={Style.dateTime}>{language.date}</Text>
					{/* <Text style={{...Style.dateTime, ...Style.margin}}>{language.cashOut}</Text> */}
					<Text style={{...Style.dateTime}}>{language.cashOut}</Text>
					<Text style={Style.dateTime}>{language.cashIn}</Text>
				</Card>

				{
					dataProvider._data?.length >= 1 ?
					<>
						<RecyclerListView
							dataProvider={dataProvider}
							layoutProvider={layoutProvider}
							rowRenderer={rowRenderer}
							renderFooter={() => (
								<>
									{fields.totalDataLength >= 50 && <View style={Style.paginateCardContainer}>
									<Card style={Style.paginateCardStyle} onPress={prevPage}>
										<Text>{language.prev}</Text>
									</Card>
	
									<Card style={Style.paginateCardStyle}>
										<Text>{fields.currentPage} / {Math.ceil(fields.totalDataLength / paginateDataLength)}</Text>
									</Card>
	
									<Card style={Style.paginateCardStyle} onPress={nextPage}>
										<Text>{language.next}</Text>
									</Card>
								</View>}
								</>
							)}
						/>
					</>
					:
					<View style={Style.notFoundContainer}>
						<Text style={Style.notFound}>{language.noDataAvailable}</Text>
					</View>
				}
				
				<View style={Style.cashsCotainer}>
					<Button style={{...Style.cashButton, ...Style.cashInButton}} onPress={() => navigate("CashIn", { fromCashbook: true })}>{language.cashIn}</Button>
					<Button style={Style.cashButton} onPress={() => navigate("CashOut", { fromCashbook: true })}>{language.cashOut}</Button>
				</View>
			</View>
			<TransactionModal
				visible={fields.transactionModal.visible}
				customerName={fields.modalCustomerName}
				data={fields.transactionModal.data}
				onDismiss={() => onChange({visible: false, data: {}}, "transactionModal")}
			/>
		</View>
	) : null
};

export default CashBook;


export const CashBookOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<View>
				<AntDesign name={"book"} color={tabInfo.color} size={tabInfo.size} />
			</View>
		)
	}
}