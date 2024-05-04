import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Alert } from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'
import colors from '../../assets/constants/colors'
import CButton from '../../components/common/CButton'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CText from '../../components/common/CText'
import g from '../../assets/styles/global'
import PreferencesModal from '../../components/modals/PreferencesModal'
import LanguagePreferenceModal from '../../components/modals/LanguagePreferenceModal'
import CButtonInput from '../../components/common/CButtonInput'
import api from '../../api/api'
import { isArray, values } from 'lodash'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { useSelector } from 'react-redux'

const Preferences = ({ navigation }) => {
  const [emailNotificationToggle, setEmailNotificationToggle] = useState(false)
  const [smsNotificationToggle, setSmsNotificationToggle] = useState(false)
  const [pushNotificationToggle, setPushNotificationToggle] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [openLanguageModal, setOpenLanguageModal] = useState(false)
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false)
  const [timeZoneIndex, setTimeZoneIndex] = useState({ index: -1 })
  const [timeZone, setTimeZone] = useState('')
  const [selectedDateFormat, setSelectedDateFormat] = useState({})
  const [selectedLanguage, setSelectedLanguage] = useState({})
  const [userSettings, setUserSettings] = useState([])
  const [dateFormats, setDateFormats] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(state => state.user)

  const onPress = () => {
    navigation.goBack()
  }

  const handleSend = () => {
    //console.log('pressed')
    // console.log(
    //   selectedDateFormat,
    //   selectedLanguage,
    //   emailNotificationToggle,
    //   smsNotificationToggle,
    //   pushNotificationToggle
    // )
    const body = {
      date_format: selectedDateFormat.value,
      language: selectedLanguage.language.toLowerCase(),
    }
    api.user
      .changeUserSettings(body)
      .then((response) => {
        //console.log(response)
        navigation.goBack()
      })
      .catch((err) => {})
  }

  useEffect(() => {
    Promise.all([api.dateFormat.getDateFormat({ allData: true }), api.user.getUserSettings()])
      .then((values) => {
        // //console.log('Date Formates', values[0])
        setDateFormats(values[0])

        // //console.log('Prev settings', values[1])
        if (values[1].settings?.date_format) {
          const dateFormatObj = values[0].find(
            (date) => date.value == values[1].settings.date_format
          )
          const newDateFormatObj = { id: dateFormatObj?.id, name: dateFormatObj?.name }
          setSelectedDateFormat(newDateFormatObj)
        }
        // if (values[1].settings?.time_zone != 'null' && values[1].settings?.time_zone != '') setTimeZone(values[1].settings?.time_zone)
        setEmailNotificationToggle(values[1].settings.is_email_notify)
        // //console.log(values[1].settings.is_email_notify)
        setSmsNotificationToggle(values[1].settings.is_sms_notify)
        setPushNotificationToggle(values[1].settings.is_push_notify)
        setSelectedLanguage({ language: values[1].settings.language.toUpperCase() })
        setTimeZone(user?.time_zone)
        setTimeZoneIndex({ item: { value: user?.time_zone } })
      })
      .catch((err) => {
        //console.log(err, 'here')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <SafeAreaView style={[g.safeAreaStyle, { backgroundColor: colors.WHITE }]}>
      <PreferencesModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedDateFormat={selectedDateFormat}
        setSelectedDateFormat={setSelectedDateFormat}
        dateFormats={dateFormats}
      />
      <LanguagePreferenceModal
        openLanguageModal={openLanguageModal}
        setOpenLanguageModal={setOpenLanguageModal}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      <TimeZoneModal
        visibility={showTimeZoneModal}
        setVisibility={setShowTimeZoneModal}
        selectedIndex={timeZoneIndex}
        setSelectedIndex={setTimeZoneIndex}
      />
      <View style={{ marginHorizontal: 16 }}>
        <CHeaderWithBack title="Preferences" containerStyle={{ marginTop: 0 }} onPress={onPress} />
      </View>
      <ScrollView
        contentContainerStyle={{ flex: 1, marginBottom: 60, justifyContent: 'space-between' }}
      >
        <View>
          <View style={[styles.formContainer]}>
            <CSelectWithLabel
              label="Date format"
              onPress={() => setOpenModal(true)}
              selectText={selectedDateFormat?.name ? selectedDateFormat?.name : 'Select'}
            />
            <CSelectWithLabel
              onPress={() => setShowTimeZoneModal(true)}
              label="Time zone"
              selectText={
                timeZoneIndex.index != -1
                  ? timeZoneIndex.item.value
                  : timeZone !== ''
                    ? timeZone
                    : 'Select'
              }
              showLabel
            />
            <CSelectWithLabel
              label="Language"
              onPress={() => setOpenLanguageModal(true)}
              selectText={selectedLanguage?.language ? selectedLanguage?.language : 'Select'}
            />
          </View>


        </View>
        <View style={[styles.formContainer]}>
          <CButtonInput style={[g.button, styles.btnText]} label="Save" onPress={handleSend} />
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
  formContainer: {
    marginHorizontal: 20,
    // marginTop: 20,
  },
  notificationContainer: {
    marginTop: 20,
    marginHorizontal: 23,
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

  btnText: {
    color: colors.WHITE,
  },
})

export default Preferences
