import { View, Text } from 'react-native'
import React from 'react'
import Calendar from "../../assets/svg/calendar.svg";

export default function CalendarIcon({color = '#fff'}) {
  return (
    <View>
      <Calendar fill={color} />
    </View>
  )
}