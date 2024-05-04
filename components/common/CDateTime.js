import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'

import DateTimePickerModal from 'react-native-modal-datetime-picker'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import ClockIcon from '../../assets/svg/clock.svg'
import EditIcon from '../../assets/svg/edit.svg'
import { dateFormatter, getDate, getHourMinutes, getSpiltDateTime } from '../../utils/Timer'

export default function CDateTime({
  style,
  onPress,
  pickedDate,
  setPickedDate,
  showLabel = false,
  type = 'date',
  label = '',
  icon = false,
  dateFormate = false,
  noIcon = false,
  containerStyle,
  flex = { flex: 1 },
  disabled=false
  // editable=true
}) {
  //console.log('type...................', type)

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date) => {
    setPickedDate(date)
    hideDatePicker()
  }
  return (
    <View style={[flex, containerStyle]}>
      {showLabel ? <Text style={s.inputHeader}>{label}</Text> : <></>}
      <TouchableOpacity style={[s.dateTimeContainer, style, disabled && {backgroundColor:'#F5F7FA'}]} onPress={showDatePicker} disabled={disabled}>
        <Text style={[s.dateTimeText, disabled && {color:'#999'}]}>
          {dateFormate && pickedDate
            ? dateFormatter(pickedDate)
            : pickedDate
            ? type == 'date'
              ? getDate(pickedDate)
              : type === 'time'
              ? getHourMinutes(pickedDate)
              : getSpiltDateTime(pickedDate)
            : type === 'time'
            ? `__:__`
            : `__. __. ____ _:_`}
        </Text>
        {!noIcon &&
          (icon ? (
            <EditIcon fill={colors.ICON_BG} />
          ) : type == 'time' ? (
            <ClockIcon />
          ) : (
            <CalendarIcon fill={colors.ICON_BG} />
          ))}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode={type}
          is24Hour
          // locale="en_GB"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={pickedDate ? new Date(pickedDate) : new Date()}
        />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  dateTimeContainer: {
    backgroundColor: colors.START_BG,
    width: '100%',
    color: colors.BLACK,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  dateTimeText: {
    fontFamily: 'inter-medium',
    color: colors.NORMAL,
    fontSize: 16,

    // fontWeight: '600',
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
    // borderWidth: 1
  },
})
