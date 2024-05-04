import { View, StyleSheet } from 'react-native'
import React from 'react'

import moment from 'moment-mini'
import filters from '../../assets/constants/filters'
import colors from '../../assets/constants/colors'
const StatusBar = ({ created, deadline, status, barStyle, statusStyle }) => {
  const calculateProgress = () => {
    const start = moment(created)
    const end = moment(deadline)
    const startDiff = start.diff(moment(), 'minutes')
    const endDiff = start.diff(end, 'minutes')

    if (end.diff(moment(), 'minutes') < 0) {
      return 100
    }

    if (endDiff === 0 && startDiff === 0) { return 100 }

    const diff = -(startDiff / endDiff)
    if (diff) {
      return -diff * 100
    }

  }

  const memoProgress = React.useMemo(calculateProgress, [created, deadline])


  return (
    <View style={[s.statusBar, barStyle]}>
      <View
        style={[
          s.status,
          {
            width: `${memoProgress || 0}%`,
            backgroundColor: (filters[status] && filters[status].color) || colors.GREEN_NORMAL,
          },
          statusStyle,
        ]}
      />
    </View>
  )
}

const s = StyleSheet.create({
  statusBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.SEC_BG,
  },
  status: {
    height: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: '#00000040',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
})

export default StatusBar
