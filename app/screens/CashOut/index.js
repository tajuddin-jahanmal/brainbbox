import Feather from "@expo/vector-icons/Feather";
import { useIsFocused } from "@react-navigation/core";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import Toast from "react-native-toast-message";
import Customers from "../../DB/Customer";
import Queue from "../../DB/Queue";
import SelfCashDB from "../../DB/SelfCash";
import TransactionDB from "../../DB/Transaction";
import WeeklyBalances from "../../DB/WeeklyBalances";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import { CashInOutValidationAlert } from "../../components/Alerts";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { isAndroid } from "../../constant";
import language from "../../localization";
import useStore from "../../store/store";
import { getWeekRange } from "../../utils/dateMaker";
import idGenerator from "../../utils/idGenerator";
import isNumber from "../../utils/isNumber";
import serverPath, { mainServerPath } from "../../utils/serverPath";
import Validation from "../../validator/CashInOut";
import Style from "./Style";

const CashOut = (props) =>
{
    const { goBack } = props.navigation;
	const { selfCash, cashbookId, fromCashbook, transactionEdit, transactionId } = props.route?.params;
    const context = useContext(ExchangeMoneyContext);
    const isFocused = useIsFocused();

    const initState = {
        // amount: JSON.stringify(Math.floor(Math.random() * 100)),
        amount: "",
        profit: "",
        currencyId: context.currency?.id,
        cashbookId: "",
        information: "",
		photo: null,
        type: false,
        showAlert: { visible: false, message: "" },
        currenciesData: [],
    };

    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: language.success,
            text2: language.CashOutSuccessfullyAdded,
            swipeable: true,
            visibilityTime: 2000,
        });
    };
    const showEditToast = () => {
		Toast.show({
			type: 'success',
			text1: language.success,
			text2: language.CashOutSuccessfullyEdited,
			swipeable: true,
			visibilityTime: 2000,
		});
	};

    const [ globalState, dispatch ] = useStore(false);
    const [ fields, setFields ] = useState(initState);
    const [ isLoading, setIsLoading ] = useState(false);
    const [CashBook, setCashBook] =  useState({
		customer: {},
		cashIn:0,
		cash: 0,
		cashOut: 0,
		profit: 0
	});

    const onChange = (value, type) =>
    {
        if (isLoading)
            return;
        
        setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    useEffect(() =>
    {
        let currencies = [];
        globalState.currencies.forEach(curr => {
            currencies.push({key: curr.id, value: curr.code });
        });
        onChange(currencies, "currenciesData");
    }, []);

    useEffect(() => {
		if (transactionEdit)
		{
			if (transactionId?._id)
			{
				const transaction = globalState.transactions.find(transaction => transaction._id === transactionId._id)
				setFields(prev => ({
					...prev,
					amount: transaction.amount.toString(),
					profit: transaction.profit.toString(),
					currencyId: transaction.currencyId,
					information: transaction.information,
				}));
			} else {
				const transaction = globalState.transactions.find(transaction => transaction.id === transactionId.id)
				setFields(prev => ({
					...prev,
					amount: transaction.amount.toString(),
					profit: transaction.profit.toString(),
					currencyId: transaction.currencyId,
					information: transaction.information,
				}));
			}
		}
	}, [transactionEdit]);

    useEffect(() => {
        (async () =>
		{
            if(!isFocused)
                return;
            const cashbookUser = globalState.customers?.find(customer => (customer?._id || customer?.id) === (cashbookId || fields.cashbookId));

			setCashBook(prev => {
				let summary = cashbookUser?.summary.find(perCurrency => perCurrency.currencyId == fields.currencyId);
				return {
					...prev,
					customer: cashbookUser?.customer || {firstName: cashbookUser?.firstName},
					cashIn: summary?.cashIn,
					cash: summary?.cashIn - summary?.cashOut || 0,
					cashOut: summary?.cashOut || 0,
					profit: summary?.totalProfit || 0,
				}
			})
		})();
	}, [globalState.customers, isFocused, fields.cashbookId, fields.currencyId]);

	const takePhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Alert", "Camera permission required!");
			return;
		}

		if (fields.photo)
			return;

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ["images"],
			quality: 0.7,
		});

		if (!result.canceled)
			onChange(result.assets[0], "photo");
	};

	async function resizeImage(uri) {
			const result = await ImageManipulator.manipulateAsync(
				uri,
				[{ resize: { width: 800 } }], // keep aspect ratio
				{
					compress: 0.7,               // 0 → 1
					format: ImageManipulator.SaveFormat.JPEG,
				}
			);
	
			return result; // { uri, width, height, base64? }
		}

    // IN EDIT HANDLER I DON'T DID THE CODE FOR SELFCASH BECAUSE NOW WE DON'T USE SELFCASH
	const editHandler = async () =>
	{
        // OFFLINE EDIT, CURRENCY CHANGE IN EDIT WANT SOME WORK
		if (context.isGuest) {
			// NOW THE GUEST HAS ONLY ONE CURRENCY IF GUEST HAS MORE CURRENCIES THE CODE SHOULD BE DEVELOPE.
			return transactionEditManager();
		}

		if (!context.isConnected)
        {
            setIsLoading(false);
            return Alert.alert(language.info, "You are offline please come online");
        }
			// return transactionEditManager("offline");

		transactionEditManager("online");
	}

	const transactionEditManager = async (mode) =>
	{
		const transactionsClone = [...globalState.transactions];
		let transaction;
		if (transactionId?._id)
			transaction = transactionsClone.find(transaction => transaction._id === transactionId._id)
		else
			transaction = transactionsClone.find(transaction => transaction.id === transactionId.id)

		const oldTransactionClone = {...transaction};

		let cloneCustomers = [...globalState.customers];
		let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == cashbookId);
		if(cashBookIndex < 0)
			return Alert.alert(language.info,  language.pleaseTryAgain);
		
		let cloneSummary = [...cloneCustomers[cashBookIndex]?.summary];
		let summaryIndex = cloneSummary.findIndex(per => per.currencyId == fields.currencyId);
		if(summaryIndex < 0 && cloneSummary?.length > 0)
		{
			summaryIndex = cloneSummary?.length;
			cloneSummary = [...cloneSummary, {cashIn: 0, cashOut: 0, currencyId: fields.currencyId, totalProfit: 0, cashbookId: cloneCustomers[cashBookIndex]?._id || cloneCustomers[cashBookIndex]?.id }]
		}
		if(summaryIndex < 0  && cloneSummary?.length <= 0)
		{
			summaryIndex = 0;
			cloneSummary = [{cashIn: 0, cashOut: 0, currencyId: fields.currencyId, totalProfit: 0, cashbookId: cloneCustomers[cashBookIndex]?._id || cloneCustomers[cashBookIndex]?.id }]
		}

		let In_Out_Amount = cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"];
		let editAmount = (Number(In_Out_Amount) - Number(transaction.amount) + Number(fields.amount));
		let totalProfit = (Number(cloneSummary[summaryIndex].totalProfit) - Number(transaction.profit) + Number(fields.profit))
		cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"] = editAmount;
		cloneSummary[summaryIndex].totalProfit = totalProfit;
		cloneCustomers[cashBookIndex].summary = cloneSummary;

		const customerData = await Customers.getCustomers();
		const findCust = customerData.find(customer => customer._id === cashbookId);

		if (transaction.currencyId !== fields.currencyId)
		{
			// IF THE CURRENCY IS CHANGE THE TRANSACTION SHOULD REMOVE FROM GLOBALSTATE.TRANSACTIONS AND ADD TO THE OWN CURRENCY ACCOUNT
			// AND THE NEW AND OLD TRANSACTIONS WITH BOTH CURRECIES ARE HAVE ACCOUNTING CHANGES
		}
		
        transaction.amount = Number(fields.amount);
		transaction.profit = Number(fields.profit);
		transaction.currencyId = fields.currencyId;
		transaction.type = false;
		transaction.isReceivedMobile = transaction.isReceivedMobile ? true : false;
		transaction.information = fields.information;
		const transactionClone = {...transaction};
		transactionClone.id = transactionClone._id || transactionClone.id;
		delete transactionClone?._id;
		delete transactionClone?.photo;
		delete transactionClone?.runningBalance;
        

		if (mode === "offline")
		{
			const offlineQueue = await Queue.getQueueEntries();
			const offlineQueueClone = [...offlineQueue];
			if (offlineQueueClone.length >= 1)
			{
                const queueTransaction = offlineQueueClone.find(que => {
					const data = JSON.parse(que.data);
					return (data?._id === transactionId?._id) || (data?.id === transactionId?.id);
				});
				if (queueTransaction)
				{
					queueTransaction.data.amount = transaction.amount;
					queueTransaction.data.profit = transaction.profit;
					queueTransaction.data.currencyId = transaction.currencyId;
					queueTransaction.data.information = transaction.information;
					Queue.updateQueueEntry(queueTransaction.id, "edit", transaction.id, "transactions", JSON.stringify(transaction), transaction?._id);
                    transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
				} else {
					Queue.createQueueEntry("edit", transaction.id, "transactions", JSON.stringify(transaction), transaction?._id);
                    transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
				}
			} else {
				Queue.createQueueEntry("edit", transaction.id, "transactions", JSON.stringify(transaction), transaction?._id);
                transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
			}
            return;
		}
		if (mode === "online")
		{
			setIsLoading(true);
			try {
				const { weekStart, weekEnd } = getWeekRange(transaction.dateTime);
				const weeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
					context?.customer?.id,
					context?.currency?.id,
					new Date(weekStart).toISOString(),
					new Date(weekEnd).toISOString()
				);

				if (weeklyData.length >= 1)
				{
					const weeklyDataClone = {...weeklyData[0]};
					const amountChange = transaction.amount - oldTransactionClone.amount;
					if (transaction.type) {
						weeklyDataClone.totalCashIn += amountChange;
						weeklyDataClone.closingBalance += amountChange;
					} else {
						weeklyDataClone.totalCashOut += amountChange;
						weeklyDataClone.closingBalance -= amountChange;
					}

					// if (transaction.type) {
					// 	weeklyDataClone.totalCashIn = weeklyDataClone.totalCashIn - oldTransactionClone.amount + transaction.amount;
					// 	weeklyDataClone.closingBalance = weeklyDataClone.closingBalance - oldTransactionClone.amount + transaction.amount;
					// } else {
					// 	weeklyDataClone.totalCashOut = weeklyDataClone.totalCashOut - oldTransactionClone.amount + transaction.amount;
					// 	weeklyDataClone.closingBalance = weeklyDataClone.closingBalance - oldTransactionClone.amount + transaction.amount;
					// }
	
					const success = await updateServerTransaction(transactionClone, findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
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
						console.log(weeklyBalanceObjData, "CashOut Weekly Balance Update");
						setIsLoading(false);
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
	
					updateNextWeekBalance(weekEnd, weeklyDataClone.closingBalance, oldTransactionClone, transaction);
					return;
				};

				await updateServerTransaction(transactionClone, findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
			} catch (error) {
				setIsLoading(false);
				console.log(error.message, "error.message Edit CashOut");
				Alert.alert(language.alert, error.message);
			}
			return;
		}

		// WHEN THE TRANSACTION IS NEW CREATED IT LOOKS LIKE (f1S0mZ3CNTlT transaction.id) (undefined transaction._id)
		transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
		return;
	}

    const transactionDataEditSetter = async (findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex) =>
	{
		setIsLoading(false);
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

		TransactionDB.updateTransaction(
			transaction.id,
			transaction._id,
			transaction.amount,
			transaction.profit,
			transaction.information,
			transaction.currencyId,
			transaction.cashbookId,
			transaction.type,
			transaction.dateTime,
			transaction.isReceivedMobile,
			transaction.photo,
		);

		dispatch("setCustomers", cloneCustomers);
		dispatch("setTransactions", transactionsClone);
		showEditToast();
		setFields(initState);
		goBack();
		return;
	};

	const updateServerTransaction = async (transactionClone, findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex) => {
		const response = await fetch(serverPath("/transaction"), {
			method: "PUT",
			headers: {
				"Content-Type": "Application/JSON",
			},
			body: JSON.stringify({...transactionClone, providerId: context?.user?.id})
		});

		const objData = await response.json();
		if (objData.status === "success")
			await transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);

		if (objData.status === "failure")
		{
			setIsLoading(false);
			Alert.alert(language.info, objData.message)
			return false;
		};
		return true;
	};

	const updateNextWeekBalance = async (weekEnd, newOpeningBalance, oldTransaction, transaction) =>
	{
		const newest = await WeeklyBalances.getNewestWeeklyBalance(
			context?.customer?.id,
			transaction.currencyId
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
			return updateNextWeekBalance(nextWeekEnd, newOpeningBalance, oldTransaction, transaction);
		}

		const weeklyDataClone = { ...nextWeeklyData[0] };
		weeklyDataClone.openingBalance = newOpeningBalance;
		// weeklyDataClone.closingBalance = weeklyDataClone.openingBalance + (weeklyDataClone.totalCashIn - weeklyDataClone.totalCashOut);
		if (transaction.type) {
			weeklyDataClone.closingBalance = weeklyDataClone.closingBalance - oldTransaction.amount + transaction.amount
		} else {
			weeklyDataClone.closingBalance = weeklyDataClone.closingBalance + oldTransaction.amount - transaction.amount;
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
		
		await updateNextWeekBalance(nextWeekEnd, weeklyDataClone.closingBalance, oldTransaction, transaction);
	}

    const submitHandler = async () =>
    {
        if (isLoading) return;

        if (fromCashbook && fields.cashbookId.length <= 0)
			return Alert.alert(language.info, language.pleaseSelectCustomer);

        setIsLoading(true);
        let requestData = {
            amount: fields.amount,
            profit: fields.profit || 0,
            currencyId: fields.currencyId,
            information: fields.information,
            // providerId: context.user.id,
			cashbookId: (fromCashbook ? fields.cashbookId : cashbookId),
            // dateTime: new Date().toString(),
            dateTime: new Date().toISOString(),
            type: fields.type,
			photo: fields.photo,
			isReceivedMobile: true,
        };

        const error = Validation(requestData);
        if (error)
        {
            Alert.alert(language.info, error);
            setIsLoading(false);
            return;
        };

		if (!isNumber(requestData.amount) || !isNumber(requestData.profit))
		{
			Alert.alert(language.info, language.pleaseEnterNumber);
			setIsLoading(false);
			return;
		}

        // let cashBookCustomer = globalState.customers.find(per => (per._id || per.id) == (fromCashbook ? fields.cashbookId : cashbookId));
        // const cash = cashBookCustomer?.summary.find(per => per.currencyId === fields.currencyId);
        
        if (!transactionEdit && fields.amount > CashBook.cash || CashBook.cash === undefined)
        {
            setIsLoading(false);
            Alert.alert(language.info, language.insufficientCashIsAvailable, [
            {
                text: language.cancel,
                onPress: () => {
                    setFields(prev => ({...prev, amount: "", profit: "", information: "",}));    
                },
                style: 'cancel',
                },
                {text: language.transper, onPress: () => { bottomPartOfSubmitHandler(requestData) }},
            ]);

            return;
        }

        bottomPartOfSubmitHandler(requestData);
    };

    const bottomPartOfSubmitHandler = async (requestData) =>
    {
        try {

            if (transactionEdit)
				return editHandler();
            
            if (context.isGuest)
            {
                delete requestData.providerId;
                requestData.amount = Number(requestData.amount);
				requestData.profit = Number(requestData.profit);
                requestData.id = idGenerator();

                submitedDataHandler({data: requestData});
                return;
            }
            
            if (!context.isConnected)
            {
                delete requestData.providerId;
                requestData.id = idGenerator();
                requestData.amount = Number(requestData.amount);
				requestData.profit = Number(requestData.profit);
				requestData.photo = JSON.stringify(requestData.photo);
                if (selfCash)
                    Queue.createQueueEntry("insert", requestData.id, "selfCash", JSON.stringify(requestData), null);
                else
                    Queue.createQueueEntry("insert", requestData.id, "transactions", JSON.stringify(requestData), null);

                submitedDataHandler({data: [requestData]});
                return;
            }

            const offlineQueue = await Queue.getQueueEntries();
            if (offlineQueue.length >= 1)
            {
                const queueTransaction = offlineQueue.find(que => JSON.parse(que.data).cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId));
                if (queueTransaction)
                {
                    delete requestData.providerId;
                    requestData.id = idGenerator();
                    requestData.amount = Number(requestData.amount);
                    requestData.profit = Number(requestData.profit);
                    if (selfCash)
                        Queue.createQueueEntry("insert", requestData.id, "selfCash", JSON.stringify(requestData), null);
                    else
                        Queue.createQueueEntry("insert", requestData.id, "transactions", JSON.stringify(requestData), null);

                    submitedDataHandler({data: requestData});
                    return;
                }
            }

			const formData = new FormData();
			formData.append("amount", String(fields.amount));
			formData.append("profit", String(fields.profit || 0));
			formData.append("currencyId", String(fields.currencyId));
			formData.append("information", fields.information || "");
			formData.append("cashbookId", String(fromCashbook ? fields.cashbookId : cashbookId));
			formData.append("dateTime", new Date().toISOString());
			formData.append("type", String(fields.type));
			formData.append("isReceivedMobile", "true");
			if (fields.photo?.uri) {
				const resized = await resizeImage(fields.photo.uri);
				formData.append("photo", {
					uri: resized.uri,
					name: "transaction.jpeg",
					type: fields.photo.mimeType || "image/jpeg",
				});
			}
            
            // const response = await fetch(serverPath("/transaction"), {
            //     method: "POST",
            //     headers: {
            //             "Content-Type": "Application/JSON",
            //     },
            //     body: JSON.stringify(requestData)
            // });

			const response = await fetch(mainServerPath("/transaction_file"), {
				method: "POST",
				body: formData
			});

            const objData = await response.json();

            if (objData.status === "success")
                submitedDataHandler(objData)

            if (objData.status === "failure")
            {
                setIsLoading(false);
                Alert.alert(language.info, objData.message)
            }
        } catch (error) {
			setIsLoading(false);
			console.log(error.message, "error.message Add Cashout");
			Alert.alert('Info!', error.message);
		}
    }

    const submitedDataHandler = async (objData) =>
	{
		if (selfCash)
		{
			// const data = objData.data; => THIS CODE IS FOR TRANSACTION
			const data = objData.data[0]; // => THIS CODE IS FOR TRANSACTION WITH PHOTO
			data.amount = Number(data.amount);
			data.profit = Number(data.profit);
			data.currencyId = Number(data.currencyId);
			data.cashbookId = Number(data.cashbookId);

			if (context.currency?.id === fields.currencyId)
				dispatch("setSelfCash", [...globalState.selfCash, data]);

            SelfCashDB.createSelfCash(
                objData.data.id,
                objData.data.amount,
                objData.data.profit,
                objData.data.information,
                objData.data.currencyId,
                objData.data.cashbookId,
                objData.data.type,
                objData.data.dateTime
				// THE SELFCASH DON'T HAVE PHOTO IN LOCAL DATABASE.
            );

            setFields(initState);
			goBack();
			// ToastAndroid.show(language.CashOutSuccessfullyAdded, ToastAndroid.SHORT);
            showToast();
			return;
		}

        // Cashbook Transactions
		const offlineTransactionsByDate = await TransactionDB.transactionByDateAndCashbookIdAndCurrencyId("", "", (fromCashbook ? fields.cashbookId : cashbookId), context.currency?.id, "custom");
		if (!context.isConnected) {
			if (offlineTransactionsByDate?.length >= 1)
			{
				dataManager(objData);
				return;
			}
		};

		dataManager(objData);
		return;
	}

    const dataManager = async (objData, ...options) =>
    {
		// WITH newTransaction WE HAVE THE _ID AND ID OTHER WAYS WE ONLY HAVE THE ID NOT _ID
		const newTransaction = await TransactionDB.createTransaction(
			// objData.data.id, // THIS CODE IS FOR TRANSACTION
			// objData.data.amount,
			// objData.data.profit,
			// objData.data.information,
			// objData.data.currencyId,
			// objData.data.cashbookId,
			// objData.data.type,
			// objData.data.dateTime,
			// objData.data.isReceivedMobile,
			objData.data[0].id, // THIS CODE IS FOR TRANSACTION WITH PHOTO
			objData.data[0].amount,
			objData.data[0].profit,
			objData.data[0].information,
			objData.data[0].currencyId,
			objData.data[0].cashbookId,
			objData.data[0].type,
			objData.data[0].dateTime,
			objData.data[0].isReceivedMobile,
			objData.data[0].photo,
		);
        
        let cloneCustomers = [...globalState.customers];
		let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == (fromCashbook ? fields.cashbookId : cashbookId));
        if(cashBookIndex < 0)
			return Alert.alert(language.info,  language.pleaseTryAgain);

        let cloneSummary = [...cloneCustomers[cashBookIndex]?.summary];
        let summaryIndex = cloneSummary.findIndex(per => per.currencyId == fields.currencyId);
        if(summaryIndex < 0 && cloneSummary.length > 0)
        {
            summaryIndex = cloneSummary?.length;
			cloneSummary = [...cloneSummary, {cashIn: 0, cashOut: 0, currencyId: fields.currencyId, totalProfit: 0, cashbookId: cloneCustomers[cashBookIndex]?._id || cloneCustomers[cashBookIndex]?.id }]
        }
        if(summaryIndex < 0  && cloneSummary.length <= 0)
        {
            summaryIndex = 0;
            cloneSummary = [{cashIn: 0, cashOut: 0, currencyId: fields.currencyId, totalProfit: 0, cashbookId: cloneCustomers[cashBookIndex]?._id || cloneCustomers[cashBookIndex]?.id }]
        }

        let In_Out_Amount = cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"];
        let newAmount = (Number(In_Out_Amount) + Number(fields.amount))
        let totalProfit = (Number(cloneSummary[summaryIndex].totalProfit) + Number(fields.profit))
        cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"] = newAmount;
        cloneSummary[summaryIndex].totalProfit = totalProfit;
        cloneCustomers[cashBookIndex].summary = cloneSummary;

        const customerData = await Customers.getCustomers();
		const findCust = customerData.find(customer => customer._id === (fromCashbook ? fields.cashbookId : cashbookId));	
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

        dispatch("setCustomers", cloneCustomers);
		if (context.currency?.id === fields.currencyId)
		{
			if (fromCashbook && globalState.transactions.length <= 0)
			{
				const offlineTransactions = await TransactionDB.getTransactions();
				dispatch("setTransactions", [...offlineTransactions]);
			} else {
                dispatch("setTransactions", options[0]?.transactions ? [...options[0]?.transactions, newTransaction] : [...globalState.transactions, newTransaction]);
				// dispatch("setTransactions", options[0]?.transactions ? [...options[0]?.transactions, objData.data] : [...globalState.transactions, objData.data]);
			}
		};

        showToast();
        setFields(initState);
        goBack();
        ToastAndroid.show(language.CashOutSuccessfullyAdded, ToastAndroid.SHORT);
    }

    const customerDataFinder = (data) =>
	{
        return data?.filter(trans =>
			trans.cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId) && trans.currencyId === context.currency?.id
		);
	};

    return (
        <View style={Style.container}>
            <Header title={`${transactionEdit ? language.edit : language.add} ${language.cashOut}`} goBack={goBack} />
            <View style={Style.content}>
				<ScrollView keyboardShouldPersistTaps="handled">
					<View style={Style.form}>
						<Input placeholder={language.amount} value={fields.amount} onChangeText={(text) => onChange(text, "amount")} keyboardType="numeric" disabled={isLoading} />
						{/* <Input placeholder="Currency" value={globalState.currencies.find(curr => curr.id === fields.currencyId).code} disabled={true} /> */}
						{!transactionEdit && <SelectList
							setSelected={(val) => onChange(Number(val), "currencyId")} 
							data={fields.currenciesData}
							// save={context.currency.code}
							save={"key"}
							search={false}
							placeholder={context.currency?.code}
							boxStyles={Style.dropDown}
							dropdownStyles={Style.dropdownMenu}
							disabled={isLoading}
						/>}

						{/* {fromCashbook && (
							<SelectList
								setSelected={(val) => {
									if (val) {
										const selectedCustomer = globalState.customers.find(c => 
											c.id === val || c._id === val || c.customer?.id === val
										);
										if (selectedCustomer) {
											const selectedId = 
												selectedCustomer?.summary?.[0]?.cashbookId || 
												selectedCustomer?._id || 
												selectedCustomer?.id;
											onChange(selectedId, "cashbookId");
										}
									}
								}}
								data={globalState.customers.map((item) => ({
									key: item.id || item._id || item.customer?.id,
									value: `${item.customer?.firstName || item.firstName || "Unknown"} ${item.customer?.lastName || item.lastName || ""}`,
									details: `${item.customer?.phone || item.phone || "N/A"} - ${item.customer?.email || item.email || "N/A"}`,
								}))}
								save="key"
								searchPlaceholder="Search Customer"
								placeholder="Select Customer"
								search={false}
								keyboardShouldPersistTaps="handled"
							/>
						)} */}
						{fromCashbook && (
							<SelectList
								setSelected={(val) => {
									if (val) {
										const selectedId =
												val?.summary?.[0]?.cashbookId || val?._id || val?.id;
												// val?.summary?.[0]?.cashbookId || val?.id || val?._id;
										onChange(selectedId, "cashbookId");
									}
								}}
								data={globalState?.customers?.map((item) => ({
									// value: item.customer?.firstName || "Unknown Customer",
									// details: `${item.customer?.phone || "N/A"} - ${item.customer?.email || "N/A"}`,
									key: item.id || item.customer?.id,
									value: item || "Unknown Customer",
									details: `${item?.phone || "N/A"} - ${item?.email || "N/A"}`,
								}))}
								save="customer"
								searchPlaceholder="Search Customer"
								placeholder="Select Customer"
								isForPhone={true}
								searchicon={false}
								search={false}
							/>
						)}
						<Input placeholder={language.profit} value={fields.profit} onChangeText={(text) => onChange(text, "profit")} keyboardType="numeric" disabled={isLoading} />
						<Input placeholder={language.information} value={fields.information} onChangeText={(text) => onChange(text, "information")} type="textarea" disabled={isLoading} />

						{(!transactionEdit && !context.isGuest) && <Card style={Style.takePhotoContainer} onPress={takePhoto} activeOpacity={1}>
							{
								fields.photo ?
								<View style={Style.photoContainer}>
									<Image
										source={{ uri: fields.photo.uri }}
										style={{ width: "100%", height: "100%" }}
									/>
									<TouchableOpacity style={{...Style.trashContainer}} onPress={() => onChange(null, "photo")}>
										<Feather name="trash-2" size={20} color={"rgba(240, 0, 41, 0.6)"} />
									</TouchableOpacity>
								</View>
								:
								<Text style={{color: isAndroid ? "#808080" : "#C7C7CD"}}>{language.takePhoto}</Text>
							}
						</Card>}

						<Button style={Style.submit} onPress={submitHandler} isLoading={isLoading} disabled={isLoading}>{transactionEdit ? language.edit : language.submit}</Button>
					</View>
				</ScrollView>
            </View>

            <CashInOutValidationAlert
                onConfirm={() => onChange({ visible: false, message: "" }, "showAlert")}
                onCancel={() => onChange({ visible: false, message: "" }, "showAlert")}
                show={fields.showAlert.visible}
                message={fields.showAlert.message}
                
            />
        </View>
    )
};

export default CashOut;