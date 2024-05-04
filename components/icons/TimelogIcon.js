import React from 'react';
import { View } from 'react-native';
import TimeLog from "../../assets/svg/time-tabbar.svg";

export default function TimeLogIcon({color = '#fff'}) {
  return (
    <View>
      <TimeLog fill={color} />
    </View>
  )
}
