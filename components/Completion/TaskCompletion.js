import React, { memo, useEffect, useState } from 'react'
import { LogBox, StyleSheet, Text, View } from 'react-native'
import Slider from 'react-native-slider'
import { FilterColors } from '../../assets/constants/filters'
import colors from '../../assets/constants/colors'

const TaskCompletion = ({
  sliderColor = colors.GREEN_NORMAL,
  sliderTrackColor = colors.SEC_BG,
  progress = 0,
}) => {
  return (
    <View style={[s.sliderContainer, { backgroundColor: sliderTrackColor }]}>
      <View
        style={[s.sliderProgress, { backgroundColor: sliderColor, width: `${progress}%` }]}
      ></View>
    </View>
  )
}

export default TaskCompletion

const s = StyleSheet.create({
  sliderContainer: {
    flexDirection: 'row',
    backgroundColor: colors.SEC_BG,
    width: '100%',
    height: 8,
    borderRadius: 8,
    position: 'relative',
  },
  sliderProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '20%',
    height: 8,
    borderRadius: 8,
    backgroundColor: 'green',
  },
})
