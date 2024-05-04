import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import CButton from '../../components/common/CButton'
import CInput from '../../components/common/CInput'
import CText from '../../components/common/CText'

import { Keyboard, KeyboardAvoidingView } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import LogoIcon from '../../assets/svg/logo_2.svg'
import useIsMounted from '../../hooks/useIsMounted'
import { login as loginAction } from '../../store/slices/auth'
import { getErrorMessage, hasEmailErrors, hasPasswordErrors } from '../../utils/Errors'

const SignIn = ({ navigation }) => {
  const dispatch = useDispatch()
  const mounted = useIsMounted()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
  })

  const handleSignIn = () => {
    if (
      hasEmailErrors(email, setErrorMessage) ||
      hasPasswordErrors(password, password, setErrorMessage)
    )
      return

    setLoading(true)
    dispatch(
      loginAction({
        email,
        password: password,
      })
    )
      .then((res) => {
        /* if (res.success) {
          dispatch(authenticateUser())
        } else {
          if (mounted()) Alert.alert('Login Failed. Check your credentials.')
        } */
      })
      .catch((err) => {
        //console.log(err, 'login error..........')
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
      })
  }

  if (!loading) {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.NORMAL }}>
        <StatusBar barStyle={'light-content'} backgroundColor={colors.NORMAL}/>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={[g.container, s.container]}>
            <LogoIcon />
            <Text style={s.subHeader}>Help run your business</Text>
            <CInput
              spaces={false}
              maxLength={255}
              placeholder="Email"
              style={s.input}
              value={email}
              setValue={setEmail}
              errorMessage={errorMessage.email}
            />
            <CInput
              spaces={false}
              password
              maxLength={16}
              placeholder="Password"
              style={s.input}
              value={password}
              setValue={setPassword}
              errorMessage={errorMessage.password}
            />

            <CButton
              onPress={handleSignIn}
              type={'white'}
              loading={loading}
              setLoading={setLoading}
              style={{ marginVertical: 16, height: 50 }}
            >
              <CText style={[g.button, s.btnText]}>Sign in</CText>
            </CButton>

            <CText style={{ marginTop: 16 }}>
              <Text onPress={() => navigation.navigate('PasswordReset')}>Forget Password?</Text>
            </CText>
            <CText style={{ marginTop: 64, marginBottom: 16 }}>
              Don’t have an account?{' '}
              <Text
                onPress={() => {
                  navigation.replace('SignUpEmail')
                }}
                style={{ color: colors.SIGN_IN_BTN_BG, textDecorationLine: 'underline' }}
              >
                Sign up here
              </Text>
            </CText>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    )
  }
  return (
    <View style={[g.container, s.container]}>
      <ActivityIndicator size="large" color={colors.WHITE} />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.NORMAL,
    padding: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 32,
  },
  subHeader: {
    color: colors.WHITE,
    marginBottom: 80,
    marginTop: 35,
    fontFamily: 'inter-regular',
    fontWeight: '500',
  },
  input: {
    minHeight: 50,
    maxHeight: 50,
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

export default SignIn
