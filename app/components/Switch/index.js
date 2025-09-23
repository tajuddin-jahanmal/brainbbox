import React, { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity } from "react-native";
import Style from "./Style";

const Switch = (props) =>
{
    const [isOn, setIsOn] = useState(false);
    const translateX = useRef(new Animated.Value(5)).current;

    useEffect(() =>
    {
      Animated.timing(translateX, {
        toValue: isOn ? 30 : 5,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [isOn]);

    useEffect(() =>
    {
      if (props.on !== isOn)
        setIsOn(props.on);
    }, [props.on]);

    return (
      <TouchableOpacity 
        style={[Style.toggleSwitch, isOn && Style.toggleSwitchOn]} 
        onPress={() => { setIsOn(!isOn); props.toggler(!isOn); }} 
        activeOpacity={0.8}
      >
        <Animated.View style={[Style.switchHandle, { transform: [{ translateX }] }]} />
      </TouchableOpacity>
    )
};

export default React.memo(Switch, (next, prev) => (
    next.on === prev.on
));