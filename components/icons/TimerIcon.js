import React from 'react';
import { View } from 'react-native';
import Timer from "../../assets/svg/timer-tabbar.svg";

export default function TimerIcon({color = '#fff'}) {
  return (
    <View>
      <Timer fill={color} />
    </View>
  )
}
