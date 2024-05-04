import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import g from '../../assets/styles/global'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import IconWrap from './IconWrap'
import colors from '../../assets/constants/colors'

export default function CHeaderWithTwoIcons({
  onPress,
  containerStyle,
  iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG],
  children,
}) {
  return (
    <View style={[g.containerBetween, s.container, containerStyle]}>
      <TouchableOpacity onPress={onPress}>
        <BackArrow fill={colors.ICON_BG} />
      </TouchableOpacity>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    // marginTop: 24,
    // paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})