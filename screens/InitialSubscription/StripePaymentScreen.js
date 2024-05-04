import { StackActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { makeSubscribed, setInitialPlan } from '../../store/slices/subscription'

const StripePaymentScreen = ({ navigation, route }) => {
  let stripeUrl = route.params ? route.params.stripeUrl : null
  const dispatch = useDispatch()
  const [url, setUrl] = useState('')
  const [showWebView, setShowWebView] = useState(true)

  const handleWebViewNavigationStateChange = async (newNavState) => {
    const { url } = newNavState
    if (!url) return
    if (url.includes('/stripe-checkout-success') || url.includes('/stripe-checkout-cancel')) {
      setUrl(url)
      setShowWebView(false)
    }
  }

  useEffect(() => {
    const urlParams = new URL(url)
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match
    while ((match = regex.exec(urlParams))) {
      params[match[1]] = match[2]
    }
    if (params?.organization_id && params?.session_id) {
      try {
        const body = {
          organization_id: +params.organization_id,
          session_id: params.session_id.replace("/", "")
        }
        if (url.includes('/stripe-checkout-success')) {
          api.subscription.stripeSuccess(body).then((res) => {
            if (res.success) {
              dispatch(makeSubscribed())
            }
          }).catch((err) => {
            // dispatch(setInitialPlan(null))
            navigation.dispatch(StackActions.popToTop())
          })
        } else if (url.includes('/stripe-checkout-cancel')) {
          api.subscription.stripeCancel(body).then((res) => {
            if (res.success) {
              //  dispatch(setInitialPlan(null))
              navigation.dispatch(StackActions.popToTop())
            }
          }).catch((err) => {
            // dispatch(setInitialPlan(null))
            navigation.dispatch(StackActions.popToTop())
          })
        }

      } catch (error) {
        const subsCheck = api.subscription.checkSubscription();
        if (subsCheck.success) {
          dispatch(makeSubscribed())
        } else {
          // dispatch(setInitialPlan(null))                                             
          navigation.dispatch(StackActions.popToTop())
        }
      }
    }
  }, [url])
  return (
    <SafeAreaView style={s.containerBG}>
      <StatusBar style="dark" />
      <View style={[g.outerContainer, s.outerPadding]}>
        {showWebView && (<WebView
          source={{ uri: stripeUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />)}
        {
          !showWebView && <View style={s.loaderView}><ActivityIndicator size="large" color={colors.HOVER} /></View>
        }
      </View>
    </SafeAreaView>
  )
}

export default StripePaymentScreen

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.WHITE,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },

  outerPadding: {
    paddingHorizontal: 16,
    flex: 1,
    paddingBottom: 72,
  },
  closeWebview: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  loaderView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
