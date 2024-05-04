//import liraries
import React, { Component, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native'
import { TouchableOpacity } from 'react-native'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import colors from '../../assets/constants/colors'
import RightAngularIcon from '../../assets/svg/arrow-right-blue.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import CButtonInput from '../../components/common/CButtonInput'
import ExpirePasswordDayPickerModal from '../../components/modals/ExpirePasswordDayPickerModal'
import RestrictPrevPassPickerModal from '../../components/modals/RestrictPrevPassPickerModal'
import LockoutAccountValuePickerModal from '../../components/modals/LockoutAccountValuePickerModal'
import UnlockAutoValuePickerModal from '../../components/modals/UnlockAutoValuePickerModal'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'

const allowedIPs = [
  { ip: '192.168.1.0/24' },
  { ip: '192.168.1.0/25' },
  { ip: '192.168.1.0/26' },
  { ip: '192.168.1.0/27' },
]

// create a component
const CompanySecurityScreen = ({ navigation, route }) => {
  const [requireStrongPassword, setRequireStrongPassword] = useState(false)
  const [expirePassword, setExpirePassword] = useState(false)
  const [expirePasswordValue, setExpirePasswordValue] = useState(90)
  const [openExpirePasswordModal, setOpenExpirePasswordModal] = useState(false)
  const [restrictPreviousPasswords, setRestrictPreviousPasswords] = useState(false)
  const [restrictPreviousPasswordsValue, setRestrictPreviousPasswordsValue] = useState(5)
  const [openRestrictPreviousPasswordsModal, setOpenRestrictPreviousPasswordsModal] =
    useState(false)
  const [lockoutAccount, setLockoutAccount] = useState(false)
  const [lockoutAccountValue, setLockoutAccountValue] = useState(10)
  const [openLockoutAccountModal, setOpenLockoutAccountModal] = useState(false)
  const [unlockAutomatically, setUnlockAutomatically] = useState(false)
  const [unlockAutomaticallyValue, setUnlockAutomaticallyValue] = useState(30)
  const [openUnlockAutomaticallyModal, setOpenUnlockAutomaticallyModal] = useState(false)
  const [allowedIpAddresses, setAllowedIpAddresses] = useState('')
  const [tabScreen, setTabScreen] = useState('password')

  const checkIfAgreed = (item) => {
    if (item === 'requireStrongPassword') {
      if (requireStrongPassword) {
        return true
      } else {
        return false
      }
    } else if (item === 'expirePassword') {
      if (expirePassword) {
        return true
      } else {
        return false
      }
    } else if (item === 'restrictPrevious') {
      if (restrictPreviousPasswords) {
        return true
      } else {
        return false
      }
    } else if (item === 'lockoutAccount') {
      if (lockoutAccount) {
        return true
      } else {
        return false
      }
    } else if (item === 'unlockAutomatically') {
      if (unlockAutomatically) {
        return true
      } else {
        return false
      }
    }
  }

  const toggleAgree = (item) => {
    if (item === 'requireStrongPassword') {
      setRequireStrongPassword(!requireStrongPassword)
    } else if (item === 'expirePassword') {
      setExpirePassword(!expirePassword)
    } else if (item === 'restrictPrevious') {
      setRestrictPreviousPasswords(!restrictPreviousPasswords)
    } else if (item === 'lockoutAccount') {
      setLockoutAccount(!lockoutAccount)
    } else if (item === 'unlockAutomatically') {
      setUnlockAutomatically(!unlockAutomatically)
    }
  }

  useEffect(() => {
    api.company
      .getCompanySecuritySettings()
      .then((res) => {
        //console.log(res)
        if (res.success) {
          setAllowedIpAddresses(res.settings.allowed_ip_address)
          setExpirePassword(res.settings.is_expire_password_after_day)
          setExpirePasswordValue(res.settings.expire_password_after_day)
          setLockoutAccount(res.settings.is_login_attempt)
          setLockoutAccountValue(res.settings.login_attempt)
          setRequireStrongPassword(res.settings.is_strong_password)
          setRestrictPreviousPasswords(res.settings.is_restrict_previous_password)
          setRestrictPreviousPasswordsValue(res.settings.restrict_previous_password)
          setUnlockAutomaticallyValue(res.settings.unlock_minute)
        }
      })
      .catch((err) => {
        //console.log(err)
      })
  }, [])

  const handleSave = () => {
    const body = {
      is_strong_password: requireStrongPassword,
      is_expire_password_after_day: expirePassword,
      expire_password_after_day: expirePasswordValue,
      is_restrict_previous_password: restrictPreviousPasswords,
      restrict_previous_password: restrictPreviousPasswordsValue,
      is_login_attempt: lockoutAccount,
      login_attempt: lockoutAccountValue,
      unlock_minute: unlockAutomaticallyValue,
      allowed_ip_address: allowedIpAddresses,
    }
    //console.log({ body })

    api.company
      .postCompanySecuritySettings(body)
      .then((res) => {
        if (res.success) {
          Alert.alert('Security Settings Updated Successfully')
        }
        //console.log(res)
      })
      .catch((err) => {
        //console.log(err)
      })
  }

  const handlePlusIconPress = () => {
    navigation.navigate('AddIPAddressScreen')
  }

  return (
    <SafeAreaView
      style={[
        { backgroundColor: colors.WHITE, flex: 1 },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <ExpirePasswordDayPickerModal
        visibility={openExpirePasswordModal}
        setVisibility={setOpenExpirePasswordModal}
        value={expirePasswordValue}
        setValue={setExpirePasswordValue}
      />
      <RestrictPrevPassPickerModal
        visibility={openRestrictPreviousPasswordsModal}
        setVisibility={setOpenRestrictPreviousPasswordsModal}
        value={restrictPreviousPasswordsValue}
        setValue={setRestrictPreviousPasswordsValue}
      />
      <LockoutAccountValuePickerModal
        visibility={openLockoutAccountModal}
        setVisibility={setOpenLockoutAccountModal}
        value={lockoutAccountValue}
        setValue={setLockoutAccountValue}
      />
      <UnlockAutoValuePickerModal
        visibility={openUnlockAutomaticallyModal}
        setVisibility={setOpenUnlockAutomaticallyModal}
        value={unlockAutomaticallyValue}
        setValue={setUnlockAutomaticallyValue}
      />

      <View style={{ flex: 1, marginBottom: 50 }}>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={{ width: '80%', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
            Security Settings
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
          <View style={s.container}>
            <View style={[g.containerBetween, s.tabContainer]}>
              <TouchableOpacity
                style={[s.tabButton, tabScreen === 'password' ? s.tabButtonActive : null]}
                onPress={() => {
                  setTabScreen('password')
                }}
              >
                <Text
                  style={[s.tabButtonText, tabScreen === 'password' ? s.tabButtonTextActive : null]}
                >
                  Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tabButton, tabScreen === 'allowedip' ? s.tabButtonActive : null]}
                onPress={() => {
                  setTabScreen('allowedip')
                }}
              >
                <Text
                  style={[
                    s.tabButtonText,
                    tabScreen === 'allowedip' ? s.tabButtonTextActive : null,
                  ]}
                >
                  Allowed IP
                </Text>
              </TouchableOpacity>
            </View>

            {tabScreen == 'password' && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
                  Account Password Settings
                </Text>

                <TouchableOpacity
                  style={[s.agreeTermsContainer]}
                  onPress={() => toggleAgree('requireStrongPassword')}
                >
                  {checkIfAgreed('requireStrongPassword') ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  <Text
                    style={{ marginLeft: 10, fontSize: 16, fontWeight: '400', color: colors.BLACK }}
                  >
                    Require strong password
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.agreeTermsContainer]}
                  onPress={() => toggleAgree('expirePassword')}
                >
                  {checkIfAgreed('expirePassword') ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  <Text
                    style={{ marginLeft: 10, fontSize: 16, fontWeight: '400', color: colors.BLACK }}
                  >
                    Expire password after
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      setOpenExpirePasswordModal(true)
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.SECONDARY,
                        marginRight: 10,
                      }}
                    >
                      {expirePasswordValue} days
                    </Text>
                    <RightAngularIcon style={{ marginTop: 5 }} fill={'#246BFD'} />
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.agreeTermsContainer]}
                  onPress={() => toggleAgree('restrictPrevious')}
                >
                  {checkIfAgreed('restrictPrevious') ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  <Text
                    style={{ marginLeft: 10, fontSize: 16, fontWeight: '400', color: colors.BLACK }}
                  >
                    Restrict previous{' '}
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      setOpenRestrictPreviousPasswordsModal(true)
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.SECONDARY,
                        marginRight: 10,
                      }}
                    >
                      {restrictPreviousPasswordsValue}
                    </Text>
                    <RightAngularIcon style={{ marginTop: 5 }} fill={'#246BFD'} />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.BLACK,
                      }}
                    >
                      passwords
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.agreeTermsContainer]}
                  onPress={() => toggleAgree('lockoutAccount')}
                >
                  {checkIfAgreed('lockoutAccount') ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  <Text
                    style={{ marginLeft: 10, fontSize: 16, fontWeight: '400', color: colors.BLACK }}
                  >
                    Lockout account after{' '}
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setOpenLockoutAccountModal(true)}
                  >
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.SECONDARY,
                        marginRight: 10,
                      }}
                    >
                      {lockoutAccountValue}
                    </Text>
                    <RightAngularIcon style={{ marginTop: 5 }} fill={'#246BFD'} />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.BLACK,
                      }}
                    >
                      login attempts
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.agreeTermsContainer]}
                  onPress={() => toggleAgree('unlockAutomatically')}
                >
                  {/* {checkIfAgreed('unlockAutomatically') ? <CheckedIcon /> : <CheckedEmptyIcon />} */}
                  <Text
                    style={{ marginLeft: 10, fontSize: 16, fontWeight: '400', color: colors.BLACK }}
                  >
                    Unlock automatically after
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setOpenUnlockAutomaticallyModal(true)}
                  >
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: '400',
                        color: colors.SECONDARY,
                        marginRight: 10,
                      }}
                    >
                      {unlockAutomaticallyValue} min
                    </Text>
                    <RightAngularIcon style={{ marginTop: 5 }} fill={'#246BFD'} />
                  </TouchableOpacity>
                </TouchableOpacity>
                {/* <View style={{ marginTop: 24 }}>

								<CInputWithLabel label='Allowed IP address' placeholder='___.___.___.___' value={allowedIpAddresses} setValue={setAllowedIpAddresses} />
							</View> */}
              </View>
            )}

            {tabScreen == 'allowedip' && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    paddingVertical: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.SEC_BG,
                  }}
                >
                  Allowed IP list:
                </Text>

                {allowedIPs.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '400', color: colors.BLACK }}>
                      {item.ip}
                    </Text>
                    <TouchableOpacity>
                      <DeleteIcon />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        {tabScreen == 'password' && (
          <View style={{ paddingHorizontal: 16, width: '100%', marginBottom: 8 }}>
            <CButtonInput label="Save" onPress={handleSave} />
          </View>
        )}
      </View>
      <View style={{}}>
        {tabScreen == 'allowedip' && (
          <CFloatingPlusIcon style={{ bottom: 30 }} onPress={handlePlusIconPress} />
        )}
      </View>
    </SafeAreaView>
  )
}

// define your styles
const s = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    backgroundColor: colors.WHITE,
    // borderWidth: 1,
    // paddingHorizontal: 16,
  },
  agreeTermsContainer: {
    // paddingHorizontal: 16,
    // borderWidth: 1,
    backgroundColor: colors.WHITE,
    height: 30,
    // borderWidth: 1,
    // borderBottomColor: colors.SEC_BG,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContainer: {
    borderRadius: 20,
    backgroundColor: colors.START_BG,
    marginVertical: 16,
  },
  tabButton: {
    width: '50%',
    borderRadius: 20,
    // backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  tabButtonText: {
    color: colors.BLACK,
    // fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
})

//make this component available to the app
export default CompanySecurityScreen
