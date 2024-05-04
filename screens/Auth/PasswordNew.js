import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CButton from '../../components/common/CButton'
import CInput from '../../components/common/CInput'
import CText from '../../components/common/CText'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { resetPassword } from '../../store/slices/auth'
import { hasPasswordErrors } from '../../utils/Errors'

const PasswordNew = ({ navigation }) => {
  const dispatch = useDispatch()
  const { resetPasswordToken } = useSelector((state) => state.auth)
  const [password, setPassword] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [errorMessages, setErrorMessages] = useState({
    password: '',
  })

  const handleResetPassword = () => {
    if (hasPasswordErrors(password, rPassword, setErrorMessages)) return

    dispatch(
      resetPassword({
        token: resetPasswordToken,
        new_password: password,
        confirm_password: rPassword,
      })
    )
      .then((res) => {
        console.log('res.......',res)
        if (res.success) {
          navigation.replace('SignIn')
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
      <View style={[g.container, s.container]}>
        <CText style={[g.h1, s.title]}>Create password</CText>
        <CText style={s.infoText}>The new password must be different from the old password.</CText>

        <CInput
          maxLength={32}
          spaces={false}
          password
          placeholder="Password"
          style={s.input}
          value={password}
          setValue={setPassword}
          errorMessage={errorMessages?.password}
        />

        <CInput
          maxLength={32}
          spaces={false}
          password
          placeholder="Repeat password"
          style={s.input}
          value={rPassword}
          setValue={setRPassword}
        />
        <CButton onPress={handleResetPassword} type={'white'} style={{ height: 50, marginTop: 20 }}>
          <CText style={[g.button, s.btnText]}>Update Password</CText>
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

export default PasswordNew
