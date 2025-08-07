import AntDesign from '@expo/vector-icons/AntDesign';
import { useIsFocused } from '@react-navigation/native';
import * as Contacts from "expo-contacts";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { DataProvider, LayoutProvider } from "recyclerlistview";
import { AddCustomerValidationAlert } from "../../../components/Alerts";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import PhoneInput from "../../../components/PhoneInput";
import UpScreenLoader from "../../../components/UpScreenLoader";
import { ScreenWidth } from "../../../constant";
import Customers from "../../../DB/Customer";
import { ExchangeMoneyContext } from "../../../ExchangeMoneyContext";
import language from "../../../localization";
import useStore from "../../../store/store";
import { generateNumericId } from "../../../utils/idGenerator";
import serverPath from "../../../utils/serverPath";
import { SortCustomers } from "../../../utils/SortData";
import AddCustomerValidator from "../../../validator/AddCustomer";
import Style from "./Style";

const AddCustomer = (props) => {
  const isFocused = useIsFocused(); // Simplified focus management
  const initState = {
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+93",
    email: "",
    type: "customer",
    showAlert: { visible: false, message: "" },
    newStyle: Style.disNone,
  };

  const showToast = () => {
    Toast.show({
      type: 'success',
      text1: language.success,
      text2: language.customerSuccessfullyAdded,
      swipeable: true,
      visibilityTime: 2000,
    });
  };

  const [globalState, dispatch] = useStore();
  const context = useContext(ExchangeMoneyContext);
  const [dataProvider, setDataProvider] = useState(new DataProvider((r1, r2) => r1 !== r2));
  const [fields, setFields] = useState(initState);
  const [isLoading, setIsLoading] = useState(false);
	const navigation = useNavigation();
  const onChange = (value, type) => {
    if (isLoading) return;
    
    setFields(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  useEffect(() => {
    if (!isFocused) return;

    const fetchContacts = async () => {
      if (globalState.contacts.length <= 0) {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers],
          });

          if (data.length >= 1) {
            let filterContacts = data
              .filter(per => per.phoneNumbers && per.phoneNumbers.length > 0)
              .map(per => ({
                firstName: per.firstName || "",
                lastName: per.lastName || "",
                phone: per.phoneNumbers[0].number
              }));
            
            if (filterContacts.length > 0) {
              dispatch("setContacts", filterContacts);
            }
          }
        }
      }
    };

    fetchContacts();
  }, [globalState.contacts, isFocused, dispatch]);

  const phonePressHandler = (item) => {
    const { firstName, lastName, phone } = item;
    onChange(firstName, "firstName");
    onChange(lastName, "lastName");
    onChange(phone, "phone");
    onChange(Style.disNone, "newStyle");
  };

  const addCustomerHandler = async () => {
    try {
      const error = AddCustomerValidator(fields);
      if (error) {
        return onChange({visible: true, message: error}, "showAlert");
      }

      const data = {
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        countryCode: fields.countryCode,
        phone: fields.phone,
        type: fields.type,
        providerId: context?.user?.id,
      };

      console.log(data, 'ADD CUSTOMER DATA');
      

      if (context.isGuest) {
        const customerExists = globalState.customers.some(
          cus => (cus?.customer?.phone || cus?.phone) === data.phone
        );
        
        if (customerExists) {
          Alert.alert("Info!", "Cashbook already exists!");
          return;
        }

        const newCustomer = {
          ...data,
          id: generateNumericId(),
          userId: null
        };
        
        const cashbook = {
          id: generateNumericId(),
          customer: newCustomer,
          customerId: newCustomer.id,
          owner: context.customer,
          ownerId: context.customer.id,
          summary: []
        };

        await Customers.createCustomer(
          cashbook.id,
          cashbook.customer?.firstName,
          cashbook.customer?.lastName,
          cashbook.customer?.countryCode,
          cashbook.customer?.phone,
          cashbook.customer?.email,
          JSON.stringify(cashbook?.summary),
          cashbook.customer?.active,
          cashbook.customer?.userId
        );
        
        setFields(initState);
        dispatch("setCustomers", SortCustomers([...globalState.customers, cashbook]));
        navigation.navigate('Home'); // Explicit navigation
        return;
      }

      setIsLoading(true);
      const response = await fetch(serverPath("/customer"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const objData = await response.json();

      if (objData.status === "success") {
        const response2 = await fetch(serverPath("/cashbook"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            providerId: context.user.id,
            ownerId: context.customer.id,
            customerId: objData.data.id
          })
        });

        const objData2 = await response2.json();

        if (objData2.status === "success") {
          const cashbookResponse = await fetch(serverPath("/get/cashbook"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              providerId: context.user.id,
              ownerId: context.customer.id
            })
          });
          
          const cashbookObjData = await cashbookResponse.json();
          
          if (cashbookObjData.status === "success") {
            let filterCustomers = cashbookObjData?.data?.filter(
              customer => customer.customerId !== context.customer.id
            );
            
            const newCustomer = filterCustomers.find(
              cus => cus.customerId === objData2.data.customerId
            );
            
            if (newCustomer) {
              await Customers.createCustomer(
                newCustomer.id,
                newCustomer.customer.firstName,
                newCustomer.customer.lastName,
                newCustomer.customer.countryCode,
                newCustomer.customer.phone,
                newCustomer.customer.email,
                JSON.stringify(newCustomer?.summary),
                newCustomer.customer.active,
                newCustomer.customer.userId
              );
              
              setFields(initState);
              dispatch("setCustomers", SortCustomers(filterCustomers));
              navigation.navigate('Home'); // Explicit navigation
              // ToastAndroid.show("Customer successfully added", ToastAndroid.SHORT);
              showToast();
            }
          }
        } else {
          Alert.alert("Info!", objData2.message);
        }
      } else {
        Alert.alert("Info!", objData.message);
      }
    } catch (error) {
      console.error("Add Customer Error:", error);
      Alert.alert('Error', "An error occurred while adding customer");
    } finally {
      setIsLoading(false);
    }
  };

  const NORMAL = "NORMAL";
  
  const layoutProvider = new LayoutProvider(
    () => NORMAL,
    (type, dim) => {
      switch (type) {
        case NORMAL:
          dim.width = ScreenWidth;
          dim.height = 60;
          break;
        default:
          dim.width = 0;
          dim.height = 0;
          break;
      }
    }
  );

  const rowRenderer = (type, item) => {
    return (
      <Card 
        style={Style.contact} 
        onPress={() => phonePressHandler(item)} 
        activeOpacity={0.8}
      >
        <Text>{item.firstName} {item.lastName}</Text>
        <Text style={Style.phoneNumber}>{item.phone}</Text>
      </Card>
    );
  };

  if (!isFocused) return null;

  return (
    <View style={Style.container}>
      <Header title={language.addCustomer} goBack={() => navigation.navigate('Home')} noBack />
      <View style={Style.content}>
        <View style={Style.form}>
          <Input 
            placeholder={language.firstName} 
            value={fields.firstName} 
            onChangeText={(text) => onChange(text, "firstName")} 
            disabled={isLoading} 
          />
          <Input 
            placeholder={language.lastName} 
            value={fields.lastName} 
            onChangeText={(text) => onChange(text, "lastName")} 
            disabled={isLoading} 
          />
          
          <PhoneInput
            placeholder={language.phone}
            phoneHandler={(countryCode, phone) => {
              onChange(countryCode, "countryCode");
              onChange(phone, "phone");
            }}
          />
        
          <Input 
            placeholder={language.email} 
            value={fields.email} 
            onChangeText={(text) => onChange(text, "email")} 
            disabled={isLoading} 
            keyboardType="email-address" 
          />

          <Button 
            style={Style.addCustomer} 
            onPress={addCustomerHandler} 
            isLoading={isLoading} 
            disabled={isLoading || (context.isGuest ? false : !context.isConnected)}
          >
            {language.addCustomer}
          </Button>
        </View>
      </View>

      <AddCustomerValidationAlert
        onConfirm={() => onChange({ visible: false, message: "" }, "showAlert")}
        onCancel={() => onChange({ visible: false, message: "" }, "showAlert")}
        show={fields.showAlert.visible}
        message={fields.showAlert.message}
      />
      
      {isLoading && <UpScreenLoader />}
    </View>
  );
};

export default AddCustomer;

export const AddCustomerOptions = (nav) => {
  return {
    tabBarIcon: (tabInfo) => (
      <View>
        <AntDesign name={"adduser"} color={tabInfo.color} size={tabInfo.size} />
      </View>
    )
  };
};