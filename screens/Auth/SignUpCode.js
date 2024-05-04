import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import EmailSentIcon from '../../assets/svg/email_sent.svg'
import CButton from '../../components/common/CButton'
import CText from '../../components/common/CText'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import {
  decrementResendSignUpEmailTimer,
  resendVerifyEmail,
  verifySignUpCode,
} from '../../store/slices/auth'

import { useEffect } from 'react'
import CCodeInput from '../../components/common/CCodeInput'
import useIsMounted from '../../hooks/useIsMounted'
import { getErrorMessage, hasCodeErrors } from '../../utils/Errors'
import { getTime } from '../../utils/Timer'

const SignUpCode = ({ navigation }) => {
  const dispatch = useDispatch()
  const mounted = useIsMounted()
  const { signUpEmail, resendSignUpEmailTimer } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [errorMessages, setErrorMessages] = useState({
    code: '',
  })

  const handleCodeEntered = () => {
    if (hasCodeErrors(code, setErrorMessages)) return
    //console.log('code entered', signUpEmail)
    setLoading(true)
    dispatch(
      verifySignUpCode({
        email: signUpEmail,
        code: code,
      })
    )
      .then((res) => {
        // console.log(res, 'verify sign up code ............')
        if (res.success) {
          if (!res.is_can_trial && res?.has_password) {
            navigation.navigate('SignIn')
          } else {
            navigation.navigate('SignUpNewPassword')
          }
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
      .finally(() => {
        if (mounted()) setLoading(false)
      })
  }

  const handleResendVerifyMail = () => {
    setLoading(true)
    dispatch(
      resendVerifyEmail({
        email: signUpEmail,
      })
    )
      .then((res) => {
        if (res.success) {
          Alert.alert('Verification Code Successfully sent.')
        }
      })
      .catch((err) => {
        if (err.response) {
          let errorMsg = getErrorMessage(err)
          Alert.alert(errorMsg)
        } else {
          //console.log(err)
        }
      })
      .finally(() => {
        if (mounted()) setLoading(false)
      })
  }
  const handleBackClick = () => {
    navigation.replace('SignIn')
  }

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(decrementResendSignUpEmailTimer())
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
          Check your e-mail, shortly you will receive a code to verify your email.
        </CText>

        <CCodeInput
          value={code}
          setValue={setCode}
          errorMessage={errorMessages.code}
          textColor={{ color: colors.BLACK }}
          bgColor={{ backgroundColor: colors.CONTAINER_BG }}
        />

        <CButton onPress={handleCodeEntered} type={'white'} style={{ height: 50 }}>
          <CText style={[g.button, s.btnText]}>Verify Code</CText>
        </CButton>
        <Text></Text>
        {resendSignUpEmailTimer != 0 && (
          <>
            <CText style={{ marginTop: 28 }}>Didn't recieve a code?</CText>
            <CText>You can request a new code within {getTime(resendSignUpEmailTimer)}</CText>
          </>
        )}
        {resendSignUpEmailTimer == 0 && (
          <Text
            onPress={handleResendVerifyMail}
            style={{
              color: colors.SIGN_IN_BTN_BG,
              textDecorationLine: 'underline',
              marginTop: 10,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            Resend Code
          </Text>
        )}
        <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72, height: 50 }}>
          <CText style={[g.button]}>
            <Text>← Back to Sign In</Text>
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

export default SignUpCode
