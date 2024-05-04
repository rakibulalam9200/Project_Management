import React from 'react';
import { View } from 'react-native';
import List from "../../assets/svg/list-tabbar.svg";

export default function ListIcon({color = '#fff'}) {
  return (
    <View>
      <List fill={color} />
    </View>
  )
}
