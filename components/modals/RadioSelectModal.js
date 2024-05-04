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
import { priorities } from '../../assets/constants/priority'
import g from '../../assets/styles/global'

import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { capitalizeFirstLetter } from '../../utils/Capitalize'

export default function RadioSelectModal({ children, selected, setSelected, options = [] }) {
  const [show, setShow] = useState(false)
  const openModal = () => {
    setShow(true)
  }
  const closeModal = () => {
    setShow(false)
  }
  const toggleSelected = (priority) => {
    if (priority.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(priority)
      closeModal()
    }
  }
  const checkIfSelected = (priority) => {
    return selected.id == priority.id
  }
  return (
    <>
      <TouchableOpacity onPress={openModal}>{children}</TouchableOpacity>
      <Modal visible={show} animationType="fade" onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={s.outerContainer}>
            <CHeaderWithBack
              onPress={closeModal}
              title="Select priority"
              labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
              iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            />
            <ScrollView style={s.modalOuterContainer}>
              {options?.map((priority, idx) => {
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
    </>
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
    backgroundColor: colors.CONTAINER_BG,
  },
})
