import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function UnderConstructionScreen() {
  return (
    <View style={s.container}>
      <Text>Screen is under Construction...</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
