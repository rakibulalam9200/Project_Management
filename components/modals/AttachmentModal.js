import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CameraIcon from '../../assets/svg/camera-2.svg'
import DocumentIcon from '../../assets/svg/document-2.svg'
import GallaryIcon from '../../assets/svg/gallary.svg'
import ScribbleIcon from '../../assets/svg/scribble.svg'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'
export default function AttachmentModal({
  children,
  visibility,
  setVisibility,
  navigation,
  onReOrder,
  documents,
  setDocuments,
  pickDocument,
  pickImage,
  onCamera = null,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <TouchableOpacity style={[s.modalOuterContainer]} onPress={closeModal}>
        <View style={s.modalContainer}>
          <CText style={[g.title3, s.textColor]}>Attachment</CText>
          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              //   onReOrder()
              // closeModal()
            }}
          >
            <TouchableOpacity style={s.itemContainer} onPress={() => {
                  if (onCamera) {
                    onCamera()
                  }
                  closeModal()
                }}>
              <IconWrap
                outputRange={iconWrapColors}
                onPress={() => {
                  if (onCamera) {
                    onCamera()
                  }
                  closeModal()
                }}
              >
                <CameraIcon />
              </IconWrap>
              <Text style={s.settingsItemText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.itemContainer} onPress={pickImage}>
              <IconWrap outputRange={iconWrapColors} onPress={pickImage}>
                <GallaryIcon />
              </IconWrap>
              <Text style={s.settingsItemText}>Gallary</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              //   onReOrder()
              // closeModal()
            }}
          >
            <TouchableOpacity style={s.itemContainer} onPress={pickDocument}>
              <IconWrap outputRange={iconWrapColors} onPress={pickDocument}>
                <DocumentIcon />
              </IconWrap>
              <Text style={s.settingsItemText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.itemContainer}>
              <IconWrap outputRange={iconWrapColors}>
                <ScribbleIcon />
              </IconWrap>
              <Text style={s.settingsItemText}>Scribble</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    width: '80%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  textColor: {
    color: '#000E29',
    textAlign: 'center',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
