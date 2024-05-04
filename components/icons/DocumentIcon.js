import { View, Text } from 'react-native'
import React from 'react'
import Document from "../../assets/svg/document.svg";

export default function DocumentIcon({color = '#fff'}) {
  return (
    <View>
      <Document fill={color} />
    </View>
  )
}