import { ActivityIndicator, TouchableOpacity } from "react-native";
import Colors from "../../constant";
import Style from "./Style";

const Card = (props) =>
{
    // console.log("Rendering [Card.js]");
    return (
        <TouchableOpacity {...props} style={{...Style.card, ...props.style}} activeOpacity={props.activeOpacity || 0.6}>
             {
                props.isLoading ?
                <ActivityIndicator color={Colors.white} />
                :
                props.children
            }
        </TouchableOpacity>
    )
};

export default Card;