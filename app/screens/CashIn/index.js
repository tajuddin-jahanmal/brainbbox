import { useNavigation } from 'expo-router';
import { memo, useContext, useEffect, useState } from "react";
import { Alert, StatusBar, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import Toast from "react-native-toast-message";
import { CashInOutValidationAlert } from "../../components/Alerts";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import Colors from "../../constant";
import Customers from "../../DB/Customer";
import Queue from "../../DB/Queue";
import SelfCashDB from "../../DB/SelfCash";
import TransactionDB from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import idGenerator from "../../utils/idGenerator";
import isNumber from "../../utils/isNumber";
import serverPath from "../../utils/serverPath";
import SortData from "../../utils/SortData";
import Validation from "../../validator/CashInOut";
import Style from "./Style";

const CashIn = (props) =>
{
	const navigation = useNavigation();
	const { goBack } = navigation;
	const { dailyTrans, selfCash, cashbookId, fromCashbook, transactionEdit, transactionId } = props.route?.params;
	const context = useContext(ExchangeMoneyContext);

	const initState = {
			// amount: JSON.stringify(Math.floor(Math.random() * 100)),
			amount: "",
			profit: '',
			currencyId: context.currency?.id,
			cashbookId: "",
			information: "",
			type: true,
			showAlert: { visible: false, message: "" },
			currenciesData: [],
	};

	const showToast = () => {
		Toast.show({
			type: 'success',
			text1: language.success,
			text2: language.CashInSuccessfullyAdded,
			swipeable: true,
			visibilityTime: 2000,
		});
	};
	const showEditToast = () => {
		Toast.show({
			type: 'success',
			text1: language.success,
			text2: language.CashInSuccessfullyEdited,
			swipeable: true,
			visibilityTime: 2000,
		});
	};

	const [ globalState, dispatch ] = useStore(false);
	const [ fields, setFields ] = useState(initState);
	const [ isLoading, setIsLoading ] = useState(false);

	useEffect(() => {
		let currencies = [];
		globalState.currencies.forEach(curr => {
				currencies.push({key: curr.id, value: curr.code });
		});
		onChange(currencies, "currenciesData");

		StatusBar.setBackgroundColor(Colors.green);
		return () => {
			StatusBar.setBackgroundColor(Colors.primary);
		}
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

	const onChange = (value, type) =>
	{
			if (isLoading)
					return;
			setFields(prev => ({
					...prev,
					[type]: value,
			}));
	};
	
	// IN EDIT HANDLER I DON'T DID THE CODE FOR SELFCASH BECAUSE NOW WE DON'T USE SELFCASH
	const editHandler = async () =>
	{
		// OFFLINE EDIT, CURRENCY CHANGE IN EDIT WANT SOME WORK
		if (context.isGuest) {
			// NOW THE GUEST HAS ONLY ONE CURRENCY IF GUEST HAS MORE CURRENCIES THE CODE SHOULD BE DEVELOPE.
			return transactionEditManager();
		}
		
		if (!context.isConnected)
			return Alert.alert(language.info, "You are offline please come online");
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
		let editAmount = (Number.parseInt(In_Out_Amount) - Number.parseInt(transaction.amount) + Number.parseInt(fields.amount));
		let totalProfit = (Number.parseInt(cloneSummary[summaryIndex].totalProfit) - Number.parseInt(transaction.profit) + Number.parseInt(fields.profit))
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
		transaction.type = true;
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
				const response = await fetch(serverPath("/transaction"), {
					method: "PUT",
					headers: {
						"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({...transactionClone, providerId: context?.user?.id})
				});
		
				const objData = await response.json();
				if (objData.status === "success")
					return transactionDataEditSetter(findCust, transaction, cloneCustomers, transactionsClone, cashBookIndex);
		
				if (objData.status === "failure")
				{
					setIsLoading(false);
					Alert.alert(language.info, objData.message)
				};
			} catch (error) {
				setIsLoading(false);
				console.log(error.message, "error.message Edit CashIn");
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
	}

	const submitHandler = async () =>
	{
		if (isLoading) return;
		
		try {
			if (fromCashbook && fields.cashbookId?.length <= 0)
				return Alert.alert(language.info, language.pleaseSelectCustomer);

			setIsLoading(true);
			let requestData = {
				amount: fields.amount,
				profit: fields.profit || 0,
				currencyId: fields.currencyId,
				information: fields.information,
				providerId: context?.user?.id,
				cashbookId: (fromCashbook ? fields?.cashbookId : cashbookId),
				// dateTime: new Date().toString(),
				dateTime: new Date().toISOString(),
				type: fields.type,
				isReceivedMobile: true,
			}

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
				if (selfCash)
					Queue.createQueueEntry("insert", requestData.id, "selfCash", JSON.stringify(requestData), null);
				else
					Queue.createQueueEntry("insert", requestData.id, "transactions", JSON.stringify(requestData), null);

				submitedDataHandler({data: requestData});
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

			const response = await fetch(serverPath("/transaction"), {
				method: "POST",
				headers: {
						"Content-Type": "Application/JSON",
				},
				body: JSON.stringify(requestData)
			});
	
			const objData = await response.json();
			if (objData.status === "success")
				submitedDataHandler(objData)
	
			if (objData.status === "failure")
			{
				setIsLoading(false);
				Alert.alert(language.info, objData.message)
			};
		} catch (error) {
			setIsLoading(false);
			console.log(error.message, "error.message Add CashIn");
			Alert.alert(language.alert, error.message);
		}
	}

	const submitedDataHandler = async (objData) =>
	{
		if (selfCash)
		{
			const data = objData.data;
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
			);
			
			setFields(initState);
			goBack();
			// ToastAndroid.show(language.CashInSuccessfullyAdded, ToastAndroid.SHORT);
			showToast();
			return;
		}

		// Daily Transactions
		if (dailyTrans)
		{
			dailyTransactionFinder(objData);
			return;
		}

		// Cashbook Transactions
		const offlineTransactionsByDate = await TransactionDB.transByDateAndcashbbokId("", "", (fromCashbook ? fields?.cashbookId : cashbookId), context.currency?.id, "custom");
		if (context.isConnected) {
			// let oldDailyTranscations = [];
			// globalState.dailyTransactions.find(trans => {
			// 	if (trans.cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId) && trans.currencyId === context.currency?.id)
			// 	oldDailyTranscations.push(trans);
			// });

			const oldDailyTranscations = globalState.dailyTransactions.filter( trans => 
				trans.cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId) && trans.currencyId === context.currency?.id
			);

			if (oldDailyTranscations?.length <= 0)
			{
				let offlineData = customerDataFinder(SortData(offlineTransactionsByDate));
				dataManager(objData, { dailyTransactions: [...offlineData, ...globalState.dailyTransactions] });
				return;
			}
		} else {
			// if (offlineTransactions?.length >= 1)
			if (offlineTransactionsByDate?.length >= 1)
			{
				dataManager(objData, { dailyTransactions: [...offlineTransactionsByDate] });
				return;
			}
		}

		dataManager(objData);
		return;
	};

	const dailyTransactionFinder = async (objData) =>
	{
		const offlineTransactions = await TransactionDB.getTransactions();
		if (context.isConnected) {
			const oldTranscations = globalState.transactions.filter( trans =>
			    trans.cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId) && trans.currencyId === context.currency?.id
			);

			if (oldTranscations?.length <= 0)
			{
				// const offlineTransactionsByDate = await TransactionDB.transactionsByDate("", "", (fromCashbook ? fields?.cashbookId : cashbookId), context.currency?.id, "custom");
				// dataManager(objData, { transactions: [...offlineTransactionsByDate, ...globalState.transactions] });
				let offlineData = customerDataFinder(SortData(offlineTransactions));
				dataManager(objData, { transactions: [...offlineData, ...globalState.transactions] });
				// dataManager(objData, { transactions: [...offlineTransactions, ...globalState.transactions] });
				return;
			}
		} else {
			if (offlineTransactions?.length >= 1)
			{
				dataManager(objData, { transactions: [...offlineTransactions] });
				return;
			}
		}

		dataManager(objData);
	}

	const dataManager = async (objData, ...options) =>
	{
		// WITH newTransaction WE HAVE THE _ID AND ID OTHER WAYS WE ONLY HAVE THE ID NOT _ID
		const newTransaction = await TransactionDB.createTransaction(
			objData.data.id,
			objData.data.amount,
			objData.data.profit,
			objData.data.information,
			objData.data.currencyId,
			objData.data.cashbookId,
			objData.data.type,
			objData.data.dateTime,
			objData.data.isReceivedMobile,
		);

		let cloneCustomers = [...globalState.customers];
		let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == (fromCashbook ? fields?.cashbookId : cashbookId));
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
		let newAmount = (Number.parseInt(In_Out_Amount) + Number.parseInt(fields.amount))
		let totalProfit = (Number.parseInt(cloneSummary[summaryIndex].totalProfit) + Number.parseInt(fields.profit))
		cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"] = newAmount;
		cloneSummary[summaryIndex].totalProfit = totalProfit;
		cloneCustomers[cashBookIndex].summary = cloneSummary;

		const customerData = await Customers.getCustomers();
		const findCust = customerData.find(customer => customer._id === (fromCashbook ? fields?.cashbookId : cashbookId));
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
			if (fromCashbook && globalState.transactions?.length <= 0)
			{
				const offlineTransactions = await TransactionDB.getTransactions();
				dispatch("setTransactions", [...offlineTransactions]);
			} else {
				dispatch("setTransactions", options[0]?.transactions ? [...options[0]?.transactions, newTransaction] : [...globalState.transactions, newTransaction]);
				// dispatch("setTransactions", options[0]?.transactions ? [...options[0]?.transactions, objData.data] : [...globalState.transactions, objData.data]);
			}
			dispatch("setDailyTransactions", options[0]?.dailyTransactions ? [...options[0]?.dailyTransactions, newTransaction] : [...globalState.dailyTransactions, newTransaction]);
			// dispatch("setDailyTransactions", options[0]?.dailyTransactions ? [...options[0]?.dailyTransactions, objData.data] : [...globalState.dailyTransactions, objData.data]);
		};


		showToast();
		setFields(initState);
		goBack();
		// ToastAndroid.show(language.CashInSuccessfullyAdded, ToastAndroid.SHORT);
	}

	const customerDataFinder = (data) =>
	{
		return data.filter(trans =>
			trans.cashbookId === (fromCashbook ? fields?.cashbookId : cashbookId) && trans.currencyId === context.currency?.id
		);
	};

	console.log("Rendering [CAshIn.js]");

	return (
		<View style={Style.container}>
			<Header title={`${transactionEdit ? language.edit : language.add} ${language.cashIn}`} goBack={goBack} style={{ backgroundColor: Colors.green }} />
			<View style={Style.content}>
				<View style={Style.form}>
					<Input placeholder={language.amount} value={fields.amount} onChangeText={(text) => onChange(text, "amount")} keyboardType="numeric" disabled={isLoading} />
					{/* <Input placeholder="Currency" value={globalState.currencies.find(curr => curr.id === fields.currencyId).code} disabled={true} /> */}
					{!transactionEdit && <SelectList
						setSelected={(val) => onChange(Number(val), "currencyId")} 
						data={fields.currenciesData}
						// save={context.currency?.code}
						save={"key"}
						search={false}
						placeholder={context.currency?.code}
						boxStyles={Style.dropDown}
						dropdownStyles={Style.dropdownMenu}
						disabled={isLoading}
						keyboardShouldPersistTaps="handled"
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
							keyboardShouldPersistTaps="handled"
						/>
					)}

					<Input placeholder={language.profit} value={fields.profit} onChangeText={(text) => onChange(text, "profit")} keyboardType="numeric" disabled={isLoading} />
					<Input placeholder={language.information} value={fields.information} onChangeText={(text) => onChange(text, "information")} type="textarea" disabled={isLoading} />

					<Button style={Style.submit} onPress={submitHandler} isLoading={isLoading} disabled={isLoading}>{transactionEdit ? language.edit : language.submit}</Button>

				</View>
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

export default memo(CashIn);