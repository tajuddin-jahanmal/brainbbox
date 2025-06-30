import React from "react";
import { TextInput } from "react-native";
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
        />
    )
};

// export default Input;

export default React.memo(Input, (next, prev) => (
    next.value === prev.value &&
    next.placeholder === prev.placeholder &&
    next.disabled === prev.disabled 
));


