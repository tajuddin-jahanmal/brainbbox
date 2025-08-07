import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ImageBackground, Text, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import ArrowIcon from "../../assets/arrow.png";
import HeratImage from "../../assets/provinces/Herat.jpeg";
import JalalabadImage from "../../assets/provinces/Jalalabad.jpg";
import KabulImage from "../../assets/provinces/Kabul2.jpg";
import KandaharImage from "../../assets/provinces/Kandahar.jpg";
import Mazar_i_SharifImage from "../../assets/provinces/Mazar-i-Sharif.jpeg";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Input from "../../components/Input";
import Colors from "../../constant";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { mainServerPath } from "../../utils/serverPath";
import TimeAgo from "../../utils/TimeAgo";
import Style from "./Style";

const CurrencyRate = (props) =>
{
	const isFocused = useIsFocused()
	const [ globalState, dispatch ] = useStore();
	const { goBack, navigate } = props.navigation;
	const context = useContext(ExchangeMoneyContext);
	const [isLoading, setIsLoading] = useState(false);
	const initState = {
		currencies: [],
		province: {id: 1, province: "Kabul"},
		provinceImage: KabulImage,
		data: [],
		fromCurrency: globalState.currencies[0]?.id,
		toCurrency: globalState.currencies[1]?.id,
		fromCurrencyValue: "",
		toCurrencyValue: "",
	};
	
	const [ fields, setFields ] = useState(initState);
	const provinces = [{id: 1, province: "Kabul"}, {id: 2, province: "Kandahar"}, {id: 3, province: "Herat"}, {id: 4, province: "Mazar-i-Sharif"}, {id: 5, province: "Jalalabad"}];
	const isRTL = language.isRtl;

	const onChange = (value, type) =>
	{
		setFields(prev => ({
			...prev,
			[type]: value
		}))
	};

	useEffect(() =>
	{
		(async () =>
		{
			if(!isFocused)
				return
			let data = [];
			globalState.currencies.forEach(curr => {
				data.push({key: curr.id, value: curr?.code});
			});
			onChange(data, "currencies");
		})();
	}, [isFocused]);

	useEffect(() =>
	{
		(async () =>
		{
			if (context.isConnected)
			{
				setIsLoading(true);
				const response = await fetch(mainServerPath("/get/latest_currency_rate"), {
					method: "POST",
					headers: {
						"Content-Type": "Application/JSON",
					},
					body: JSON.stringify({providerId: context?.user?.id})
				});

				const objData = await response.json();
				if (objData.status === "success")
				{
					const filterData = (objData?.data || [])?.filter(rate => rate.province === fields.province.province);
					onChange(ratesSorting(filterData || []), "data");
					dispatch("setCurrencyRate", objData.data);
					await AsyncStorage.setItem("@currencyRate", JSON.stringify(objData.data));
					
				}
				setIsLoading(false);
			} else {
				const offlineCurrencyRate = JSON.parse(await AsyncStorage.getItem("@currencyRate"));
				const filterData = (offlineCurrencyRate || [])?.filter(rate => rate.province === fields.province.province);
				onChange(ratesSorting(filterData), "data");
				dispatch("setCurrencyRate", offlineCurrencyRate);
			}
		})();
	}, []);

	useEffect(() =>
	{
		(async () =>
		{
			if (globalState.currencyRate.length >= 1)
			{
				setIsLoading(true);
				const filterData = globalState?.currencyRate?.filter(rate => rate.province === fields.province.province);
				setFields(prev => ({ ...prev, data: ratesSorting(filterData)}));

				switch (fields.province.province) {
					case "Kabul":
						onChange(KabulImage, "provinceImage");
						break;
					case "Kandahar":
						onChange(KandaharImage, "provinceImage");
						break;
					case "Herat":
						onChange(HeratImage, "provinceImage");
						break;
					case "Mazar-i-Sharif":
						onChange(Mazar_i_SharifImage, "provinceImage");
						break;
					case "Jalalabad":
						onChange(JalalabadImage, "provinceImage");
						break;
				}
				setIsLoading(false);
			}
		})();
	}, [fields.province]);

	useEffect(() =>
	{
		(async () =>
		{
			// const fieldsData = {
			// 	fromCurrency: fields.fromCurrency,
			// 	toCurrency: fields.toCurrency,
			// 	fromCurrencyValue: fields.fromCurrencyValue,
			// 	province: fields.province,
			// };

			// fieldsData[newData.type] = newData.value;
			// onChange(newData.value, newData.type);

			if (fields.fromCurrency === fields.toCurrency) return;

			if (fields.fromCurrency !== fields.toCurrency)
			{
				if (fields.fromCurrencyValue >= 1)
				{
					// const currency = globalState.currencyRate.find(rate => rate.fromCurrencyId === fields.fromCurrency && rate.toCurrencyId === fields.toCurrency && rate.province === fields.province.province);
					// const reverseCurrency = globalState.currencyRate.find(rate => rate.fromCurrencyId === fields.toCurrency && rate.toCurrencyId === fields.fromCurrency && rate.province === fields.province.province);
					const currency = fields.data.find(rate => rate.fromCurrencyId === fields.fromCurrency && rate.toCurrencyId === fields.toCurrency && rate.province === fields.province.province);
					const reverseCurrency = fields.data.find(rate => rate.fromCurrencyId === fields.toCurrency && rate.toCurrencyId === fields.fromCurrency && rate.province === fields.province.province);

					if (currency)
						return onChange(fields.fromCurrencyValue ? (fields.fromCurrencyValue * currency.sell).toFixed(3).toString() : "", "toCurrencyValue"); // i call toString() becuase the input don't show the number
					else if (reverseCurrency)
						return onChange(fields.fromCurrencyValue ? (fields.fromCurrencyValue / reverseCurrency.buy).toFixed(3).toString() : "", "toCurrencyValue"); // i call toString() becuase the input don't show the number

					setFields(prev => ({...prev, fromCurrencyValue: "", toCurrencyValue: ""}));
				} else {
					if (fields.fromCurrencyValue.length <= 0 && fields.toCurrencyValue.length >= 1)
						setFields(prev => ({...prev, fromCurrencyValue: "", toCurrencyValue: ""}));
				}
			} // else {
			// }
			
		})();
	}, [fields.fromCurrency, fields.toCurrency, fields.fromCurrencyValue, fields.province]);

	const ratesSorting = (data) =>
	{
		// Afghni => PKR, $ => Afghni, Afghni => ريال, 
		// const customOrder = [{code: "؋", array: []}, {code: "$", array: []}, {code: "PKR", array: []}, {code: "﷼", array: []}, {code: "درهم", array: []}];
		// const sortedData = [];
		// data.forEach(per => {
		// 	customOrder.forEach(per2 => {
		// 		if (per2.code === per.fromCurrency.code)
		// 			per2.array.push(per);					
		// 	});
		// });
		// const customOrder = [{fromCode: "؋", toCode: "PKR", rate: {}}, {fromCode: "$", toCode: "؋", rate: {}}, {fromCode: "؋", toCode: "﷼", rate: {}}, {rates: []}];
		// let sortedData = [];

		// data.forEach(per => {
		// 	customOrder.forEach(per2 => {
		// 		if (per2.fromCode === per.fromCurrency.code && per2.toCode === per.toCurrency.code)
		// 			return per2.rate = per;

		// 		const ratesHolder = customOrder.find(item => Array.isArray(item.rates));
		// 		if (ratesHolder && !ratesHolder.rates.some(r => r.id === per.id)) {
		// 			ratesHolder.rates.push(per);
		// 		}
		// 		// per2.rates?.push(per);
		// 	});
		// });	

		// sortedData = customOrder.flatMap(item => {
		// 	if (item.rate) return [item.rate]; // top-level single rate
		// 	if (item.rates) return item.rates; // nested array of rates
		// 	return []; // ignore other items
		// });


		const priorityList = [
			{ fromCode: "$", toCode: "؋" },
			{ fromCode: "؋", toCode: "PKR" },
			{ fromCode: "$", toCode: "PKR" },
			{ fromCode: "$", toCode: "﷼" },
			{ fromCode: "PKR", toCode: "﷼" },
			{ fromCode: "؋", toCode: "﷼" },
			{ fromCode: "؋", toCode: "درهم" },
		];

		const sortedRates = [];
		const usedIds = new Set();

		priorityList.forEach(priority => {
		const match = data.find(rate =>
			rate.fromCurrency.code === priority.fromCode &&
			rate.toCurrency.code === priority.toCode
		);
		if (match) {
			sortedRates.push(match);
			usedIds.add(match.id);
		}
		});

		data.forEach(rate => {
			if (!usedIds.has(rate.id)) {
				sortedRates.push(rate);
			}
		});

		return sortedRates;
	}

	console.log("RENDRING OF RATES");
	

	return isFocused ? (
		<View style={Style.container}>
			<Header title={language.currencyRate} goBack={goBack} />
				<View style={Style.content}>
					<View>
						<FlatList
							horizontal={true}
							data={provinces}
							keyExtractor={item => item.id}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={Style.flatListContent}
							keyboardShouldPersistTaps="handled"
							renderItem={({item}) => (
								<Card
									isLoading={item.province === fields.province.province ? isLoading : false}
									style={item.province === fields.province.province ? {...Style.provinceCard, ...{backgroundColor: Colors.active}} : {...Style.provinceCard}}
									onPress={() => onChange({id: item.id, province: item.province}, "province")}
									// onPress={() => currencyConverter({value: {id: item.id, province: item.province}, type: "province"})}
								>
									<Text style={Style.province}>{item.province}</Text>
								</Card>
							)}
						/>
					</View>

					<View style={{flex: 1, marginVertical: 10, marginBottom: 20}}>
						<Card style={Style.rateContainerHeader} activeOpacity={1}>
							<Text style={Style.item}>{language.currency}</Text>
							<Text style={[Style.item, {color: Colors.green}]}>{language.buy}</Text>
							<Text style={[Style.item, {color: Colors.primary}]}>{language.sell}</Text>
						</Card>
						<ImageBackground
							source={fields.provinceImage}
							style={Style.backgroundImage}
							resizeMode="cover"
							imageStyle={{opacity: 0.5}}
						>
							<FlatList
								style={{height: "100%"}}
								data={fields.data}
								keyExtractor={item => item.id}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								ListEmptyComponent={
									isLoading ? (
										<View style={Style.notFoundContainer}>
											<ActivityIndicator size="large" color={Colors.primary} />
										</View>
									)
									:
									(<View style={Style.notFoundContainer}>
										<Text style={Style.notFound}>{language.noCurrencyRateFound}</Text>
									</View>)
								}
								renderItem={({item}) => (
									<Card style={Style.rateContainer} activeOpacity={1}>
										{/* <Text style={Style.dateTime}>{(new Date(item?.dateTime))?.toLocaleString()}</Text> */}
										<Text style={Style.dateTime}>{TimeAgo(item.dateTime)}</Text>
										<View style={Style.rateWrapper}>
											<View style={Style.currenciesContainer}>
												<Text style={Style.currenyItem}>{item.fromCurrency.code}</Text>
												<Image source={ArrowIcon} style={{ width: 16, height: 16 }} resizeMode="contain" />
												<Text style={Style.currenyItem}>{item.toCurrency.code}</Text>
											</View>
											<Text style={[Style.item, {color: Colors.green}]}>{item.buy}</Text>
											<Text style={[Style.item, {color: Colors.primary}]}>{item.sell}</Text>
										</View>
									</Card>
								)}
							/>
						</ImageBackground>

						<Card style={Style.inputContainer} activeOpacity={1}>
							<Text style={[Style.currencyTxt,isRTL && {textAlign: "right"}]}>{language.currencyConverter}</Text>
							<View style={Style.inputWrapper}>
								<SelectList
									// setSelected={(val) => currencyConverter({value: val, type: "fromCurrency"})}
									setSelected={(val) => onChange(val, "fromCurrency")}
									data={fields.currencies}
									placeholder={globalState.currencies[0]?.code}
									boxStyles={Style.dropDown}
									search={false}
									dropdownStyles={Style.dropdopMenu}
								/>
								<Input
									keyboardType="numeric"
									placeholder="From Currency"
									value={fields.fromCurrencyValue}
									// onChangeText={(text) => currencyConverter({value: text, type: "fromCurrencyValue"})}
									onChangeText={(text) => onChange(text, "fromCurrencyValue")}
								/>
							</View>

							<View style={[Style.inputWrapper, {zIndex: 99}]}>
								<SelectList
									// setSelected={(val) => currencyConverter({value: val, type: "toCurrency"})}
									setSelected={(val) => onChange(val, "toCurrency")}
									data={fields.currencies}
									placeholder={globalState.currencies[1]?.code}
									boxStyles={Style.dropDown}
									search={false}
									dropdownStyles={Style.dropdopMenu}
								/>
								<Input
									disabled
									keyboardType="numeric"
									placeholder="To Currency"
									value={fields.toCurrencyValue}
									onChangeText={(text) => {}}
								/>
							</View>
						</Card>
					</View>

				</View>
		</View>
	): null
};

export default CurrencyRate;