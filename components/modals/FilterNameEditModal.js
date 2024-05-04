import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

import CloneIcon from '../../assets/svg/clone.svg'
import ReorderIcon from '../../assets/svg/reorder.svg'
import CreateTemplateIcon from '../../assets/svg/create-template.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import IconWrap from '../common/IconWrap'
import CButtonInput from '../common/CButtonInput'
import CInput from '../common/CInput'

export default function FilterNameEditModal({
  children,
  filterName,
  setFilterName,
  visibility,
  setVisibility,
  onSave = null,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal
      transparent
      visible={visibility}
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent={true}
    >
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={s.headerText}>Save Filter</Text>
          {/* <CInput label="Filter Name" /> */}
          <Text style={{ marginBottom: 5, color: colors.PRIM_CAPTION }}>Filter Name</Text>
          <TextInput style={s.input} value={filterName} onChangeText={setFilterName} />
          <View style={g.containerBetween}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput label="Save" onPress={onSave} style={s.saveButton} />
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
