import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { getFirstLetter } from '../../utils/Capitalize'
import colors from '../../assets/constants/colors'

export default function CLetterCard({ label, color = colors.NORMAL, style }) {
  return (
    <View style={[s.container, { backgroundColor: color }, style]}>
      <Text style={s.text}>{getFirstLetter(label)}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  text: {
    fontSize: 22,
    color: colors.WHITE,
    fontWeight: 'bold',
  },
})
