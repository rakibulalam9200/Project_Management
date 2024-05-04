import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { secondtoHms } from '../../utils/Timer'

const TimerCount = ({ timer }) => {
  console.log(timer,'timer..........')
  return <Text style={s.timerText}>{secondtoHms(timer)}</Text>
}

export default TimerCount

const s = StyleSheet.create({
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
})
