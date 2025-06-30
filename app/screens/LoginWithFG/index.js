import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as NetFetch } from "@react-native-community/netinfo";
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import * as WebBrowser from 'expo-web-browser';
import React, { useContext, useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import {
  Settings
} from "react-native-fbsdk-next";
import LinearGradient from 'react-native-linear-gradient';
import Button from "../../components/Button";
import UpScreenLoader from "../../components/UpScreenLoader";
import Colors from "../../constant";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import { generateNumericId } from "../../utils/idGenerator";
import serverPath from "../../utils/serverPath";
import Style from "./Style";




WebBrowser.maybeCompleteAuthSession();

const LoginWithFG = (props) =>
{
	// const { navigate } = props.navigation;
	const [globalState, dispatch] = useStore();
	const context = useContext(ExchangeMoneyContext);
  const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
  const redirectUri = AuthSession.makeRedirectUri({
    // native: 'com.mosaaghajahanmal.brainbbox:/LoginWithFG/index.js',
    useProxy: false,
  });
	const [request, response, promptAsync] = Google.useAuthRequest({
		androidClientId: '504215588437-3nkmfpds107445d47mq408lnjsuhco6h.apps.googleusercontent.com',
    redirectUri: redirectUri
    // redirectUri: AuthSession.makeRedirectUri({ useProxy: true })
	});
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: "361987559839890",
  })

  useEffect(() => {
    const requestTracking = async () => {
      const { status } = await requestTrackingPermissionsAsync();

      Settings.initializeSDK();

      if (status === "granted") {
        await Settings.setAdvertiserTrackingEnabled(true);
      }
    };

    requestTracking();
  }, []);
  
  useEffect(() => {
    handleEffect();
    
  }, [response, token]);

  useEffect(() => {
    if (fbResponse && fbResponse?.type === "success" && fbResponse.authentication) {
      (async () =>
      {
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?access_token=${fbResponse.authentication.accessToken}&fields=id,name`
        );
        const userInfo = await userInfoResponse.json();
        console.log(userInfo, "userInfo");
      })();
    }
  }, [fbResponse]);

  const handlePressAsync = async () =>
  {
    const result = await fbPromptAsync();
    if (result.type !== "success") {
      alert("Uh oh, something went wrong");
      return;
    }
    
  }


  async function handleEffect() {
    NetFetch().then(async (state) => {
      checkingUser(state);
    });
  }

  async function checkingUser (state) {
    const user = await getLocalUser();
    const isGuestExist = await AsyncStorage.getItem("@guestExpirationTime");
    const isCustomerExist = await AsyncStorage.getItem("@customer");
    
    if (isGuestExist)
    {
      setIsLoading(true);
      const guestData = await AsyncStorage.getItem("@guest");
      let currencies = [{code: "؋", id: 1, name: "afghani"}];
      context.setState(prev => ({...prev, customer: JSON.parse(guestData), isGuest: true, login: true, currency: currencies[0]}));
      dispatch('setCurrencies', currencies);
      return;
    }

    if (isCustomerExist && state.isConnected)
    {
      const customerToJson = JSON.parse(isCustomerExist);
      const regex = /^07/;
      if (regex.test(customerToJson.phone) && !customerToJson.countryCode)
      {
        Alert.alert("Info!", "You Need to Login Again!", [{
          "text": "Ok", onPress: () => {updateCustomerAutomatically(customerToJson, user)},
        }]);
        return;
      }
    }

    if (!state.isConnected && user)
    {
      if (isCustomerExist)
        context.setState(prev => ({...prev, user, customer: JSON.parse(isCustomerExist), login: true, isConnected: state.isConnected}));
      else
        context.setState(prev => ({...prev, user, login: true}));
      return;
    };

    if (!user) {
      if (response?.type === "success") {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      const customer = await getCustomer(user.id, user)
      context.setState(prev => ({...prev, user, customer, login: true}))
      if (!isCustomerExist || isCustomerExist === null)
        await AsyncStorage.setItem("@customer", JSON.stringify(customer));

      console.log("loaded locally");
    }
  }

  const updateCustomerAutomatically = async (customer, user) =>
  {
    const response = await fetch(serverPath('/customer'), {
      method: "PUT",
      headers: {
          "Content-Type": "Application/JSON",
      },
      body: JSON.stringify({firstName: customer?.firstName, lastName: customer?.lastName, countryCode: "+93", phone: customer?.phone.replace(/^0/, ''), email: customer?.email, providerId: user.id, id: customer?.id})
    });

    const objData = await response.json();
    if(objData.status === 'success')
    {
      context.logoutHandler();
      // context.setState(prev => ({...prev, customer: {...context.customer, ...objData.date}}))
      // await AsyncStorage.setItem("@customer", JSON.stringify(customer));
    }
  }

  const getLocalUser = async () => {
    // await AsyncStorage.removeItem("@user");
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      user.provider = "google"
      const customer = await getCustomer(user.id, user)
			context.setState(prev => ({...prev, user, customer, login: true}));
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      if (customer)
        await AsyncStorage.setItem("@customer", JSON.stringify(customer));
      // setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  async function getCustomer(providerId, user) {
    setIsLoading(true);
    try {
      const userResponse = await fetch(serverPath("/user/findorcreate"), {
        method: "POST",
        headers: {
          "Content-Type": "Application/JSON"
        },
        body: JSON.stringify({providerId, provider: user.provider, id: providerId, displayName: user?.name, email: user?.email, image: user?.picture})
      });
      const userObjData = await userResponse.json();
      // console.log(userObjData, "userObjData");
      if(userObjData.status === 'failure')
      {
        Alert.alert("Info!", userObjData.message);
        return null;
      }
      if(userObjData.status === 'success')
      {
        const response = await fetch(serverPath("/get/customer_by_auth"), {
          method: "POST",
          headers: {
            "Content-Type": "Application/JSON"
          },
          body: JSON.stringify({providerId})
        });
        const objData = await response.json();
        // console.log(objData, "objData Customer");
        if(objData.status === 'failure')
        {
          Alert.alert("Info!", objData.message);
          return null;
        }
        if(objData.status === 'success')
        {
          const currencyResponse = await fetch(serverPath("/get/currency"), {
            method: "POST",
            headers: {
              "Content-Type": "Application/JSON"
            },
            body: JSON.stringify({providerId})
          });
          const currency = await currencyResponse.json();
          if(currency.status === 'failure')
          {
            console.log("CURRENCY ERROR");
            Alert.alert("Info!", currency.message);
            return null;
          }
          if(currency.status === 'success')
          {
            context.setState(prev => ({...prev, currency: currency?.data[0]}));
            dispatch('setCurrencies', currency.data)
            return objData.data;
          }
          
        }
      }

    } catch (error) {
        console.log("catch", "Error Code: 1", error);
        if (error.message === "Network request failed") {
          checkingUser({isConnected: false});
          return;
        };
        Alert.alert("Info!", error.message + " Error Code: 1");
        return null;
    }
  };

  const guestHandler = async () =>
  {
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // Current time + 24 hours
    await AsyncStorage.setItem('@guestExpirationTime', expirationTime.toString());
    let guestCustomer = {
      id: generateNumericId(),
      firstName: "Guest",
      lastName: "",
      countryCode: "+93",
      phone: "700012345",
      email: "guest@brainbbox.com",
      active: true,
      userId: null,
    }
    await AsyncStorage.setItem("@guest", JSON.stringify(guestCustomer));
    context.setState(prev => ({...prev, customer: guestCustomer, isGuest: true, login: true}));

    let currencies = [{code: "؋", id: 1, name: "afghani"}];
    context.setState(prev => ({...prev, currency: currencies[0]}));
    dispatch('setCurrencies', currencies)
  };


  const privacyHandler = async () =>
  {
    const isSupported = await Linking.canOpenURL("https://sites.google.com/view/brainbbox-privacy-policy/home/");
    if (isSupported)
      await Linking.openURL("https://sites.google.com/view/brainbbox-privacy-policy/home/");
    else 
      Alert.alert("Info!", "`Don't know how to open this URL: https://sites.google.com/view/brainbbox-privacy-policy/home`")
  }

	return (
		<View style={{...Style.container,}}>
        { !isLoading &&
          <LinearGradient
            colors={['#f00029', '#ffd7d7', '#ffffff']}
            style={Style.linearGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={Style.content}>

              <View style={Style.circle} />
              <View style={[Style.circle, Style.circle2]} />

              <Text style={Style.welcomeTxt}>{language.welcomeToBrainbbox}</Text>
              <View style={Style.buttonsContainer}>
                <View>
                  <Button style={Style.button} onPress={guestHandler} disabled={!request} icon={<Ionicons name="person-sharp" size={18} color={Colors.white} />}>{language.loginWithGuest}</Button>
                  <Button style={Style.button} onPress={() => {
                      promptAsync();
                  }} disabled={!request} icon={<AntDesign name="google" size={18} color={Colors.white} />}>{language.loginWithGoogle}</Button>
                  
                  {/* <Button style={Style.button} onPress={() => {
                    // handlePressAsync();
                  }} disabled={!fbRequest} icon={<FontAwesome name="facebook" size={18} color={Colors.white} />} >Login With Facebook</Button> */}
                  {/* <View style={Style.fbContainer}>
                    <LoginButton
                      style={Style.FBbutton}
                      onLogoutFinished={() => console.log("Logged out")}
                      onLoginFinished={(error, data) => {
                        console.log("LOGIN FINISHED")
                        AccessToken.getCurrentAccessToken().then((data) => {
                          const infoRequest = new GraphRequest("/me", null, (error, result) => {
                            console.log(error || result);
                          });
                          if(data)
                            new GraphRequestManager().addRequest(infoRequest).start();
                        });
                      }}
                    />
                  </View> */}
                  {/* }} disabled={!request} icon={<FontAwesome name="facebook" size={18} color={Colors.white} />} >Login With Facebook</Button> */}
                  <TouchableOpacity onPress={privacyHandler}>
                    <Text style={Style.privacy}>{language.privacyPolicy}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </LinearGradient>
      }


      {
				isLoading &&
        <UpScreenLoader />
			}
		</View>
	)
};

export default LoginWithFG;

//ANDROID 504215588437-3nkmfpds107445d47mq408lnjsuhco6h.apps.googleusercontent.com
