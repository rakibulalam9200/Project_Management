import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Alert,
  Text,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import CText from '../../components/common/CText'
import CInput from '../../components/common/CInput'
import CButton from '../../components/common/CButton'

import auth from '../../assets/constants/auth'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { forgotSendMail } from '../../store/slices/auth'
import { getErrorMessage, hasEmailErrors } from '../../utils/Errors'

const PasswordReset = ({ navigation }) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const dispatch = useDispatch()
  const [password, setPassword] = useState(null)
  const [errorMessage, setErrorMessage] = useState({
    email: '',
  })

  const handleSend = async () => {
    if (hasEmailErrors(email, setErrorMessage)) return

    dispatch(
      forgotSendMail({
        email: email,
      })
    )
      .then((res) => {
        if (res.success) {
          navigation.navigate('PasswordResetCode')
        }
      })
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
  }
  const handleBackClick = () => {
    navigation.replace('SignIn')
  }
  if (!loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.NORMAL }}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1, backgroundColor: colors.NORMAL }}
        >
          <View style={[g.container, s.container]}>
            <CText style={[g.h1, s.title]}>Password Reset</CText>
            <CText style={s.infoText}>
              Enter your registered email below to receive password reset instruction
            </CText>
            <CInput
              spaces={false}
              maxLength={255}
              placeholder="Email"
              style={s.input}
              value={email}
              setValue={setEmail}
              errorMessage={errorMessage.email}
            />
            <CButton onPress={handleSend} type={'white'} style={{ height: 50 }}>
              <CText style={[g.button, s.btnText]}>Send</CText>
            </CButton>
            <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72, height: 50 }}>
              <CText style={[g.button]}>
                <Text onPress={() => navigation.goBack()}>← Cancel</Text>
              </CText>
            </CButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    maxHeight: 50,
    minHeight: 50,
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

export default PasswordReset
