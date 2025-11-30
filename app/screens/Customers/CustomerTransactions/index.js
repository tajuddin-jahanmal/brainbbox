import { useIsFocused } from "@react-navigation/core";
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Header from "../../../components/Header";
import ReminderModal from "../../../components/ReminderModal";
import Transaction from "../../../components/Transaction";
import TransactionModal from "../../../components/TransactionModal";
import UpScreenLoader from '../../../components/UpScreenLoader';
import { ScreenWidth } from "../../../constant";
import { default as Customers } from "../../../DB/Customer";
import TransactionDB from "../../../DB/Transaction";
import WeeklyBalances from "../../../DB/WeeklyBalances";
import { ExchangeMoneyContext } from "../../../ExchangeMoneyContext";
import language from "../../../localization";
import useStore from "../../../store/store";
import { fromAndToDateMaker, getWeekRange } from "../../../utils/dateMaker";
import { customerReportHTML } from "../../../utils/ReportsHTML";
import serverPath from "../../../utils/serverPath";
import SortData from "../../../utils/SortData";
import GetResponsiveFontSize from "../../../utils/TransactionFontSizeManager";
import Style from "./Style";

const CustomerTransactions = (props) =>
{
    const isFocused = useIsFocused();
    const initState = {
        cashbookUser: {},
        transications: [],
        showTotalCashinOut: true,
        showDatePicker: { visible: false, type: "" },
        from: "",
        to: "",
		selectedDate: new Date(),
        currentPage: 1,
        totalDataLength: 0,
        transactionModal: {visible: false, data: {}},
        reminderModal: {visible: false, data: {}},
    };

    const [globalState, dispatch] = useStore();
    const { customers } = globalState;
    const { goBack, navigate } = props.navigation;
    const { cashbookId, fromCashbook } = props.route.params;
    const [dataProvider, setDataProvider] = useState(new DataProvider((r1, r2) => r1 !== r2));
    const [fields, setFields] = useState(initState);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(ExchangeMoneyContext)
    const [CashBook, setCashBook] =  useState({
        customer: {},
        cashIn:0,
        cash: 0,
        cashOut: 0,
        profit: 0
    });
    const isRTL = language.isRtl;
	const openRowRef = useRef(null);
    const paginateDataLength = 15;
    const lastIndex = fields.currentPage * paginateDataLength;
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

    const cashbookUser = customers?.find(customer => (customer?._id || customer?.id) === cashbookId);

	// const cashbookUser = customers?.find(customer => customer?.id === cashbookId);
	// customers?.find(customer => {
	// 	console.log(customer._id);
	// });
	
	// console.log(globalState.transactions, "globalState.transactions");

	useEffect(() =>
	{
		
		(async() =>
		{
			if(!isFocused)
				return
			console.log("EFFECT")
		
			if (cashbookId)
			{
				const cashbookUser = globalState.customers?.find(customer => customer.id || customer.summary[0].cashbookId === cashbookId);
				const offlineTransactions = await TransactionDB.getTransactions();
				const offlineTransactionsByDate = await TransactionDB.transactionByDateAndCashbookIdAndCurrencyId("", "", cashbookId, context.currency?.id, "custom");
				
				try {
					if (!cashbookId)
						return Alert.alert("Info!", "No Cashbook Selected!");
					if(!cashbookUser)
						return Alert.alert("Info!", "No Cashbook Found By THis Name!")

					setIsLoading(true);
					if (globalState.transactions.length >= 1)
					{
						let data = customerDataFinder(globalState.transactions);
						if (data.length >= 1)
							return;
					};

					// if (context.isConnected)
					// {
					// 		const response = await fetch(serverPath("/get/cashbook_transactions"), {
					// 			method: "POST",
					// 			headers: {
					// 					"Content-Type": "Application/JSON",
					// 			},
					// 			body: JSON.stringify({ cashbookId, currencyId: context.currency.id, providerId: context.user.id })
					// 		});
							
					// 		const objData = await response.json();
					// 		if (objData.status === "success" && objData.data.length > 0)
					// 		{
					// 			dispatch("setTransactions", [...globalState.transactions, ...objData.data])
					// 			setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(objData.data))]));
					// 			return;
					// 		}
					// 		if (objData.status === "failure")
					// 			Alert.alert("Info!", objData.message)
					// 		setIsLoading(false);
					// } else {
						if (offlineTransactions.length >= 1 && dataProvider._data.length <= 0)
						{
							let data = customerDataFinder(offlineTransactions);
							if (data.length >= 1)
							{
								dispatch("setTransactions", [...globalState.transactions, ...offlineTransactions]);
								return;
							};
							setIsLoading(false);
						}
					// }
					setIsLoading(false);
					return;
				} catch (error) {
					console.log(error);
					setIsLoading(false)
				}
			}
		})();
	}, [globalState.transactions, fields.currentPage, isFocused]);

	useEffect(() => {
		(async () =>
		{
			if(!isFocused)
				return
			setCashBook(prev => {
				let summary = cashbookUser?.summary.find(perCurrency => perCurrency.currencyId == context.currency?.id)
				return {
					...prev,
					customer: cashbookUser?.customer || {firstName: cashbookUser?.firstName, lastName: cashbookUser?.lastName},
					cashIn: summary?.cashIn || 0,
					cash: summary?.cashIn - summary?.cashOut || 0,
					cashOut: summary?.cashOut || 0,
					profit: summary?.totalProfit || 0,
				}
			})
		})();
	}, [customers, isFocused]);

	useEffect(() =>
	{
		if (fromCashbook && isFocused)
			onChange(false, "showTotalCashinOut");
	}, [isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return
			if (fields.from && fields.to)
			{
				// if (context.isConnected)
				// {
				// 	const response = await fetch(serverPath("/get/transaction_by_date"), {
				// 		method: "POST",
				// 		headers: {
				// 				"Content-Type": "Application/JSON",
				// 		},
				// 		body: JSON.stringify({
				// 			cashbookId,
				// 			currencyId: context.currency?.id,
				// 			providerId: context.user.id,
				// 			fromDate: fields.from,
				// 			toDate: fields.to,
				// 			type: "custom",
				// 		})
				// 	});
			
				// 	const objData = await response.json();
				// 	if (objData.status === "success")
				// 		setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(objData.data))]));
			
				// 	if (objData.status === "failure")
				// 		Alert.alert("Info!", objData.message)
				// } else {
					dataFinderByDate();
				// }
			}
		})();
	}, [fields.from, fields.to, isFocused]);

	const dataFinderByDate = async () =>
	{
		// const fromDate = new Date(fields.from.getTime() - (fields.from.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];
		// const toDate = new Date(fields.to.getTime() - (fields.to.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];
		const {fromDate, toDate} = fromAndToDateMaker(fields.from, fields.to);

		const offlineTransactionsByDate = await TransactionDB.transactionByDateAndCashbookIdAndCurrencyId(fromDate, toDate, cashbookId, context.currency?.id);
		let OTByDateClone = [...offlineTransactionsByDate];

		let calculate = 0;
		OTByDateClone.forEach(trans => {
			if (trans.type) calculate += trans.amount;
			else calculate -= trans.amount;
			trans.runningBalance = calculate;
		});

		setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(OTByDateClone))]));
		
		return OTByDateClone;
	}

	const paginationFunction = (data) =>
	{
		const firstIndex = lastIndex - paginateDataLength;
		const recorder = data.slice(firstIndex, lastIndex);
		onChange(data.length, "totalDataLength");
		return recorder;
	};

	const customerDataFinder = (data) =>
	{
		let cashTransactions = [];
		let calculate = 0;
	
		SortData(data).reverse().find(trans => {
			if (trans.cashbookId === cashbookId && trans.currencyId === context.currency?.id)
			{
				cashTransactions.push(trans);
				if (trans.type) calculate += trans.amount;
				else calculate -= trans.amount;
				trans.runningBalance = calculate;
			}
		});
		if (cashTransactions.length >= 1)
		{
			setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(cashTransactions))]));
			setIsLoading(false);
		}
		
		return SortData(cashTransactions);
	};

	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
			// if(!isFocused)
			// 	return
			// const offlineTrans = await TransactionDB.getTransactions();
			// offlineTrans.forEach(element => {
			// 		console.log(element);
			// });
			// TransactionDB.deleteTransaction(786);
			// TransactionDB.deleteTransaction("xTHx$xd!8uTa");
			// TransactionDB.deleteTransaction(512);
			// TransactionDB.deleteTransaction(503);
			// TransactionDB.deleteTransaction(416);
			// console.log(dataProvider._data);
	// 	})();
	// }, [isFocused]);

	const deleteHandler = async (item) =>
	{
		try {
			setIsLoading(true);

			if (context.isGuest)
				return dataManager(item);

			
			if (!context.isConnected)
			{
				Alert.alert("Alert", "You are offline!");
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
					console.log(weeklyBalanceObjData, "Customer Transactions Weekly Balance Update");
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
		const customerData = await Customers.getCustomers();
		let cloneCustomers = [...globalState.customers];
		let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == cashbookId);
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
		const findCust = customerData.find(customer => customer._id === cashbookId);

		if (cloneSummary[summaryIndex].cashIn <= 0 && cloneSummary[summaryIndex].cashOut <= 0)
			setDataProvider(dataProvider.cloneWithRows([]));

		Customers.updateCustomer(
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

	const print = async () =>
	{
		const offlineTransactionsByDate = await TransactionDB.transactionByDateAndCashbookIdAndCurrencyId("", "", cashbookId, context.currency?.id, "custom");
		let data = [];

		if (fields.from && fields.to) {
			data = await dataFinderByDate();
		} else {
			data = customerDataFinder(globalState.transactions)
		}

		let forCounting = {cashIn: 0, cash: 0, cashOut: 0};
		data.forEach(element => {
			// Number.parseInt(element.amount) => if the amount is string they will convert it to number.
			if (element.type)
				return forCounting = {cashIn: forCounting.cashIn + Number.parseInt(element.amount), cash: forCounting.cash, cashOut: forCounting.cashOut};
			forCounting = {cashIn: forCounting.cashIn, cash: forCounting.cash, cashOut: forCounting.cashOut + Number.parseInt(element.amount)};
		});
		forCounting = {cashIn: forCounting.cashIn, cash: forCounting.cashIn - forCounting.cashOut, cashOut: forCounting.cashOut};

		let ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || "");
		let customerFullName = CashBook?.customer?.firstName + " " + (CashBook?.customer?.lastName || "");

		const fileName = `${ownerFullName} To ${customerFullName}${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
		const { uri } = await printToFileAsync({
			base64: true,
			html: customerReportHTML(ownerFullName, data, context.currency?.code, forCounting, customerFullName),
			margins: {top: 50, right: 50, bottom: 50, bottom: 50}
		});
		const newURI = `${FileSystem.documentDirectory}${fileName}`;

		await FileSystem.moveAsync({from: uri, to: newURI});
		await shareAsync(newURI, { UTI: ".pdf", mimeType: "application/pdf" });
	};

    const dateChanger = (event, date) => {
        const type = fields.showDatePicker.type;
        let selectedDate = new Date(date);
		// setSelectedDate(date); // ✅ Update selectedDate with the picked date

        if (type === "from") {
            if (fields.to && (fields.to - selectedDate) <= -1) {
                setFields(prev => ({ ...prev, from: "", to: "" }));
            } else {
                setFields(prev => ({ ...prev, from: selectedDate }));
            }
        } else {
            selectedDate.setHours(23, 59, 59, 999);
            if (fields.from && (fields.from - selectedDate) <= -1) {
                setFields(prev => ({ ...prev, to: selectedDate }));
            } else {
                setFields(prev => ({ ...prev, to: "" }));
            }
        }

        // On Android, we need to explicitly hide the picker after selection
        // if (Platform.OS === 'android') {
            setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
        // }
    };

	const reminderHandler = () =>
	{
		const ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || "");
		const customerFullName = CashBook?.customer?.firstName +" "+ (CashBook?.customer?.lastName || "");
		onChange({visible: true, data: {cash: CashBook.cash, ownerFullName, customerFullName, currencyCode: context.currency?.code}}, "reminderModal");
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

	const editHandler = (item) =>
	{
		navigate(item.type ? "CashIn" : "CashOut", {
			cashbookId: item.cashbookId,
			transactionId: {_id: item?._id, id: item?.id},
			transactionEdit: true
		});
	}

	const handleRowOpen = (ref) => {
		if (openRowRef.current && openRowRef.current !== ref) {
			openRowRef.current.close();     // close previously open row
		}
		openRowRef.current = ref;
	};
	const handleRowClose = (ref) => {
		if (openRowRef.current === ref) openRowRef.current = null;
	};
	const closeAnyOpen = () => openRowRef.current?.close();
	
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

	const deleteAlertHandler = (item) =>
	{
		Alert.alert(language.alert, language.doyYouWantToDeleteTransaction, [
			{ text: language.cancel, onPress: () => { console.log("Cancled") }, style: 'cancel', },
			{ text: language.ok, onPress: () => deleteHandler(item) },
		]);
	}

	const rowRenderer = (type, item) =>
	{
		
		return (
			<Transaction
				item={item}
				onPress={() => onChange({visible: true, data: item}, "transactionModal")}
				// deleteHandler={() => deleteAlertHandler(item)}
				// delete={true}
				runningBalance={true}
				// swipeable={true}
				// onOpen={handleRowOpen}
				// onClose={handleRowClose}
				navigation={props.navigation}
			/>

			// <Card style={Style.card} onPress={() => onChange({visible: true, data: item}, "transactionModal")}>
			// 	<View>
			// 		<Text style={Style.date}>{(new Date(item?.dateTime))?.toLocaleString()}</Text>
			// 		<View style={{...Style.flexRow, alignItems: "center"}}>
			// 			<Text style={Style[item.type ? "cashIn" : "cashOut"]}>Amount: </Text>
			// 			<Text style={Style[item.type ? "cashIn" : "cashOut"]}>{item.amount}</Text>
			// 		</View>
			// 		<View style={Style.flexRow}>
			// 			<Text style={Style[item.type ? "cashIn" : "cashOut"]}>Type: </Text>
			// 			<Text style={Style[item.type ? "cashIn" : "cashOut"]}>{item.type ? "IN" : "OUT"}</Text>
			// 		</View>
			// 	</View>
			// 	<View>
			// 		<Card onPress={() => deleteHandler(item)}>
			// 			<Feather name="trash-2" size={18} color={"rgba(240, 0, 41, 0.6)"} />
			// 		</Card>
			// 	</View>
			// </Card>
		)
	}

	console.log("Rendering [CustomerTransactions.js]", isFocused);
// const handleIOSDateSelection = () => {
//     // Use the current selected date and close the modal
//     dateChanger({ type: "set" }, selectedDate);
//     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
// };

	return isFocused ? (
        <View style={Style.container}>
            <Header title={CashBook?.customer?.firstName +" "+ (CashBook?.customer?.lastName || "")} goBack={goBack} />
            <View style={Style.content}>    
                <View>
                    {fromCashbook && <View style={[Style.fromToContainer, isRTL && {flexDirection: "row-reverse"}]}>
                        <Card
                            style={Style.fromTo}
                            onPress={() => !context.isGuest && handleDatePress("from")}
                        >
                            <Text style={isRTL && {textAlign: 'right'}}>
                                {language.from}: {fields.from >= 1 && dateMaker(fields.from)}
                            </Text>
                        </Card>
                        <Card
                            style={Style.fromTo}
                            onPress={() => (!context.isGuest || fields.from) && handleDatePress("to")}
                        >
                            <Text style={isRTL && {textAlign: 'right'}}>
                                {language.to}: {fields.to >= 1 && dateMaker(fields.to)}
                            </Text>
                        </Card>

						{/* {fields.showDatePicker.visible && ( */}
							<DatePicker
								modal
								mode="date"
								open={fields.showDatePicker.visible}
								date={fields.selectedDate}
								onConfirm={(date) => {
									dateChanger(null, date);
									onChange(date, "selectedDate")
									onChange({ visible: false, type: "" }, "showDatePicker");
								}}
								onCancel={() => {
									setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
								}}
							/>
						{/* )} */}
                    </View>}

					<View style={Style.shareShowContainer}>
						{
							(!fields.showTotalCashinOut && fromCashbook && dataProvider._data.length > 0) &&
							<TouchableOpacity style={Style.showTxtContainer} onPress={() => onChange(true, "showTotalCashinOut")}>
								<Text style={Style.showTxt}>{language.show}</Text>
							</TouchableOpacity>
						}
					</View>
					{(fields.showTotalCashinOut) && <Card style={Style.cashInOutContainer} activeOpacity={1}>
						<View style={Style.cashsContainer}>
							{/* <View style={Style.cashInOut}>
								<Text>{language.cashIn}</Text>
								<Text style={{...Style.cashInOutMony, ...Style.cashIn, ...{fontSize: GetResponsiveFontSize(CashBook.cashIn)}}}>{CashBook.cashIn + " " + context.currency?.code}</Text>
							</View> */}
							{ (fromCashbook && fields.showTotalCashinOut) &&
								<View style={Style.hideTxtContainer}>
									<TouchableOpacity style={Style.showTxtContainer} onPress={reminderHandler}>
										<Text style={Style.showTxt}>{language.reminder}</Text>
									</TouchableOpacity>
								</View>
							}
							<View style={Style.cashInOut}>
								<Text>{language.cash}</Text>
								<Text style={{...Style.cashInOutMony, ...CashBook.cash < 0 ? Style.cashOut : Style.cashIn, ...{fontSize: GetResponsiveFontSize(CashBook.cash)}}}>{CashBook.cash + " " + context.currency?.code}</Text>
							</View>
							{ (fromCashbook && fields.showTotalCashinOut) &&
								<View style={Style.hideTxtContainer}>
									<TouchableOpacity style={Style.showTxtContainer} onPress={print}>
										<Text style={Style.showTxt}>{language.share}</Text>
									</TouchableOpacity>
								</View>
							}
							{/* <View style={Style.cashInOut}>
								<Text>{language.cashOut}</Text>
								<Text style={{...Style.cashInOutMony, ...Style.cashOut, ...{fontSize: GetResponsiveFontSize(CashBook.cashOut)}}}>{CashBook.cashOut + " " + context.currency?.code}</Text>
							</View> */}
						</View>
					</Card>}
				</View>

				<Card style={Style.dateCashinOutContainer}>
					<Text style={Style.dateTime}>{language.date}</Text>
					{/* <Text style={{...Style.dateTime, ...Style.margin}}>{language.cashOut}</Text> */}
					<Text style={{...Style.dateTime, }}>{language.cashOut}</Text>
					<Text style={Style.dateTime}>{language.cashIn}</Text>
					<Text style={Style.runningBalance}>{language.runningBalance}</Text>
				</Card>

				{
					dataProvider._data.length >= 1 ?
					<RecyclerListView
						dataProvider={dataProvider}
						layoutProvider={layoutProvider}
						rowRenderer={rowRenderer}
						// onScroll={closeAnyOpen}
						renderFooter={() => (
							<>
								{fields.totalDataLength >= 16 && <View style={Style.paginateCardContainer}>
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
					:
					<View style={Style.noDataContainer}>
						{<Text style={Style.noData}>{language.noDataAvailable}</Text>}
					</View>
				}

				{/* {dataProvider._data.length >= 1 && <Button onPress={print}> <FontAwesome5 name="share" size={24} color="white"/> </Button>} */}

				<View style={Style.cashsCotainer}>
					<Button style={{...Style.cashButton, ...Style.cashInButton}} onPress={() => navigate("CashIn", { cashbookId })}>{language.cashIn}</Button>
					<Button style={Style.cashButton} onPress={() => navigate("CashOut", { cashbookId })}>{language.cashOut}</Button>
				</View>
			</View>
			<TransactionModal
				visible={fields.transactionModal.visible}
				customerName={CashBook?.customer?.firstName +" "+ (CashBook?.customer?.lastName || "")}
				data={fields.transactionModal.data}
				onDismiss={() => onChange({visible: false, data: {}}, "transactionModal")}
				deleteHandler={() => deleteAlertHandler(fields.transactionModal.data)}
				delete={true}
				editHandler={() => editHandler(fields.transactionModal.data)}
				edit={true}
			/>
			<ReminderModal
				visible={fields.reminderModal.visible}
				data={fields.reminderModal.data}
				onDismiss={() => onChange({visible: false, data: {}}, "reminderModal")}
				shareHandler={() => {}}
			/>
			{
				isLoading &&
				<UpScreenLoader />
			}
		</View>
	) : null
};

export default CustomerTransactions;