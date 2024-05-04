import React, { useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CalendarIcon from '../../assets/svg/calendar2.svg'

const CDateRangerPicker = ({
  showDateSelection,
  setShowDateSelection,
  rangeDate,
  setRangeDate,
}) => {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.inputHeader}>{'Time period'}</Text>
      <TouchableOpacity style={[s.dateTimeContainer]} onPress={() => setShowDateSelection(true)}>
        <Text style={s.dateTimeText}>{rangeDate ? rangeDate : `__.__.____ - __.__.____`}</Text>
        <CalendarIcon fill={colors.ICON_BG} />
      </TouchableOpacity>
    </View>
  )
}

export default CDateRangerPicker

const s = StyleSheet.create({
  dateTimeContainer: {
    backgroundColor: colors.WHITE,
    width: '100%',
    color: colors.NORMAL,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  dateTimeText: {
    fontFamily: 'inter-medium',
    color: colors.NORMAL,
    fontSize: 16,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
})
