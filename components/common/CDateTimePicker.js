import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import moment from 'moment-mini'
import React, { useState } from 'react'
import { Alert, Platform, StyleSheet, View } from 'react-native'
import CButton from './CButton'
import CModal from './CModal'
import CText from './CText'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const CDateTimePicker = ({ visible, setVisibility, setValue }) => {
  const [localTime, setLocalTime] = useState(Platform.OS === 'ios' ? new Date() : null)
  const [localDate, setLocalDate] = useState(Platform.OS === 'ios' ? new Date() : null)
  const [step, setStep] = useState('date')

  const handlePress = () => {
    if (step === 'date') {
      setStep('time')
      return
    }
    setVisibility(false)
    setValue({
      date: moment(localDate).format('MM.DD.YYYY'),
      time: moment(localTime).format('hh:mm A'),
    })
  }

  const callTimePicker = (date) => {
    DateTimePickerAndroid.open({
      value: new Date(),
      is24Hour: false,
      mode: 'time',
      onChange: (e, time) => {
        if (moment().format('MM.DD.YYYY') === moment(date).format('MM.DD.YYYY')) {
          if (moment(time).diff(moment(), 'minutes') < 0) {
            Alert.alert('Error', 'Time cannot be less than current', [{
              text: 'OK',
              onPress: () => {
                callTimePicker(date)
              },
            }])
            return
          }
        }

        if (e.type === 'dismissed') {
          setVisibility(false)
          return
        }
        setValue((ps) => ({
          ...ps,
          time: moment(time).format('hh:mm A'),
        }))
        setVisibility(false)
      },
    })
  }

  React.useLayoutEffect(() => {
    if (!visible) {
      setStep('date')
    }
    if (Platform.OS === 'android' && visible) {
      DateTimePickerAndroid.open({
        value: new Date(),
        is24Hour: false,
        minimumDate: new Date(),
        mode: 'date',
        onChange: (e, date) => {
          if (e.type === 'dismissed') {
            setVisibility(false)
            return
          }
          setValue({
            date: moment(date).format('MM.DD.YYYY'),
            time: moment(new Date()).format('hh:mm A'),
          })
          callTimePicker(date)
        },
      })
    }
  }, [visible])

  const handleChange = (_e, value) => {
    if (step === 'date') {
      setLocalDate(value)
    } else {
      setLocalTime(value)
    }
  }

  return Platform.OS === 'ios' ? (
    <CModal
      visibility={visible}
      setVisibility={setVisibility}
      bgStyle={{ padding: 23 }}
      wrapStyle={{ backgroundColor: colors.WHITE, borderRadius: 20 }}
      onRequestClose={() => setVisibility(false)}
    >
      <View style={{ width: '100%', pointerEvents: 'auto' }}>
        <DateTimePicker
          textColor={'black'}
          value={step === 'date' ? localDate : localTime}
          mode={step}
          minimumDate={step === 'time' ? moment().format('MM.DD.YYYY') === moment(localDate).format('MM.DD.YYYY') ? new Date() : null : new Date()}
          display="spinner"
          onChange={handleChange}
          is24Hour={false}
          locale="en-US"
        />
        <View style={{ paddingHorizontal: 30, paddingVertical: 20 }}>
          <CButton onPress={handlePress}>
            <CText style={[g.button]}>{step === 'date' ? 'Next' : 'Save'}</CText>
          </CButton>
        </View>
      </View>
    </CModal>
  ) : null
}

export default CDateTimePicker

const s = StyleSheet.create({})
