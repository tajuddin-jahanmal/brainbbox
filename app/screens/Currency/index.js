import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import Header from "../../components/Header";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import Style from "./Style";

const Currency = (props) =>
{
	const isFocused = useIsFocused()
	const [ globalState, dispatch ] = useStore();
	const { goBack, navigate } = props.navigation;

	const initState = {
		currency: "",
		currencies: [],
	};

	const [ fields, setFields ] = useState(initState);
	const context = useContext(ExchangeMoneyContext);

	const onChange = (value, type) =>
	{
		// if (!context.isConnected)
		// 	return;
		
		if (type === "currency" && (fields.currency + "")?.length >= 1)
		{
			const matchedCurrency = fields.currencies?.find(cu => cu.key == value);

			if (matchedCurrency) {
				setFields(prev => ({ ...prev, currency: matchedCurrency.value }));
				changeCurrencyFunc(matchedCurrency.key);
			}
			return;
		}

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
			onChange(context.currency?.code, "currency");
		})();
	}, [isFocused]);

	
	const changeCurrencyFunc = (currencyId) =>
	{
		const findCurrency = globalState.currencies.find(currency => currency.id === currencyId)
		context.setNewState(findCurrency, "currency");
		dispatch("setCustomers", []);
		dispatch("setOppositeCustomers", []);
		dispatch("setTransactions", []);
		dispatch("setOppositeTransactions", []);
		dispatch("setSelfCash", []);
	}

	return isFocused ? (
		<View style={Style.container}>
            <Header title={language.currency} goBack={goBack} />
			<View style={Style.content}>
				<View style={Style.selectorContainer}>
					<SelectList
						setSelected={(val) => {
							onChange(val, "currency")
						}}
						data={fields.currencies}
						save={context.currency.code}
						search={false}
						placeholder={fields.currency}
						boxStyles={Style.dropDown}
						dropdownStyles={Style.dropdopMenu}
					/>
				</View>

				<View style={Style.changeCurrencyContainer}>
					<Text style={Style.changeCurrency}>{language.byChangingTheCurrency}</Text>
				</View>

			</View>
		</View>
	): null
};

export default Currency;