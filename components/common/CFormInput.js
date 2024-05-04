import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import colors from '../../assets/constants/colors'

export default function CFormInput({
  value,
  setValue,
  placeholder = 'Place Holder',
  placeholderTextColor = colors.HEADER_TEXT,
  style,
}) {
  return (
    <View>
      <TextInput
        style={[s.inputStyle, style]}
        maxLength={255}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={setValue}
      />
    </View>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.HOME_TEXT,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '500',
  },
})
