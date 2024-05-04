import { View, StyleSheet, ActivityIndicator, BackHandler, Alert, Text } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CText from '../../components/common/CText'
import CInput from '../../components/common/CInput'
import CCodeInput from '../../components/common/CCodeInput'
import CButton from '../../components/common/CButton'
import EmailSentIcon from '../../assets/svg/email_sent.svg'

import { getTime } from '../../utils/Timer'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { verifyCode, forgotSendMail, decrementResendEmailTimer } from '../../store/slices/auth'
import { hasCodeErrors } from '../../utils/Errors'

const PasswordResetCode = ({ navigation }) => {
  const dispatch = useDispatch()
  const { forgotMail, resendEmailTimer } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState({
    code: '',
  })

  const handleCodeEntered = () => {
    if (hasCodeErrors(code, setErrorMessage)) return

    dispatch(
      verifyCode({
        email: forgotMail,
        code: code,
      })
    )
      .then((res) => {
        if (res.success) {
          navigation.navigate('PasswordNew')
        }
      })
      .catch(function (error) {
        if (error.response) {
          const data = error.response.data
          if (data.errors.message) Alert.alert(data.errors.message[0])
        }
      })
  }

  const handleResend = async () => {
    dispatch(
      forgotSendMail({
        email: forgotMail,
      })
    )
      .then((res) => {
        if (res.success) {
          navigation.navigate('PasswordResetCode')
        }
      })
      .catch(function (err) {
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
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decrementResendEmailTimer())
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  if (!loading) {
    return (
      <View style={[g.container, s.container]}>
        <View style={s.containerMiddle}>
          <EmailSentIcon />
        </View>
        <CText style={[g.h1, s.title]}>Email Has Been Sent!</CText>
        <CText style={s.infoText}>
          Check your e-mail, shortly you will receive a code to reset your password.
        </CText>

        <CCodeInput value={code} setValue={setCode} errorMessage={errorMessage.code} textColor={{ color: colors.BLACK }} bgColor={{ backgroundColor: colors.CONTAINER_BG }} />
        <CButton onPress={handleCodeEntered} type={'white'} style={{ height: 50 }}>
          <CText style={[g.button, s.btnText]}>Verify Code</CText>
        </CButton>

        {resendEmailTimer != 0 && (
          <>
            <CText style={{ marginTop: 28 }}>Didn't recieve a code?</CText>
            <CText>You can request a new code within {getTime(resendEmailTimer)}</CText>
          </>
        )}
        {resendEmailTimer == 0 && (
          <Text
            onPress={handleResend}
            style={{ color: colors.SIGN_IN_BTN_BG, textDecorationLine: 'underline', marginTop: 10 }}
          >
            Resend Code
          </Text>
        )}
        <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72, height: 50 }}>
          <CText style={[g.button]}>
            <Text onPress={() => navigation.goBack()}>← Cancel</Text>
          </CText>
        </CButton>
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
    marginBottom: 16,
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

export default PasswordResetCode
