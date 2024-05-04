import { StyleSheet, Pressable, View } from 'react-native'
import React from 'react'

import CText from './CText'

import CalendarIcon from '../../assets/svg/calendar2.svg'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const DateTimeInput = ({ selectedDate, setShowDate, style }) => {
  return (
    <View style={[s.itemWrapper, style]}>
      <CText style={s.labelText}>Deadline date</CText>
      <Pressable onPress={() => setShowDate(true)} style={s.dateWrap}>
        <CText style={selectedDate.date && selectedDate.time ? s.activeText : s.notActiveText}>
          {selectedDate.date && selectedDate.time
            ? `${selectedDate.date} ${selectedDate.time}`
            : '_._.____ _:_'}
        </CText>
        <CalendarIcon width={24} height={24} fill={colors.NORMAL} />
      </Pressable>
    </View>
  )
}

export default DateTimeInput

const s = StyleSheet.create({
  dateWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    borderRadius: 8,
  },
  notActiveText: {
    ...g.body1,
    color: colors.PRIM_CAPTION,
  },
  activeText: {
    ...g.body1,
    color: colors.HEADING,
  },
  labelText: {
    ...g.caption1,
    marginBottom: 4,
    color: colors.PRIM_CAPTION,
  },
  itemWrapper: {
    marginBottom: 24,
    paddingHorizontal: 23,
  },
})
