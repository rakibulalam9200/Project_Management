import React from 'react';
import { View } from 'react-native';
import More from "../../assets/svg/more-home.svg";

export default function MoreIcon({color = '#fff'}) {
  return (
    <View>
      <More fill={color} />
    </View>
  )
}