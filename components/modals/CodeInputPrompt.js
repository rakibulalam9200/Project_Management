import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert } from 'react-native'
import React from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CButtonInput from '../common/CButtonInput'
import api from '../../api/api'
import { useState } from 'react'
import CCodeInput from '../common/CCodeInput'

export default function CodeInputPrompt({
  children,
  visibility,
  setVisibility,
  onSave
}) {

  const [code, setCode] = useState('')

  const closeModal = () => {
    setCode('')
    setVisibility(false)
  }

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal} statusBarTranslucent={true} >
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={s.headerText}>Verify Code</Text>
          {/* <CInput label="Filter Name" /> */}
          <Text style={{ marginBottom: 5, color: colors.PRIM_CAPTION, textAlign: 'center' }}>Enter the 6-digit code sent to your phone</Text>
          {/* <TextInput style={s.input} value={value} onChangeText={setValue} secureTextEntry={true} /> */}
          <View>
            <CCodeInput
              value={code}
              setValue={setCode}
              bgColor={s.inputBox}
              textColor={s.codeText}
            />
          </View>
          <View style={g.containerBetween}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput label="Save" onPress={() => {
              onSave(code)
              setCode('') // clear code
            }} style={s.saveButton} />
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
  inputBox: {
    backgroundColor: colors.SEC_BG,
    color: 'black',
  },
  codeText: {
    color: colors.BLACK,
  },
  input: {
    maxHeight: 64,
    color: colors.BLACK,
    backgroundColor: colors.WHITE,
    width: 300,
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 64,
    marginBottom: 16,
    // borderWidth: 1,
  },
  modalContainer: {
    // minWidth: '60%',
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