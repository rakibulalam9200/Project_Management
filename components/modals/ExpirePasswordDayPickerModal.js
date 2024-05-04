import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import CButtonInput from '../common/CButtonInput'
import CHeaderWithBack from '../common/CHeaderWithBack'


const data = [
  { id: 1, name: '30 days', value: 30 },
  { id: 2, name: '60 days', value: 60 },
  { id: 3, name: '90 days', value: 90 },
  { id: 4, name: '120 days', value: 120 },
  { id: 5, name: 'Never', value: 'Never' },
]


export default function ExpirePasswordDayPickerModal({ children, visibility, setVisibility, navigation, value, setValue }) {

  const [selected, setSelected] = useState(value)

  const closeModal = () => {
    setVisibility(false)
  }
  const checkIfSelected = (value) => {
    return selected == value.value
  }

  const toggleSelected = (value) => {
    if (value.value == selected) setSelected(null)
    else setSelected(value.value)
  }


  const handleSave = () => {
    setValue(selected)
    closeModal()
  }

  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Password Expiration"
            labelStyle={s.headerLabel}
            // iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false} >
            {data.map((dat, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(dat)}
                >
                  <Text>{dat.name}</Text>
                  {checkIfSelected(dat) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          <CButtonInput label="save" onPress={handleSave} />
        </View>
      </View>
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
    width: '60%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    // padding: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContainerStyle: {
    // marginVertical: 16,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  modalInnerContainer: {
    padding: 16,
    // paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
