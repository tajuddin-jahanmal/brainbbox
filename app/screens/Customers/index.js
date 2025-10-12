import { useIsFocused } from "@react-navigation/core";
import { useContext, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Card from "../../components/Card";
import CustomeDropdown from "../../components/CustomeDropdown";
import Header from "../../components/Header";
// import Input from "../../components/Input";
import Input from "../../components/Input";
import { ScreenWidth } from "../../constant";
import CustomerDB from "../../DB/Customer";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { SortCustomers } from "../../utils/SortData";
import Style from "./Style";

const Customers = (props) =>
{
	const isFocused = useIsFocused();
	const { goBack, navigate } = props.navigation;
	const initState = {
		from: "",
		to: "",
		showDatePicker: { visible: false, type: "" },
		search: "",
		showTotalCashinOut: true,
		totalCashInOut: { cash: 0, cashIn: 0, cashOut: 0, },
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
			return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));

		if (type === "search" && value.length >= 1)
		{
			let result = [];

			// globalState.customers.forEach(customer => {
			// 	if (context.customer.firstName)
			// 		if (customer?.customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
			// 	else 
			// 		if (customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
			// });

			globalState.customers.forEach(customer => {
				let firstNameMatch = customer?.customer?.firstName?.toLowerCase()?.includes(value?.toLowerCase()) ||
									 customer?.firstName?.toLowerCase()?.includes(value?.toLowerCase());

				let lastNameMatch = customer?.customer?.lastName?.toLowerCase()?.includes(value?.toLowerCase()) ||
									customer?.lastName?.toLowerCase()?.includes(value?.toLowerCase());
			
				if (firstNameMatch || lastNameMatch)
					result.push(customer);
			})

			return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(result)]));
		};
	};


	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return
			try {
				// if (globalState.customers.length <= 0 && context.isConnected)
				const customerData = await CustomerDB.getCustomers();
				if (globalState.customers.length <= 0 && customerData.length >= 1)
				{
					setIsLoading(true);
					const filterData = [];
					customerData.forEach(per => { filterData.push({...per, summary: JSON.parse(per.summary)}) });
					dispatch("setCustomers", filterData);
					setDataProvider(dataProvider.cloneWithRows([...SortCustomers(filterData)]));

					setIsLoading(false);
					return;
				}

				setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));
			} catch (error) {
				setIsLoading(false);
				// Alert.alert("Info!", error.message)
				Alert.alert("Info!", "Error Code: 4")
			}
		})();
	}, [globalState.customers, isFocused]);

	useEffect(() => {
		// if(globalState.customers.length > 0 && isFocused)
		if(isFocused)
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
	}, [globalState.customers, context.currency, isFocused]);

	const makeCustomerName = (item) => {
		const firstName = item.customer?.firstName || item?.firstName || "";
		const lastName = item.customer?.lastName || item?.lastName || "";
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
			<Card style={Style.card} onPress={() => navigate("CustomerTransactions", { cashbookId: item?.summary[0]?.cashbookId || item?._id || item?.id, customerName: makeCustomerName(item), fromCashbook: true })}>
				<View style={{width: "100%"}}>
					<View
						style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
					>
						<Text>{language.customer}: <Text numberOfLines={1}>{makeCustomerName(item)}</Text></Text>
					</View>
					<View
						style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
					>
						<Text>{language.phone}: <Text>{item?.customer?.countryCode || item?.countryCode}{item.customer?.phone || item.phone}</Text></Text>
					</View>
				</View>
			</Card>
		)
	}

	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.customers} goBack={goBack} />
			
			<View style={Style.content}>
				<View>
					<Input placeholder="Search" value={fields.search} onChangeText={(text) => onChange(text, "search")} />
				</View>
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
									<Text style={{...Style.cashInOutMony, ...Style.cashIn}}>{fields.totalCashInOut.cashIn} {context.currency.code}</Text>
								</View> */}
								<View style={Style.cashInOut}>
									<Text>{language.cash}</Text>
									<Text style={{...Style.cashInOutMony, ...fields.totalCashInOut.cash < 0 ? Style.cashOut : Style.cashIn}}>{fields.totalCashInOut.cash} {context.currency.code}</Text>
								</View>
								{/* <View style={Style.cashInOut}>
									<Text>{language.cashOut}</Text>
									<Text style={{...Style.cashInOutMony, ...Style.cashOut}}>{fields.totalCashInOut.cashOut} {context.currency.code}</Text>
								</View> */}
							</View>

							<CustomeDropdown />

							{/* <TouchableOpacity style={Style.hideTxtContainer} onPress={() => onChange(false, "showTotalCashinOut")}>
								<Text style={Style.showTxt}>Hide</Text>
							</TouchableOpacity> */}
						</Card>
					}
				</View>

				{/* {
					dataProvider._data.map((item, index) => (
						<Card style={Style.card} key={index} onPress={() => navigate("CustomerTransactions", { cashbookId: item?.summary[0]?.cashbookId || item?._id || item?.id, customerName: makeCustomerName(item), fromCashbook: true })}>
							<View style={{width: "100%"}}>
								<View
									style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
								>
									<Text>{language.customer}: <Text numberOfLines={1}>{makeCustomerName(item)}</Text></Text>
								</View>
								<View
									style={{...Style.flexRow, ...{...isRTL && {justifyContent: "flex-end"}}}}
								>
									<Text>{language.phone}: <Text>{item?.customer?.countryCode || item?.countryCode}{item.customer?.phone || item.phone}</Text></Text>
								</View>
							</View>
						</Card>
					))
				} */}

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
				
				{/* <View style={Style.cashsCotainer}>
					<Button style={{...Style.cashButton, ...Style.cashInButton}} onPress={() => navigate("CashIn", { fromCashbook: true })}>Cash In</Button>
					<Button style={Style.cashButton} onPress={() => navigate("CashOut", { fromCashbook: true })}>Cash Out</Button>
				</View> */}
			</View>
		</View>
	) : null;




	// const isFocused = useIsFocused();
	// const initState = {
	// 	customersData: [],
	// 	search: "",
	// 	showTotalCashinOut: false,
	// 	totalCashInOut: { cashIn: 0, cashOut: 0 },
	// };

	// const [ globalState, dispatch ] = useStore();
	// const context = useContext(ExchangeMoneyContext)
	// const [ fields, setFields ] = useState(initState);
	// const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	// const [isLoading, setIsLoading] = useState(false);
    // const { goBack, navigate } = props.navigation;

	// const onChange = (value, type) =>
	// {
	// 	setFields(perv => ({
	// 		...perv,
	// 		[type]: value,
	// 	}));

	// 	if (type === "search" && value.length === 0)
	// 		return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));

	// 	if (type === "search" && value.length >= 1)
	// 	{
	// 		let result = [];

	// 		globalState.customers.forEach(customer => {
	// 			if (context.customer.firstName)
	// 				if (customer?.customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
	// 			else 
	// 				if (customer?.firstName?.toLowerCase()?.search(value?.toLowerCase()) >= 0) { result.push(customer) }
	// 		});

	// 		return setDataProvider(dataProvider.cloneWithRows([...SortCustomers(result)]));
	// 	};
	// };

	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
	// 		if(!isFocused)
	// 			return
	// 		try {
	// 			const customerData = await CustomerDB.getCustomers();
	// 			if (globalState.customers.length <= 0)
	// 			{
	// 				setIsLoading(true);
	// 				const filterData = [];
	// 				customerData.forEach(per => { filterData.push({...per, summary: JSON.parse(per.summary)}) });
	// 				dispatch("setCustomers", filterData);
	// 				setDataProvider(dataProvider.cloneWithRows([...SortCustomers(filterData)]));

	// 				setIsLoading(false);
	// 				return;
	// 			}

	// 			setDataProvider(dataProvider.cloneWithRows([...SortCustomers(globalState.customers)]));
	// 		} catch (error) {
	// 			setIsLoading(false);
	// 			Alert.alert("Info!", error.message)
	// 		}
	// 	})();
	// }, [isFocused]);

	// const makeCustomerName = (item) => (item.customer?.firstName || item?.firstName + " " + isLastNameExist(item));
	// const isLastNameExist = (item) =>
	// {
	// 	if (item.customer?.lastName)
	// 		return item.customer?.lastName;
	// 	if (item?.lastName)
	// 		return item.lastName;
	// 	return "";
	// }

	// const NORMAL = "NORMAL";
	
	// const layoutProvider = new LayoutProvider((index) => {
	// 	return NORMAL
	// }, (type, dim) =>
	// {
	// 	switch (type) {
	// 		case NORMAL:
	// 			dim.width = ScreenWidth,
	// 			dim.height = 76
	// 			break;
	// 		default:
	// 			dim.width = 0,
	// 			dim.height = 0
	// 			break;
	// 	}
	// });

	// const rowRenderer = (type, item) =>
	// {
	// 	return (
	// 		<Card style={Style.card} onPress={() => navigate("CustomerTransactions", { cashbookId: item?.summary[0]?.cashbookId || item?._id || item?.id, customerName: makeCustomerName(item), dailyTrans: true })}>
	// 			<View style={Style.flexRow}>
	// 				<Text>Customer: </Text>
	// 				<Text numberOfLines={1}>{makeCustomerName(item)}</Text>
	// 			</View>
	// 			<View style={Style.flexRow}>
	// 				<Text>Phone: </Text>
	// 				<Text>{item.customer?.phone || item.phone}</Text>
	// 			</View>
	// 		</Card>
	// 	)
	// }

