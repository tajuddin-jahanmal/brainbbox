import Entypo from '@expo/vector-icons/Entypo';
import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import Colors from "../../constant";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import Style from "./Style";

const CustomeDropdown = (props) =>
{
	const context = useContext(ExchangeMoneyContext);
	const [ globalState, dispatch ] = useStore();
    const initState = {
        toggle: false,
        value: "",
    }

    const [ fields, setFields ] = useState(initState);

    const onChange = (value, type) =>
    {
        return setFields(prev => ({
            ...prev,
            [type]: value,
        }));
    };

    const toggler = () => {
        onChange(!fields.toggle, "toggle");
    }

    const currencyHandler = (value) =>
    {
        onChange(!fields.toggle, "toggle");
        if (context.currency.id === value.id)
            return;

        const findCurrency = globalState.currencies.find(currency => currency.id === value.id);
        context.setNewState(findCurrency, "currency");
        dispatch("setCustomers", []);
        dispatch("setOppositeCustomers", []);
        dispatch("setTransactions", []);
        dispatch("setOppositeTransactions", []);
        dispatch("setDailyTransactions", []);
        dispatch("setSelfCash", []);
    }

    return (
        <View style={Style.container}>
            <TouchableOpacity style={[Style.thressDotContainer, props.dotStyle]} onPress={toggler} activeOpacity={0.5}>
                <Entypo name="dots-three-vertical" size={15} color={Colors.textColor} />
            </TouchableOpacity>

            {
                fields.toggle && <Card style={Style.card}>
                {
                    globalState.currencies.length >= 1 ?
                    <TouchableOpacity>
                        {
                            globalState.currencies?.map((value, index) => (
                                <TouchableOpacity key={index} style={Style.contentCard} onPress={() => currencyHandler(value)}>
                                    <Text>{value.code}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </TouchableOpacity>
                    :
                    <TouchableOpacity>
                        <Text>{language.noDataFound}</Text>
                    </TouchableOpacity>
                }
            </Card>
            }            
        </View>
    );
};

export default React.memo(CustomeDropdown, (next, prev) => (
    next.dotStyle === prev.dotStyle
));

