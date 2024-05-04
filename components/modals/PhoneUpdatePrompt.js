import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert } from 'react-native'
import React from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CButtonInput from '../common/CButtonInput'
import api from '../../api/api'
import { useState } from 'react'

export default function PhoneUpdatePrompt({
  children,
  visibility,
  setVisibility,
  onPressNext,
}) {


  const [value, setValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleNext = () => {
    if (value == '') {
      setErrorMessage('Please enter a phone number')
      return
    }
    onPressNext(value)
    closeModal()
  }


  const closeModal = () => {
    setVisibility(false)
    setValue('')
    setErrorMessage('')
  }
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal} statusBarTranslucent={true} >
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={s.headerText}>Enter Phone</Text>
          {/* <CInput label="Filter Name" /> */}
          <Text style={{ marginBottom: 5, color: colors.PRIM_CAPTION }}>Type Phone</Text>
          <TextInput style={s.input} value={value} onChangeText={setValue} />
          <Text style={{ marginBottom: 5, color: colors.RED_NORMAL }}>{errorMessage}</Text>
          <View style={[g.containerBetween, { marginTop: 10 }]}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput label="Next" onPress={handleNext} style={s.saveButton} />
          </View>
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
  input: {
    maxHeight: 64,
    color: colors.BLACK,
    backgroundColor: colors.WHITE,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 64,
    // marginBottom: 16,
    // borderWidth: 1,
  },
  modalContainer: {
    // minWidth: '60%',
    width: '95%',
    // alignItems: 'center',
    backgroundColor: '#F2F6FF',
    borderRadius: 20,
    padding: 16,
    margin: 8,
  },
  saveButton: {
    backgroundColor: colors.ICON_BG,
    paddingHorizontal: 38,
  },
  cancelButton: {
    backgroundColor: colors.PRIM_CAPTION,
  },
  headerText: {
    fontFamily: 'inter-regular',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK,
    textAlign: 'center',
    marginVertical: 16,
  },
  subHeaderText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    marginVertical: 16,
    color: colors.BLACK,
    textAlign: 'left',
  },
})