//   return isFocused ? (
// 		<View style={Style.container}>
//             <Header title={"Customers"} goBack={goBack} />
// 			<View style={Style.content}>
// 				<View>
// 					<Input style={Style.search} placeholder="Search" value={fields.search} onChangeText={(text) => onChange(text, "search")} />

// 					{/* {
// 						!fields.showTotalCashinOut &&
// 						<TouchableOpacity style={Style.showTxtContainer} onPress={() => onChange(true, "showTotalCashinOut")}>
// 							<Text style={Style.showTxt}>Show</Text>
// 						</TouchableOpacity>
// 					}

// 					{
// 						fields.showTotalCashinOut &&
// 						<Card style={Style.cashInOutContainer} activeOpacity={1}>
// 							<View style={Style.cashInOut}>
// 								<Text>Total Cash In</Text>
// 								<Text style={{...Style.cashInOutMony, ...Style.cashIn}}>{fields.totalCashInOut.cashIn} {context.currency.code}</Text>
// 							</View>
// 							<View style={Style.cashInOut}>
// 								<Text>Total Cash Out</Text>
// 								<Text style={{...Style.cashInOutMony, ...Style.cashOut}}>{fields.totalCashInOut.cashOut} {context.currency.code}</Text>
// 							</View>

// 							<TouchableOpacity style={Style.hideTxtContainer} onPress={() => onChange(false, "showTotalCashinOut")}>
// 								<Text style={Style.showTxt}>Hide</Text>
// 							</TouchableOpacity>
// 						</Card>
// 					} */}
// 				</View>

// 				{
// 					dataProvider._data.length >= 1 ?
// 					<RecyclerListView
// 						dataProvider={dataProvider}
// 						layoutProvider={layoutProvider}
// 						rowRenderer={rowRenderer}
// 					/>					
// 					:
// 					<View style={Style.notFoundContainer}>
// 						<Text style={Style.notFound}>Customer Not Found</Text>
// 					</View>
// 				}

// 				{/* <Add onPress={() => navigate("AddCustomer")} /> */}
// 				{
// 					isLoading &&
// 					<UpScreenLoader />
// 				}
// 			</View>
// 		</View>
// 	) : null;
};

export default Customers;