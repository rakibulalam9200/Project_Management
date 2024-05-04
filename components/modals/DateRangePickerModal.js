import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'
import moment from 'moment'

import DateRangePicker from 'rn-select-date-range'

export default function DateRangePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  dateRange,
  setDateRange,
  onConfirm = null,
}) {
  const [selectedRange, setRange] = useState({})
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <TouchableOpacity style={[s.modalOuterContainer]} onPress={closeModal}>
        <View style={s.modalContainer}>
          <DateRangePicker
            onSelectDateRange={(range) => {
              setDateRange(range)
            }}
            blockSingleDateSelection={true}
            maxDate={moment().add(2, 'years')}
            minDate={moment().subtract(2, 'years')}
            selectedDateContainerStyle={s.selectedDateContainerStyle}
            selectedDateStyle={s.selectedDateStyle}
            onConfirm={() => {
              if (onConfirm) onConfirm()
              closeModal()
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerContainerStyle: {
    marginVertical: 8,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    // marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },

  selectedDateContainerStyle: {
    height: 35,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.HOVER,
    borderRadius: 35,
  },
  selectedDateStyle: {
    fontWeight: 'bold',
    color: 'white',
  },
})
