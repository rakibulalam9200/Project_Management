import { View, Text } from 'react-native'
import React from 'react'
import GlobalSearch from '../../assets/svg/search-filled.svg'

export default function GlobalSearchIcon({ color = '#fff' }) {
  return (
    <View>
      <GlobalSearch fill={color} />
    </View>
  )
}
