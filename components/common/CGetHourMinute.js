import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const CGetHourMinute = ({ numberOfHours, label}) => {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.inputHeader}>{label}</Text>
      <View style={s.hourContainer}>
        <Text style={g.body1}>{numberOfHours}</Text>
      </View>
    </View>
  )
}

export default CGetHourMinute

const s = StyleSheet.create({
  hourContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom:8,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
})
