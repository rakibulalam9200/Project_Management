import React, { useState } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CButtonInput from '../common/CButtonInput'
import CButton from '../common/CButton'
import CText from '../common/CText'

export default function ListCompleteModal({
  children,
  confirmationMessage = 'Do you want to complete this list?',
  visibility,
  setVisibility,
  onComplete = null,
  statusLoader,
  setStatusLoader,
  setListStatus,
}) {
  const [loading, setloading] = useState(statusLoader)
  //console.log(loading, 'loading....')
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={[g.initailTitle, { color: colors.NORMAL }]}>Complete</Text>
          <Text style={s.subHeaderText}>{confirmationMessage}</Text>
          <View style={[g.containerBetween, { width: '100%', marginVertical: 10 }]}>
            <CButton
              type="gray"
              style={[s.margin1x, s.grayButton]}
              onPress={() => {
                closeModal()
                if (setListStatus) {
                  setListStatus(false)
                }
              }}
            >
              <CText style={g.title3}>Cancel</CText>
            </CButton>
            <CButton style={[s.margin1x, s.blueButton]} onPress={onComplete} loading={statusLoader}>
              <CText style={g.title3}>Complete</CText>
            </CButton>

            {/* <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput
              label="Complete"
              onPress={onComplete}
              style={s.completeButton}
              loading={loading}
              disabled={loading}
              //   loading={statusLoader}
            /> */}
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
  completeButton: {
    backgroundColor: colors.SECONDARY,
    paddingHorizontal: 35,
  },
  cancelButton: {
    backgroundColor: colors.PRIM_CAPTION,
    paddingHorizontal: 35,
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
  grayButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  blueButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
})
