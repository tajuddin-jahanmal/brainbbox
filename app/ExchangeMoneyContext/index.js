import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking, View } from 'react-native';
import VersionCheck from "react-native-version-check";
import Constant from "../constant";

import {
  clearCurrenciesTable,
  clearCustomersTable,
  clearOppoTransactionsTable,
  clearOppositeCustomersTable,
  clearQueueTable,
  clearSelfCashTable,
  clearTransactionsTable
} from "../DB";
import Customers from "../DB/Customer";
import TransactionDB from "../DB/Transaction";
import language from "../localization";
import useStore from "../store/store";
import serverPath, { mainServerPath } from "../utils/serverPath";

const initState = {
  login: false,
  currency: "",
  localAuth: false,
  user: {},
  customer: null,
  isConnected: false,
  isGuest: false,
  language: "en",
  setNewState: (value, type) => {},
  setState: (prev) => {}
};

export const ExchangeMoneyContext = React.createContext({
    ...initState,
    initState: {...initState},
});

Notifications.setNotificationHandler({
	handleNotification: async () => ({
	  shouldShowAlert: true,
	  shouldPlaySound: true,
	  shouldSetBadge: false,
	}),
});

const ExchangeMoneyProvider = (props) =>
{

    const [ globalState, dispatch ] = useStore();
    const [ state, setState ] = useState(initState);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const [ isBiometricSupported, setIsBiometricSupported ] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    const setNewState = (value, type) =>
    {
        setState(prev => ({
            ...prev,
            [type]: value,
        }));
    };
    
    // Notification Code
    async function NotificationFunc() {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Exchange Money Notification",
            body: 'This Notification is Just For Test.',
            data: { data: 'goes here' },
          },
          trigger: { seconds: 1 },
        });
    };

    // Report File Name
    // App Online abd offline,
    // Update Notification
    // Reports like Balance sheet
    // App Lock
    // Localization
    // Report => Daily Report
    // Balance sheet

    useEffect(() =>
    {
      (async () =>
      {
        // await AsyncStorage.removeItem("@user");
        // await AsyncStorage.removeItem("@customer");
        // await AsyncStorage.removeItem("isFirstTime");
        // console.log(isUserExist, "isUserExist");
        
        const isFirstTime = JSON.parse(await AsyncStorage.getItem("isFirstTime"));
        if (isFirstTime === null)
          await AsyncStorage.setItem("isFirstTime", JSON.stringify({isFirstTime: true}));
        
        const appLock = JSON.parse(await AsyncStorage.getItem("@appLock"));
        if (appLock === null)
          await AsyncStorage.setItem("@appLock", JSON.stringify(true));
        // if (appLock === false)
        //   setNewState(true, "localAuth");

        if (state.isConnected)
        {
          const currentVersion = VersionCheck.getCurrentVersion();
          const hasSeenUpdate = JSON.parse(await AsyncStorage.getItem("@hasSeenUpdate"))
          if (hasSeenUpdate === null)
            await AsyncStorage.setItem("@hasSeenUpdate", JSON.stringify({version: currentVersion, seen: true}));

          checkAppNewUpdate();
        }
        
        const storedExpirationTime = await AsyncStorage.getItem('@guestExpirationTime');
        if (storedExpirationTime) {
          const currentTime = Date.now();
          if (currentTime > parseInt(storedExpirationTime, 10))
          {
            logoutHandler();
            // await AsyncStorage.removeItem('@guestExpirationTime');
            // await AsyncStorage.removeItem('@guest');
            // setNewState(false, "isGuest");
          }
        }

        // Notification Code
        // registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        // notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        //   setNotification(notification);
        // });
        // responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        //   console.log(response, "response");
        // });

        // Biometric Code
        const compatiable = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatiable);

        // Notification Code
        return () => {
          Notifications.removeNotificationSubscription(notificationListener.current);
          Notifications.removeNotificationSubscription(responseListener.current);
        };
      })();
    }, []);

    useEffect(() =>
    {
      (async () =>
      {
        // If the network is slow but he will send the request so I added the (state.customer) by this he don't send the request
       if (state.isConnected && state.isGuest && state.customer && globalState.transactions.length >= 1)
       {
        //  const response = await fetch(mainServerPath("/app/api/get/sync"), {
         const response = await fetch(serverPath("/get/sync"), {
        //  const response = await fetch(mainServerPath("/get/sync"), {
           method: "POST",
           headers: {
             "Content-Type": "Application/JSON",
            },
            body: JSON.stringify({providerId: state?.user.id, customerId: state?.customer?._id || state?.customer?.id})
          });
          const objData = await response?.json();
          if (objData?.status === "success" && objData?.data.length >= 1)
          {
            objData.data.forEach(async (per) =>
            {
              switch (per.type) {
                case "insert":
                  break;
                case "delete":
                  if (per.tableName === "transactions")
                  {
                    const parseData = JSON.parse(per.data);
                    const trans = globalState.transactions.find(per => (per._id || per.id) === parseData.id)
                    // const response = await fetch(mainServerPath("/sync"), {
                    const response = await fetch(serverPath("/sync"), {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "Application/JSON",
                      },
                      body: JSON.stringify({ providerId: state.user.id, id: per.id })
                    });
                    
                    const objData = await response.json();
                    if (objData.status === "failure")
                    {
                      Alert.alert("Info!", objData.message)
                      return;
                    }

                    if (objData.status === "success")
                    {
                      if (trans)
                      {                
                        const customerData = await Customers.getCustomers();
                        let cloneCustomers = [...globalState.customers];
                        let cashBookIndex = cloneCustomers.findIndex(per => (per._id || per.id) == trans.cashbookId);
                        if(cashBookIndex < 0)
                          return Alert.alert("Info!",  "Please Try Again!");
                        let cloneSummary = [...cloneCustomers[cashBookIndex]?.summary];
                        let summaryIndex = cloneSummary.findIndex(per => per.currencyId == trans.currencyId)
                        if(summaryIndex < 0)
                          return Alert.alert("Info!",  "PLease Try Again!");
                        let In_Out_Amount = cloneSummary[summaryIndex][trans.type ? "cashIn" : "cashOut"];
                        if (trans.type === false || trans.type === 0)
                        {
                          // let newInAmount = (cloneSummary[summaryIndex]["cashIn"] + trans.amount)
                          // cloneSummary[summaryIndex]["cashIn"] = newInAmount;
                        }
                        let newAmount = (In_Out_Amount - trans.amount)
                        let totalProfit = (cloneSummary[summaryIndex].totalProfit - trans.profit)
                        cloneSummary[summaryIndex][trans.type ? "cashIn" : "cashOut"] = newAmount;
                        cloneSummary[summaryIndex].totalProfit = totalProfit;
                        cloneCustomers[cashBookIndex].summary = cloneSummary;
                        const transactionsClone = [...globalState.transactions];
                        let ndx = transactionsClone.findIndex(per => per.id == trans.id)
                        if (ndx >= 0)
                          transactionsClone.splice(ndx, 1)
                        const dailytransactionsClone = [...globalState.dailyTransactions];
                        let dailyNdx = dailytransactionsClone.findIndex(per => per.id == trans.id)
                        if (dailyNdx >= 0)
                          dailytransactionsClone.splice(dailyNdx, 1);
                        dispatch("setCustomers", cloneCustomers);
                        dispatch("setTransactions", transactionsClone);
                        dispatch("setDailyTransactions", dailytransactionsClone);
                        TransactionDB.deleteTransaction(trans._id || trans.id);
                        const findCust = customerData.find(customer => customer._id === trans.cashbookId);

                        Customers.updateCustomer(
                          findCust.id,
                          findCust.firstName,
                          findCust.lastName,
                          findCust.phone,
                          findCust.email,
                          JSON.stringify(cloneCustomers[cashBookIndex].summary),
                          findCust.active,
                          findCust.userId
                        );
                      }
                    };
                  }


                  break;
              }
            });
          }
       }
      })();
    }, [globalState.transactions]);

    useEffect(() =>
    {
      (async () =>
      {
        // If the network is slow but he will send the request so I added the (state.customer) by this he don't send the request
        if (state.isConnected && globalState.currencies.length <= 0 && state.user && state.customer)
        {
          const response = await fetch(serverPath("/get/currency"), {
            method: "POST",
            headers: {
                "Content-Type": "Application/JSON",
            },
            body: JSON.stringify({providerId: state.user?.id})
          });
  
          const objData = await response.json();
          if (objData.status === "success")
          {
            setNewState(objData.data[0], "currency")
            dispatch("setCurrencies", objData.data);
          }
        }
        // If the network is slow but he will send the request so I added the (state.customer) by this he don't send the request
        if (state.isConnected && globalState.sliders.length <= 0 && state.customer)
        {
          const response = await fetch(mainServerPath("/appslider"));
  
          const objData = await response.json();
          if (objData.status === "success")
          {
            await AsyncStorage.setItem("@appSliders", JSON.stringify(objData.data));
            dispatch("setSliders", objData.data);
          }
        } else if (!state.isConnected && globalState.sliders.length <= 0 && state.customer)
        {
          const appSliders = JSON.parse(await AsyncStorage.getItem("@appSliders"));
          if (appSliders !== null)
            dispatch("setSliders", appSliders);
        }

        if (state.isConnected)
          checkAppUpdate();

      })();
    }, [state.user, state.customer]);

    useEffect(() =>
    {
      NetInfo.addEventListener(stat => {
        // if (stat.isConnected !== state.isConnected)
          setNewState(stat.isConnected, "isConnected");
      })
    }, [NetInfo]);

    const logoutHandler = async () =>
    {


        await AsyncStorage.removeItem("@user");
        await AsyncStorage.removeItem("@customer");
        await AsyncStorage.removeItem("@guestExpirationTime");
        await AsyncStorage.removeItem('@guest');
        await AsyncStorage.removeItem('@language');
        await AsyncStorage.removeItem('@appLock');
        await AsyncStorage.removeItem('@hasSeenUpdate');
        await AsyncStorage.removeItem('@appSliders');
        await AsyncStorage.removeItem('@currencyRate');
        await AsyncStorage.setItem("isFirstTime", JSON.stringify({isFirstTime: true}));
        clearCustomersTable();
        clearOppositeCustomersTable();
        clearQueueTable();
        // clearCashBooksTable(); => we didn't use cashbook in offline mode.
        clearTransactionsTable();
        clearOppoTransactionsTable();
        clearSelfCashTable();
        clearCurrenciesTable();
        dispatch("clearStore", []);
        dispatch("setCustomers", []);
        NetInfo.addEventListener(stat => {
          setState({...initState, isConnected: stat.isConnected});
        });
    };

    const checkAppUpdate = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion();
        const currentVersion = VersionCheck.getCurrentVersion();
        const hasSeenUpdate = JSON.parse(await AsyncStorage.getItem("@hasSeenUpdate"));

        // if (latestVersion !== currentVersion  && hasSeenUpdate?.version !== latestVersion && !hasSeenUpdate?.seen) {
        if (latestVersion !== currentVersion  && hasSeenUpdate?.version !== latestVersion) {
          Alert.alert(
            language.updateAvailable, language.updateNow,
            [
              {
                text: language.later,
                style: "cancel",
                onPress: async () => await AsyncStorage.setItem("@hasSeenUpdate", JSON.stringify({version: latestVersion, seen: true}))
              },
              {
                text: language.updateNow,
                onPress: async () => {
                  await AsyncStorage.setItem("@hasSeenUpdate", JSON.stringify({version: latestVersion, seen: true}));
                  Linking.openURL(await VersionCheck.getStoreUrl());
                },
              },
            ]
          );
        }
      } catch (error) {
        console.log("Error checking for app update:", error);
      }
    };

    const checkAppNewUpdate = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion();
        const hasSeenUpdate = JSON.parse(await AsyncStorage.getItem("@hasSeenUpdate"));

        if (latestVersion > hasSeenUpdate?.version)
          await AsyncStorage.setItem("@hasSeenUpdate", JSON.stringify({version: latestVersion, seen: false}));

      } catch (error) {
        console.log("Error checking for app new update:", error);
      }
    };

    const handleBiometricAuth = async () =>
    {
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

      if (!isBiometricAvailable)
        return console.log("NO BIOMETRIC Avaliable");
      let supportBiometrics;
      if (isBiometricAvailable)
        supportBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
        console.log("INSIDE BIO FUNC")

      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

      if (!savedBiometrics)
      {
        console.log("No Biometric is saved in user device");
        return {
          success: true
        } 
      }

      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login With Biometrics",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      return biometricAuth;
    }
    return (
        <ExchangeMoneyContext.Provider value={{ ...state, initState, setState, setNewState, NotificationFunc, handleBiometricAuth, logoutHandler }}>
          <View style={{flex: 1}}>
          {props.children}
          </View>
          <StatusBar
            backgroundColor={Constant.primary}
            animated={true}
          />
        </ExchangeMoneyContext.Provider>
    )
};

export default ExchangeMoneyProvider;


// Notification Code
// async function registerForPushNotificationsAsync() {
// 	let token;
  
// 	if (Platform.OS === 'android')
// 	{
// 	  await Notifications.setNotificationChannelAsync('default', {
// 		name: 'default',
// 		importance: Notifications.AndroidImportance.MAX,
// 		vibrationPattern: [0, 250, 250, 250],
// 		lightColor: '#FF231F7C',
// 	  });
// 	}
  
// 	if (Device.isDevice) {
// 	  const { status: existingStatus } = await Notifications.getPermissionsAsync();
// 	  let finalStatus = existingStatus;
// 	  if (existingStatus !== 'granted') {
// 		const { status } = await Notifications.requestPermissionsAsync();
// 		finalStatus = status;
// 	  }
// 	  if (finalStatus !== 'granted') {
// 		alert('Failed to get push token for push notification!');
// 		return;
// 	  }
// 	  // Learn more about projectId:
// 	  // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
// 	  token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId, })).data;
// 	} else {
// 	  alert('Must use physical device for Push Notifications');
// 	}
  
// 	return token;
// }
