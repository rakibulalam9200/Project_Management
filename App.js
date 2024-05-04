import { NavigationContainer } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'

// import * as Notifications from 'expo-notifications'
import * as Linking from 'expo-linking'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { StatusBar } from 'expo-status-bar'
import MainStack from './components/navigation/MainStack.js'
import { store } from './store/store.js'
// import registerForPushNotificationsAsync from './services/registerForPushNotificatitonsAsync.js'
import { useNetInfo } from '@react-native-community/netinfo'
import { StripeProvider } from '@stripe/stripe-react-native'
import { MenuProvider } from 'react-native-popup-menu'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const prefix = Linking.createURL('/')

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// })

export default function App() {
  const netInfo = useNetInfo()

  let [fontsLoaded] = useFonts({
    'inter-bold': require('./assets/fonts/Inter-Bold.ttf'),
    'inter-medium': require('./assets/fonts/Inter-Medium.ttf'),
    'inter-semibold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'inter-regular': require('./assets/fonts/Inter-Regular.ttf'),
  })
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    const AutoHide = async () => {
      await SplashScreen.preventAutoHideAsync()
    }
    AutoHide()
    // registerForPushNotificationsAsync()

    // notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
    //   //console.log(notification)
    // })

    // responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
    //   //console.log(notification)
    // })

    // return () => {
    //   Notifications.removeNotificationSubscription(notificationListener.current)
    //   Notifications.removeNotificationSubscription(responseListener.current)
    // }
  }, [])
  useEffect(() => {
    //console.log(netInfo, 'netinfoo')
    if (netInfo && !netInfo.isConnected && netInfo.isConnected != null) {
      Toast.show({
        type: 'error',
        text1: 'Network Connectivity Error!',
        text2: 'Please turn on wifi or mobile network.',
        position: 'bottom',
      })
    }
  }, [netInfo])

  useEffect(() => {
    const hideAsync = async () => {
      await SplashScreen.hideAsync()
    }
    if (fontsLoaded) {
      hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }
  const linking = {
    prefixes: [prefix, 'https://www.vidadynamics.com', 'https://vidadynamics.com'],
    config: {
      screens: {
        AcceptInvitation: '/invitation-accept/:token',
      },
    },
  }

  return (
    <StripeProvider publishableKey="pk_test_51LybmQDVh3BBypbUm084tAckfflFQsDQ5OMRb0069s8cqUboXRdJ1fTypB9gBQW5bgcyGcxpSc186l5fdZqCqXps007Zbe5u4Y">
       <MenuProvider>
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer linking={linking}>
                <StatusBar style="dark" />
                <MainStack />
                <Toast />
              </NavigationContainer>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </Provider>
      </MenuProvider>
    </StripeProvider>
  )
}
