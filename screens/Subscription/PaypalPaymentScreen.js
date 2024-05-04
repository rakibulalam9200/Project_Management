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

const PaypalPaymentScreen = ({ navigation, route }) => {
    let paypalUrl = route.params ? route.params.paypalUrl : null
    const dispatch = useDispatch()
    const [url, setUrl] = useState('')
    const [showWebView, setShowWebView] = useState(true)

    const handleWebViewNavigationStateChange = async (newNavState) => {
        const { url } = newNavState
        if (!url) return
        if (url.includes('/paypal-checkout-success') || url.includes('/paypal-checkout-cancel')) {
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
        if (params?.organization_id && params?.paymentId && params?.PayerID) {
            try {
                const body = {
                    organization_id: +params.organization_id,
                    paymentId: params.paymentId,
                    PayerID: params.PayerID.replace('/', ''),
                    status: route?.params?.status
                }
                //console.log('body from url paypal', body)

                if (url.includes('/paypal-checkout-success')) {
                    api.subscription.paypalSuccess(body).then((res) => {
                        if (res.success) {
                            //   dispatch(makeSubscribed())
                            navigation.navigate('SubscriptionList', { refresh: true })
                        }
                    }).catch((err) => {
                        // dispatch(setInitialPlan(null))
                        navigation.dispatch(StackActions.popToTop())
                    })
                } else if (url.includes('/paypal-checkout-cancel')) {
                    api.subscription.paypalCancel(body).then((res) => {
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
                    source={{ uri: paypalUrl }}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                />)}
                {
                    !showWebView && <View style={s.loaderView}><ActivityIndicator size="large" color={colors.HOVER} /></View>
                }
            </View>
        </SafeAreaView>
    )
}

export default PaypalPaymentScreen

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
