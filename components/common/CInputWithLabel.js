import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import colors from '../../assets/constants/colors'

export default function CInputWithLabel({
  value,
  setValue,
  label = '',
  showLabel = true,
  placeholder = '',
  placeholderTextColor = colors.HEADER_TEXT,
  errorMessage = '',
  showErrorMessage = false,
  required = false,
  style,
  containerStyle,
  editable = true,
  numeric = false,
  onFocus = null,
  onBlur = null,
  keyboardShow = false,
  multiline = false,
}) {
  // //console.log(showErrorMessage, 'show error message....')
  return (
    <View style={[s.container, containerStyle]} onStartShouldSetResponder={() => !keyboardShow}>
      <View style={[{ flexDirection: 'row', justifyContent: 'flex-start' }]}>
        {showLabel && <Text style={[s.inputHeader]}>{label}</Text>}
        {required && <Text style={{ fontSize: 12, color: colors.HEADER_TEXT }}>*</Text>}
      </View>
      <TextInput
        editable={editable}
        multiline={multiline}
        style={[s.inputStyle, style, !editable && { color: '#999', backgroundColor: '#F5F7FA' }]}
        maxLength={255}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={setValue}
        keyboardType={numeric ? 'numeric' : 'default'}
        onFocus={onFocus}
        onBlur={onBlur}
        required
      />
      {showErrorMessage ? <Text style={[s.errorMessage]}>{errorMessage}</Text> : <></>}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    marginVertical: 8,
    // backgroundColor:"green",
    // margin:0,
  },
  inputHeader: {
    fontSize: 14,
    color: colors.HEADER_TEXT,
    marginRight: 2,
    marginBottom: 4,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.HOME_TEXT,
    padding: 8,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
    // backgroundColor:'red'
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
})
