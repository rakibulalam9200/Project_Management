import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'

const CFloatingPlusIcon = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.plusButton, style]} onPress={onPress}>
      <FloatingPlusButton />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  plusButton: {
    position: 'absolute',
    bottom: 40,
    right: 0,
  },
})

export default CFloatingPlusIcon
