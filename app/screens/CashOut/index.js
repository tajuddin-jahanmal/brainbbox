import { useIsFocused } from "@react-navigation/core";
import { useContext, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import Toast from "react-native-toast-message";
import Customers from "../../DB/Customer";
import Queue from "../../DB/Queue";
import SelfCashDB from "../../DB/SelfCash";
import TransactionDB from "../../DB/Transaction";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import { CashInOutValidationAlert } from "../../components/Alerts";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import language from "../../localization";
import useStore from "../../store/store";
import SortData from "../../utils/SortData";
import idGenerator from "../../utils/idGenerator";
import isNumber from "../../utils/isNumber";
import serverPath from "../../utils/serverPath";
import Validation from "../../validator/CashInOut";
import Style from "./Style";

const CashOut = (props) =>
{
    const { goBack } = props.navigation;
	const { type, dailyTrans, selfCash, cashbookId, fromCashbook } = props.route?.params;
    const context = useContext(ExchangeMoneyContext);
    const isFocused = useIsFocused();

    const initState = {
        // amount: JSON.stringify(Math.floor(Math.random() * 100)),
        amount: "",
        profit: "",
        currencyId: context.currency?.id,
        cashbookId: "",
        information: "",
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
            currencies.push({key: curr.id, value: curr.code, });
        });
        onChange(currencies, "currenciesData");
    }, []);

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

    const submitHandler = async () =>
    {
        if (fromCashbook && fields.cashbookId.length <= 0)
			return Alert.alert(language.info, language.pleaseSelectCustomer);

        setIsLoading(true);
        let requestData = {
            amount: fields.amount,
            profit: fields.profit || 0,
            currencyId: fields.currencyId,
            information: fields.information,
            providerId: context.user.id,
			cashbookId: (fromCashbook ? fields.cashbookId : cashbookId),
            dateTime: new Date().toString(),
            type: fields.type,
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
        if (fields.amount > CashBook.cash || CashBook.cash === undefined)
        {
            setIsLoading(false);
            Alert.alert(language.info, language.heDontHaveEnoughCash, [
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
            
            if (context.isGuest)
            {
                delete requestData.providerId;
                requestData.amount = Number.parseInt(requestData.amount);
				requestData.profit = Number.parseInt(requestData.profit);
                requestData.id = idGenerator();

                submitedDataHandler({data: requestData});
                return;
            }
            
            if (!context.isConnected)
            {
                delete requestData.providerId;
                requestData.id = idGenerator();
                requestData.amount = Number.parseInt(requestData.amount);
				requestData.profit = Number.parseInt(requestData.profit);
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
                    requestData.amount = Number.parseInt(requestData.amount);
                    requestData.profit = Number.parseInt(requestData.profit);
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
            const data = objData.data;
			data.amount = Number.parseInt(data.amount);
			data.profit = Number.parseInt(data.profit);
			data.currencyId = Number.parseInt(data.currencyId);
			data.cashbookId = Number.parseInt(data.cashbookId);

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

			goBack();
			// ToastAndroid.show(language.CashOutSuccessfullyAdded, ToastAndroid.SHORT);
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
		const offlineTransactionsByDate = await TransactionDB.transByDateAndcashbbokId("", "", (fromCashbook ? fields.cashbookId : cashbookId), context.currency?.id, "custom");
		if (context.isConnected) {
            let oldDailyTranscations = [];
            globalState.dailyTransactions.find(trans => {
				if (trans.cashbookId === (fromCashbook ? fields.cashbookId : cashbookId) && trans.currencyId === context.currency?.id)
                oldDailyTranscations.push(trans);
            });

			if (oldDailyTranscations?.length <= 0)
			{
				let offlineData = customerDataFinder(SortData(offlineTransactionsByDate));
				dataManager(objData, { dailyTransactions: [...offlineData, ...globalState.dailyTransactions] });
				return;
			}
		} else {
			// if (offlineTransactions.length >= 1)
			if (offlineTransactionsByDate?.length >= 1)
			{
				dataManager(objData, { dailyTransactions: [...offlineTransactionsByDate] });
				return;
			}
		}

		dataManager(objData);
		return;
	}

    const dailyTransactionFinder = async (objData) =>
	{
		const offlineTransactions = await TransactionDB.getTransactions();
			if (context.isConnected) {
                let oldTranscations = [];
                globalState.transactions.find(trans => {
                    if (trans.cashbookId === (fromCashbook ? fields.cashbookId : cashbookId) && trans.currencyId === context.currency?.id)
                        oldTranscations.push(trans);
                });

                if (oldTranscations.length <= 0)
                {
                    let offlineData = customerDataFinder(SortData(offlineTransactions));
                    dataManager(objData, { transactions: [...offlineData, ...globalState.transactions] });
                    return;
                }
            } else {
                if (offlineTransactions.length >= 1)
                {
                    dataManager(objData, { transactions: [...offlineTransactions] });
                    return;
                }
            }

		dataManager(objData);
	}

    const dataManager = async (objData, ...options) =>
    {
		TransactionDB.createTransaction(
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
        // let InAmount = cloneSummary[summaryIndex]["cashIn"];
        let newAmount = (Number.parseInt(In_Out_Amount) + Number.parseInt(fields.amount))
        // let newInAmount = (Number.parseInt(InAmount) - Number.parseInt(fields.amount))
        let totalProfit = (Number.parseInt(cloneSummary[summaryIndex].totalProfit) + Number.parseInt(fields.profit))
        cloneSummary[summaryIndex][fields.type ? "cashIn" : "cashOut"] = newAmount;
        // cloneSummary[summaryIndex]["cashIn"] = newInAmount;
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
				dispatch("setTransactions", options[0]?.transactions ? [...options[0]?.transactions, objData.data] : [...globalState.transactions, objData.data]);
			}
			dispatch("setDailyTransactions", options[0]?.dailyTransactions ? [...options[0]?.dailyTransactions, objData.data] : [...globalState.dailyTransactions, objData.data]);
		};


        goBack();
        // ToastAndroid.show(language.CashOutSuccessfullyAdded, ToastAndroid.SHORT);
        showToast();
    }

    const customerDataFinder = (data) =>
	{
		let cashTransactions = [];
		data.find(trans => {
			if (trans.cashbookId === ((fromCashbook ? fields.cashbookId : cashbookId)) && trans.currencyId === context.currency?.id)
				cashTransactions.push(trans);
		});

		return cashTransactions;
	};

    return (
        <View style={Style.container}>
            <Header title={`${type ? language.edit : language.add} ${language.cashOut}`} goBack={goBack} />
            <View style={Style.content}>
                <View style={Style.form}>
                    <Input placeholder={language.amount} value={fields.amount} onChangeText={(text) => onChange(text, "amount")} keyboardType="numeric" disabled={isLoading} />
                    {/* <Input placeholder="Currency" value={globalState.currencies.find(curr => curr.id === fields.currencyId).code} disabled={true} /> */}
                    <SelectList
						setSelected={(val) => onChange(val, "currencyId")} 
						data={fields.currenciesData}
						save={context.currency.code}
						search={false}
                        placeholder={context.currency?.code}
						boxStyles={Style.dropDown}
						dropdownStyles={Style.dropdopMenu}
                        disabled={isLoading}
					/>

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
                            data={globalState.customers.map((item) => ({
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

                    <Button style={Style.submit} onPress={submitHandler} isLoading={isLoading} disabled={isLoading}>{language.submit}</Button>
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

export default CashOut;