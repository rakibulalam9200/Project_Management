import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, Alert } from 'react-native'
import React from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CButtonInput from '../common/CButtonInput'
import api from '../../api/api'

export default function PasswordPrompt({
  children,
  visibility,
  setVisibility,
  onSave
}) {


  const [value, setValue] = React.useState('')

  const validatePassword = () => {
    api.user.verifyPassword({ password: value })
      .then((res) => {
        //console.log(res)
        if (res.success) {
          onSave()
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
        Alert.alert('Password is incorrect')
      })
  }

  const closeModal = () => {
    setValue('')
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal} statusBarTranslucent={true} >
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={s.headerText}>Confirm Password</Text>
          {/* <CInput label="Filter Name" /> */}
          <Text style={{ marginBottom: 5, color: colors.PRIM_CAPTION }}>Type Password</Text>
          <TextInput style={s.input} value={value} onChangeText={setValue} secureTextEntry={true} />
          <View style={g.containerBetween}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput label="Next" onPress={validatePassword} style={s.saveButton} />
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