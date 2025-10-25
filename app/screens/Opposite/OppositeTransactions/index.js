import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { DataProvider, LayoutProvider, RecyclerListView } from "recyclerlistview";
import Card from "../../../components/Card";
import Header from "../../../components/Header";
import Transaction from "../../../components/Transaction";
import TransactionModal from "../../../components/TransactionModal";
import UpScreenLoader from '../../../components/UpScreenLoader';
import { ScreenWidth } from "../../../constant";
import OppositeTransactionsDB from "../../../DB/OppositeTransactions";
import { ExchangeMoneyContext } from "../../../ExchangeMoneyContext";
import language from "../../../localization";
import useStore from "../../../store/store";
import serverPath from "../../../utils/serverPath";
import SortData from "../../../utils/SortData";
import GetResponsiveFontSize from "../../../utils/TransactionFontSizeManager";
import Style from "./Style";

const OppositeTransactions = (props) =>
{
	const isFocused = useIsFocused();
	const initState = {
		cashbookUser: {},
		transications: [],
		currentPage: 1,
		totalDataLength: 0,
		transactionModal: {visible: false, data: {}},
	};

	const [ globalState, dispatch ] = useStore();
	const { oppositeCustomers } = globalState;
	const { goBack, navigate } = props.navigation;
	const { cashbookId } = props.route.params;
	const [ dataProvider, setDataProvider ] = useState(new DataProvider((r1, r2) => r1 !== r2));
	const [ fields, setFields ] = useState(initState);
	const [ isLoading, setIsLoading ] = useState(false);
	const context = useContext(ExchangeMoneyContext)
	const [CashBook, setCashBook] =  useState({
		owner: {},
		cashIn:0,
		cashOut: 0,
		profit: 0
	});
	const paginateDataLength = 15;
	const lastIndex = fields.currentPage * paginateDataLength;

	const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));
	};

	useEffect(() =>
	{
		(async () =>
		{
			try {
				if(!isFocused)
					return;
				if (!cashbookId)
					return Alert.alert("Info!", "No Cashbook Selected!");

				const offlineOppoTrans = await OppositeTransactionsDB.getOppositeTransactions();
				// OppositeTransactionsDB.clearOppositeTransaction();
				if (context.isConnected)
				{
					setIsLoading(true);
					const transactionResponse = await fetch(serverPath("/get/cashbook_transactions"), {
						method: "POST",
						headers: {
							"Content-Type": "Application/JSON",
						},
						body: JSON.stringify({ cashbookId, currencyId: context.currency.id, providerId: context.user.id })
					});
					const oppTransObjData = await transactionResponse.json();

					if (oppTransObjData.status === "success")
					{
						let existedData = [];
						offlineOppoTrans.forEach(per => {
							if (per.cashbookId === cashbookId && per.currencyId === context.currency.id)
								existedData.push(per)
						});
						if (existedData.length >= 1)
							existedData.forEach(per => OppositeTransactionsDB.deleteOppositeTransaction(per._id))

						const data = [];
						let calculate = 0;
						oppTransObjData.data.forEach(transaction => {
							if (transaction.currencyId === context.currency.id && transaction.cashbookId === cashbookId)
							{
								data.push(transaction);

								if (transaction.type) calculate += transaction.amount;
								else calculate -= transaction.amount;
								transaction.runningBalance = calculate;
							}

							OppositeTransactionsDB.createOppositeTransaction(
								transaction.id,
								transaction.amount,
								transaction.profit,
								transaction.information,
								transaction.currencyId,
								transaction.cashbookId,
								transaction.type,
								transaction.dateTime
							);
						});

						setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(data))]));
					}

					if (oppTransObjData.status === "failure")
						Alert.alert("Info!", oppTransObjData.message)

					setIsLoading(false);
				};

				if (offlineOppoTrans.length >= 1)
				{
					let existedData = [];
					let calculate = 0;
					offlineOppoTrans.forEach(transaction => {
						if (transaction.cashbookId === cashbookId && transaction.currencyId === context.currency.id)
						{
							existedData.push(transaction)
							if (transaction.type) calculate += transaction.amount;
							else calculate -= transaction.amount;
							transaction.runningBalance = calculate;
						}
					});
					if (existedData.length >= 1)
						setDataProvider(dataProvider.cloneWithRows([...paginationFunction(SortData(existedData))]));
				}

			} catch (error) {
				console.log(error, "Oppo Transaction");
				setIsLoading(false)
			}
		})();
	}, [cashbookId, isFocused]);

	const cashbookUser = oppositeCustomers?.find(oppCustomer => (oppCustomer?._id || oppCustomer?.id) === cashbookId);

	// useEffect(() => {
	// 	if(!isFocused)
	// 		return
	// 	setCashBook(prev => {
	// 		let summary = cashbookUser?.summary.find(perCurrency => perCurrency.currencyId == context.currency?.id)
	// 		return {
	// 			...prev,
	// 			owner: cashbookUser?.owner || {firstName: cashbookUser?.firstName},
	// 			cashIn: summary?.cashIn || 0,
	// 			cashOut: summary?.cashOut || 0,
	// 			profit: summary?.totalProfit || 0,
	// 		}
	// 	})
	// }, [oppositeCustomers, isFocused]);

	useEffect(() => {
		if(!isFocused)
			return
		setCashBook(prev => {
			let summary = cashbookUser?.summary.find(perCurrency => perCurrency.currencyId == context.currency?.id)
			return {
				...prev,
				owner: cashbookUser?.owner || {firstName: cashbookUser?.firstName, lastName: cashbookUser?.lastName},
				cashIn: summary?.cashIn || 0,
				cash: summary?.cashIn - summary?.cashOut || 0,
				cashOut: summary?.cashOut || 0,
				profit: summary?.totalProfit || 0,
			}
		})
	}, [oppositeCustomers, isFocused]);

	const paginationFunction = (data) =>
	{
		const firstIndex = lastIndex - paginateDataLength;
		const recorder = data.slice(firstIndex, lastIndex);
		onChange(data.length, "totalDataLength");
		return recorder;
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

	const rowRenderer = (type, item) =>
	{
		return (
			<Transaction
				item={item}
				onPress={() => onChange({visible: true, data: item}, "transactionModal")}
				runningBalance={true}
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
			// </Card>
		)
	}

	// console.log("Rendering [OppositeTransactions.js]", isFocused);

	return isFocused ? (
		<View style={Style.container}>
			<Header title={CashBook?.owner?.firstName +" "+ (CashBook?.owner?.lastName || "")} goBack={goBack} />
			<View style={Style.content}>	

				<View>
					{<Card style={Style.cashInOutContainer} activeOpacity={1}>
						<View style={Style.cashInOut}>
							<Text>{language.cashIn}</Text>
							<Text style={{...Style.cashInOutMony, ...Style.cashIn, ...{fontSize: GetResponsiveFontSize(CashBook.cashIn)}}}>{CashBook.cashIn +" "+ context.currency?.code}</Text>
						</View>
						<View style={Style.cashInOut}>
							<Text>{language.cash}</Text>
							<Text style={{...Style.cashInOutMony, ...CashBook.cash < 0 ? Style.cashOut : Style.cashIn, ...Style.cashIn, ...{fontSize: GetResponsiveFontSize(CashBook.cash)}}}>{CashBook.cash +" "+ context.currency?.code}</Text>
						</View>
						<View style={Style.cashInOut}>
							<Text>{language.cashOut}</Text>
							<Text style={{...Style.cashInOutMony, ...Style.cashOut, ...{fontSize: GetResponsiveFontSize(CashBook.cashOut)}}}>{CashBook.cashOut +" "+ context.currency?.code}</Text>
						</View>
					</Card>}
				</View>

				<Card style={Style.dateCashinOutContainer}>
					<Text style={Style.dateTime}>{language.date}</Text>
					{/* <Text style={{...Style.dateTime, ...Style.margin}}>{language.cashOut}</Text> */}
					<Text style={{...Style.dateTime}}>{language.cashOut}</Text>
					<Text style={Style.dateTime}>{language.cashIn}</Text>
					<Text style={Style.runningBalance}>{language.runningBalance}</Text>
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
						{<Text style={Style.noData}>{language.noDataAvailable}</Text>}
					</View>
				}

			</View>
			<TransactionModal
				visible={fields.transactionModal.visible}
				customerName={CashBook?.owner?.firstName +" "+ (CashBook?.owner?.lastName || "")}
				data={fields.transactionModal.data}
				onDismiss={() => onChange({visible: false, data: {}}, "transactionModal")}
				opposite={true}
			/>
			{
				isLoading &&
				<UpScreenLoader />
			}
		</View>
	) : null
};

export default OppositeTransactions;