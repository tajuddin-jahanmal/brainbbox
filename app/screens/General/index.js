import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Style from "./Style";

import AsyncStorage from "@react-native-async-storage/async-storage";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { PermissionsAndroid } from "react-native";
import RNFS from "react-native-fs";
import ArrowCardDropdown from "../../components/ArrowCardDropdown";
import BackupDateModal from "../../components/BackupDateModal";
import Switch from "../../components/Switch";
import { isAndroid } from "../../constant";
import Transaction from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { fromAndToDateMaker } from "../../utils/dateMaker";
import { balanceSheetReportHTML, customerReportHTML, dailyReportHTML } from "../../utils/ReportsHTML";
import SortData from "../../utils/SortData";


const General = (props) =>
{
    const { goBack, navigate } = props.navigation;
    const [globalState] = useStore();
    const context = useContext(ExchangeMoneyContext);

    const initState = {
		showPicker: false,
		currencyIdForReport: null,
		currencies: [],
		appLock: false,
		backupModalVisible: false,
    };

    const [fields, setFields] = useState(initState);

	const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));
	};

	useEffect(() =>
	{
		if (globalState.currencies.length >= 1) {
			let curr = [];
			globalState.currencies.forEach(currency => {
				curr.push({key: currency._id || currency.id, value: currency?.code});
			})

			onChange(curr, "currencies")
		}
	}, [globalState.currencies]);

	useEffect(() =>
	{
		(async () =>
		{
			const appLock = JSON.parse(await AsyncStorage.getItem("@appLock"));
			onChange(appLock, "appLock");
		})();
	}, []);

    const dateChanger = async (event, date) =>
	{
		if (event.type === "dismissed")
		{
			onChange(false, "showPicker")
			return;
		}
		onChange(false, "showPicker")

		// const toDay = new Date(date.getTime() - (date.getTimezoneOffset()*60*1000)).toISOString().split('T')[0];
		// const nxtDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
		// const nextDay = new Date(nxtDay.getTime() - (nxtDay.getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
		const toDay = date;
		let selectedDate = new Date(date);
		selectedDate.setHours(23, 59, 59, 999);
		const nextDay = selectedDate;

		const data = await dailyReport(toDay, nextDay);

		if (data)
		{
			let sumCashs = {cashIn: 0, cashOut: 0};

			data.forEach(obj => {
				sumCashs.cashIn += obj.cash.cashIn;
				sumCashs.cashOut += obj.cash.cashOut;
			});

			const fileName = `${toDay} Daily report.pdf`;
			const currencyCode = fields.currencies.find(currency => currency.key === fields.currencyIdForReport);
			const ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || "");
			const { uri } = await printToFileAsync({
				base64: true,
				html: dailyReportHTML(ownerFullName, data, currencyCode.value, sumCashs, toDay),
				margins: {top: 50, right: 50, bottom: 50, bottom: 50}
			});
			const newURI = `${FileSystem.documentDirectory}${fileName}`;

			await FileSystem.moveAsync({from: uri, to: newURI});
			await shareAsync(newURI, { UTI: ".pdf", mimeType: "application/pdf" });
		}
	}

    const dailyReport = async (from, to) =>
	{
		let data = [];
		for (const customer of globalState.customers) {
			let cash = { cashIn: 0, cashOut: 0 };
			const {fromDate, toDate} = fromAndToDateMaker(from, to);
			const TBD = await Transaction.transByDateAndcashbbokId(fromDate, toDate, (customer._id || customer.id), fields.currencyIdForReport); // TBD => Transacitions By Date

			TBD.forEach(transaction => {
				if(transaction.currencyId == fields.currencyIdForReport)
					transaction.type ? cash.cashIn += Number.parseInt(transaction.amount) : cash.cashOut += Number.parseInt(transaction.amount)
			})

			if (TBD.length >= 1)
				data.push({customer, cash});
		}

		return data;
	};

	const balanceSheetHandler = async (currencyId) =>
	{
		let data = [];
		for (const customer of globalState.customers) {
			customer.summary.forEach(summ => {
				if (summ.currencyId === currencyId && !(summ.cashIn - summ.cashOut === 0))
					data.push({customer, cash: summ.cashIn - summ.cashOut});
			})
		}

		if (data)
		{
			let sum = {positiveCash: 0, negativeCash: 0};
			data.forEach(obj => {
				if (obj.cash < 0)
					sum.negativeCash += obj.cash;
				else 
					sum.positiveCash += obj.cash;
			})

			const fileName = `${new Date().toLocaleDateString().replace(/\//g, '-')} Balance sheet report.pdf`;
			const currencyCode = fields.currencies.find(currency => currency.key === currencyId)
			const ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || "");
			const { uri } = await printToFileAsync({
				base64: true,
				html: balanceSheetReportHTML(ownerFullName, data, currencyCode.value, sum),
				margins: {top: 50, right: 50, bottom: 50, bottom: 50}
			});
			const newURI = `${FileSystem.documentDirectory}${fileName}`;

			await FileSystem.moveAsync({from: uri, to: newURI});
			await shareAsync(newURI, { UTI: ".pdf", mimeType: "application/pdf" });
		}
		return data;
	};

	const contenthandler = async (key, currencyId) =>
	{
		switch (key) {
			case "dailyReport":
				onChange(currencyId, "currencyIdForReport")
				onChange(true, "showPicker")
				break;
			case "balanceSheetCurrency":
				onChange(currencyId, "currencyIdForReport")
				balanceSheetHandler(currencyId);
				break;
			case "en":
				language.setLanguage("en");
				await AsyncStorage.setItem("@language", JSON.stringify({language: "en"}));
				context.setState(prev => ({...prev, language: "en"}))
				context
				break;
			case "ps":
				language.setLanguage("ps");
				await AsyncStorage.setItem("@language", JSON.stringify({language: "ps"}));
				context.setState(prev => ({...prev, language: "ps"}))
				break;
			case "pe":
				language.setLanguage("pe");
				await AsyncStorage.setItem("@language", JSON.stringify({language: "pe"}));
				context.setState(prev => ({...prev, language: "pe"}))
				break;
		}
	};

	const requestStoragePermission = async () => {
		if (isAndroid) {
		  const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
			{
			  title: 'Storage Permission',
			  message: 'App needs access to your storage to save files.',
			  buttonPositive: 'OK',
			}
		  );
		  return granted === PermissionsAndroid.RESULTS.GRANTED;
		}
		return true;
	};

	const backupHandler = async () =>
	{
		onChange(true, "backupModalVisible");

		// 2025-03-06T16:32:00.000Z 2025-03-29T16:32:00.000Z
		// for (const currency of globalState.currencies)
		// {
		// 	for (const customer of globalState.customers)
		// 	{
		// 		const customerFullName = (customer?.customer?.firstName || customer?.firstName) + " " + ((customer?.customer?.lastName || customer?.lastName) || "");
		// 		if (customer.summary.length >= 1)
		// 		{
					
		// 			const cashbookId = (customer?.summary[0]?.cashbookId || customer?._id || customer?.id);
		// 			const offlineTransactionsByDate = await Transaction.transByDateAndcashbbokId("2024-03-06T16:32:00.000Z", "2025-03-29T16:32:00.000Z", cashbookId, currency?.id);
					
		// 		}
		// 	}
		// }
	}

	const backupDatesHandler = async (from, to) =>
	{
		try {
			const granted = await requestStoragePermission();
			if (granted && globalState.customers.length >= 1)
			{
				const {fromDate, toDate} = fromAndToDateMaker(from, to);
				const mainPath = `${RNFS.DownloadDirectoryPath}/brainbbox`;
				const baseDirectoryName = `${fromDate} ${toDate}`;
				let directoryName = baseDirectoryName;
				let directoryPath = `${mainPath}/${directoryName}`;
				let counter = 1;

				const minExists = await RNFS.exists(mainPath);
				if (!minExists)
					await RNFS.mkdir(mainPath);

				const directorys = await RNFS.readDir(mainPath);
				const similarDirectorys = directorys?.filter(item => item.isDirectory() && item.name.startsWith(baseDirectoryName)).map(item => item.name);

				while (similarDirectorys.includes(directoryName)) {
					directoryName = `${baseDirectoryName} (${counter})`;
					directoryPath = `${mainPath}/${directoryName}`;
					counter++;
				}

				await RNFS.mkdir(directoryPath);

				for (const currency of globalState.currencies)
				{
					for (const customer of globalState.customers)
					{
						const customerFullName = (customer?.customer?.firstName || customer?.firstName) + " " + ((customer?.customer?.lastName || customer?.lastName) || "");
						if (customer.summary.length >= 1)
						{
							const customerDirectory = `${directoryPath}/${customerFullName}`;
							await RNFS.mkdir(customerDirectory);
							try {
								await reportMaker(customer, fromDate, toDate, customerFullName, customerDirectory, currency);
							} catch (error) {
								console.log("PDF creation failed for:", customerFullName, currency?.code, error);
							}
						}
					}	
				}
				
				ToastAndroid.show(language.backupCompleted, ToastAndroid.SHORT);
				onChange(false, "backupModalVisible");
			}
		} catch (error) {
			console.log("Error backup dates function: ", error);
		}
	}

	async function reportMaker (customer, fromDate, toDate, customerFullName, customerDirectory, currency)
	{
		const cashbookId = (customer?.summary[0]?.cashbookId || customer?._id || customer?.id);
		const offlineTransactionsByDate = await Transaction.transByDateAndcashbbokId(fromDate, toDate, cashbookId, currency?.id);
		let OTByDateClone = [...offlineTransactionsByDate]; // OfflineTransactionsByDateClone

		let calculate = 0;
		OTByDateClone.forEach(trans => {
			if (trans.type) calculate += trans.amount;
			else calculate -= trans.amount;
			trans.runningBalance = calculate;
		});
		// I call the sortData() after the calculate because the data will sort descending (sort by the newst transaction);
		OTByDateClone = SortData(OTByDateClone);

		let forCounting = {cashIn: 0, cash: 0, cashOut: 0};
		OTByDateClone.forEach(element => {
			// Number.parseInt(element.amount) => if the amount is string they will convert it to number.
			if (element.type)
				return forCounting = {cashIn: forCounting.cashIn + Number.parseInt(element.amount), cash: forCounting.cash, cashOut: forCounting.cashOut};
			forCounting = {cashIn: forCounting.cashIn, cash: forCounting.cash, cashOut: forCounting.cashOut + Number.parseInt(element.amount)};
		});
		forCounting = {cashIn: forCounting.cashIn, cash: forCounting.cashIn - forCounting.cashOut, cashOut: forCounting.cashOut};

		let ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || "");

		const fileName = `${currency?.code} report.pdf`;
		const { uri } = await printToFileAsync({
			base64: true,
			html: customerReportHTML(ownerFullName, OTByDateClone, currency?.code, forCounting, customerFullName),
			margins: {top: 50, right: 50, bottom: 50, bottom: 50}
		});

		const newURI = `${customerDirectory}/${fileName}`;
		await RNFS.moveFile(uri, newURI);
	}

	const togglerHandler = async (isOn) => await AsyncStorage.setItem("@appLock", JSON.stringify(isOn));

	return (
		<View style={Style.container}>
			<Header title={language.general} noBack />
			<ScrollView>
				<View style={Style.content}>
					{ fields.showPicker && <RNDateTimePicker value={new Date()} onChange={(event, date) => dateChanger(event, date)} />  }

					<ArrowCardDropdown
						title={language.profile}
						cardHandler={() => navigate("Profile")}
					/>
					{
						!context.isGuest && <>
							<ArrowCardDropdown
								title={language.report}
								content={[{key: "dailyReport", value: language.dailyReport, subContent: fields.currencies}]}
								contenthandler={(key, currencyId) => contenthandler(key, currencyId)}
								cardHandler={() => {}}
							/>
							<ArrowCardDropdown
								title={language.balanceSheet}
								content={[{key: "balanceSheetCurrency", value: language.balanceSheetCurrency, subContent: fields.currencies}]}
								contenthandler={(key, currencyId) => contenthandler(key, currencyId)}
								cardHandler={() => {}}
							/>
						</>
					}
					<ArrowCardDropdown
						title={language.language}
						content={[{key: "en", value: "English"}, {key: "ps", value: "پښتو"}, {key: "pe", value: "فارسي"}]}
						contenthandler={(key) => contenthandler(key)}
						cardHandler={() => {}}
					/>
					{
						!context.isGuest && <ArrowCardDropdown
							title={language.appBackup}
							cardHandler={backupHandler}
						/>
					}

					<Card style={Style.arrowCard}>
						<TouchableOpacity style={Style.titleContainer} activeOpacity={0.6}>
							<Text>{language.appLock}</Text>
							<Switch on={fields.appLock} toggler={(isOn) => togglerHandler(isOn)} />
						</TouchableOpacity>
					</Card> 

				</View>
			</ScrollView>
			<Text style={Style.founder}>{language.founder}</Text>

			<BackupDateModal
				visible={fields.backupModalVisible}
				onDismiss={() => onChange(false, "backupModalVisible")}
				backupDates={(from, to) => backupDatesHandler(from, to)}
			/>
		</View>
	)
};

export default General;

export const GeneralOptions = (nav) =>
{
	return {
		tabBarIcon: (tabInfo) => (
			<View>
				<SimpleLineIcons name={"menu"} color={tabInfo.color} size={tabInfo.size} />
			</View>
		)
	}
};