import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'

export default function CMidHeaderWithIcons({
  title,
  onPress,
  labelStyle,
  containerStyle,
  iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG],
  children,
}) {
  return (
    <View style={[g.containerBetween, s.container, containerStyle]}>
      <TouchableOpacity onPress={onPress}>
        <BackArrow fill={colors.ICON_BG} />
      </TouchableOpacity>
      <Text style={[s.headerTitle, labelStyle]}>{title}</Text>
      <View style={g.containerLeft}>{children}</View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    // marginTop: 16,
  
  },
  headerTitle: {
    fontSize: 16,
    fontWeight:'500'
    // fontWeight: 'bold',
  },
})
