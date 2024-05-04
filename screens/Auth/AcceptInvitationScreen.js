import * as Linking from 'expo-linking'
import QueryString from 'query-string'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CButton from '../../components/common/CButton'
import CInput from '../../components/common/CInput'
import CText from '../../components/common/CText'
import useIsMounted from '../../hooks/useIsMounted'
import {
  acceptInvitation,
  logout,
  setShowNewUserPasswordScreen
} from '../../store/slices/auth'
import { getErrorMessage, hasPasswordErrors } from '../../utils/Errors'

const AcceptInvitationScreen = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const mounted = useIsMounted()
  const url = Linking.useURL()
  let parsedUrl = QueryString.parseUrl(url ? url : '')
  let type = parsedUrl.query.type ? parsedUrl.query.type : 'invited'
  let token = route ? (route.params?.token ? route.params.token : '') : ''
  const [password, setPassword] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    password: '',
  })

  const handleResetPassword = async (checkPassword = true) => {
    if (checkPassword) {
      if (hasPasswordErrors(password, rPassword, setErrorMessages)) return
    }
    const body = {
      token: token,
      type: type,
    }
    if (type == 'invited') {
      body['password'] = password
      body['confirm_password'] = rPassword
    }

    console.log(body,'body...................')

    setLoading(true)
    dispatch(acceptInvitation(body))
      .then((res) => { })
      .catch((err) => {
        console.log(err?.response,"--------------------")
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        if (mounted()) setLoading(false)
        dispatch(setShowNewUserPasswordScreen(false))
      })
  }
  const handleBackClick = () => {
    dispatch(setShowNewUserPasswordScreen(false))
  }

  useEffect(() => {
    async function logoutSession() {
      await dispatch(logout())
      if (type == 'active') {
        await handleResetPassword(false)
      }
    }
    logoutSession()
  }, [])
  if (!loading) {
    return (
      <View style={[g.container, s.container]}>
        {type == 'invited' && (
          <>
            <CText style={[g.h1, s.title]}>Create new password</CText>
            <CText style={s.infoText}>Enter your password for your account.</CText>

            <CInput
              spaces={false}
              password
              placeholder="Password"
              maxLength={32}
              style={s.input}
              value={password}
              setValue={setPassword}
              errorMessage={errorMessages?.password}
            />

            <CInput
              spaces={false}
              password
              placeholder="Repeat password"
              maxLength={32}
              style={s.input}
              value={rPassword}
              setValue={setRPassword}
            />

            <CButton onPress={handleResetPassword} type={'white'}>
              <CText style={[g.button, s.btnText]}>Set Password</CText>
            </CButton>
            <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72 }}>
              <CText style={[g.button]}>
                <Text>← Back to Sign In</Text>
              </CText>
            </CButton>
          </>
        )}
      </View>
    )
  }
  return (
    <View style={[g.container, s.container]}>
      <ActivityIndicator size="large" color={colors.WHITE} />
    </View>
  )
}

const s = StyleSheet.create({
  containerMiddle: {
    flexDirection: 'row',
    marginBottom: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.NORMAL,
    padding: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 32,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    maxHeight: 64,
    color: colors.WHITE,
  },
  termsText: {
    marginLeft: 8,
  },
  terms: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  btnText: {
    color: colors.WHITE,
  },
})

export default AcceptInvitationScreen
