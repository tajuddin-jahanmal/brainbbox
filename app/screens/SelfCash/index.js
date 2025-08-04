import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Queue from "../../DB/Queue";
import SelfCashDB from "../../DB/SelfCash";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Header from "../../components/Header";
import TransactionModal from "../../components/TransactionModal";
import UpScreenLoader from "../../components/UpScreenLoader";
import { ScreenWidth } from "../../constant";
import language from "../../localization";
import useStore from "../../store/store";
import SortData from "../../utils/SortData";
import serverPath from "../../utils/serverPath";
import Style from "./Style";

const SelfCash = (props) =>
{
	const isFocused = useIsFocused()
	const initState = {
		selfCashbookID: 0,
		totalCashInOut: { cashIn: 0, cashOut: 0 },
		currentPage: 1,
		totalDataLength: 0,
		transactionModal: {visible: false, data: {}},
	}

	const [ globalState, dispatch ] = useStore();
	const { goBack, navigate } = props.navigation;
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const [ isLoading, setIsLoading ] = useState(false);
	const context = useContext(ExchangeMoneyContext);
	const paginateDataLength = 15;
	const lastIndex = fields.currentPage * paginateDataLength;

	const onChange = (value, type) =>
	{
		setFields(prev => ({
			...prev,
			[type]: value,
		}));
	};

	useEffect(() =>
	{
		(async() =>
		{
			if(!isFocused)
				return
			// await AsyncStorage.removeItem("selfCashbookID")
			setIsLoading(true);
			if (globalState.selfCash.length >= 1)
			{
				setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(globalState.selfCash))]));
				setIsLoading(false);
				return;
			}

			const offlineSelfCash = await SelfCashDB.getSelfCash();
			if (offlineSelfCash.length >= 1)
			{
				const filterData = (offlineSelfCash || [])?.filter(cash => cash.currencyId === context.currency?.id);
				setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(filterData))]));
				dispatch("setSelfCash", [...globalState.selfCash, ...filterData])
				setIsLoading(false);
				return;
			}

			if (fields.selfCashbookID && globalState.selfCash.length <= 0 && context.isConnected && offlineSelfCash.length <= 0)
			{
				const response2 = await fetch(serverPath("/get/cashbook_transactions"), {
					method: "POST",
					headers: {
							"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({ cashbookId: fields.selfCashbookID, currencyId: context.currency?.id, providerId: context.user?.id })
				});

				const objData2 = await response2.json();
				if (objData2.status === "success" && objData2.data.length >= 1)
				{
					dispatch("setSelfCash", [...globalState.selfCash, ...objData2.data])
					setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(objData2.data))]));

					if (offlineSelfCash.length <= 0)
					{
						objData2.data.forEach(selfC => {
							SelfCashDB.createSelfCash(
								selfC.id,
								selfC.amount,
								selfC.profit,
								selfC.information,
								selfC.currencyId,
								selfC.cashbookId,
								selfC.type,
								selfC.dateTime
							);
						});
					}
				}

				if (objData2.status === "failure")
					Alert.alert("Info!", objData2.message)

				setIsLoading(false);
				return;
			}
			if (isLoading)
				setIsLoading(false);
		})();
	}, [fields.selfCashbookID, globalState.selfCash, fields.currentPage, isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return
			const isExistSCID = await AsyncStorage.getItem("selfCashbookID")
			if (!isExistSCID && context.isConnected)
			{
				const response = await fetch(serverPath("/get/cashbook"), {
					method: "POST",
					headers: {
						"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({providerId: context.user?.id, ownerId: context.customer?.id})
				});
				const objData = await response.json();
				if (objData.status === "success")
				{
					objData.data.forEach(async (per) => {
						if (per.ownerId === per.customerId)
						{
							await AsyncStorage.setItem("selfCashbookID", JSON.stringify(per.id))
							onChange(per.id, "selfCashbookID")
						}
					});
				}
				if (objData.status === "failure") Alert.alert("Info!", objData.message)
			}
			onChange(JSON.parse(isExistSCID), "selfCashbookID")
		})();
	}, [isFocused]);

	useEffect(() =>
	{
		if (globalState.selfCash.length >= 1 && isFocused)
		{
			let totalCashIn = 0;
			let totalCashOut = 0;

			globalState.selfCash.forEach(per =>
				{
					if (per.type)
						totalCashIn += per.amount;
					else
						totalCashOut += per.amount;
				});
		
			onChange({cashIn: totalCashIn, cashOut: totalCashOut}, "totalCashInOut");
		}
	}, [globalState.selfCash, isFocused]);


	const deleteHandler = async (item) =>
	{
		try {
			setIsLoading(true)
			const isExist = await Queue.findQueueEntrie(item._id || item.id);
			if (!context.isConnected)
			{
				if (isExist.length >= 1)
				{
					Queue.deleteQueueEntry(isExist[0].id);
					dataManager(item);
					return;
				};

				let requestData = {
					id: (item._id || item.id),
					amount: item.amount,
					profit: item.profit,
					currencyId: item.currencyId,
					information: item.information,
					cashbookId: item.cashbookId,
					type: item.type,
					dateTime: item.dateTime,
				}

				Queue.createQueueEntry("delete", (item._id || item.id), "selfCash", JSON.stringify(requestData), (item._id || item.id));
				dataManager(item);
				return;
			}

			if (isExist.length >= 1)
			{
				Queue.deleteQueueEntry(isExist[0].id);
				dataManager(item);
				return;
			};

			const response = await fetch(serverPath("/transaction"), {
				method: "DELETE",
				headers: {
					"Content-Type": "Application/JSON",
				},
				body: JSON.stringify({ id: (item._id || item.id), providerId: context.user.id })
			});
			
			const objData = await response.json();
			if (objData.status === "failure")
			{
				setIsLoading(false);
				Alert.alert("Info!", objData.message)
			}
			
			if (objData.status === "success")
				dataManager(item);

		} catch (error) {
			setIsLoading(false)
			console.log(error)
		}
	};

	const dataManager = async (item) =>
	{
		const selfCashClone = [...globalState.selfCash];
		let selfNdx = selfCashClone.findIndex(per => per.id == (item.id || item._id))
		if (selfNdx >= 0)
			selfCashClone.splice(selfNdx, 1)

		await SelfCashDB.deleteSelfCash(item._id || item.id);
		dispatch("setSelfCash", selfCashClone);
		setIsLoading(false);
	}

	const paginationFunction = (data) =>
	{
		const firstIndex = lastIndex - paginateDataLength;
		const recorder = data.slice(firstIndex, lastIndex);
		onChange(data.length, "totalDataLength");
		return recorder;
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

	const deleteAlertHandler = (item) =>
	{
		Alert.alert("Alert!", "Do you want to delete this transaction, it effects on your cashbook.", [
		{ text: 'Cancel', onPress: () => { console.log("Cancled") }, style: 'cancel', },
		{ text: 'ok', onPress: () => deleteHandler(item) },
		]);
	}

	const rowRenderer = (type, item) =>
	{
		return (
			<Card style={Style.card} onPress={() => onChange({visible: true, data: item}, "transactionModal")}>
				<View style={Style[item.type ? "dateAmountContainer" : "dateAmountContainer2"]}>
					<Text style={Style.date}>{(new Date(item?.dateTime))?.toLocaleString()}</Text>
					<Text style={Style[item.type ? "cashIn" : "cashOut"]}>{item.amount}</Text>
				</View>
				<Card onPress={() => deleteAlertHandler(item)}>
					<Feather name="trash-2" size={18} color={"rgba(240, 0, 41, 0.6)"} />
				</Card>
			</Card>
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

	return isFocused ? (
		<View style={Style.container}>
            <Header title={language.selfCash} goBack={goBack} />
			
			<View style={Style.content}>
				<Card style={Style.cashInOutContainer} activeOpacity={1}>
					<View style={Style.cashInOut}>
						<Text>{language.cashIn}</Text>
						<Text style={{...Style.cashInOutMony, ...Style.cashIn}}>{fields.totalCashInOut.cashIn} {context.currency?.code}</Text>
					</View>
					<View style={Style.cashInOut}>
						<Text>{language.cashOut}</Text>
						<Text style={{...Style.cashInOutMony, ...Style.cashOut}}>{fields.totalCashInOut.cashOut} {context.currency?.code}</Text>
					</View>
				</Card>

				<Card style={Style.dateCashinOutContainer}>
					<Text style={Style.dateTime}>{language.dateTime}</Text>
					<Text style={{...Style.dateTime, ...Style.margin}}>{language.cashOut}</Text>
					<Text style={Style.dateTime}>{language.cashIn}</Text>
				</Card>

				{
					dataProvider._data.length >= 1 ?
					<RecyclerListView
						dataProvider={dataProvider}
						layoutProvider={layoutProvider}
						rowRenderer={rowRenderer}
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
						<Text style={Style.noData}>{language.noDataAvailable}</Text>
					</View>
				}

				<View style={Style.cashsCotainer}>
					<Button style={{...Style.cashButton, ...Style.cashInButton}} onPress={() => navigate("CashIn", { selfCash: true, cashbookId: fields.selfCashbookID })}>{language.cashIn}</Button>
					<Button style={Style.cashButton} onPress={() => navigate("CashOut", { selfCash: true, cashbookId: fields.selfCashbookID })}>{language.cashOut}</Button>
				</View>
			</View>
			<TransactionModal
				visible={fields.transactionModal.visible}
				data={fields.transactionModal.data}
				onDismiss={() => onChange({visible: false, data: {}}, "transactionModal")}
				selfCash={true}
			/>
			{
				isLoading &&
				<UpScreenLoader />
			}
		</View>
	) : isFocused
};

export default SelfCash;