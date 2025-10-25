import Feather from '@expo/vector-icons/Feather';
import React, { useRef } from "react";
import { Animated, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import GetResponsiveFontSize from "../../utils/TransactionFontSizeManager";
import Card from "../Card";
import Style from "./Style";

const Transaction = (props) =>
{
    const { navigate } = props.navigation;
	const swipeRef = useRef(null);
	const item = props?.item;

	const editHandler = () =>
	{
		navigate(item.type ? "CashIn" : "CashOut", {
			cashbookId: item.cashbookId,
			transactionId: {_id: item?._id, id: item?.id},
			transactionEdit: true
		});
		swipeRef?.current?.close();
	}

	const renderRightAction = (progress) => {
		const scale = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0.8, 1],
			extrapolate: "clamp",
		});

		return (
			<Animated.View style={[Style.rightAction, { transform: [{ scale }] }]}>
				<Card onPress={editHandler} style={Style.actionBtn}>
					<Feather name="edit-2" size={20} color="white" />
				</Card>
			</Animated.View>
		);
	};

	return (
		<Swipeable
			ref={swipeRef}
			renderRightActions={props?.swipeable && renderRightAction}
			overshootRight={false}
			overshootLeft={false}
			rightThreshold={props?.swipeable && 20}
			friction={props?.swipeable && 2.5}
			onSwipeableOpen={() => props?.swipeable && props?.onOpen(swipeRef.current)}
			onSwipeableClose={() => props?.swipeable && props?.onClose(swipeRef.current)}
		>
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
		</Swipeable>
	)
};

export default Transaction;
// export default React.memo(Transaction, (next, prev) => (
// 	next.item?.runningBalance === prev.item?.runningBalance &&
// 	next.item?.type === prev.item?.type &&
// 	next.item?.amount === prev.item?.amount
// ));