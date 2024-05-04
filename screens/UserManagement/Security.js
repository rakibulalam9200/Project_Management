import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native'

import { SafeAreaView } from 'react-native'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import colors from '../../assets/constants/colors'
import ToggleSwitch from 'toggle-switch-react-native'
import DeleteWhite from '../../assets/svg/delete_white.svg'
import BlueDelete from '../../assets/svg/delete-2.svg'
import CInput from '../../components/common/CInput'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import { getErrorMessage, hasPasswordErrors } from '../../utils/Errors'
import api from '../../api/api'
import { useIsFocused } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import DeleteMFAPhoneModal from '../../components/modals/DeleteMFAPhoneModal'
import CInputWithLabel from '../../components/common/CInputWithLabel'

const devicesMockData = [
  {
    title: 'This Session',
    lastActivity: 'seconds ago',
  },
  {
    title: 'Chrome on Windows',
    lastActivity: '10:09:2022 18:46',
  },
  {
    title: 'Windows 11',
    lastActivity: '10:09:2022 18:46',
  },
]

const Security = ({ navigation }) => {
  const [isMultiAuthorization, setIsMultiAuthorization] = useState(false)
  const [old_password, setOldPassword] = useState('')
  const [new_password, setNewPassword] = useState('')
  const [confirm_password, setConfirmPassword] = useState('')
  const { user } = useSelector((state) => state.user)
  const [securityScreen, setSecurityScreen] = useState('password')
  const [showMFADeleteModal, setShowMFADeleteModal] = useState(false)
  //console.log(user)
  const [errorMessage, setErrorMessage] = useState({
    password: '',
  })

  const isFocused = useIsFocused()

  const onPress = () => {
    navigation.goBack()
  }

  // change password
  const handleSend = () => {
    //console.log('Checking')
    if (hasPasswordErrors(new_password, confirm_password, setErrorMessage)) {
      //console.log(errorMessage)
      return
    }

    const body = {
      old_password,
      new_password,
      confirm_password,
    }

    api.user
      .userPasswordReset(body)
      .then((response) => {
        if (response.success) {
          navigation.goBack()
        }
      })
      .catch((err) => {
        //console.log(err)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
          //console.log(errMsg)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(`${errMsg}`)
      })
  }

  // disable multifactor auth
  // const disableMultiFactorAuth = () => {

  //   //console.log('Disable hobe')
  //   api.user.changeUserSettings({ is_multi_authorization: false })
  //     .then((response) => {
  //       if (response.success) {
  //         Alert.alert('Multifactor Authentication is disabled')
  //         setIsMultiAuthorization(false)
  //       }
  //     })
  //     .catch((err) => {
  //       //console.log(err)
  //     }
  //     )

  // }

  // Need to work tomorrow, need to be clear about phone number to verify code
  // Send verification code to email or phone
  const sendVerificationCode = () => {
    api.user
      .sendVerificationCodeToEmailOrPhone()
      .then((response) => {
        if (response.success) {
          //console.log(response)
          navigation.navigate('MultifactorVerifyCode', {
            initialCodeVerify: true,
            disable: true,
            phone: user.mfa_phone,
          })
          // Alert.alert('Verification code sent')
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        Alert.alert('An error occurred. Please try again later')
      })
    // api.user.changeUserSettings({ is_multi_authorization: 0 })
    //   .then((response) => {
    //     if (response.success) {
    //       // Alert.alert('Multifactor Authentication is disabled')
    //       // setEnabled(false)
    //       // setShowAcceptedModal(true)
    //       // setIsMultiAuthorization(false)

    //     }
    //   })
    //   .catch((err) => {
    //     //console.log(err)
    //   })
  }

  // get user settings
  useEffect(() => {
    if (isFocused) {
      api.user
        .getUserSettings()
        .then((response) => {
          if (response.success) {
            //console.log({ response })
            setIsMultiAuthorization(response.settings.is_multi_authorization)
          }
        })
        .catch((err) => {
          //console.log(err)
        })
    }
  }, [isFocused])

  const handleOnpressMFAOnOffButton = () => {
    if (!isMultiAuthorization) {
      navigation.navigate('MultifactorAuth')
    } else {
      sendVerificationCode()
    }
  }

  const handleDeleteMFAPhone = () => {
    setShowMFADeleteModal(false)
    sendVerificationCode()
  }

  return (
    <SafeAreaView style={[g.safeAreaStyle, styles.container]}>
      <DeleteMFAPhoneModal
        visibility={showMFADeleteModal}
        setVisibility={setShowMFADeleteModal}
        onDelete={handleDeleteMFAPhone}
      />
      <View style={{ marginHorizontal: 16 }}>
        <CHeaderWithBack title="Security" onPress={onPress} containerStyle={{ marginTop: 0 }} />
      </View>
      <ScrollView contentContainerStyle={{ flex: 1, marginBottom: 60, paddingHorizontal: 16 }}>
        <View style={[styles.tabContainer]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              securityScreen == 'password' ? styles.tabActiveButton : styles.inActiveButton,
            ]}
            onPress={() => {
              setSecurityScreen('password')
            }}
          >
            <Text
              style={[
                styles.tabButtonText,
                securityScreen == 'password' ? styles.tabButtonTextActive : null,
              ]}
            >
              Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              securityScreen == 'mfa' ? styles.tabActiveButton : styles.inActiveButton,
            ]}
            onPress={() => {
              setSecurityScreen('mfa')
            }}
          >
            <Text
              style={[
                styles.tabButtonText,
                securityScreen == 'mfa' ? styles.tabButtonTextActive : null,
              ]}
            >
              MFA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              securityScreen == 'devices' ? styles.tabActiveButton : styles.inActiveButton,
            ]}
            onPress={() => {
              setSecurityScreen('devices')
            }}
          >
            <Text
              style={[
                styles.tabButtonText,
                securityScreen == 'devices' ? styles.tabButtonTextActive : null,
              ]}
            >
              My Devices
            </Text>
          </TouchableOpacity>
        </View>
        {/* <View style={[styles.twoFactorToggle]}>
          <Text style={[styles.twofactorText]}>Two-factor authentication</Text>
          <ToggleSwitch
            isOn={isMultiAuthorization}
            onColor="green"
            offColor={colors.SEC_BG}
            labelStyle={{ color: 'black', fontWeight: '900' }}
            size="medium"
            onToggle={(isOn) => {
              if (isOn) {
                //console.log('On')
                // sendVerificationCode()
                navigation.navigate('MultifactorAuth')
                // navigation.navigate('MultifactorVerifyCode', { initialCodeVerify: true })
              } else {
                //console.log('Off')
                // Alert.alert('Under Construction')
                // disableMultiFactorAuth()
                sendVerificationCode()
              }
              setIsMultiAuthorization(isOn)
            }}
            animationSpeed={150}
          />
        </View> */}

        {securityScreen == 'password' && (
          <View style={{ justifyContent: 'space-between', flex: 1 }}>
            <View>
              <CInputWithLabel
                placeholder="*************"
                style={styles.input}
                value={old_password}
                setValue={setOldPassword}
                password
                label="Old Password"
              />

              <CInputWithLabel
                placeholder="*************"
                style={styles.input}
                value={new_password}
                setValue={setNewPassword}
                password
                label="New Password"
              />
              <CInputWithLabel
                placeholder="*************"
                style={styles.input}
                value={confirm_password}
                setValue={setConfirmPassword}
                password
                label="Repeat New Password"
              />
            </View>
            <View style={[styles.formContainer]}>
              <CButtonInput style={[g.button, styles.btnText]} label="Save" onPress={handleSend} />
            </View>
          </View>
        )}

        {securityScreen == 'mfa' && (
          <View style={{ marginHorizontal: 16 }}>
            <View style={styles.mfaOnContainer}>
              <Text style={styles.mfaText}>Protect your account with 2-step verification</Text>
              <CButtonInput
                style={[g.button, styles.btnText]}
                label={isMultiAuthorization ? 'Turn Off' : 'Turn On'}
                onPress={handleOnpressMFAOnOffButton}
              />
            </View>
            {isMultiAuthorization && (
              <View style={styles.mfaNumberContainer}>
                <View style={styles.mfaCard}>
                  <Text style={{ color: colors.LIGHT_GRAY }}>Phone number:</Text>
                  <Text style={{ fontSize: 22, fontWeight: '600' }}>{user.mfa_phone}</Text>
                  <Text style={{ marginTop: 16, fontSize: 18, color: colors.GREEN_NORMAL }}>
                    Verified
                  </Text>
                  <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
                    Verification codes are sent by text messages.
                  </Text>
                  <TouchableOpacity
                    style={[styles.buttonContainer]}
                    onPress={() => {
                      setShowMFADeleteModal(true)
                    }}
                  >
                    <DeleteWhite />
                    <Text style={[styles.buttonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {securityScreen == 'devices' && (
          <View style={{}}>
            {devicesMockData.map((item, index) => {
              return (
                <View style={[styles.devicesCard]} key={index}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
                    <BlueDelete />
                  </View>
                  <Text style={{ marginTop: 16, fontSize: 16, color: colors.LIGHT_GRAY }}>
                    Last activity:
                  </Text>
                  <Text style={{ fontSize: 16 }}>{item.lastActivity}</Text>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
  },
  twofactorText: {
    fontWeight: '400',
    fontSize: 16,
  },

  devicesCard: {
    borderWidth: 1,
    borderColor: colors.SEC_BG,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 30,
    backgroundColor: colors.LIGHT_GRAY,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  buttonText: {
    color: colors.WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },
  mfaNumberContainer: {
    marginVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.SEC_BG,
    paddingVertical: 16,
  },
  mfaCard: {
    borderWidth: 1,
    borderColor: colors.SEC_BG,
    borderRadius: 10,
    padding: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mfaOnContainer: {
    marginVertical: 16,
    width: '60%',
    alignSelf: 'center',
  },

  mfaText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },

  twoFactorToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
  },
  input: {
    // backgroundColor: colors.PRIM_BG,
    color: colors.INPUT_BG,
    // maxHeight: 64,
    // minHeight: 48,
    // borderWidth: 1
    maxHeight: 50,
    // minHeight: 50,
  },
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    backgroundColor: colors.WHITE,
  },
  formContainer: {
    // marginHorizontal: 16,
    // borderWidth: 1
  },
  btnText: {
    color: colors.WHITE,
    // height: 50,
    paddingVertical: 12,
  },
  tabContainer: {
    marginBottom: 20,
    // marginTop: 10,
    borderRadius: 20,
    // backgroundColor: colors.WHITE,
    // paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    width: '30%',
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  tabActiveButton: {
    backgroundColor: colors.ICON_BG,
  },
  inActiveButton: {
    backgroundColor: colors.SEC_BG,
  },
  tabButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: colors.WHITE,
    fontWeight: '700',
  },
})

export default Security
