import React from 'react'
import { useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Platform, StatusBar, Alert } from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'
import colors from '../../assets/constants/colors'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import g from '../../assets/styles/global'
import api from '../../api/api'
import { useEffect } from 'react'
import { getErrorMessage } from '../../utils/Errors'

const NotificationSettings = ({ navigation }) => {
  const [financialToggle, setFinancialToggle] = useState(false)
  const [projectToggle, setProjectToggle] = useState(false)
  const [userManagementToggle, setUserManagementToggle] = useState(false)
  const [reportsToggle, setReportsToggle] = useState(false)
  const [emailNotificationToggle, setEmailNotificationToggle] = useState(false)
  const [smsNotificationToggle, setSmsNotificationToggle] = useState(false)
  const [pushNotificationToggle, setPushNotificationToggle] = useState(false)

  const onPress = () => {
    navigation.goBack()
  }

  const enableDisableAll = (enable) => {
    setEmailNotificationToggle(enable)
    setSmsNotificationToggle(enable)
    setPushNotificationToggle(enable)
    setFinancialToggle(enable)
    setProjectToggle(enable)
    setUserManagementToggle(enable)
    setReportsToggle(enable)

    handleSaveAll(enable)
  }


  const handleSaveAll = (enable) => {

    const body = {
      is_financial_notify: enable,
      is_project_notify: enable,
      is_user_management_notify: enable,
      is_report_notify: enable,
      is_email_notify: enable,
      is_sms_notify: enable,
      is_push_notify: enable,
    }

    api.user
      .changeUserSettings(body)
      .then((res) => {
        //console.log(res)
        Alert.alert('Settings updated successfully')
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }


  const handleSaveSingle = (enable, type) => {
    const body = {
      [type]: enable,
    }
    api.user
      .changeUserSettings(body)
      .then((res) => {
        //console.log(res)
        Alert.alert('Settings updated successfully')
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }


  useEffect(() => {
    api.user
      .getUserSettings()
      .then((res) => {
        //console.log(res)
        setFinancialToggle(res.settings.is_financial_notify)
        setProjectToggle(res.settings.is_project_notify)
        setUserManagementToggle(res.settings.is_user_management_notify)
        setReportsToggle(res.settings.is_report_notify)
        setEmailNotificationToggle(res.settings.is_email_notify)
        setSmsNotificationToggle(res.settings.is_sms_notify)
        setPushNotificationToggle(res.settings.is_push_notify)
      })
      .catch((err) => {})
  }, [])

  return (
    <SafeAreaView style={[
      { flex: 1, backgroundColor: colors.CONTAINER_BG },
      { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    ]}>
      <View style={{ marginHorizontal: 16 }}>
        <CHeaderWithBack title="Notification" onPress={onPress} containerStyle={{ marginTop: 0 }} />
      </View>
      <ScrollView contentContainerStyle={{ flex: 1, marginBottom: 60, justifyContent: 'space-between' }}>

        <View style={{ marginTop: 20, marginHorizontal: 23 }}>

          <View style={[styles.notificationContainer]}>
            <View style={[styles.notification]}>
              <Text style={[styles.notificationText]}>Email notification</Text>
              <ToggleSwitch
                isOn={emailNotificationToggle}
                onColor="green"
                offColor={colors.SEC_BG}
                labelStyle={{ color: 'black', fontWeight: '900' }}
                size="medium"
                onToggle={(isOn) => {
                  setEmailNotificationToggle(isOn)
                  handleSaveSingle(isOn, 'is_email_notify')
                }}
                animationSpeed={150}
              />
            </View>

            <View style={[styles.notification]}>
              <Text style={[styles.notificationText]}>SMS notification</Text>
              <ToggleSwitch
                isOn={smsNotificationToggle}
                onColor="green"
                offColor={colors.SEC_BG}
                labelStyle={{ color: 'black', fontWeight: '900' }}
                size="medium"
                onToggle={(isOn) => {
                  setSmsNotificationToggle(isOn)
                  handleSaveSingle(isOn, 'is_sms_notify')
                }}
                animationSpeed={150}
              />
            </View>

            <View style={[styles.notification]}>
              <Text style={[styles.notificationText]}>Push notification</Text>
              <ToggleSwitch
                isOn={pushNotificationToggle}
                onColor="green"
                offColor={colors.SEC_BG}
                labelStyle={{ color: 'black', fontWeight: '900' }}
                size="medium"
                onToggle={(isOn) => {
                  setPushNotificationToggle(isOn)
                  handleSaveSingle(isOn, 'is_push_notify')
                }}
                animationSpeed={150}
              />
            </View>
          </View>


          <View style={[styles.toggleContainer, { marginTop: 16 }]}>
            <Text style={[styles.notificationTitle]}>Project</Text>
            <ToggleSwitch
              isOn={projectToggle}
              onColor="green"
              offColor={colors.SEC_BG}
              labelStyle={{ color: 'black', fontWeight: '900' }}
              size="medium"
              onToggle={(isOn) => {
                setProjectToggle(isOn)
                handleSaveSingle(isOn, 'is_project_notify')
              }}
              animationSpeed={150}
            />
          </View>

          <View style={[styles.toggleContainer]}>
            <Text style={[styles.notificationTitle]}>Financial</Text>
            <ToggleSwitch
              isOn={financialToggle}
              onColor="green"
              offColor={colors.SEC_BG}
              labelStyle={{ color: 'black', fontWeight: '900' }}
              size="medium"
              onToggle={(isOn) => {
                setFinancialToggle(isOn)
                handleSaveSingle(isOn, 'is_financial_notify')
              }}
              animationSpeed={150}
            />
          </View>

          <View style={[styles.toggleContainer]}>
            <Text style={[styles.notificationTitle]}>User Management</Text>
            <ToggleSwitch
              isOn={userManagementToggle}
              onColor="green"
              offColor={colors.SEC_BG}
              labelStyle={{ color: 'black', fontWeight: '900' }}
              size="medium"
              onToggle={(isOn) => {
                setUserManagementToggle(isOn)
                handleSaveSingle(isOn, 'is_user_management_notify')
              }}
              animationSpeed={150}
            />
          </View>
          <View style={[styles.toggleContainer]}>
            <Text style={[styles.notificationTitle]}>Reports</Text>
            <ToggleSwitch
              isOn={reportsToggle}
              onColor="green"
              offColor={colors.SEC_BG}
              labelStyle={{ color: 'black', fontWeight: '900' }}
              size="medium"
              onToggle={(isOn) => {
                setReportsToggle(isOn)
                handleSaveSingle(isOn, 'is_report_notify')
              }}
              animationSpeed={150}
            />
          </View>
        </View>
        <View style={[styles.formContainer]}>
          <CButtonInput style={[styles.btnText, { backgroundColor: colors.LIGHT_GRAY, }]} label="Disable All" onPress={() => enableDisableAll(false)} />
          <CButtonInput style={[styles.btnText]} label="Enable All" onPress={() => enableDisableAll(true)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#D6E2FF',
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  btnText: {
    color: colors.WHITE,
    width: '48%',
    paddingHorizontal: 0,
  },
  formContainer: {
    marginHorizontal: 20,
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  notificationContainer: {
    // marginTop: 20,
    borderWidth: 1,
    borderColor: '#D6E2FF',
    borderRadius: 10,
    padding: 16,
  },

  notification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  notificationText: {
    fontSize: 16,
    fontWeight: '400',
  },

})

export default NotificationSettings
