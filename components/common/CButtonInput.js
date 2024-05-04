import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'
import colors from '../../assets/constants/colors'
export default function CButtonInput({
  style,
  label = 'Button',
  onPress,
  loading = false,
  textStyle,
  btnFrom = '',
  disable = false,
}) {
  return (
    <TouchableOpacity style={[s.buttonContainer, style]} onPress={onPress} disabled={loading || disable}>
      {loading && btnFrom !== 'cancel' && <ActivityIndicator size="small" color={'white'} />}
      <Text style={[s.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    backgroundColor: colors.ICON_BG,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },

  buttonText: {
    color: colors.WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },
})
