import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import Calender from '../../assets/svg/calendar.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'

export default function SelectButtonWithArrow({
  label = '',
  showLabel = true,
  style,
  titleStyle,
  onPress = null,
  selectText = 'Select',
  errorMessage = '',
  showErrorMessage = false,
  required = false,
  showDate = false,
  containerStyle,
  disabled = false,
}) {
  return (
    <View style={[s.container, containerStyle]}>
      <View style={[{ flexDirection: 'row', justifyContent: 'flex-start' }]}>
        {showLabel && <Text style={s.inputHeader}>{label}</Text>}
        {required && <Text style={{ fontSize: 12, color: colors.HEADER_TEXT }}>*</Text>}
      </View>

      <View
        style={[s.inputStyle, style, disabled && { backgroundColor: '#F5F7FA' }]}
        onPress={onPress}
      >
        <Text style={[s.selectText, titleStyle, disabled && { color: '#999' }]}>{selectText}</Text>
        {showDate ? (
          <Calender fill={colors.SECONDARY} />
        ) : (
          <RightArrowIcon fill={colors.HEADER_TEXT} />
        )}
      </View>
      {showErrorMessage ? <Text style={s.errorMessage}>{errorMessage}</Text> : <></>}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 2,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 8,
    // paddingVertical: 24,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.HOME_TEXT,
  },
})
