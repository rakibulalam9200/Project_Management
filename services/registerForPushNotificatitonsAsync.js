import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { setNotificationToken } from '../store/slices/auth'
import { store } from '../store/store'

import { Platform } from 'react-native'
const registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!')
    return
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data
  //console.log(token)
  store.dispatch(setNotificationToken(token))

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }
}

export default registerForPushNotificationsAsync
