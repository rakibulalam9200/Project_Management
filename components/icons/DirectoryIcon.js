import { View, Text } from 'react-native'
import React from 'react'
import Directory from '../../assets/svg/directory-filled.svg'

export default function DirectoryIcon({ color = '#fff' }) {
  return (
    <View>
      <Directory fill={color} />
    </View>
  )
}
