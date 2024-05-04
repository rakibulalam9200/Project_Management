import React from 'react';
import { View } from 'react-native';
import Message from "../../assets/svg/message-tabbar.svg";

export default function MessageIcon({color = '#fff'}) {
  return (
    <View>
      <Message fill={color} />
    </View>
  )
}
