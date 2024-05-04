import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'

import CloneIcon from '../../assets/svg/clone.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'
import MoveIcon from '../../assets/svg/move.svg'
import CButtonInput from '../common/CButtonInput'
import IconWrap from '../common/IconWrap'

export default function CDetailsSettingModal({
  children,
  visibility,
  setVisibility,
  navigation,
  onEdit = null,
  onDelete = null,
  onClone = null,
  onMove = null,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Settings"
            labelStyle={s.headerLabel}
            // iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          {onEdit && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onEdit) onEdit()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Edit</Text>
              <IconWrap outputRange={iconWrapColors}>
                <EditIcon />
              </IconWrap>
            </TouchableOpacity>
          )}

          {onClone && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onClone) onClone()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Clone</Text>
              <IconWrap outputRange={iconWrapColors}>
                <CloneIcon />
              </IconWrap>
            </TouchableOpacity>
          )}

          {onMove && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onMove) onMove()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Move</Text>
              <IconWrap outputRange={iconWrapColors}>
                <MoveIcon />
              </IconWrap>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onDelete) onDelete()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Delete</Text>
              <IconWrap outputRange={iconWrapColors}>
                <DeleteIcon />
              </IconWrap>
            </TouchableOpacity>
          )}
          <CButtonInput label="Save" onPress={() => closeModal()} style={{ marginTop: 24 }} />
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerContainerStyle: {
    marginVertical: 8,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    // marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
})
