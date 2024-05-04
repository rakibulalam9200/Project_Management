import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  SafeAreaViewBase,
} from 'react-native'
import CHeaderWithBack from '../common/CHeaderWithBack'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'

const PreferencesModal = ({
  openModal,
  setOpenModal,
  selectedDateFormat,
  setSelectedDateFormat,
  dateFormats,
}) => {
  const closeModal = () => {
    setOpenModal(false)
  }

  const toggleSelected = (format) => {
    setSelectedDateFormat(format)
  }

  const checkIfSelected = (format) => {
    return selectedDateFormat.id == format.id
  }

  return (
    <Modal visible={openModal} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={[{ flex: 1 }]}>
        <View style={{ paddingHorizontal: 16 }}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Date Format"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <ScrollView>
            {dateFormats.map((format) => {
              return (
                <TouchableOpacity
                  key={format.id}
                  style={[g.containerBetween, styles.modalInnerContainer]}
                  onPress={() => toggleSelected(format)}
                >
                  <Text>{format.name}</Text>
                  {checkIfSelected(format) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})

export default PreferencesModal
