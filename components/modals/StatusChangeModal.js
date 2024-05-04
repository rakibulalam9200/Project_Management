import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CButtonInput from '../common/CButtonInput'
export default function StatusChangeModal({
  children,
  confirmationMessage = 'Do you want to mark this checklist as completed?',
  visibility,
  setVisibility,
  onComplete = null,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={s.headerText}>Complete</Text>
          <Text style={s.subHeaderText}>{confirmationMessage}</Text>
          <View style={g.containerBetween}>
            <CButtonInput label="Complete" onPress={onComplete} style={s.completeButton} />
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
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
  modalContainer: {
    minWidth: '60%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
    margin: 8,
  },
  completeButton: {
    backgroundColor: colors.SECONDARY,
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
