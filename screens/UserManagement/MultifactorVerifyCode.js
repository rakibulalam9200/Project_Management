import React, { useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native'
import colors from '../../assets/constants/colors'
import CCodeInput from '../../components/common/CCodeInput'
import CButtonInput from '../../components/common/CButtonInput'
import api from '../../api/api'
import { getErrorMessage } from '../../utils/Errors'
import MFAAcceptedModal from '../../components/modals/MFAAcceptedModal'
import { useDispatch, useSelector } from 'react-redux'
import { loadUser } from '../../store/slices/auth'

const MultifactorVerifyCode = ({ navigation, route }) => {

  const initialCodeVerify = route.params?.initialCodeVerify ?? false
  const disableMFA = route.params?.disable ?? false
  const { user } = useSelector(state => state.user)
  const [token, setToken] = useState('')
  const [enabled, setEnabled] = useState(true)
  const dispatch = useDispatch()
  const MFA_PHONE = route?.params?.phone ?? ''

  //console.log(disableMFA)

  const [errorMessage, setErrorMessage] = useState({
    code: '',
  })
  const [code, setCode] = useState('')
  const [showAcceptedModal, setShowAcceptedModal] = useState(false)

  // // Verify code
  const handleVerifyCode = () => {
    const body = {}
    if (initialCodeVerify) {
      //console.log('Initial code verify')
      body['code'] = code
      api.user.verifyInitialVerificationCode(body)
        .then(res => {
          //console.log(res)
          if (res.success) {
            if (disableMFA) {
              enableOrDisableMultiFactorAuth(res.token, false)
            } else {
              navigation.navigate('MultifactorAuth')
            }

          }
        })
        .catch(err => {
          //console.log(err.response.data)
          Alert.alert('Invalid code')
        })

    } else {
      body['phone'] = MFA_PHONE
      body['code'] = code

      //console.log('Pressed')
      api.user.verifySMSVerificationCode(body)
        .then(res => {
          //console.log(res)
          if (res.success) {
            //console.log({ res })
            // setToken(res.token)
            // setEnabled(true)

            enableOrDisableMultiFactorAuth(res.token, true)

            // setShowAcceptedModal(true)
            // navigation.navigate('MultifactorVerificationAccepted', { phone: route.params.phone })
          }
        })
        .catch(err => {
          //console.log(err.response.data)

          // uncomment for testing
          // setShowAcceptedModal(true)
          // navigation.navigate('MultifactorVerificationAccepted', { phone: route.params.phone })
          // need to remove after testing


          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
          //console.log(errMsg)
        })
    }

  }

  // Disable multifactor auth
  const enableOrDisableMultiFactorAuth = (vToken, enable) => {

    if (enable) {
      //console.log('Enable hobe')
      api.user.updateMFA({ mfa_phone: MFA_PHONE, token: vToken })
        .then((response) => {
          if (response.success) {
            // Alert.alert('Multifactor Authentication is disabled')
            setEnabled(true)
            setShowAcceptedModal(true)
            // setIsMultiAuthorization(false)

          }
        })
        .catch((err) => {
          //console.log(err)
        })
    } else {
      //console.log('Disable hobe')
      api.user.disableMFA({ token: vToken })
        .then((response) => {
          if (response.success) {
            // Alert.alert('Multifactor Authentication is disabled')
            setEnabled(false)
            setShowAcceptedModal(true)
            // setIsMultiAuthorization(false)

          }
        })
        .catch((err) => {
          //console.log(err)
        })
    }

  }


  const onPressOk = () => {
    //console.log('Pressed')
    navigation.navigate('Security')
    dispatch(loadUser())

  }


  // // Resend code
  const resendVerificationCode = () => {
    //console.log('Resending')
    const body = {
      phone: route.params.phone,
    }

    api.user.sendSMSVerificationCode(body)
      .then(res => {
        //console.log(res)
        if (res.success) {
          //console.log('Success')
          Alert.alert('Verification code sent')
        }
      })
      .catch(err => {
        //console.log(err.response.data)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }


  //Update user settings
  // const updateUserSettings = () => {
  //   if (enabled) {
  //     const body = {
  //       phone: route.params.phone,
  //       token: token
  //     }

  //     // api.user.updatePhoneNumber(body)
  //     //   .then(res => {
  //     //     //console.log(res)
  //     //     if (res.success) {
  //     //       //console.log('Success')
  //     //       navigation.navigate('Security')
  //     //     }
  //     //   })
  //     //   .catch(err => {
  //     //     //console.log(err.response.data)
  //     //     let errMsg = ''
  //     //     try {
  //     //       errMsg = getErrorMessage(err)
  //     //     } catch (err) {
  //     //       errMsg = 'An error occurred. Please try again later'
  //     //     }
  //     //     Alert.alert(errMsg)
  //     //   })
  //   } else if (!enabled) {
  //     navigation.navigate('Security')
  //   }

  // }

  return (
    <SafeAreaView style={[styles.container]}>
      <MFAAcceptedModal
        visibility={showAcceptedModal}
        setVisibility={setShowAcceptedModal}
        onPressOk={onPressOk}
        enabled={enabled}
      />
      <ScrollView>
        <View>
          <Text style={[styles.heading]}>Multifactor authentication verification</Text>
        </View>

        <View style={[styles.subHeadingContainer]}>
          <Text style={[styles.subHeading]}>
            To continue enter the 6-digit verification code sent to your {user.phone ? 'phone number' : 'email'}.
          </Text>
        </View>
        <View style={[styles.form]}>
          <CCodeInput
            value={code}
            setValue={setCode}
            errorMessage={errorMessage.code}
            bgColor={styles.inputBox}
            textColor={styles.codeText}
          />
        </View>
        <View style={[styles.form]}>
          <CButtonInput label="Verify Code" onPress={handleVerifyCode} />
        </View>

        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>

          <Text style={[styles.subHeading]}>Didn't receive the code?</Text>

          <TouchableOpacity style={{ marginLeft: 10 }}
            onPress={() => resendVerificationCode()}
          >
            <Text style={[styles.subHeading, { color: colors.SECONDARY, textAlign: 'center', textDecorationLine: 'underline' }]}>Resend</Text>

          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(1, 7, 20, 0.72)',
    flex: 1,
    paddingVertical: 151,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 50,
    color: colors.WHITE,
  },
  codeText: {
    color: colors.BLACK,
  },
  subHeadingContainer: {
    marginTop: 120,
    marginHorizontal: 24,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.WHITE,
  },
  form: {
    marginHorizontal: 24,
  },
  btnText: {
    color: colors.WHITE,
  },
  inputBox: {
    backgroundColor: colors.SEC_BG,
    color: 'black',
  },
})

export default MultifactorVerifyCode