import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Slider from "../../components/Slider";
import TokenModal from "../../components/TokenModal";
import Colors, { isAndroid } from "../../constant";
import Currency from "../../DB/Currency";
import Customers from "../../DB/Customer";
import OpeningBalance from '../../DB/OpeningBalance';
import Queue from "../../DB/Queue";
import SelfCash from "../../DB/SelfCash";
import Transaction from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import serverPath, { mainServerPath } from '../../utils/serverPath';
import { SortCustomers } from "../../utils/SortData";
import Style from "./Style";



const Home = (props) =>
{
	const isFocused = useIsFocused()
	const [isLoading, setIsLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [globalState, dispatch] = useStore();
	const navigation = useNavigation();
	const { navigate } = isAndroid ? props.navigation : navigation;
	const [ tokenModalVisible, setTokenModalVisible ] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const [ offlineQueueLength, setOfflineQueueLength ] = useState(0);
	const [ cash, setCash ] = useState({});
	const hasUploadedRef = useRef(false);



	// DONE
	// REPORT ,,,,,
	// Transaction Modal CustomerName
	// When cashout go down it color change to RED
	// Delete Cash show ALert
	// In cashbook page shoulde transactions show with customerName & wonerName
	// show/hide remove => currencies
	// In Chasin/out if he do the cashout and he dont has enught money there soulde show the Alert you give him $1000 withdraw to him
	// Report shoulde have total Chas, ChasIn, Cashout, and the desing shoulde be like transaction
	// In Cashbook page show/hide shoulde change to curency
	// When customer added for first Time in CashbookCashin customer don't work
	// Cashbook CashIn/Out customer check
	// In profile (Phone, gmail) shoulde not update.
	// logout then customers exist WHY
	// Logout button

	// WORKING
	// Cashin/out amount/profit yup.string to yup.number
	// Token Chacker
	// Login with existing customer Register
	// Pa Cashbook page ki header ki chi cashIn Amount di fontsize yai ba yad kochni si
	// Cashin/out profit not required
	// Sync fetch request error !---------------------------------!
	// Report in Client make like react native wala
	// In report check it if its string it change to Number
	// Error checking for app update: [TypeError: Cannot read property 'seen' of null]

	// n guest mood the amount is string Check in user mood

	// SERVER
	// AddCustomer emil not require


	// Helper function to set customers from local DB
	const customersSetter = async () => {
		try {
			const customerData = await Customers.getCustomers();
			const newCustomerData = customerData.map(customer => ({
				id: customer?.id,
				_id: customer?._id,
				active: customer?.active, 
				firstName: customer?.firstName, 
				lastName: customer?.lastName,
				countryCode: customer?.countryCode,
				phone: customer?.phone,
				email: customer?.email, 
				summary: JSON.parse(customer?.summary || '[]'),
				userId: customer?.userId
			}));
			
			dispatch("setCustomers", SortCustomers(newCustomerData));
			return newCustomerData;
		} catch (error) {
			console.error("Error setting customers:", error);
			return [];
		}
	};

	// Helper function to update transaction received status
	const updateTransactionReceivedStatus = async (transaction, user) => {
	if (!transaction.isReceivedMobile) {
		const reqData = {
		id: transaction.id,
		amount: transaction.amount,
		profit: transaction.profit,
		information: transaction.information,
		currencyId: transaction.currencyId,
		cashbookId: transaction.cashbookId,
		type: transaction.type,
		isReceivedMobile: true,
		dateTime: transaction.dateTime
		};
		
		try {
		await fetch(serverPath("/transaction"), {
			method: "PUT",
			headers: { "Content-Type": "Application/JSON" },
			body: JSON.stringify({ ...reqData, providerId: user.id })
		});
		} catch (error) {
		console.error("Error updating transaction status:", error);
		}
	}
	};

	// Helper function to process and store transactions
	const processTransactions = async (transactions, user) => {
	for (const transaction of transactions) {
		try {
		await Transaction.createTransaction(
			transaction.id,
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
		
		await updateTransactionReceivedStatus(transaction, user);
		} catch (error) {
		console.error("Error processing transaction:", error);
		}
	}
	};

	
	// Helper function to check if customer already exists in local DB
	const customerExists = async (phone) => {
		try {
			const existingCustomers = await Customers.getCustomers();
			return existingCustomers.some(customer => customer.phone === phone);
		} catch (error) {
			console.error("Error checking customer existence:", error);
			return false;
		}
	};

	// Updated syncInitialData function
	const syncInitialData = async (user, customer) => {
	try {
		setIsLoading(true);
		setLoadingData(true);
		
		// Fetch cashbook data
		const response = await fetch(serverPath("/get/cashbook"), {
		method: "POST",
		headers: { "Content-Type": "Application/JSON" },
		body: JSON.stringify({ providerId: user.id, ownerId: customer.id })
		});

		const objData = await response.json();
		
		if (objData.status !== "success") {
		Alert.alert("Info!", objData.message || "Failed to fetch cashbook data");
		return;
		}

		// Filter and process customers
		const filterCustomers = objData.data?.filter(customerItem => customerItem.customerId !== customer.id)
		.map(customerItem => ({
			...customerItem,
			customer: customerItem.customer || {}
		}));

		// Store customers locally - ONLY if they don't exist
		for (const customerItem of filterCustomers) {
		const phone = customerItem?.customer?.phone;
		
		// Check if customer already exists before creating
		if (phone && !(await customerExists(phone))) {
			try {
			await Customers.createCustomer(
				customerItem?.id,
				customerItem?.customer?.firstName,
				customerItem?.customer?.lastName,
				customerItem?.customer?.countryCode || "",
				phone,
				customerItem?.customer?.email,
				JSON.stringify(customerItem?.summary || []),
				customerItem?.customer?.active,
				customerItem?.customer?.userId
			);
			} catch (error) {
			console.error(`Error creating customer ${phone}:`, error);
			}
		} else {
			console.log(`Customer ${phone} already exists, skipping creation`);
		}
		}

		dispatch("setCustomers", SortCustomers(filterCustomers));

		// Fetch and process currencies - ONLY if they don't exist
		const currencyResponse = await fetch(serverPath("/get/currency"), {
		method: "POST",
		headers: { "Content-Type": "Application/JSON" },
		body: JSON.stringify({ providerId: user.id })
		});

		const currencyData = await currencyResponse.json();
		
		if (currencyData.status === "success") {
		// Check existing currencies
		const existingCurrencies = await Currency.getCurrencies();
		
		// Process transactions for each customer and currency
		for (const customerItem of filterCustomers) {
			for (const currency of currencyData.data) {
			try {
				// Check if transactions already exist for this customer/currency
				// const existingTransactions = await Transaction.getTransactionsByCurrencyId(currency.id);
				
				// Only fetch if we don't have transactions for this currency
				// if (existingTransactions.length === 0) {
					const transactionResponse = await fetch(serverPath("/get/cashbook_transactions"), {
						method: "POST",
						headers: { "Content-Type": "Application/JSON" },
						body: JSON.stringify({ 
						cashbookId: customerItem.id, 
						currencyId: currency.id, 
						providerId: user.id 
						})
					});

					const transactionObjData = await transactionResponse.json();
					
					if (transactionObjData.status === "success" && transactionObjData.data.length > 0) {
						await processTransactions(transactionObjData.data, user);
					} else if (transactionObjData.status === "failure") {
						Alert.alert("Info!", transactionObjData.message);
					}
				// } else {
				// console.log(`Transactions for currency ${currency.id} already exist, skipping`);
				// }
			} catch (error) {
				console.error(`Error processing transactions for customer ${customerItem.id}:`, error);
			}
			}
		}

		// Set currencies in state and local DB - ONLY if not already set
		if (globalState.currencies.length <= 0) {
			context.setState(prev => ({ ...prev, currency: currencyData.data[0] }));
			dispatch('setCurrencies', currencyData.data);
		}
		
		// Create currencies in local DB only if they don't exist
		for (const currency of currencyData.data) {
			const currencyExists = existingCurrencies.some(curr => curr.id === currency.id || curr._id === currency.id);
			if (!currencyExists) {
			await Currency.createCurrency(currency.id, currency?.code, currency.name);
			}
		}
		} else {
		Alert.alert("Info!", currencyData.message);
		}

		// Mark first time setup as complete
		await AsyncStorage.setItem("isFirstTime", JSON.stringify({ isFirstTime: false }));
		
	} catch (error) {
		console.error("Error in syncInitialData:", error);
		Alert.alert("Info!", "Error Code: 2");
	} finally {
		setIsLoading(false);
		setLoadingData(false);
	}
	};

	// Helper function to sync received transactions
	const syncReceivedTransactions = async (customers, user, currency) => {
	try {
		const customersClone = [...customers];
		
		for (const customer of customersClone) {
		try {
			const request = await fetch(serverPath("/get/receivedTransactions"), {
			method: "POST",
			headers: { "Content-Type": "Application/JSON" },
			body: JSON.stringify({ 
				cashbookId: customer._id || customer.id, 
				currencyId: currency.id, 
				providerId: user.id 
			})
			});

			const objData = await request.json();
			
			if (objData.status === "success" && objData.data.length >= 1) {
			const cashs = [];
			
			// Process transactions
			for (const transaction of objData.data) {
				const tranIndex = cashs.findIndex(item => item.cashbookId === transaction.cashbookId);
				
				if (tranIndex >= 0) {
				if (transaction.type) {
					cashs[tranIndex].cashIn += transaction.amount;
				} else {
					cashs[tranIndex].cashOut += transaction.amount;
				}
				cashs[tranIndex].profit += transaction.profit;
				} else {
				cashs.push({
					cashIn: transaction.type ? transaction.amount : 0,
					cashOut: !transaction.type ? transaction.amount : 0,
					cashbookId: transaction.cashbookId,
					profit: transaction.profit
				});
				}

				// Store transaction and update status
				await Transaction.createTransaction(
				transaction.id,
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
				
				await updateTransactionReceivedStatus(transaction, user);
			}

			// Update customer summary
			const customerIndex = customersClone.findIndex(item => 
				(item._id || item.id) === (customer._id || customer.id)
			);

			if (customerIndex >= 0 && cashs.length >= 1) {
				await updateCustomerSummary(customersClone[customerIndex], cashs[0], currency.id);
			}
			}
		} catch (error) {
			console.error(`Error syncing transactions for customer ${customer.id}:`, error);
		}
		}

		dispatch("setCustomers", customersClone);
	} catch (error) {
		console.error("Error in syncReceivedTransactions:", error);
	}
	};

	// Helper function to update customer summary
	const updateCustomerSummary = async (customer, cashData, currencyId) => {
	try {
		const customerId = customer.id;
		const firstName = customer.customer?.firstName || customer.firstName;
		const lastName = customer.customer?.lastName || customer.lastName;
		const countryCode = customer.customer?.countryCode || customer.countryCode;
		const phone = customer.customer?.phone || customer.phone;
		const email = customer.customer?.email || customer.email;
		const active = customer.active || customer.customer?.active;
		const userId = customer.customer?.userId || customer.userId;

		let newSummary = [];
		const oldSummary = Array.isArray(customer.summary) ? customer.summary : [];
		const existingCurrencySummary = oldSummary.find(summ => summ.currencyId === currencyId);

		if (existingCurrencySummary) {
		// Update existing summary
		const otherSummaries = oldSummary?.filter(summ => summ.currencyId !== currencyId);
		const updatedSummary = {
			...existingCurrencySummary,
			cashIn: existingCurrencySummary.cashIn + cashData.cashIn,
			cashOut: existingCurrencySummary.cashOut + cashData.cashOut,
			totalProfit: existingCurrencySummary.totalProfit + cashData.profit
		};
		
		newSummary = [...otherSummaries, updatedSummary];
		} else if (oldSummary.length > 0) {
		// Add new currency summary to existing summaries
		newSummary = [
			...oldSummary,
			{
			cashIn: cashData.cashIn,
			cashOut: cashData.cashOut,
			currencyId: currencyId,
			totalProfit: cashData.profit,
			cashbookId: customer._id || customer.id
			}
		];
		} else {
		// Create first summary
		newSummary = [{
			cashIn: cashData.cashIn,
			cashOut: cashData.cashOut,
			currencyId: currencyId,
			totalProfit: cashData.profit,
			cashbookId: customer._id || customer.id
		}];
		}

		// Update customer in local DB and state
		await Customers.updateCustomer(
		customerId,
		firstName,
		lastName,
		countryCode,
		phone,
		email,
		JSON.stringify(newSummary),
		active,
		userId
		);

		customer.summary = newSummary;
	} catch (error) {
		console.error("Error updating customer summary:", error);
	}
	};

	useEffect(() => {
		if (!isFocused) return;

		const loadInitialData = async () => {
			if (context.isGuest) {
				await customersSetter();
				return;
			}

			try {
				const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;

				// Check if we already have customers in local DB
				const localCustomers = await Customers.getCustomers();

				// Load offline data if no customers in state AND no customers in local DB
				// if (globalState.customers.length <= 0 && localCustomers.length <= 0 && !isFirstTime) {
				if (globalState.customers.length <= 0 && !isFirstTime) {
						const [offlineCurrencies, offlineOpeningBalances, offlineTransactions] = await Promise.all([
						Currency.getCurrencies(),
						OpeningBalance.getOpeningBalance(),
						Transaction.getTransactionsByCurrencyId(context.currency?.id)
					]);

					await customersSetter();

					const currencyData = context.isConnected ? offlineCurrencies : 
					offlineCurrencies.map(currency => ({ ...currency, id: currency._id }));

					if (globalState.currencies.length <= 0) {
						dispatch("setCurrencies", currencyData);
					}

					if (globalState.openingBalances.length <= 0) {
						dispatch("setOpeningBalances", offlineOpeningBalances);
					}

					if (globalState.transactions.length <= 0) {
						dispatch("setTransactions", offlineTransactions);
					}

					if (!context.currency) {
						context.setState(prev => ({ ...prev, currency: currencyData[0] }));
					}
					return;
				}

				// Sync data from server only if we don't have local customers
				if (localCustomers.length <= 0 && context.isConnected) {
					await syncInitialData(context.user, context.customer);
				} else {
					// If we already have local customers, just set them in state
					await customersSetter();
				}
				} catch (error) {
				setIsLoading(false);
				Alert.alert("Info!", "Error Code: 2");
			}
		};

		loadInitialData();
	}, [isFocused]);

	// useEffect for syncing received transactions
	useEffect(() => {
	const syncTransactions = async () => {
		const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;
		
		if (context.isConnected && 
			globalState.customers.length >= 1 && 
			context.currency && 
			!isFirstTime) {
		await syncReceivedTransactions(
			globalState.customers, 
			context.user, 
			context.currency
		);
		}
	};

	syncTransactions();
	}, [context.currency, globalState.customers.length]);












	// ---------------THIS CODE IS WORKING BUT THE ABOVE CODE IS THE NEW VERSION CODE---------------
	// const customersSetter = async () =>
	// {
	// 	const customerData = await Customers.getCustomers();
	// 	let newCustomerData = [];
	// 	customerData.forEach(customer => {
	// 		newCustomerData.push({
	// 			id: customer?.id,
	// 			_id: customer?._id,
	// 			active: customer?.active, 
	// 			firstName: customer?.firstName, 
	// 			lastName: customer?.lastName,
	// 			countryCode: customer?.countryCode,
	// 			phone: customer?.phone,
	// 			email: customer?.email, 
	// 			summary: JSON.parse(customer?.summary),
	// 			userId: customer?.userId
	// 		})});
	// 	dispatch("setCustomers", SortCustomers(newCustomerData));
	// }
	// useEffect(() => {
	// 	(async () =>
	// 	{
	// 		if(!isFocused)
	// 			return;
	// 		if (context.isGuest)
	// 		{
	// 			customersSetter();
	// 			return;
	// 		}

	// 		try {
	// 			const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;

	// 			if (globalState.customers.length <= 0 && !isFirstTime)
	// 			{
	// 				const offlineCurrencies = await Currency.getCurrencies();
	// 				const offlineOpeningBalances = await OpeningBalance.getOpeningBalance();
	// 				customersSetter();
	// 				const currencyData = context.isConnected ? offlineCurrencies : [];

	// 				if (!context.isConnected)
	// 					offlineCurrencies.forEach(currency => { currencyData.push({...currency, id: currency._id}) });
					
	// 				if (globalState.currencies.length <= 0)
	// 					dispatch("setCurrencies", currencyData);
					
	// 				if (globalState.openingBalances.length <= 0)
	// 					dispatch("setOpeningBalances", offlineOpeningBalances);

	// 				if (!context.currency)
	// 					context.setState(prev => ({...prev, currency: currencyData[0]}));
	// 				return;
	// 			};

	// 			if (globalState.customers.length <= 0 && context.isConnected)
	// 			{
	// 				let filterCustomers = [];
	// 				setIsLoading(true);
	// 				const response = await fetch(serverPath("/get/cashbook"), {
	// 					method: "POST",
	// 					headers: {
	// 							"Content-Type": "Application/JSON",
	// 					},
	// 					body: JSON.stringify({providerId: context.user.id, ownerId: context.customer.id})
	// 				});

	// 				const objData = await response.json();
					
	// 				if (objData.status === "success")
	// 				{
	// 					objData.data.forEach(customer =>
	// 					{
	// 						if (customer.customerId !== context.customer.id)
	// 						{
	// 							filterCustomers.push(customer);
	// 							if (isFirstTime)
	// 							{
	// 								Customers.createCustomer(
	// 									customer?.id,
	// 									customer?.customer?.firstName,
	// 									customer?.customer?.lastName,
	// 									customer?.customer?.countryCode || "",
	// 									customer?.customer?.phone,
	// 									customer?.customer?.email,
	// 									JSON.stringify(customer?.summary),
	// 									customer?.customer?.active,
	// 									customer?.customer?.userId
	// 								);
	// 							}
	// 						}
	// 					});
	// 					dispatch("setCustomers", SortCustomers(filterCustomers));
	// 					if (isFirstTime)
	// 					{
	// 						const currencyResponse = await fetch(serverPath("/get/currency"), {
	// 							method: "POST",
	// 							headers: {
	// 								"Content-Type": "Application/JSON"
	// 							},
	// 							body: JSON.stringify({providerId: context.user.id})
	// 						});

	// 						const currency = await currencyResponse.json();
	// 						if (currency.status === "success")
	// 						{
	// 							filterCustomers.forEach(async (customer) =>
	// 							{
	// 								currency.data.forEach(async (curr) => {
	// 									const transactionResponse = await fetch(serverPath("/get/cashbook_transactions"), {
	// 										method: "POST",
	// 										headers: {
	// 											"Content-Type": "Application/JSON",
	// 										},
	// 										body: JSON.stringify({ cashbookId: customer.id, currencyId: curr.id, providerId: context.user.id })
	// 									});
	// 									const transactionObjData = await transactionResponse.json();
	// 									if (transactionObjData.status === "success" && transactionObjData.data.length > 0)
	// 									{
	// 										transactionObjData.data.forEach(async (transaction) => {
	// 											Transaction.createTransaction(
	// 												transaction.id,
	// 												transaction.amount,
	// 												transaction.profit,
	// 												transaction.information,
	// 												transaction.currencyId,
	// 												transaction.cashbookId,
	// 												transaction.type,
	// 												transaction.dateTime,
	// 												transaction.isReceivedMobile,
	// 												transaction.photo,
	// 											);
												
	// 											if (!transaction.isReceivedMobile)
	// 											{
	// 												const reqData = {id: transaction.id, amount: transaction.amount, profit: transaction.profit, information: transaction.information, currencyId: transaction.currencyId, cashbookId: transaction.cashbookId, type: transaction.type, isReceivedMobile: true, dateTime: transaction.dateTime};
	// 												const updateRequest = await fetch(serverPath("/transaction"), {
	// 													method: "PUT",
	// 													headers: {
	// 														"Content-Type": "Application/JSON",
	// 													},
	// 													body: JSON.stringify({...reqData, providerId: context.user.id })
	// 												});
	// 												const updateObjData = await updateRequest.json();
	// 											}
	// 										});
	// 									}
	// 									if (transactionObjData.status === "failure")
	// 										Alert.alert("Info!", transactionObjData.message)
	// 								})
	// 							});


	// 							context.setState(prev => ({...prev, currency: currency.data[0]}));
	// 							dispatch('setCurrencies', currency.data);
	// 							currency.data.forEach(curr => Currency.createCurrency(curr.id, curr?.code, curr.name) )
	// 						}
	// 						if(currency.status === 'failure')
	// 							Alert.alert("Info!", currency.message);
	// 					}
	// 				};

	// 				if (objData.status === "failure")
	// 					Alert.alert("Info!", objData.message)

	// 				if (isFirstTime)
	// 					await AsyncStorage.setItem("isFirstTime", JSON.stringify({isFirstTime: false}))

	// 				setIsLoading(false);
	// 				return;
	// 			}
	// 		} catch (error) {
	// 			setIsLoading(false);
	// 			Alert.alert("Info!", "Error Code: 2")
	// 		}
	// 	})();
	// }, [isFocused]);

	// useEffect(() =>
	// {
	// 	(async () =>
	// 	{
	// 		const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;
	// 		if (context.isConnected && globalState.customers.length >= 1 && context.currency && !isFirstTime)
	// 		{
	// 			try {
	// 				const customersClone = [...globalState.customers];
	// 				customersClone.forEach(async (cus) =>
	// 				{
	// 					const request = await fetch(serverPath("/get/receivedTransactions"), {
	// 						method: "POST",
	// 						headers: {
	// 							"Content-Type": "Application/JSON",
	// 						},
	// 						body: JSON.stringify({ cashbookId: cus._id || cus.id, currencyId: context.currency.id, providerId: context.user.id })
	// 					});

	// 					const objData = await request.json();
	// 					let cashs = [];

	// 					if (objData.status === "success" && objData.data.length >= 1)
	// 					{
	// 						objData.data.forEach(async (transaction) => {
	// 							const tranNdx = cashs.findIndex(per => per.cashbookId === transaction.cashbookId);
	// 							if (tranNdx >= 0)
	// 							{
	// 								transaction.type ? cashs[tranNdx].cashIn += transaction.amount : cashs[tranNdx].cashOut += transaction.amount;
	// 								cashs[tranNdx].profit += transaction.profit;
	// 							}
	// 							if (tranNdx < 0)
	// 								cashs.push({cashIn: transaction.type ? transaction.amount : 0, cashOut: !transaction.type ? transaction.amount : 0, cashbookId: transaction.cashbookId, profit: transaction.profit});

	// 							Transaction.createTransaction(
	// 								transaction.id,
	// 								transaction.amount,
	// 								transaction.profit,
	// 								transaction.information,
	// 								transaction.currencyId,
	// 								transaction.cashbookId,
	// 								transaction.type,
	// 								transaction.dateTime,
	// 								transaction.isReceivedMobile,
	// 								transaction.photo,
	// 							);
	// 							const reqData = {id: transaction.id, amount: transaction.amount, profit: transaction.profit, information: transaction.information, currencyId: transaction.currencyId, cashbookId: transaction.cashbookId, type: transaction.type, isReceivedMobile: true, dateTime: transaction.dateTime};
	// 							const updateRequest = await fetch(serverPath("/transaction"), {
	// 								method: "PUT",
	// 								headers: {
	// 									"Content-Type": "Application/JSON",
	// 								},
	// 								body: JSON.stringify({...reqData, providerId: context.user.id })
	// 							});
	// 							const updateObjData = await updateRequest.json();
	// 						});

	// 						const customerNdx = customersClone.findIndex(per => (per._id || per.id) === (cus._id || cus.id));
	// 						if (cus.summary.length >= 1 && cashs.length >= 1)
	// 						{
	// 							const oldSummary = cus?.summary?.find(summ => (summ.currencyId === context.currency.id));

	// 							if (!oldSummary)
	// 							{
	// 								const newSummary = [...cus.summary, {cashIn: cashs[0]?.cashIn, cashOut: cashs[0]?.cashOut, currencyId: context.currency.id, totalProfit: cashs[0]?.profit, cashbookId: cus._id || cus.id }]
	// 								Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify(newSummary), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
	// 								customersClone[customerNdx].summary = newSummary;
	// 								// console.log(newSummary, "1");
	// 								return;	
	// 							}

	// 							const otherSummary = cus?.summary?.find(summ => summ.currencyId !== context.currency.id)
	// 							oldSummary.cashIn += cashs[0]?.cashIn;
	// 							oldSummary.cashOut += cashs[0]?.cashOut;
	// 							oldSummary.totalProfit += cashs[0]?.profit;
	// 							Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify([otherSummary, oldSummary]), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
	// 							customersClone[customerNdx].summary = [otherSummary, oldSummary];
	// 							// console.log([otherSummary, oldSummary], "2");
	// 							return;
	// 						};

	// 						if (cus.summary.length <= 0 && cashs.length >= 1)
	// 						{
	// 							const newSummary = [{cashIn: cashs[0]?.cashIn, cashOut: cashs[0]?.cashOut, currencyId: context.currency.id, totalProfit: cashs[0]?.profit, cashbookId: cus._id || cus.id }]
	// 							Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify(newSummary), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
	// 							customersClone[customerNdx].summary = newSummary;
	// 							// console.log(newSummary, "3");
	// 							return;
	// 						}
	// 					}
	// 				});

	// 				dispatch("setCustomers", customersClone);
	// 			} catch (error) {
	// 				console.log("home page error", error);
	// 				return null;
	// 			}
	// 		}
	// 	})();
	// }, [context.currency, globalState.customers.length]);













	// useEffect(() => {
	// 	if(globalState.customers.length > 0 && isFocused)
	// 	{
	// 		let cloneCurrency = [...globalState.currencies];
	// 		cloneCurrency.forEach(currency => {
	// 			currency.total = 0;
	// 			globalState.customers.forEach((perCustomer => {
	// 				let isExist = perCustomer?.summary?.find(perSum => perSum.currencyId == currency.id)
	// 				if(isExist)
	// 					currency.total = (currency.total + isExist.cashIn)
	// 			}))
	// 		});
	// 		dispatch("setCurrencies", cloneCurrency);

	// 		let totalCash = [];
	// 		globalState.customers.forEach(customer => {
	// 			customer.summary?.forEach(per => {
	// 				const cashCurrencyExistNdx = totalCash.findIndex(curr => curr.currencyId === per.currencyId)
	// 				const currencyCode = cloneCurrency.findIndex(curr => (curr._id || curr.id) === per.currencyId)

	// 				if (cashCurrencyExistNdx < 0)
	// 					totalCash.push({cashIn: per.cashIn, cashOut: per.cashOut, currencyId: per.currencyId, code: cloneCurrency[currencyCode]?.code});
	// 				else {
	// 					totalCash[cashCurrencyExistNdx].cashIn  = totalCash[cashCurrencyExistNdx].cashIn + per.cashIn;
	// 					totalCash[cashCurrencyExistNdx].cashOut  = totalCash[cashCurrencyExistNdx].cashOut + per.cashOut;
	// 				}
	// 			});
	// 		});


	// 		for (let i = 0; i < totalCash.length; i++) {
	// 			totalCash[i].cash = totalCash[i].cashIn - totalCash[i].cashOut
	// 		}

	// 		setCash(totalCash);

	// 		return;
	// 	}
	// }, [globalState.customers, context.currency, isFocused]);


	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return 
			const offlineQueue = await Queue.getQueueEntries();
			const offlineTransactions = await Transaction.getTransactions();
			if (offlineQueue.length > 0 && !hasUploadedRef.current) {
				if (globalState.transactions.length >= 1 && offlineTransactions.length >= 1)
				{
					// I hasUploadedRef for to avoid twice data upload to server.
					hasUploadedRef.current = true;
					uploadData(offlineTransactions);
				}
			}
			setOfflineQueueLength(offlineQueue.length);
		})();
	}, [isFocused]);
	// i comment this beacuse the offline transactions where upload to sever 3 time.
	// }, [globalState.customers, globalState.transactions, globalState.selfCash, isFocused]);


	const uploadData = async () =>
	{
		const offlineQueue = await Queue.getQueueEntries();
		const offlineSelfCash = await SelfCash.getSelfCash();
		const offlineTransactions = await Transaction.getTransactions();
		const transactionsClone = [...globalState.transactions];

		if (offlineQueue.length > 0 && context.isConnected)
		{
			setIsLoading(true);
			for (const q of offlineQueue)
			{
				// console.log(q, 'q');
				
				switch (q.queryType) {
					case "insert":
						try {
							if (q.tableName === "transactions")
							{
								const data = JSON.parse(q.data);
								let requestData = {
									amount: Number.parseInt(data.amount),
									profit: Number.parseInt(data.profit),
									currencyId: data.currencyId,
									information: data.information,
									// providerId: context.user.id,
									cashbookId: data.cashbookId,
									dateTime: data.dateTime,
									type: data.type,
									isReceivedMobile: data.isReceivedMobile,
									photo: data.photo,
								}
								
								const formData = new FormData();
								formData.append("amount", String(data.amount));
								formData.append("profit", String(data.profit || 0));
								formData.append("currencyId", String(data.currencyId));
								formData.append("information", data.information || "");
								formData.append("cashbookId", String(data.cashbookId));
								formData.append("dateTime", String(data.dateTime));
								formData.append("type", String(data.type));
								formData.append("isReceivedMobile", "true");
								
								if (data.photo)
								{
									const parsePhoto = JSON.parse(data.photo);
									if (parsePhoto?.uri)
									{
										formData.append("photo", {
											uri: parsePhoto.uri,
											name: "transaction.jpg",
											type: parsePhoto.mimeType || "image/jpeg",
										});
									}
								}
					
								const response = await fetch(mainServerPath("/transaction_file"), {
									method: "POST",
									body: formData
								});

								// const response = await fetch(serverPath("/transaction"), {
								// 	method: "POST",
								// 	headers: {
								// 			"Content-Type": "Application/JSON",
								// 	},
								// 	body: JSON.stringify(requestData)
								// });
								const objData = await response.json();
								if (objData.status === "success")
								{
									const { id, amount, profit, information, currencyId, cashbookId, type, dateTime, photo } = objData.data[0];
									const findOfflineTran = offlineTransactions?.find(per => per._id === data.id);
									Queue.deleteQueueEntry(q.id);
									Transaction.updateTransaction(findOfflineTran.id, id, amount, profit, information, currencyId, cashbookId, type, dateTime, true, photo);
									if (transactionsClone.length >= 1)
									{
										const transIndex = transactionsClone.findIndex(tran => tran?._id === data.id);
										if (transIndex >= 0)
											transactionsClone[transIndex] = objData.data[0];
									}
								}
								if (objData.status === "failure")
									Alert.alert("Info!", objData.message)
							}

							if (q.tableName === "selfCash")
							{
								const data = JSON.parse(q.data);
								let requestData = {
									amount: Number.parseInt(data.amount),
									profit: Number.parseInt(data.profit),
									currencyId: data.currencyId,
									information: data.information,
									providerId: context.user.id,
									cashbookId: data.cashbookId,
									dateTime: data.dateTime,
									type: data.type,
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
								{
									const { id, amount, profit, information, currencyId, cashbookId, type, dateTime } = objData.data;
									const findOfflineSelfCash = offlineSelfCash?.find(per => per._id === data.id);
									Queue.deleteQueueEntry(q.id);
									SelfCash.updateSelfCash(findOfflineSelfCash.id, id, amount, profit, information, currencyId, cashbookId, type, dateTime);

									const selfCashClone = [...globalState.selfCash];
									if (selfCashClone.length >= 1)
									{
										const selfTransIndex = selfCashClone.findIndex(selfTran => selfTran.id === data.id);
										if (selfTransIndex >= 0)
											selfCashClone[selfTransIndex] = objData.data;
										dispatch("setSelfCash", selfCashClone);
									}
								}
								if (objData.status === "failure")
									Alert.alert("Info!", objData.message)
							}

							setIsLoading(false);
						} catch (error) {
							console.log("catch Home page upload Data (insert): ", error);
							setIsLoading(false);
							Alert.alert("Info!", error.message);
							return;
						}

						break;
					case "edit":
						try {
							if (q.tableName === "transactions")
							{
								const data = JSON.parse(q.data);
								let transaction = {
									id: data._id || data.id,
									amount: Number.parseInt(data.amount),
									profit: Number.parseInt(data.profit),
									currencyId: data.currencyId,
									information: data.information,
									providerId: context.user.id,
									cashbookId: data.cashbookId,
									dateTime: data.dateTime,
									type: data.type,
									isReceivedMobile: data.isReceivedMobile,
								}
								const transactionClone = {...transaction};

								const response = await fetch(serverPath("/transaction"), {
									method: "PUT",
									headers: {
										"Content-Type": "Application/JSON",
									},
									body: JSON.stringify({...transactionClone, providerId: context?.user?.id})
								});
								const objData = await response.json();
								if (objData.status === "success")
								{
									Queue.deleteQueueEntry(q.id);
								}
								if (objData.status === "failure")
									Alert.alert("Info!", objData.message)
							}

							setIsLoading(false);
						} catch (error) {
							console.log("catch Home page upload Data (edit transaction): ", error);
							setIsLoading(false);
							Alert.alert("Info!", error.message);
							return;
						}
						break;
					case "delete":
						try {
							if (q.tableName === "transactions")
							{
								const response = await fetch(serverPath("/transaction"), {
									method: "DELETE",
									headers: {
											"Content-Type": "Application/JSON",
									},
									body: JSON.stringify({ id: q.serverId, providerId: context.user.id })
								});
								
								const objData = await response.json();
								if (objData.status === "success")
									Queue.deleteQueueEntry(q.id);

								if (objData.status === "failure")
									Alert.alert("Info!", objData.message)
							}

							if (q.tableName === "selfCash")
							{
								const response = await fetch(serverPath("/transaction"), {
									method: "DELETE",
									headers: {
											"Content-Type": "Application/JSON",
									},
									body: JSON.stringify({ id: q.serverId, providerId: context.user.id })
								});
								
								const objData = await response.json();
								if (objData.status === "success")
									Queue.deleteQueueEntry(q.id);

								if (objData.status === "failure")
									Alert.alert("Info!", objData.message)
							}

							setIsLoading(false);
						} catch (error) {
							console.log("catch Home page upload Data (delete): ", error);
							Alert.alert("Info!", error.message);
							setIsLoading(false);
							return;
						}
						
						break;
				
					default:
						break;
				}

				setOfflineQueueLength(0);
				hasUploadedRef.current = false;
			}
			console.log(transactionsClone, "transactionsClone");
			
			dispatch("setTransactions", transactionsClone);
		}
	};
	
	const notificationHandler = async () =>
	{
		await context.NotificationFunc();
	};

	const makeCustomerName = () => (context.customer?.firstName + " " + context.customer?.lastName)
	console.log("RENDERING HOME")
	return isFocused ? (
		<View style={Style.container}>
			{/* <Header title={`${language.hi} ${context.isGuest ? language.guest : makeCustomerName()}`} noBack search searchOnPress={() => setTokenModalVisible(true)} /> */}
			<Header title={`${language.hi} ${context.isGuest ? language.guest : makeCustomerName()}`} noBack />

			{loadingData && <View style={{
				zIndex: 99,
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				gap: 15,
				marginBottom: 10,
			}}>
				<ActivityIndicator size={22} color={Colors.white} />
				<Text style={{color: Colors.white}}>Loading Transactions</Text>
			</View>}


			<View style={Style.content}>
				<View style={Style.redCircle}></View>
				{/* <View style={Style.currencies}>
					{cash.length >= 1 && cash?.slice(0, 3).map((per, index) => (
						<Text style={Style.currency} key={per?.code || index}>{per?.code} {per.cash || 0}</Text>
					))}
				</View> */}
				<Slider
					images={globalState.sliders}
					// images={HomeSliderImages}
				/>
				<View style={Style.cardsContainer}>
					<Card style={Style.serviceCard} onPress={() => navigate("Customers")}>
						<SimpleLineIcons name="user" size={24} color={Colors.textColor} />
						<Text style={Style.serviceTitle}>{language.customers}</Text>
					</Card>
					<Card style={Style.serviceCard} onPress={() => navigate("Currency")}>
						<MaterialCommunityIcons name="currency-usd" size={24} color={Colors.textColor} />
						<Text style={Style.serviceTitle}>{language.currency}</Text>
					</Card>
					{/* {!context.isGuest && <Card style={Style.serviceCard} onPress={() => navigate("CurrencyRate")}>
						<MaterialIcons name="currency-exchange" size={24} color={Colors.textColor} />
						<Text style={Style.serviceTitle}>{language.currencyRate}</Text>
					</Card>} */}
					{/* <Card style={Style.serviceCard} onPress={() => navigate("SelfCash")}>
						<MaterialIcons name="show-chart" size={24} color={Colors.textColor} />
						<Text style={Style.serviceTitle}>Self Cash</Text>
					</Card> */}
				</View>

				{ offlineQueueLength >= 1 && 
					<Button style={styles.btn} onPress={uploadData} isLoading={isLoading} disabled={isLoading || !context.isConnected}>{language.uploadData}</Button>
				}
				<TokenModal
					visible={tokenModalVisible}
					onDismiss={() => setTokenModalVisible(false)}
				/>
			</View>
		</View>
	) : null
};

export default Home;


const styles = StyleSheet.create({
	btn: {
		marginTop: 10
	}
})

export const HomeOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<View>
				<Ionicons name={"home-outline"} color={tabInfo.color} size={tabInfo.size} />
			</View>
		)
	}
}