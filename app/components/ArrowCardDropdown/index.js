import Entypo from '@expo/vector-icons/Entypo';
import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import Colors from "../../constant";
import Card from "../Card";
import Style from "./Style";

const ArrowCardDropdown = (props) =>
{
	const initState = {
		show: false,
		subShow: false,
	};

	const [fields, setFields] = useState(initState);

	const onChange = (value, type) =>
	{
		setFields(perv => ({
			...perv,
			[type]: value,
		}));
	};

	const titleContainerhandler = () =>
	{
		if (props?.content?.length >= 1)
		{
			onChange(!fields.show, "show")
		}
			
		props?.cardHandler();
	}

	const content_handler = (key, currencyId) =>
	{
		if ((key === "dailyReport" || key === "balanceSheetCurrency") && !currencyId)
		{
			onChange(!fields.subShow, "subShow")
			return;
		}
		if (currencyId)
		{
			setFields(initState);
			props.contenthandler(key, currencyId);
			return;
		}
		
		onChange(false, "show")
		props.contenthandler(key);
	}

	return (
		<Card {...props} style={{...Style.arrowCard, ...props.style, ...{...fields.show && {paddingBottom: 10}}}}>
			<TouchableOpacity style={Style.titleContainer} onPress={titleContainerhandler}>
				<Text>{props.title}</Text>
				{props?.content?.length >= 1 && <Entypo style={fields.show && Style.chevron} name="chevron-small-right" size={24} color={Colors.textColor} />}
			</TouchableOpacity>
			{
				(props.content && fields.show) && props.content.map((value, index) => (
					<Card key={index} style={Style.contentContainer}>
						<Card style={Style.content} onPress={() => content_handler(value.key)}>
							<Text>{value.value}</Text>
							{value?.subContent?.length >= 1 && <Entypo style={fields.subShow && Style.chevron} name="chevron-small-right" size={24} color={Colors.textColor} />}
						</Card>
						{
							(value?.subContent && fields.subShow) && value?.subContent?.map((subValue, subIndex) => (
								<Card key={subIndex} style={Style.subContent} onPress={() => content_handler(value.key, subValue.key)}>
									<Text>{subValue.value}</Text>
								</Card>
							))
						}
					</Card>
				))
			}
		</Card>
	)
};

export default ArrowCardDropdown;