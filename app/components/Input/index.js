import React from "react";
import { TextInput } from "react-native";
import { isAndroid } from "../../constant/index.js";
import Style from "./style.js";

const Input = (props) =>
{
    // console.log("Rendering [Input.js]");
    return (
        <TextInput
            {...props}
            placeholder={props.placeholder}
            style={[Style.input, props.style]}
            editable={!props.disabled}
            placeholderTextColor={isAndroid ? "#808080" : "#C7C7CD"}
        />
    )
};

// export default Input;

export default React.memo(Input, (next, prev) => (
    next.value === prev.value &&
    next.placeholder === prev.placeholder &&
    next.disabled === prev.disabled 
));


