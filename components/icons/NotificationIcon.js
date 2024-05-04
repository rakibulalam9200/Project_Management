import { View, Text } from 'react-native'
import React from 'react'
import Notification from "../../assets/svg/notification.svg";

export default function NotificationIcon({color = '#fff'}) {
  return (
    <View>
      <Notification fill={color} />
    </View>
  )
}
