import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import { TouchableOpacity } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'

export default function CHeaderWithBack({
  title,
  onPress,
  labelStyle,
  containerStyle,
  iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG],
  loading
}) {
  return (
    <View style={[s.container, containerStyle]}>
      <TouchableOpacity onPress={onPress} disabled={loading}>
        <BackArrow fill={colors.ICON_BG} />
      </TouchableOpacity>
      <Text style={[g.body1, s.headerTitle, labelStyle]}>{title}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    // marginTop: 16,
    flexDirection: 'row',
    width: '100%',
    gap: 4,
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  headerTitle: {
    // marginLeft: 40,
    // width: '80%',
    fontWeight: '600',
    textAlign: 'center',
    // backgroundColor: 'yellow',
  },
})
