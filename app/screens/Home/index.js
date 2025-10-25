import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Slider from "../../components/Slider";
import TokenModal from "../../components/TokenModal";
import Colors, { isAndroid } from "../../constant";
import Currency from "../../DB/Currency";
import Customers from "../../DB/Customer";
import Queue from "../../DB/Queue";
import SelfCash from "../../DB/SelfCash";
import Transaction from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import serverPath from '../../utils/serverPath';
import { SortCustomers } from "../../utils/SortData";
import Style from "./Style";



const Home = (props) =>
{
	const isFocused = useIsFocused()
	const [isLoading, setIsLoading] = useState(false);
	const [globalState, dispatch] = useStore();
	const navigation = useNavigation();
	const { navigate } = isAndroid ? props.navigation : navigation;
	const [ tokenModalVisible, setTokenModalVisible ] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const [ offlineQueueLength, setOfflineQueueLength ] = useState(0);
	const [ cash, setCash ] = useState({});



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


	const customersSetter = async () =>
	{
		const customerData = await Customers.getCustomers();
		let newCustomerData = [];
		customerData.forEach(customer => {
			newCustomerData.push({
				id: customer?.id,
				_id: customer?._id,
				active: customer?.active, 
				firstName: customer?.firstName, 
				lastName: customer?.lastName,
				countryCode: customer?.countryCode,
				phone: customer?.phone,
				email: customer?.email, 
				summary: JSON.parse(customer?.summary),
				userId: customer?.userId
			})});
		dispatch("setCustomers", SortCustomers(newCustomerData));
	}
	useEffect(() => {
		(async () =>
		{
			if(!isFocused)
				return;
			if (context.isGuest)
			{
				customersSetter();
				return;
			}

			try {
				const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;

				if (globalState.customers.length <= 0 && !isFirstTime)
				{
					const offlineCurrencies = await Currency.getCurrencies();
					customersSetter();
					const currencyData = context.isConnected ? offlineCurrencies : [];

					if (!context.isConnected)
						offlineCurrencies.forEach(currency => { currencyData.push({...currency, id: currency._id}) });
					
					if (globalState.currencies.length <= 0)
						dispatch("setCurrencies", currencyData);

					if (!context.currency)
						context.setState(prev => ({...prev, currency: currencyData[0]}));
					return;
				};


				if (globalState.customers.length <= 0 && context.isConnected)
				{
					let filterCustomers = [];
					setIsLoading(true);
					const response = await fetch(serverPath("/get/cashbook"), {
						method: "POST",
						headers: {
								"Content-Type": "Application/JSON",
						},
						body: JSON.stringify({providerId: context.user.id, ownerId: context.customer.id})
					});

					const objData = await response.json();
					if (objData.status === "success")
					{
						objData.data.forEach(customer =>
						{
							if (customer.customerId !== context.customer.id)
								filterCustomers.push(customer);

							if (customer.customerId !== context.customer.id && isFirstTime)
							{
								Customers.createCustomer(
									customer?.id,
									customer?.customer?.firstName,
									customer?.customer?.lastName,
									customer?.customer?.countryCode || "",
									customer?.customer?.phone,
									customer?.customer?.email,
									JSON.stringify(customer?.summary),
									customer?.customer?.active,
									customer?.customer?.userId
								);
							}
						});
						dispatch("setCustomers", SortCustomers(filterCustomers));
						if (isFirstTime)
						{
							const currencyResponse = await fetch(serverPath("/get/currency"), {
								method: "POST",
								headers: {
									"Content-Type": "Application/JSON"
								},
								body: JSON.stringify({providerId: context.user.id})
							});

							const currency = await currencyResponse.json();
							if (currency.status === "success")
							{
								filterCustomers.forEach(async (customer) =>
								{
									currency.data.forEach(async (curr) => {
										const transactionResponse = await fetch(serverPath("/get/cashbook_transactions"), {
											method: "POST",
											headers: {
												"Content-Type": "Application/JSON",
											},
											body: JSON.stringify({ cashbookId: customer.id, currencyId: curr.id, providerId: context.user.id })
										});
										const transactionObjData = await transactionResponse.json();
										if (transactionObjData.status === "success" && transactionObjData.data.length > 0)
										{
											transactionObjData.data.forEach(async (transaction) => {
												Transaction.createTransaction(
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
												
												if (!transaction.isReceivedMobile)
												{
													const reqData = {id: transaction.id, amount: transaction.amount, profit: transaction.profit, information: transaction.information, currencyId: transaction.currencyId, cashbookId: transaction.cashbookId, type: transaction.type, isReceivedMobile: true, dateTime: transaction.dateTime};
													const updateRequest = await fetch(serverPath("/transaction"), {
														method: "PUT",
														headers: {
															"Content-Type": "Application/JSON",
														},
														body: JSON.stringify({...reqData, providerId: context.user.id })
													});
													const updateObjData = await updateRequest.json();
												}
											});
										}
										if (transactionObjData.status === "failure")
											Alert.alert("Info!", transactionObjData.message)
									})
								});


								context.setState(prev => ({...prev, currency: currency.data[0]}));
								dispatch('setCurrencies', currency.data);
								currency.data.forEach(curr => Currency.createCurrency(curr.id, curr?.code, curr.name) )
							}
							if(currency.status === 'failure')
								Alert.alert("Info!", currency.message);
						}
					};

					if (objData.status === "failure")
						Alert.alert("Info!", objData.message)

					if (isFirstTime)
						await AsyncStorage.setItem("isFirstTime", JSON.stringify({isFirstTime: false}))

					setIsLoading(false);
					return;
				}
			} catch (error) {
				setIsLoading(false);
				Alert.alert("Info!", "Error Code: 2")
			}
		})();
	}, [isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"))?.isFirstTime;
			if (context.isConnected && globalState.customers.length >= 1 && context.currency && !isFirstTime)
			{
				try {
					const customersClone = [...globalState.customers];
					customersClone.forEach(async (cus) =>
					{
						const request = await fetch(serverPath("/get/receivedTransactions"), {
							method: "POST",
							headers: {
								"Content-Type": "Application/JSON",
							},
							body: JSON.stringify({ cashbookId: cus._id || cus.id, currencyId: context.currency.id, providerId: context.user.id })
						});

						const objData = await request.json();
						let cashs = [];

						if (objData.status === "success" && objData.data.length >= 1)
						{
							objData.data.forEach(async (transaction) => {
								const tranNdx = cashs.findIndex(per => per.cashbookId === transaction.cashbookId);
								if (tranNdx >= 0)
								{
									transaction.type ? cashs[tranNdx].cashIn += transaction.amount : cashs[tranNdx].cashOut += transaction.amount;
									cashs[tranNdx].profit += transaction.profit;
								}
								if (tranNdx < 0)
									cashs.push({cashIn: transaction.type ? transaction.amount : 0, cashOut: !transaction.type ? transaction.amount : 0, cashbookId: transaction.cashbookId, profit: transaction.profit});

								Transaction.createTransaction(
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
								const reqData = {id: transaction.id, amount: transaction.amount, profit: transaction.profit, information: transaction.information, currencyId: transaction.currencyId, cashbookId: transaction.cashbookId, type: transaction.type, isReceivedMobile: true, dateTime: transaction.dateTime};
								const updateRequest = await fetch(serverPath("/transaction"), {
									method: "PUT",
									headers: {
										"Content-Type": "Application/JSON",
									},
									body: JSON.stringify({...reqData, providerId: context.user.id })
								});
								const updateObjData = await updateRequest.json();
							});

							const customerNdx = customersClone.findIndex(per => (per._id || per.id) === (cus._id || cus.id));
							if (cus.summary.length >= 1 && cashs.length >= 1)
							{
								const oldSummary = cus?.summary?.find(summ => (summ.currencyId === context.currency.id));

								if (!oldSummary)
								{
									const newSummary = [...cus.summary, {cashIn: cashs[0]?.cashIn, cashOut: cashs[0]?.cashOut, currencyId: context.currency.id, totalProfit: cashs[0]?.profit, cashbookId: cus._id || cus.id }]
									Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify(newSummary), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
									customersClone[customerNdx].summary = newSummary;
									// console.log(newSummary, "1");
									return;	
								}

								const otherSummary = cus?.summary?.find(summ => summ.currencyId !== context.currency.id)
								oldSummary.cashIn += cashs[0]?.cashIn;
								oldSummary.cashOut += cashs[0]?.cashOut;
								oldSummary.totalProfit += cashs[0]?.profit;
								Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify([otherSummary, oldSummary]), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
								customersClone[customerNdx].summary = [otherSummary, oldSummary];
								// console.log([otherSummary, oldSummary], "2");
								return;
							};

							if (cus.summary.length <= 0 && cashs.length >= 1)
							{
								const newSummary = [{cashIn: cashs[0]?.cashIn, cashOut: cashs[0]?.cashOut, currencyId: context.currency.id, totalProfit: cashs[0]?.profit, cashbookId: cus._id || cus.id }]
								Customers.updateCustomer(cus.id, (cus.customer?.firstName || cus.firstName), (cus.customer?.lastName || cus.lastName), (cus.customer?.countryCode || cus.countryCode), (cus.customer?.phone || cus.phone), (cus.customer?.email || cus.email), JSON.stringify(newSummary), (cus.active || cus.customer?.active), (cus.customer?.userId || cus.userId));
								customersClone[customerNdx].summary = newSummary;
								// console.log(newSummary, "3");
								return;
							}
						}
					});

					dispatch("setCustomers", customersClone);
				} catch (error) {
					console.log("home page error", error);
					return null;
				}
			}
		})();
	}, [context.currency, globalState.customers.length]);

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
			if (offlineQueue.length >= 1) {
				uploadData();
			}
			setOfflineQueueLength(offlineQueue.length);
		})();
	}, [isFocused]);
	// i comment this beacuse the offline transactions where upload to sever 3 time.
	// }, [globalState.customers, globalState.transactions, globalState.selfCash, isFocused]);


	const uploadData = async () =>
	{
		const offlineQueue = await Queue.getQueueEntries();
		const offlineTransactions = await Transaction.getTransactions();
		const offlineSelfCash = await SelfCash.getSelfCash();

		if (offlineQueue.length > 0 && context.isConnected)
		{
			setIsLoading(true);
			offlineQueue.forEach(async (q) =>
			{
				console.log(q, 'q');
				
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
									providerId: context.user.id,
									cashbookId: data.cashbookId,
									dateTime: data.dateTime,
									type: data.type,
									isReceivedMobile: data.isReceivedMobile,
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
									const findOfflineTran = offlineTransactions?.find(per => per._id === data.id);
									Queue.deleteQueueEntry(q.id);
									Transaction.updateTransaction(findOfflineTran.id, id, amount, profit, information, currencyId, cashbookId, type, dateTime);

									const transactionsClone = [...globalState.transactions];
									const dailyTransactionsClone = [...globalState.dailyTransactions];
									if (transactionsClone.length >= 1)
									{
										const transIndex = transactionsClone.findIndex(tran => tran.id === data.id);
										if (transIndex >= 0)
											transactionsClone[transIndex] = objData.data;
										dispatch("setTransactions", transactionsClone);
									}
									if (dailyTransactionsClone.length >= 1)
									{
										const dailyTransIndex = dailyTransactionsClone.findIndex(tran => tran.id === data.id);
										if (dailyTransIndex >= 0)
											dailyTransactionsClone[dailyTransIndex] = objData.data;
										dispatch("setDailyTransactions", dailyTransactionsClone);
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
			})
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
					<Button style={styles.btn} onPress={uploadData} isLoading={isLoading} disabled={isLoading}>{language.uploadData}</Button>
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