import Feather from '@expo/vector-icons/Feather';
import React from "react";
import { Text, View } from "react-native";
import GetResponsiveFontSize from "../../utils/TransactionFontSizeManager";
import Card from "../Card";
import Style from "./Style";

const Transaction = (props) =>
{
	const item = props?.item;

	return (
		<Card {...props} style={Style.card}>
			{/* <View style={Style[item.type ? "dateAmount Container" : "dateAmountContainer2"]}> */}
			<View style={Style.testStyle}>
				<Text style={[Style.dateTime, !props.runningBalance && Style.width33]}>{(new Date(item?.dateTime))?.toLocaleDateString()}</Text>
				<Text
					numberOfLines={1}
					style={[Style.sameCode, Style.cashOut, !props.runningBalance && Style.width33, {fontSize: GetResponsiveFontSize(item?.amount)}]}>
						{item?.type ? "" : item?.amount}
				</Text>
				<Text
					numberOfLines={1}
					style={[Style.sameCode, Style.cashIn, !props.runningBalance && Style.width33, {fontSize: GetResponsiveFontSize(item?.amount)}]}>
						{item?.type ? item?.amount : ""}
				</Text>
				{props.runningBalance && <Text
					numberOfLines={1} style={[
					Style.sameCode,
					Style.runningBalance,
					item?.runningBalance < 0 && Style.primaryColor,
					{fontSize: GetResponsiveFontSize(item?.amount)}]}>
						{item?.runningBalance}
				</Text>}
			</View>
			{
				props?.delete  && <Card onPress={props?.deleteHandler}>
					<Feather name="trash-2" size={18} color={"rgba(240, 0, 41, 0.6)"} />
				</Card>
			}
		</Card>
	)
};

export default Transaction;
// export default React.memo(Transaction, (next, prev) => (
// 	next.item?.runningBalance === prev.item?.runningBalance &&
// 	next.item?.type === prev.item?.type &&
// 	next.item?.amount === prev.item?.amount
// ));