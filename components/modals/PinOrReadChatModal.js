import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CButtonInput from '../common/CButtonInput'

export default function PinOrReadChatModal({
  children,
  confirmationMessage = 'Do you want to Pin this chat?',
  visibility,
  setVisibility,
  onSave = null,
  singleSelect,
  type = "Pin Chat",
}) {
  const closeModal = () => {
    setVisibility(false)
    singleSelect.current = {}
  }

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={[g.initailTitle, { color: colors.NORMAL }]}>{type}</Text>
          <Text style={s.subHeaderText}>{confirmationMessage}</Text>
          <View style={g.containerBetween}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput label="Yes" onPress={onSave} style={s.cloneButton} />
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
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 24,
    margin: 8,
  },
  cloneButton: {
    backgroundColor: colors.ICON_BG,
    paddingHorizontal: 44,
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
    textAlign: 'center',
    marginBottom: 48,
  },
})
