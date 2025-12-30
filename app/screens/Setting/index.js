import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useContext, useEffect, useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Colors from "../../constant";
import Style from "./Style";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { PermissionsAndroid } from "react-native";
import DatePicker from "react-native-date-picker";
import RNFS from "react-native-fs";
import Toast from 'react-native-toast-message';
import { LogoutAlert } from '../../components/Alerts';
import ArrowCardDropdown from "../../components/ArrowCardDropdown";
import BackupDateModal from "../../components/BackupDateModal";
import Switch from "../../components/Switch";
import { isAndroid } from "../../constant";
import OpeningBalance from '../../DB/OpeningBalance';
import Transaction from "../../DB/Transaction";
import WeeklyBalances from '../../DB/WeeklyBalances';
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { fromAndToDateMaker, getWeekRange } from "../../utils/dateMaker";
import { balanceSheetReportHTML, customerReportHTML, dailyReportHTML } from "../../utils/ReportsHTML";
import SortData from "../../utils/SortData";

const Setting = (props) =>
{
    const { goBack, navigate } = props.navigation;
    const [globalState] = useStore();
    const context = useContext(ExchangeMoneyContext);
    const isRTL = language.isRtl;

    const initState = {
        showPicker: false,
        logoutAlert: false,
        currencyIdForReport: null,
        currencies: [],
        appLock: false,
        backupModalVisible: false,
        showDatePicker: { visible: false, type: "" },
        from: "",
        to: "",
    };
    
    const showToast = () => {
        Toast.show({
            type: 'success',
            text1: language.success,
            text2: language.backupCompleted,
            swipeable: true,
            visibilityTime: 2000,
        });
    };

    const noDailyReportToast = () => {
		Toast.show({
			type: 'info',
			text1: language.info,
			text2: language.noTransactionsOnthisDay,
			swipeable: true,
			visibilityTime: 3000,
		});
	};

    const [fields, setFields] = useState(initState);
    // const [selectedDate, setSelectedDate] = useState(new Date());
    // const datePickerRef = useRef(null);

    const onChange = (value, type) =>
    {
        setFields(perv => ({
            ...perv,
            [type]: value,
        }));
    };

    const handleDatePress = (type) => {
        // setSelectedDate(new Date());
        onChange({ visible: true, type }, "showDatePicker");
    };

    // const handleIOSDateSelection = () => {
    //     dateChanger({ type: "set" }, selectedDate);
    //     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
    // };

    const dateChanger = async (event, date) =>
    {
        const type = fields.showDatePicker.type;
        let selectedDate = new Date(date);

        if (type === "from") {
            if (fields.to && (fields.to - selectedDate) <= -1) {
                setFields(prev => ({ ...prev, from: "", to: "", showDatePicker: { visible: false, type: "" } }));
            } else {
                setFields(prev => ({ ...prev, from: selectedDate, showDatePicker: { visible: false, type: "" } }));
            }
        } else {
            selectedDate.setHours(23, 59, 59, 999);
            if (fields.from && (fields.from - selectedDate) <= -1) {
                setFields(prev => ({ ...prev, to: selectedDate, showDatePicker: { visible: false, type: "" } }));
            } else {
                setFields(prev => ({ ...prev, to: "", showDatePicker: { visible: false, type: "" } }));
            }
        }

        // On Android, we need to explicitly hide the picker after selection
        // if (Platform.OS === 'android') {
        //     setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
        // }

        const toDay = date;

        let selectedDateForReport = new Date(date);
        selectedDateForReport.setHours(23, 59, 59, 999);
        const nextDay = selectedDateForReport;

        const { weekStart, weekEnd } = getWeekRange(selectedDate);

        const weeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
            context?.customer?.id,
            fields.currencyIdForReport,
            new Date(weekStart).toISOString(),
            new Date(weekEnd).toISOString()
        );

        const openingBalance = await OpeningBalance.getLatestOpeningBalance(fields.currencyIdForReport);
        let obWeekStart = null, obWeekEnd = null;
        if (openingBalance?.dateTime) {
            const obRange = getWeekRange(openingBalance.dateTime);
            obWeekStart = obRange.weekStart;
            obWeekEnd  = obRange.weekEnd;
        }
        const isInSameWeekRange = new Date(obWeekStart).getTime() === new Date(weekStart).getTime() && new Date(obWeekEnd).getTime() === new Date(weekEnd).getTime();

        if (weeklyData.length <= 0)
        {
            const prevWeekEndDate = new Date(weekStart);
            prevWeekEndDate.setDate(prevWeekEndDate.getDate() - 1);
            const { weekStart: prevWeekStart, weekEnd: prevWeekEnd } = getWeekRange(prevWeekEndDate);

            const prevWeeklyData = await WeeklyBalances.getWeeklyBalancesByWeek(
                context?.customer?.id,
                fields.currencyIdForReport,
                new Date(prevWeekStart).toISOString(),
                new Date(prevWeekEnd).toISOString()
            );

            if (prevWeeklyData.length <= 0)
            {
                const BeforeThisDataWeek = await WeeklyBalances.getLatestExistingWeek(context?.customer?.id, fields.currencyIdForReport, selectedDateForReport);
                // let opening = BeforeThisDataWeek?.closingBalance || openingBalance?.amount || 0;

                let opening = 0;

                if (BeforeThisDataWeek?.closingBalance !== undefined) {
                    opening = BeforeThisDataWeek.closingBalance;
                } else if (openingBalance && new Date(openingBalance.dateTime) <= new Date(selectedDateForReport)) {
                    opening = openingBalance.amount;
                }

                // if (isInSameWeekRange && shouldSumOpeningBalance(openingBalance?.dateTime, selectedDateForReport))
                //     opening += openingBalance?.amount;

                reporter(weekStart, weekEnd, opening, selectedDateForReport, toDay);
                return;
            }

            let opening = prevWeeklyData[0].closingBalance || 0;
            if (isInSameWeekRange && shouldSumOpeningBalance(openingBalance?.dateTime, selectedDateForReport))
                opening += openingBalance?.amount;
            
            reporter(weekStart, weekEnd, opening, selectedDateForReport, toDay);
            return;
        };
        
        let opening = weeklyData[0]?.openingBalance || 0;
        if (isInSameWeekRange && shouldSumOpeningBalance(openingBalance?.dateTime, selectedDateForReport))
            opening += openingBalance?.amount;   
        
        reporter(weekStart, weekEnd, opening, selectedDateForReport, toDay);
    };

    function shouldSumOpeningBalance(obDate, selectedDate) {
        if (!obDate) return false;

        const ob = new Date(obDate);
        const selected = new Date(selectedDate);

        ob.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        return selected >= ob;
    }

    const reporter = async (weekStart, weekEnd, openingBalance, selectedDateForReport, toDay) =>
    {
        const transactions = await Transaction.transactionByDateAndCurrencyId(weekStart, weekEnd, fields.currencyIdForReport);
        const dailyBalances = groupTransactionsByDay(transactions, openingBalance, selectedDateForReport);
        const dailyBalance = dailyBalances[toDay.toISOString().slice(0, 10)];

        if (dailyBalance)
        {
            const fileName = `${toDay.toISOString().slice(0, 10)} Daily report.pdf`;
            const currencyCode = fields.currencies.find(currency => currency.key === fields.currencyIdForReport);
            
            const ownerFullName = context?.customer?.firstName + " " + (context?.customer?.lastName || ""); 
            
            const { uri } = await printToFileAsync({
                base64: true,
                html: dailyReportHTML(ownerFullName, dailyBalance, currencyCode.value, toDay),
                margins: {top: 50, right: 50, bottom: 50, bottom: 50}
            });
            
            const newURI = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.moveAsync({from: uri, to: newURI});
            await shareAsync(newURI, { UTI: ".pdf", mimeType: "application/pdf" });
        } else {
            noDailyReportToast();
        }
    }

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

    function groupTransactionsByDay(transactions, firstOpeningBalance = 0, cutoffDate = null)
    {
        const dailyGroups = {};
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kabul";

        // Sort transactions by date ascending
        const sorted = [...transactions].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

        // Step 1: Group by day
        for (const t of sorted) {
            const tDate = new Date(t.dateTime);

            // Skip transactions after the cutoff date
            if (cutoffDate && tDate > cutoffDate) continue;

            // const dateKey = tDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
            const dateKey = getLocalDateKey(t.dateTime);

            if (!dailyGroups[dateKey]) {
                dailyGroups[dateKey] = { 
                    date: dateKey, 
                    cashbooks: {}, // store each cashbookId separately
                    totalCashIn: 0, 
                    totalCashOut: 0,
                    openingBalance: 0,
                    closingBalance: 0,
                };
            }

            const group = dailyGroups[dateKey];

            // Initialize cashbook if not exists
            if (!group.cashbooks[t.cashbookId]) {
                const customer = globalState.customers.find(c => (c._id ?? c.id) === t.cashbookId);
                group.cashbooks[t.cashbookId] = { customer, cashbookId: t.cashbookId, totalCashIn: 0, totalCashOut: 0 };
            }

            // Add amounts
            if (t.type) {
                group.cashbooks[t.cashbookId].totalCashIn += t.amount;
                group.totalCashIn += t.amount;
            } else {
                group.cashbooks[t.cashbookId].totalCashOut += t.amount;
                group.totalCashOut += t.amount;
            }
        }

        // Calculate opening/closing balances day by day
        let runningBalance = firstOpeningBalance;
        for (const day of Object.values(dailyGroups).sort((a,b) => new Date(a.date) - new Date(b.date))) {
            day.openingBalance = runningBalance;
            day.closingBalance = day.openingBalance + day.totalCashIn - day.totalCashOut;
            runningBalance = day.closingBalance;
        }

        return dailyGroups;
    }

    function getLocalDateKey(date) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kabul";

        return new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(date));
    }



    const dailyReport = async (from, to) =>
    {
        let data = [];
        for (const customer of globalState.customers) {
            let cash = { cashIn: 0, cashOut: 0 };
            const {fromDate, toDate} = fromAndToDateMaker(from, to);
            // TBD => Transacitions By Date
            const TBD = await Transaction.transactionByDateAndCashbookIdAndCurrencyId(fromDate, toDate, (customer._id || customer.id), fields.currencyIdForReport);

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
                handleDatePress("from");
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
            case "ur":
                language.setLanguage("ur");
                await AsyncStorage.setItem("@language", JSON.stringify({language: "ur"}));
                context.setState(prev => ({...prev, language: "ur"}))
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
    }

    const backupDatesHandler = async (from, to) =>
    {
        try {
            const granted = await requestStoragePermission();
            if (granted && globalState.customers.length >= 1)
            {
                const {fromDate, toDate} = fromAndToDateMaker(from, to);
				const mainPath = Platform.select({
					ios: `${RNFS.DocumentDirectoryPath}/brainbbox`,
					android: `${RNFS.DownloadDirectoryPath}/brainbbox`
				});

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
                
                // ToastAndroid.show(language.backupCompleted, ToastAndroid.SHORT);
                showToast();
                onChange(false, "backupModalVisible");
            }
        } catch (error) {
            console.log("Error backup dates function: ", error);
        }
    }

    async function reportMaker (customer, fromDate, toDate, customerFullName, customerDirectory, currency)
    {
        const cashbookId = (customer?.summary[0]?.cashbookId || customer?._id || customer?.id);
        const offlineTransactionsByDate = await Transaction.transactionByDateAndCashbookIdAndCurrencyId(fromDate, toDate, cashbookId, currency?.id);
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
		console.log("SUCCESSFULLY CREATED")
    }

    const togglerHandler = async (isOn) => await AsyncStorage.setItem("@appLock", JSON.stringify(isOn));

    return (
        <View style={Style.container}>
            <Header title={language.setting} noBack />
            <ScrollView>
                <View style={Style.content}>
                    {/* Android Date Picker */}
                    {fields.showDatePicker.visible && (
                        <DatePicker
                            modal
                            mode="date"
                            open={fields.showDatePicker.visible}
                            date={new Date()}
                            onConfirm={(date) => {
                                dateChanger(null, date);
                            }}
                            onCancel={() => {
                                setFields(prev => ({...prev, showDatePicker: { visible: false, type: "" }}));
                            }}
                        />
                    )}

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
                                disabled={!context.isConnected}
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
                        content={[{key: "en", value: "English"}, {key: "ps", value: "پښتو"}, {key: "pe", value: "فارسي"}, {key: "ur", value: "اردو"}]}
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

                    <ArrowCardDropdown
                        title={language.logout}
                        cardHandler={() => onChange(true, "logoutAlert")}
                    />

                    {
                        !context.isGuest && <ArrowCardDropdown
                            title={language.accountDeletion}
                            cardHandler={() => navigate("AccountDeletion")}
                        />
                    }

                </View>
            </ScrollView>
            <Text style={Style.founder}>{language.founder}</Text>

            <BackupDateModal
                visible={fields.backupModalVisible}
                onDismiss={() => onChange(false, "backupModalVisible")}
                backupDates={(from, to) => backupDatesHandler(from, to)}
            />
            <LogoutAlert
                onConfirm={() => {
                    context.logoutHandler();
                    onChange(false, "logoutAlert");
                }}
                onCancel={() => onChange(false, "logoutAlert")}
                show={fields.logoutAlert}
            />
        </View>
    )
};

const styles = {
    iosDatePickerContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    iosDatePicker: {
        flex: 1,
        backgroundColor: 'white',
    },
    iosButtonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iosDoneButton: {
        backgroundColor: Colors.primary,
    },
};

export default Setting;

export const SettingOptions = (nav) =>
{
    return {
        tabBarIcon: (tabInfo) => (
            <View>
                <SimpleLineIcons name={"menu"} color={tabInfo.color} size={tabInfo.size} />
            </View>
        )
    }
};