import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as NetFetch } from "@react-native-community/netinfo";
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useContext, useEffect, useState } from "react";
import { Alert, Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { PrivacyPolicyAlert } from '../../components/Alerts';
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

const LoginWithFG = (props) => {
  const [globalState, dispatch] = useStore();
  const context = useContext(ExchangeMoneyContext);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const [privacyPolicyAlert, setPrivacyPolicyAlert] = useState({visible: false, processType: ""});
  
  // Configure Google Auth
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '504215588437-3nkmfpds107445d47mq408lnjsuhco6h.apps.googleusercontent.com',
    iosClientId: '504215588437-vc7um5bcsa2q8775h3dmshvhnpljgevb.apps.googleusercontent.com',
    webClientId: '504215588437-3ce7ijkdkljv2lcdnbemgu53b0o3q32j.apps.googleusercontent.com',
    redirectUri,
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: "361987559839890",
  });

  // Check if Apple authentication is available (iOS only)
  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === 'ios') {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setIsAppleLoginAvailable(isAvailable);
      }
    };
    checkAppleAuth();
  }, []);

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  useEffect(() => {
    if (fbResponse?.type === "success" && fbResponse.authentication) {
      (async () => {
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?access_token=${fbResponse.authentication.accessToken}&fields=id,name,email,picture`
        );
        const userInfo = await userInfoResponse.json();
        console.log(userInfo, "Facebook userInfo");
      })();
    }
  }, [fbResponse]);

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple returns null for email if user hides it
      const email = credential.email || ``;
      
      // Create user object similar to Google's response format
      const user = {
        id: credential.user,
        name: credential?.fullName 
          ? `${credential?.fullName?.givenName || ''} ${credential?.fullName?.familyName || ''}`.trim() 
          : 'Apple User',
        email: email,
        provider: "apple",
        picture: "https://api.brainbbox.com/images/profile.jpg"
      };

      const customer = await getCustomer(user.id, user);
      context.setState(prev => ({...prev, user, customer, login: true}));
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      if (customer) {
        await AsyncStorage.setItem("@customer", JSON.stringify(customer));
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled Apple Sign-In
        console.log('Apple sign-in was canceled');
      } else {
        Alert.alert("Error", "Apple login failed");
        console.error('Apple sign-in error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function handleEffect() {
    NetFetch().then(async (state) => {
      checkingUser(state);
    });
  }

  async function checkingUser(state) {
    const user = await getLocalUser();
    const isGuestExist = await AsyncStorage.getItem("@guestExpirationTime");
    const isCustomerExist = await AsyncStorage.getItem("@customer");
    
    if (isGuestExist) {
      setIsLoading(true);
      const guestData = await AsyncStorage.getItem("@guest");
      let currencies = [{code: "؋", id: 1, name: "afghani"}];
      context.setState(prev => ({
        ...prev, 
        customer: JSON.parse(guestData), 
        isGuest: true, 
        login: true, 
        currency: currencies[0]
      }));
      dispatch('setCurrencies', currencies);
      return;
    }

    if (isCustomerExist && state.isConnected) {
      const customerToJson = JSON.parse(isCustomerExist);
      const regex = /^07/;
      if (regex.test(customerToJson.phone) && !customerToJson.countryCode) {
        Alert.alert("Info!", "You Need to Login Again!", [{
          "text": "Ok", 
          onPress: () => updateCustomerAutomatically(customerToJson, user),
        }]);
        return;
      }
    }

    if (!state.isConnected && user) {
      if (isCustomerExist) {
        context.setState(prev => ({
          ...prev, 
          user, 
          customer: JSON.parse(isCustomerExist), 
          login: true, 
          isConnected: state.isConnected
        }));
      } else {
        context.setState(prev => ({...prev, user, login: true}));
      }
      return;
    };

    if (!user) {
      if (response?.type === "success") {
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      const customer = await getCustomer(user.id, user);
      context.setState(prev => ({...prev, user, customer, login: true}));
      if (!isCustomerExist || isCustomerExist === null) {
        await AsyncStorage.setItem("@customer", JSON.stringify(customer));
      }
    }
  }

  const updateCustomerAutomatically = async (customer, user) => {
    const response = await fetch(serverPath('/customer'), {
      method: "PUT",
      headers: {
        "Content-Type": "Application/JSON",
      },
      body: JSON.stringify({
        firstName: customer?.firstName, 
        lastName: customer?.lastName, 
        countryCode: "+93", 
        phone: customer?.phone.replace(/^0/, ''), 
        email: customer?.email, 
        providerId: user.id, 
        id: customer?.id
      })
    });

    const objData = await response.json();
    if (objData.status === 'success') {
      context.logoutHandler();
    }
  };

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    return data ? JSON.parse(data) : null;
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const user = await response.json();
      user.provider = "google";
      const customer = await getCustomer(user.id, user);
      context.setState(prev => ({...prev, user, customer, login: true}));
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      if (customer) {
        await AsyncStorage.setItem("@customer", JSON.stringify(customer));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get user info");
      setIsLoading(false);
    }
  };

  async function getCustomer(providerId, user) {
    setIsLoading(true);
    try {
      const userResponse = await fetch(serverPath("/user/findorcreate"), {
        method: "POST",
        headers: { "Content-Type": "Application/JSON" },
        body: JSON.stringify({
          providerId, 
          provider: user.provider, 
          id: providerId, 
          displayName: user?.name, 
          firstName: user?.given_name, 
          lastName: user?.family_name, 
          displayName: user?.name, 
          email: user?.email, 
          image: user?.picture,
          platform: "app",
        })
      });
      
      const userObjData = await userResponse.json();
      if (userObjData.status === 'failure') {
        Alert.alert("Info!", userObjData.message);
        return null;
      }
      
      if (userObjData.status === 'success') {
        const response = await fetch(serverPath("/get/customer_by_auth"), {
          method: "POST",
          headers: { "Content-Type": "Application/JSON" },
          body: JSON.stringify({providerId})
        });
        
        const objData = await response.json();
        if (objData.status === 'failure') {
          Alert.alert("Info!", objData.message);
          return null;
        }
        
        if (objData.status === 'success') {
          const currencyResponse = await fetch(serverPath("/get/currency"), {
            method: "POST",
            headers: { "Content-Type": "Application/JSON" },
            body: JSON.stringify({providerId})
          });
          
          const currency = await currencyResponse.json();
          if (currency.status === 'failure') {
            Alert.alert("Info!", currency.message);
            return null;
          }
          
          if (currency.status === 'success') {
            context.setState(prev => ({...prev, currency: currency?.data[0]}));
            dispatch('setCurrencies', currency.data);
            return objData.data;
          }
        }
      }
    } catch (error) {
      console.log("Error:", error);
      if (error.message === "Network request failed") {
        checkingUser({isConnected: false});
        return;
      }
      Alert.alert("Error", "Failed to get customer data");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const guestHandler = async () => {
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
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
    };
    await AsyncStorage.setItem("@guest", JSON.stringify(guestCustomer));
    
    let currencies = [{code: "؋", id: 1, name: "afghani"}];
    context.setState(prev => ({
      ...prev, 
      customer: guestCustomer, 
      isGuest: true, 
      login: true,
      currency: currencies[0]
    }));
    dispatch('setCurrencies', currencies);
  };

  const privacyHandler = async () => {
    // const url = "https://sites.google.com/view/brainbbox-privacy-policy/home/";
    const url = "https://sites.google.com/view/brainbbox/home";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Couldn't open the privacy policy page");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open privacy policy");
    }
  };

  return (
    <View style={Style.container}>
      {!isLoading ? (
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
                <Button 
                  style={Style.button} 
                  // onPress={guestHandler} 
                  onPress={() => setPrivacyPolicyAlert({visible: true, processType: "guest"})} 
                  icon={<Ionicons name="person-sharp" size={18} color={Colors.white} />}
                >
                  {language.loginWithGuest}
                </Button>
                
                <Button 
                  style={Style.button} 
                  // onPress={async () => {
                  //     promptAsync()
                  // }} 
                  onPress={() => setPrivacyPolicyAlert({visible: true, processType: "google"})} 
                  disabled={!request}
                  icon={<AntDesign name="google" size={18} color={Colors.white} />}
                >
                  {language.loginWithGoogle}
                </Button>
                
                {(Platform.OS === "ios" && isAppleLoginAvailable) && (
                  <View style={Style.appleButtonContainer}>
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={5}
                      style={Style.appleButton}
                      // onPress={async () => {
                      //   const agreed = await showPrivacyAlert();
                      //   if (agreed)
                      //     handleAppleLogin
                      // }}
                      onPress={() => setPrivacyPolicyAlert({visible: true, processType: "apple"})} 
                    />
                  </View>
                )}
                
                <TouchableOpacity onPress={privacyHandler}>
                  <Text style={Style.privacy}>{language.privacyPolicy}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <PrivacyPolicyAlert
            show={privacyPolicyAlert.visible}
            onConfirm={async () => {
              if (privacyPolicyAlert.processType === "guest")
                guestHandler();
              else if (privacyPolicyAlert.processType === "google")
                promptAsync();
              else if (privacyPolicyAlert.processType === "apple")
                handleAppleLogin();
              setPrivacyPolicyAlert({visible: false, processType: ""})
            }}
            onCancel={() => setPrivacyPolicyAlert({visible: false, processType: ""})}
          />
        </LinearGradient>
      ) : (
        <UpScreenLoader />
      )}
    </View>
  );
};

export default LoginWithFG;