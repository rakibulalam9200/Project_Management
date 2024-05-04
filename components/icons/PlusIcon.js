import { View, Text } from 'react-native'
import React from 'react'
import Plus from "../../assets/svg/plus-middle.svg";

export default function PlusIcon({color = '#fff'}) {
  return (
    <View>
      <Plus fill={color} />
    </View>
  )
}