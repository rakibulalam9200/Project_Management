import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import ForwardIcon from '../../assets/svg/forward-icon.svg'
import DownloadIcon from '../../assets/svg/download-icon.svg'
import CButtonInput from '../common/CButtonInput'
import IconWrap from '../common/IconWrap'

export default function CSettingsModal({
  children,
  visibility,
  setVisibility,
  onDelete = () => {},
  onForward = () => {},
  onDownload = () => {},
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
            title="Menu"
            labelStyle={s.headerLabel}
            // iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          {/* <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              if (onForward) onForward()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Forward</Text>
            <IconWrap outputRange={iconWrapColors}>
              <ForwardIcon />
            </IconWrap>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              onDownload()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Download</Text>
            <IconWrap outputRange={iconWrapColors}>
              <DownloadIcon />
            </IconWrap>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              onDelete()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Delete</Text>
            <IconWrap outputRange={iconWrapColors}>
              <DeleteIcon />
            </IconWrap>
          </TouchableOpacity>

          <CButtonInput label="Apply" onPress={() => closeModal()} style={{ marginTop: 24 }} />
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
