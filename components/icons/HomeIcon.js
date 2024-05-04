import { View, Text } from 'react-native'
import React from 'react'
import HouseIcon from "../../assets/svg/house.svg";

export default function HomeIcon({color = '#fff'}) {
  return (
    <View>
      <HouseIcon fill={color} />
    </View>
  )
}
