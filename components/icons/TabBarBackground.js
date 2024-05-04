import { View, Text } from 'react-native'
import React from 'react'
import { Dimensions } from 'react-native'
import TabBarBackgroundSVG from "../../assets/svg/tab_bar_bg.svg";

export default function TabBarBackground({height = 56, color = '#000E29'}) {
    const windowWidth = Dimensions.get('window').width;
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <TabBarBackgroundSVG />
    </View>
  )
}
