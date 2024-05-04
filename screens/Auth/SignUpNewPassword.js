import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CButton from '../../components/common/CButton'
import CInput from '../../components/common/CInput'
import CText from '../../components/common/CText'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import useIsMounted from '../../hooks/useIsMounted'
import { authenticateUser, newUserPassword } from '../../store/slices/auth'
import { getErrorMessage, hasPasswordErrors } from '../../utils/Errors'

const SignUpNewPassword = ({ navigation }) => {
  const dispatch = useDispatch()
  const mounted = useIsMounted()
  const { signUpPasswordToken } = useSelector((state) => state.auth)
  const [password, setPassword] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    password: '',
  })

  const handleResetPassword = () => {
    if (hasPasswordErrors(password, rPassword, setErrorMessages)) return
    setLoading(true)
    dispatch(
      newUserPassword({
        token: signUpPasswordToken,
        password: password,
        confirm_password: rPassword,
      })
    )
      .then((res) => {
        console.log(res,"response...............")
        if (res.success) {
          dispatch(authenticateUser())
        }
      })
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
      })
  }
  const handleBackClick = () => {
    navigation.replace('SignIn')
  }
  if (!loading) {
    return (
      <View style={[g.container, s.container]}>
        <CText style={[g.h1, s.title]}>Create new password</CText>
        <CText style={s.infoText}>Enter your password.</CText>

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
        <CButton onPress={handleResetPassword} type={'white'} style={{ marginTop: 16, height: 50 }}>
          <CText style={[g.button, s.btnText]}>Create Password</CText>
        </CButton>
        <CButton onPress={handleBackClick} type={'empty'} style={{ marginTop: 72, height: 50 }}>
          <CText style={[g.button]}>
            <Text>← Cancel</Text>
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
    textAlign: 'center'
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

export default SignUpNewPassword
