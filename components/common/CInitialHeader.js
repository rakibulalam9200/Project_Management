import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

export default function CInitailHeader({
  title,
  labelStyle,
  containerStyle,
  iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG],
}) {
  return (
    <View style={[s.container, containerStyle]}>
      <Text style={[g.initailTitle, s.headerTitle, labelStyle]}>{title}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerTitle: {
    marginLeft: 24,
  },
})
