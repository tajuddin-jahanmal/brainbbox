import React, { useContext, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import OpeningBalance from "../../DB/OpeningBalance";
import { ExchangeMoneyContext } from "../../ExchangeMoneyContext";
import language from "../../localization";
import useStore from "../../store/store";
import isNumber from "../../utils/isNumber";
import serverPath from "../../utils/serverPath";
import Button from "../Button";
import Card from "../Card";
import Input from "../Input";
import Style from "./Style";

const OpeningBalanceModal = (props) =>
{
	const isRTL = language.isRtl;
    const [globalState, dispatch] = useStore();
    const [ fields, setFields ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const context = useContext(ExchangeMoneyContext);

    const onChange = (value, currencyId) =>
	{
        if (isLoading)
            return;
        setFields(prevFields =>
            prevFields.map(field =>
                field.currencyId === currencyId ? { ...field, amount: value } : field
            )
        );
	};

    useEffect(() =>
    {
        (async () =>
        {
            if (!props.visible) return;
            
            const offlineOpeningBalances = await OpeningBalance.getOpeningBalance();

            // Create map of latest offline balances
            const latestMap = new Map();
            for (const item of offlineOpeningBalances) {
                const existing = latestMap.get(item.currencyId);
                if (!existing || new Date(item.dateTime) > new Date(existing.dateTime)) {
                    latestMap.set(item.currencyId, item);
                }
            }

            const newFields = globalState.currencies?.map(currency => {
            const existing = latestMap.get(currency.id);
            return {
                name: currency.name,
                code: currency.code,
                currencyId: currency.id,
                amount: existing ? existing.amount.toString() : "0",
            };
            }) ?? [];

            setFields(newFields);
        })();
    }, [props.visible]);

    const saveHandler = async () =>
	{
        if (!context.isConnected)
            return Alert.alert(language.info, "You're currently offline");
            
        const hasInvalid = fields.some(element => element.amount && !isNumber(Number(element.amount)));
        if (hasInvalid)
            return Alert.alert(language.info, language.pleaseEnterNumber);

        try {
            setIsLoading(true);

            const offlineOpeningBalances = await OpeningBalance.getOpeningBalance();

            const latestMap = new Map();
            for (const item of offlineOpeningBalances) {
                const existing = latestMap.get(item.currencyId);
                if (!existing || new Date(item.dateTime) > new Date(existing.dateTime))
                    latestMap.set(item.currencyId, item);
            }

            const validFields = fields?.filter((f) => {
                const existing = latestMap.get(f.currencyId);
                if (Number(f.amount) > 0) return true;
                if (existing && Number(existing.amount) > 0 && Number(f.amount) === 0) return true;
                return false;
            });

            if (validFields.length === 0)
                return Alert.alert(language.info, language.pleaseEnterOpeningBalance);

            const changedFields = validFields?.filter((field) => {
                const existing = latestMap.get(field.currencyId);
                return !existing || Number(existing.amount) !== Number(field.amount);
            });

            if (changedFields.length === 0) {
                setIsLoading(false);
                return Alert.alert(language.info, language.noChangesFoundtoSave);
            }

            const responses = await Promise.all(
                changedFields.map((field) =>
                    fetch(serverPath("/opening_balance"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "Application/JSON",
                        },
                        body: JSON.stringify({
                            amount: Number(field.amount),
                            currencyId: field.currencyId,
                            customerId: context.customer.id,
                            providerId: context?.user?.id,
                        }),
                    })
                )
            );

            const results = await Promise.all(responses.map((r) => r.json()));

            results.forEach(result =>
            {
                if (result.status === "success")
                {
                    let data = result.data;
                    OpeningBalance.createOpeningBalance(
                        data.id,
                        data.amount,
                        data.currencyId,
                        data.customerId,
                        data.dateTime
                    );

                    dispatch("setOpeningBalances", [...globalState.openingBalances, data]);
                }
                if (result.status === "failure")
                    Alert.alert(language.info, result.message)
            })
            props.onDismiss();
        } catch (err) {
            console.error("Error sending opening balances:", err);
            Alert.alert(language.error, "Failed to save opening balances.");
        } finally {
            // setFields([]);
            setIsLoading(false);
        }
	};

    return (
        <View>
            <Modal
                visible={props.visible}
                animationType="slide"
                transparent={true}
            >
                <View style={Style.content}>
                    <Card style={Style.card} activeOpacity={1}>
                        <Text style={[Style.title, isRTL && {textAlign: 'right'}]}>{language.openingBalance}</Text>

                        <Text style={[Style.onceYouSetTheAmount, isRTL && {textAlign: "right"}]}>{language.onceYouSetTheAmount}</Text>

                        <ScrollView>
                            <View>
                                {fields.map(field => {
                                    const existingBalance = globalState.openingBalances?.find(b => b.currencyId === field.currencyId);

                                    return (
                                        <View style={Style.balanceContainer} key={field.currencyId}>
                                            <Text style={[Style.currencyCode, !!existingBalance && { backgroundColor: "#f9f9f9ff", color: "#999" }]}>{field.code}</Text>
                                            <Input
                                                style={Style.balance}
                                                placeholder="0"
                                                value={field.amount}
                                                onChangeText={text => onChange(text, field.currencyId)}
                                                keyboardType="numeric"
                                                disabled={isLoading || !!existingBalance}
                                            />
                                        </View>
                                )})}
                                <Text style={isRTL && {textAlign: "right"}}>{language.enterYourOpeningBalance}</Text>
                            </View>
                        </ScrollView>

                        <View style={Style.buttonsContainer}>
                            <Button style={Style.dismiss} onPress={props.onDismiss} disabled={isLoading}>{language.dismiss}</Button>
                            <Button style={Style.save} onPress={saveHandler} isLoading={isLoading} disabled={isLoading || !context.isConnected}>{language.save}</Button>
                        </View>
                    </Card>
                </View>
                <TouchableOpacity style={Style.backdrop} onPress={props.onDismiss} activeOpacity={1}>
                </TouchableOpacity>
            </Modal>
        </View>
    )
};

export default React.memo(OpeningBalanceModal, (next, prev) => (
    next.visible === prev.visible
));