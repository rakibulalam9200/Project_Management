import React from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'

export default function CCheckbox({
  label = 'Checkbox',
  checked,
  setChecked,
  showLabel = true,
  style,
  onChecked,
}) {
  const toggleChecked = () => {
    if (onChecked) onChecked()
    setChecked((prev) => !prev)
  }
  return (
    <TouchableWithoutFeedback onPress={toggleChecked} style={[g.containerLeft, style]}>
      <View style={g.containerLeft}>
        {checked ? (
          <CheckedIcon width={20} height={20} />
        ) : (
          <CheckedEmptyIcon width={20} height={20} />
        )}
        {showLabel && <Text style={s.label}>{label}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}

const s = StyleSheet.create({
  label: {
    padding: 8,
    paddingVertical: 0,
    color: colors.HOME_TEXT,
    marginVertical: 8,
    // backgroundColor:'yellow'
  },
})
