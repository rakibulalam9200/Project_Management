import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import g from '../assets/styles/global'
import CButtonInput from '../components/common/CButtonInput'
import axios from 'axios'
import CInputWithLabel from '../components/common/CInputWithLabel'
import { useSelector } from 'react-redux'
import { useState } from 'react'

export default function NotificationsScreen() {
  const [title, setTitle] = useState('Test Notification')
  const [body, setBody] = useState('Test Body')
  const { notificationToken } = useSelector((state) => state.auth)
  const sendNotification = async () => {
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notificationToken,
          title: title,
          body: body,
        }),
      })
      const resJson = await res.json()
      //console.log(resJson)
    } catch (err) {
      //console.log(err)
    }
  }
  return (
    <View style={g.innerContainer}>
      <CInputWithLabel value={title} setValue={setTitle} label="Title" />
      <CInputWithLabel value={body} setValue={setBody} label="Body" />
      <CButtonInput label="Send Notification to this device" onPress={sendNotification} />
    </View>
  )
}

const styles = StyleSheet.create({})
