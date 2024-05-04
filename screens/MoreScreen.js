import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function MoreScreen() {
  return (
    <View style={s.container}>
    <Text>Assalamualikum</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    background:'transparent',
    justifyContent:'center',
    alignItems:"center"
  },
})
