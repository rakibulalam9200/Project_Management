import React from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'

const HideKeyboard = ({ children, onPress = null }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
        if (onPress) onPress()
      }}
    >
      {children}
    </TouchableWithoutFeedback>
  )
}

export default HideKeyboard
