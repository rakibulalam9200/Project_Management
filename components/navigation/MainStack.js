import AsyncStorage from '@react-native-async-storage/async-storage'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AcceptInvitationScreen from '../../screens/Auth/AcceptInvitationScreen'
import DomainSelect from '../../screens/Auth/DomainSelect'
import MFAVerification from '../../screens/Auth/MFAVerification'
import PasswordNew from '../../screens/Auth/PasswordNew'
import PasswordReset from '../../screens/Auth/PasswordReset'
import PasswordResetCode from '../../screens/Auth/PasswordResetCode'
import SignIn from '../../screens/Auth/SignIn'
import SignUpCode from '../../screens/Auth/SignUpCode'
import SignUpEmail from '../../screens/Auth/SignUpEmail'
import SignUpNewPassword from '../../screens/Auth/SignUpNewPassword'
import Spinner from '../../screens/Auth/Spinner'
import LoadingScreen from '../../screens/LoadingScreen'
import TermsOfService from '../../screens/TermsAndPrivacy/TermsOfService'
import { changeToken, checkToken } from '../../store/slices/auth'
import InitialSubscriptionStack from './InitialSubscriptionStack'
import NewCompanySubscriptionStack from './NewCompanySubscriptionStack'
import Tabs from './Tabs'

const Stack = createNativeStackNavigator()

export default function MainStack() {
  console.log('hit main stack.........')
  const { authenticated, showNewUserPasswordScreen, needMFAVerification } = useSelector(
    (state) => state.auth
  )
  const { user, domain } = useSelector((state) => state.user)

  const { subscribed, subscriptionNeededNewOrg, needIntialSubscription } = useSelector(
    (state) => state.subscription
  )
  console.log({subscribed,subscriptionNeededNewOrg,needIntialSubscription}, 'checked subscried after cancel plan')
  console.log({ authenticated, needMFAVerification })
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    async function init() {
      setLoading(true)
      const token = await AsyncStorage.getItem('token')
      console.log(token,'before token...................')
      // const refreshToken = await AsyncStorage.getItem('refreshtoken')

      // if (refreshToken && refreshToken.length) {
      //   // retrieve refreshtoken from Asyncstorage and set it to redux store auth
      //   dispatch(changeRefreshToken(refreshToken))
      // }

      if (token && token.length) {
        console.log(token,'token...................')
        // retrieve the token from Asyncstorage and set it to redux store auth
        dispatch(changeToken(token))

        // check the validity of the token from redux store and get the user data from server

        await dispatch(checkToken())
      }
      setLoading(false)
      // axios.interceptors.response.use(
      //   (res) => res,
      //   (err) => {
      //     //console.log(err, 'This is error')
      //     let status = err?.response?.status

      //     //console.log(status, 'This is status')
      //     if (status == 401) {
      //       dispatch(logout())
      //     }
      //     if (status === 403) {
      //       Alert.alert('This action is unauthorized.')
      //     }
      //     return Promise.reject(err)
      //   }
      // )
    }

    init()
  }, [])

  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
      }}
    >
      {!authenticated && loading && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
      {!authenticated && needMFAVerification && (
        <Stack.Screen name="MFAVerification" component={MFAVerification} />
      )}
      {authenticated && (
        <>
          {!domain && user.organizations && user.organizations.length > 1 ? (
            <Stack.Screen name="DomainSelect" component={DomainSelect} />
          ) : subscribed ? (
            <Stack.Screen name="Tabs" component={Tabs} />
          ) : !subscribed && subscriptionNeededNewOrg ? (
            <Stack.Screen name="NewCompanySubscription" component={NewCompanySubscriptionStack} />
          ) : !subscribed && !subscriptionNeededNewOrg && needIntialSubscription ? (
            <Stack.Screen name="Subscription" component={InitialSubscriptionStack} />
          ) : (
            <Stack.Screen name="Spinner" component={Spinner} />
          )}
          {/* {(!subscribed && !subscriptionNeededNewOrg) && <Stack.Screen name="Subscription" component={InitialSubscriptionStack} />}


          {!subscribed && subscriptionNeededNewOrg && (
            <>
              <Stack.Screen name="NewCompanySubscription" component={NewCompanySubscriptionStack} />

            </>
          )} */}

          {/* {(subscribed) && <Stack.Screen name="Tabs" component={Tabs} />} */}
        </>
      )}
      {!authenticated && !loading && !needMFAVerification && (
        <>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUpEmail" component={SignUpEmail} />
          <Stack.Screen name="PasswordReset" component={PasswordReset} />
          <Stack.Screen name="PasswordResetCode" component={PasswordResetCode} />
          <Stack.Screen name="PasswordNew" component={PasswordNew} />
          <Stack.Screen name="SignUpCode" component={SignUpCode} />
          <Stack.Screen name="SignUpNewPassword" component={SignUpNewPassword} />
          <Stack.Screen name="TermsOfService" component={TermsOfService} />
        </>
      )}

      {showNewUserPasswordScreen && (
        <Stack.Screen name="AcceptInvitation" component={AcceptInvitationScreen} />
      )}
    </Stack.Navigator>
  )
}
