import React, { useEffect, useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { useSelector } from 'react-redux'

export default function ParentRolePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const { parentRoles } = useSelector(state => state.user)

  const checkIfSelected = (priority) => {
    return selected.id == priority.id
  }

  const toggleSelected = (priority) => {
    if (priority.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(priority)
      closeModal()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]


  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Parent Role"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          />

          <ScrollView style={s.modalOuterContainer}>
            {parentRoles?.map((priority, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(priority)}
                >
                  <Text>
                    {priority.name.length > 30
                      ? priority.name.slice(0, 30) + '...'
                      : capitalizeFirstLetter(priority.name)}
                  </Text>
                  {checkIfSelected(priority) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    // padding: 16,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
  },
})
