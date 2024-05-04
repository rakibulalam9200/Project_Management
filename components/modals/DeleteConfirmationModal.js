import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CButtonInput from '../common/CButtonInput'

export default function DeleteConfirmationModal({
  children,
  confirmationMessage = 'Do you want to delete this project? This cannot be undone.',
  visibility,
  setVisibility,
  onDelete = null,
  btnLoader,
  setSelectable = null,
  multipleSelect,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={[g.initailTitle, { color: colors.NORMAL }]}>Delete</Text>
          <Text style={s.subHeaderText}>{confirmationMessage}</Text>
          <View style={g.containerBetween}>
            <CButtonInput
              label="Cancel"
              onPress={closeModal}
              style={s.cancelButton}
              btnFrom="cancel"
              loading={btnLoader}
            />
            <CButtonInput
              label="Delete"
              onPress={onDelete}
              style={[s.deleteButton, btnLoader && { paddingHorizontal: 35 }]}
              loading={btnLoader}
            />
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
  deleteButton: {
    backgroundColor: colors.RED_NORMAL,
    paddingHorizontal: 40,
  },
  cancelButton: {
    backgroundColor: colors.PRIM_CAPTION,
  },
  headerText: {
    fontFamily: 'inter-regular',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.NORMAL,
    textAlign: 'center',
    marginVertical: 16,
  },
  subHeaderText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    marginBottom: 48,
    marginTop: 16,
    color: colors.NORMAL,
    textAlign: 'center',
  },
})
