import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React from 'react'
import g from '../assets/styles/global'
import colors from '../assets/constants/colors'

export default function LoadingScreen({ navigation, route }) {
  return (
    <View style={[g.outerContainer, s.container]}>
      <ActivityIndicator size="large" />
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.NORMAL,
    marginBottom: 0,
  },
})
