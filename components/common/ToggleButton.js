import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import colors from '../../assets/constants/colors'

const ToggleButton = ({check}) => {
  const [checked, setChecked] = useState(check)
  return (
    <Pressable
      style={[
        {
          height: 25,
          width: 50,
          borderRadius: 16,
          // marginTop: 20,
        },
        checked
          ? { backgroundColor: colors.GREEN_NORMAL, alignItems: 'flex-end' }
          : { backgroundColor: colors.SEC_BG },
      ]}
      onPress={() => setChecked(!checked)}
    >
      <View
        style={{
          backgroundColor: colors.WHITE,
          height: 19,
          width: 19,
          margin: 3,
          borderRadius: 9.5,
        }}
      ></View>
    </Pressable>
  )
}

export default ToggleButton
