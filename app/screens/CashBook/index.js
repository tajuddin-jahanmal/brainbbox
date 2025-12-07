import AntDesign from '@expo/vector-icons/AntDesign';
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CustomeDropdown from "../../components/CustomeDropdown";
import Header from "../../components/Header";
import OpeningBalanceModal from '../../components/OpeningBalanceModal';
import Transaction from "../../components/Transaction";
import TransactionModal from "../../components/TransactionModal";
import { ScreenWidth } from "../../constant";
import CustomerDB from "../../DB/Customer";
import OpeningBalance from '../../DB/OpeningBalance';
import TransactionDB from "../../DB/Transaction";
import WeeklyBalances from '../../DB/WeeklyBalances';
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { getWeekRange } from '../../utils/dateMaker';
import serverPath from '../../utils/serverPath';
import SortData from '../../utils/SortData';
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
		openingBalanceModal: false,
	}

	const [ globalState, dispatch ] = useStore();
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const [isLoading, setIsLoading] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const paginateDataLength = 50;
	// const lastIndex = fields.currentPage * paginateDataLength;

	const fullListRef = useRef([]);

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
				const openingBalance = await OpeningBalance.getLatestOpeningBalance(context.currency.id);
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
					totalCashInOut: { cash: cash.cashIn - cash.cashOut + (openingBalance?.amount || 0), cashIn: cash.cashIn, cashOut: cash.cashOut }
				}))
			}
		})();
	}, [globalState.customers, globalState.openingBalances, context.currency.id, isFocused]);



	useEffect(() => {
		if (!isFocused) return;

		loadCashbookTransactions();
	}, [isFocused, context.currency.id, globalState.transactions]);

	useEffect(() => {
		paginationFunction();
	}, [fields.currentPage]);

	const loadCashbookTransactions = () => {
		const sorted = SortData(
			globalState.transactions.filter(t => t.currencyId === context.currency.id)
		);

		fullListRef.current = sorted;
		paginationFunction();
	};




	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
	// 		if(!isFocused)
	// 			return;
			
	// 		// const data = await TransactionDB.getTransactionsByCurrencyId(context?.currency?.id);
	// 		const filteredTransactions = SortData(globalState.transactions?.filter(t => t.currencyId === context?.currency?.id));

	// 		if (filteredTransactions?.length >= 1)
	// 			setDataProvider(dataProvider.cloneWithRows([...paginationFunction(filteredTransactions)]));

	// 		if (filteredTransactions?.length === 0 && dataProvider._data?.length >= 1)
	// 			setDataProvider(dataProvider.cloneWithRows([]));

	// 	})();
	// }, [globalState.transactions, fields.currentPage, isFocused]);

	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
	// 		if(!isFocused)
	// 			return;
			
	// 		// const data = await TransactionDB.getTransactionsByCurrencyId(context?.currency?.id);
	// 		const filteredTransactions = SortData(globalState.transactions?.filter(t => t.currencyId === context?.currency?.id));
			
	// 		if (filteredTransactions?.length >= 1)
	// 		{
	// 			setFields(prev => ({
	// 				...prev,
	// 				currentPage: 1,
	// 				totalDataLength: 0,
	// 			}));
	// 			setDataProvider(dataProvider.cloneWithRows([...paginationFunction(filteredTransactions)]));
	// 		}
	// 	})();
	// }, [context.currency.id]);

	const paginationFunction = (data) =>
	{
		// const firstIndex = lastIndex - paginateDataLength;
		// const recorder = data.slice(firstIndex, lastIndex);
		// onChange(data?.length, "totalDataLength");
		// return recorder;


		const pageSize = paginateDataLength;
		const total = fullListRef.current.length;

		const start = (fields.currentPage - 1) * pageSize;
		const end = start + pageSize;

		const pageData = fullListRef.current.slice(start, end);

		onChange(total, "totalDataLength");
		setDataProvider(prev => prev.cloneWithRows(pageData));
	};

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

	const deleteHandler = async (item) =>
	{
		try {
			setIsLoading(true);

			if (context.isGuest)
				return dataManager(item);

			if (!context.isConnected)
			{
				Alert.alert("Alert", "You are offline.");
				return
			}

			// const isExist = await Queue.findQueueEntrie(item._id || item.id);

			// IN OFFLINE MODE TRANSACTION SHOULD DELETE BECAUSE FOR THE WEEKLY_BALANCES
			// if (!context.isConnected)
			// {
			// 	if (isExist.length >= 1)
			// 	{
			// 		Queue.deleteQueueEntry(isExist[0].id);
			// 		dataManager(item);
			// 		return;
			// 	};
				
			// 	let requestData = {
			// 		id: (item._id || item.id),
			// 		amount: item.amount,
			// 		profit: item.profit,
			// 		currencyId: item.currencyId,
			// 		information: item.information,
			// 		cashbookId: item.cashbookId,
			// 		type: item.type,
			// 		dateTime: item.dateTime,
			// 	}

			// 	Queue.createQueueEntry("delete", (item._id || item.id), "transactions", JSON.stringify(requestData), (item._id || item.id));
			// 	dataManager(item);
			// 	return;
			// };

			// if (isExist.length >= 1)
			// {
			// 	Queue.deleteQueueEntry(isExist[0].id);
			// 	dataManager(item);
			// 	return;
			// };

			const { weekStart, weekEnd } = getWeekRange(item.dateTime);
			const weeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
				context?.customer?.id,
				context?.currency?.id,
				new Date(weekStart).toISOString(),
				new Date(weekEnd).toISOString()
			);

			if (weeklyData.length >= 1)
			{
				const weeklyDataClone = {...weeklyData[0]};
				if (item.type) {
					weeklyDataClone.totalCashIn -= item.amount;
					weeklyDataClone.closingBalance -= item.amount;
				} else {
					weeklyDataClone.totalCashOut -= item.amount;
					weeklyDataClone.closingBalance += item.amount;
				}

				const success = await updateServerTransaction(item._id || item.id);
				if (!success)
					return;

				const weekylBalanceResponse = await fetch(serverPath("/weekly_balance"), {
					method: "PUT",
					headers: { "Content-Type": "Application/JSON" },
					body: JSON.stringify({
						id: weeklyDataClone._id || weeklyDataClone.id,
						weekStart: weeklyDataClone.weekStart,
						weekEnd: weeklyDataClone.weekEnd,
						openingBalance: weeklyDataClone.openingBalance,
						totalCashIn: weeklyDataClone.totalCashIn,
						totalCashOut: weeklyDataClone.totalCashOut,
						closingBalance: weeklyDataClone.closingBalance,
						providerId: context?.user?.id,
						customerId: context?.customer?.id,
						currencyId: context?.currency?.id,
					}),
				});
				const weeklyBalanceObjData = await weekylBalanceResponse.json();

				if (weeklyBalanceObjData.status === "failure")
				{
					console.log(weeklyBalanceObjData, "Cashbook Weekly Balance Update");
					return;
				}

				await WeeklyBalances.updateWeeklyBalance(
					weeklyDataClone.id, // this ID is from localDatabase
					weeklyDataClone.weekStart,
					weeklyDataClone.weekEnd,
					weeklyDataClone.openingBalance,
					weeklyDataClone.totalCashIn,
					weeklyDataClone.totalCashOut,
					weeklyDataClone.closingBalance
				);

				updateNextWeekBalance(weekEnd, weeklyDataClone.closingBalance, item);
				dataManager(item);

				return;


				// -----------FOR THE NEW WORKING BATCH UPDATE METHOD -----------------
				// // Get all subsequent weeks that need updating
				// const weeksToUpdate = await getSubsequentWeeksToUpdate(weekEnd, weeklyDataClone.closingBalance, item);

				// // Add the current week to the update batch
				// weeksToUpdate.unshift({
				// 	id: weeklyDataClone._id || weeklyDataClone.id,
				// 	weekStart: weeklyDataClone.weekStart,
				// 	weekEnd: weeklyDataClone.weekEnd,
				// 	openingBalance: weeklyDataClone.openingBalance,
				// 	totalCashIn: weeklyDataClone.totalCashIn,
				// 	totalCashOut: weeklyDataClone.totalCashOut,
				// 	closingBalance: weeklyDataClone.closingBalance,
				// 	customerId: context?.customer?.id,
				// 	currencyId: context?.currency?.id,
				// });

				// // Send all updates in one API call
				// const updateSuccess = await updateWeeklyBalancesBatch(weeksToUpdate);
				
				// if (updateSuccess) {
				// 	// Update local database for all weeks
				// 	for (const week of weeksToUpdate) {
				// 		await WeeklyBalances.updateWeeklyBalance(
				// 			week.id,
				// 			week.weekStart,
				// 			week.weekEnd,
				// 			week.openingBalance,
				// 			week.totalCashIn,
				// 			week.totalCashOut,
				// 			week.closingBalance
				// 		);
				// 	}
				// 	dataManager(item);
				// }
				// return;
			};
			
			const success = await updateServerTransaction(item._id || item.id);
			if (success)
				dataManager(item);

		} catch (error) {
			setIsLoading(false)
			console.log(error)
		}
	};

	const updateServerTransaction = async (itemId) => {
		const response = await fetch(serverPath("/transaction"), {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: itemId, providerId: context.user.id }),
		});

		const result = await response.json();
		if (result.status === "failure")
		{
			Alert.alert("Info!", result.message);
			setIsLoading(false);
			return false;
		}
		return true;
	};

	// -----------FOR THE NEW WORKING BATCH UPDATE METHOD -----------------
	// // New function to collect all subsequent weeks that need updating
	// const getSubsequentWeeksToUpdate = async (startWeekEnd, startClosingBalance, transaction) => {
	// 	const weeksToUpdate = [];
	// 	let currentWeekEnd = startWeekEnd;
	// 	let currentOpeningBalance = startClosingBalance;

	// 	const newest = await WeeklyBalances.getNewestWeeklyBalance(
	// 		context?.customer?.id,
	// 		context?.currency?.id
	// 	);

	// 	if (!newest) {
	// 		console.log("❌ No newest weekly balance found.");
	// 		return weeksToUpdate;
	// 	}

	// 	while (true) {
	// 		const nextWeekEndDate = new Date(currentWeekEnd);
	// 		nextWeekEndDate.setDate(nextWeekEndDate.getDate() + 1);

	// 		const { weekStart: nextWeekStart, weekEnd: nextWeekEnd } = getWeekRange(nextWeekEndDate);

	// 		// Stop if we've reached the newest week
	// 		if (new Date(nextWeekStart) > new Date(newest.weekStart)) {
	// 			console.log("🛑 Reached newest weekly balance. Stopping updates.");
	// 			break;
	// 		}

	// 		const nextWeeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
	// 			context?.customer?.id,
	// 			context?.currency?.id,
	// 			new Date(nextWeekStart).toISOString(),
	// 			new Date(nextWeekEnd).toISOString()
	// 		);

	// 		if (nextWeeklyData.length === 0) {
	// 			console.log("⚠️ Missing week → Skipping:", nextWeekStart);
	// 			currentWeekEnd = nextWeekEnd;
	// 			continue;
	// 		}

	// 		const weeklyDataClone = { ...nextWeeklyData[0] };
			
	// 		// Update the week's data
	// 		weeklyDataClone.openingBalance = currentOpeningBalance;
			
	// 		// Adjust closing balance based on transaction type
	// 		if (transaction.type) {
	// 			weeklyDataClone.closingBalance -= transaction.amount;
	// 		} else {
	// 			weeklyDataClone.closingBalance += transaction.amount;
	// 		}

	// 		weeksToUpdate.push({
	// 			id: weeklyDataClone._id || weeklyDataClone.id,
	// 			weekStart: weeklyDataClone.weekStart,
	// 			weekEnd: weeklyDataClone.weekEnd,
	// 			openingBalance: weeklyDataClone.openingBalance,
	// 			totalCashIn: weeklyDataClone.totalCashIn,
	// 			totalCashOut: weeklyDataClone.totalCashOut,
	// 			closingBalance: weeklyDataClone.closingBalance,
	// 			customerId: context?.customer?.id,
	// 			currencyId: context?.currency?.id,
	// 		});

	// 		// Prepare for next iteration
	// 		currentOpeningBalance = weeklyDataClone.closingBalance;
	// 		currentWeekEnd = nextWeekEnd;
	// 	}

	// 	return weeksToUpdate;
	// };

		
	// -----------FOR THE NEW WORKING BATCH UPDATE METHOD -----------------
	// // New function to send batch update
	// const updateWeeklyBalancesBatch = async (weeksData) => {
	// 	try {
	// 		const response = await fetch(serverPath("/weekly_balance/batch"), {
	// 			method: "PUT",
	// 			headers: { "Content-Type": "Application/JSON" },
	// 			body: JSON.stringify({
	// 				weeks: weeksData,
	// 				providerId: context?.user?.id,
	// 			}),
	// 		});

	// 		const result = await response.json();
			
	// 		if (result.status === "failure") {
	// 			console.log("❌ Failed to update weekly balances batch:", result);
	// 			Alert.alert("Error", "Failed to update weekly balances");
	// 			return false;
	// 		}

	// 		console.log("✅ Successfully updated", weeksData.length, "weekly balances");
	// 		return true;
	// 	} catch (error) {
	// 		console.log("❌ Error updating weekly balances batch:", error);
	// 		Alert.alert("Error", "Network error while updating weekly balances");
	// 		return false;
	// 	}
	// };

	const updateNextWeekBalance = async (weekEnd, newOpeningBalance, transaction) =>
	{
		const newest = await WeeklyBalances.getNewestWeeklyBalance(
			context?.customer?.id,
			context?.currency?.id
		);

		if (!newest) {
			console.log("❌ No newest weekly balance found. Stopping.");
			return;
		}

		const nextWeekEndDate = new Date(weekEnd);
		nextWeekEndDate.setDate(nextWeekEndDate.getDate() + 1);

		const { weekStart: nextWeekStart, weekEnd: nextWeekEnd } = getWeekRange(nextWeekEndDate);

		if (new Date(nextWeekStart) > new Date(newest.weekStart)) {
			console.log("🛑 Reached newest weekly balance. Stopping updates.");
			return;
		}

		const nextWeeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
			context?.customer?.id,
			context?.currency?.id,
			new Date(nextWeekStart).toISOString(),
			new Date(nextWeekEnd).toISOString()
		);

		if (nextWeeklyData.length === 0) {
			console.log("⚠️ Missing week → Skipping:", nextWeekStart);
			return updateNextWeekBalance(nextWeekEnd, newOpeningBalance, transaction);
		}

		const weeklyDataClone = { ...nextWeeklyData[0] };

		weeklyDataClone.openingBalance = newOpeningBalance;
		// weeklyDataClone.closingBalance = weeklyDataClone.openingBalance + (weeklyDataClone.totalCashIn - weeklyDataClone.totalCashOut);
		if (transaction.type) {
			weeklyDataClone.closingBalance -= transaction.amount;
		} else {
			weeklyDataClone.closingBalance += transaction.amount;
		}

		const response = await fetch(serverPath("/weekly_balance"), {
			method: "PUT",
			headers: { "Content-Type": "Application/JSON" },
			body: JSON.stringify({
				id: weeklyDataClone._id || weeklyDataClone.id,
				weekStart: weeklyDataClone.weekStart,
				weekEnd: weeklyDataClone.weekEnd,
				openingBalance: weeklyDataClone.openingBalance,
				totalCashIn: weeklyDataClone.totalCashIn,
				totalCashOut: weeklyDataClone.totalCashOut,
				closingBalance: weeklyDataClone.closingBalance,
				providerId: context?.user?.id,
				customerId: context?.customer?.id,
				currencyId: context?.currency?.id,
			}),
		});

		const objData = await response.json();
		if (objData.status === "failure") {
			console.log("❌ Failed to update next week:", objData);
			return;
		}

		await WeeklyBalances.updateWeeklyBalance(
			weeklyDataClone.id, // this ID is from localDatabase
			weeklyDataClone.weekStart,
			weeklyDataClone.weekEnd,
			weeklyDataClone.openingBalance,
			weeklyDataClone.totalCashIn,
			weeklyDataClone.totalCashOut,
			weeklyDataClone.closingBalance
		);

		return updateNextWeekBalance(nextWeekEnd, weeklyDataClone.closingBalance, transaction);
	};

	const dataManager = async (item) =>
	{
		const customerData = await CustomerDB.getCustomers();
		let cloneCustomers = [...globalState.customers];
		
		let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == item.cashbookId);
		if(cashBookIndex < 0)
			return Alert.alert("Info!",  "Please Try Again!");
		let cloneSummary = [...cloneCustomers[cashBookIndex]?.summary];
		let summaryIndex = cloneSummary.findIndex(per => per.currencyId == item.currencyId)
		if(summaryIndex < 0)
			return Alert.alert("Info!",  "PLease Try Again!");
		let In_Out_Amount = cloneSummary[summaryIndex][item.type ? "cashIn" : "cashOut"];
		if (item.type === false || item.type === 0)
		{
			// let newInAmount = (cloneSummary[summaryIndex]["cashIn"] + item.amount)
			// cloneSummary[summaryIndex]["cashIn"] = newInAmount;
		}
		let newAmount = (In_Out_Amount - item.amount)
		let totalProfit = (cloneSummary[summaryIndex].totalProfit - item.profit)
		cloneSummary[summaryIndex][item.type ? "cashIn" : "cashOut"] = newAmount;
		cloneSummary[summaryIndex].totalProfit = totalProfit;
		cloneCustomers[cashBookIndex].summary = cloneSummary;
		const transactionsClone = [...globalState.transactions];
		let ndx = transactionsClone.findIndex(per => per.id == item.id)
		if (ndx >= 0)
		transactionsClone.splice(ndx, 1)
		dispatch("setCustomers", cloneCustomers);
		dispatch("setTransactions", transactionsClone);
		TransactionDB.deleteTransaction(item._id || item.id);
		const findCust = customerData.find(customer => customer._id === item.cashbookId);

		if (cloneSummary[summaryIndex].cashIn <= 0 && cloneSummary[summaryIndex].cashOut <= 0)
			setDataProvider(dataProvider.cloneWithRows([]));

		CustomerDB.updateCustomer(
			findCust.id,
			findCust.firstName,
			findCust.lastName,
			findCust.countryCode,
			findCust.phone,
			findCust.email,
			JSON.stringify(cloneCustomers[cashBookIndex].summary),
			findCust.active,
			findCust.userId
		);
		setIsLoading(false)
	}

	const deleteAlertHandler = (item) =>
	{
		Alert.alert(language.alert, language.doyYouWantToDeleteTransaction, [
			{ text: language.cancel, onPress: () => { console.log("Cancled") }, style: 'cancel', },
			{ text: language.ok, onPress: () => deleteHandler(item) },
		]);
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
				navigation={props.navigation}
			/>
		)
	}

	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.cashBook} noBack />
			
			<View style={Style.content}>
				{/* <Input placeholder="Search" value={fields.search} onChangeText={(text) => onChange(text, "search")} /> */}
				<View style={{position: "relative", zIndex: 9999}}>
					{
						!fields.showTotalCashinOut &&
						<TouchableOpacity style={Style.showTxtContainer} onPress={() => onChange(true, "showTotalCashinOut")}>
							<Text style={Style.showTxt}>{language.show}</Text>
						</TouchableOpacity>
					}

					{
						fields.showTotalCashinOut &&
						<Card style={Style.cashInOutContainer} activeOpacity={1}>
							{
								context.isGuest ? <View></View> :
								<TouchableOpacity activeOpacity={0.6} onPress={() => onChange(true, "openingBalanceModal")}>
									<Text style={Style.openningText}>{language.openingBalance}</Text>
								</TouchableOpacity>
							}

							<View style={Style.cashInOutContent}>
								{/* <View style={Style.cashInOut}>
									<Text>{language.cashIn}</Text>
									<Text style={{...Style.cashInOutMony, ...Style.cashIn, ...{fontSize: GetResponsiveFontSize(fields.totalCashInOut.cashIn)}}}>{fields.totalCashInOut.cashIn} {context.currency.code}</Text>
								</View> */}
								<View style={Style.cashInOut}>
									<Text>{language.cash}</Text>
									<Text
										style={{...Style.cashInOutMony,
											...fields.totalCashInOut.cash < 0 ? Style.cashOut : Style.cashIn,
											...{fontSize: GetResponsiveFontSize(fields.totalCashInOut.cash)}
										}}
									>
										{fields.totalCashInOut.cash} {context.currency.code}
									</Text>
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
				deleteHandler={() => deleteAlertHandler(fields.transactionModal.data)}
				delete={true}
			/>
			<OpeningBalanceModal
				visible={fields.openingBalanceModal}
				onDismiss={() => onChange(false, "openingBalanceModal")}
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