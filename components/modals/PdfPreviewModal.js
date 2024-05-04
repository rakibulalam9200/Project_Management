import React, { useState } from 'react'
import { Dimensions, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import PDFReader from 'rn-pdf-reader-js'
import colors from '../../assets/constants/colors'
import CrossIcon from '../../assets/svg/crossIcon.svg'
import { downloadPdf } from '../../utils/DownloadAttachment'
import CButtonInput from '../common/CButtonInput'
import Toast from 'react-native-toast-message'

export default function PdfPreviewModal({ visibility, setVisibility, navigation, details }) {
  const [showDownloadButton, setShowDownloadButton] = useState(false)
  const closeModal = () => {
    setVisibility(false)
    setShowDownloadButton(false)
  }
  const [loading, setLoading] = React.useState(false)

  const handleDownload = async () => {
    setLoading(true)
    let message = await downloadPdf(details?.url, details?.name)
    Toast.show({
      type: message.includes('Successful') ? 'success' : 'error',
      text1: message,
      position: 'bottom',
    })
    setLoading(false)
    setVisibility(false)
  }
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <View
            style={{ justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}
          >
            <TouchableOpacity
              onPress={closeModal}
              style={{
                padding: 10,
                backgroundColor: colors.MID_BG,
                borderRadius: 20,
                marginBottom: 10,
              }}
            >
              <CrossIcon />
            </TouchableOpacity>
          </View>

          <PDFReader
            source={{
              uri: details?.url,
            }}
            style={{
              width: Dimensions.get('window').width - 32,
              height: Dimensions.get('window').height - 200,
            }}
            onLoadEnd={() => setShowDownloadButton(true)}
            useGoogleReader={Platform.OS == 'ios'}
            useGoogleDriveViewer={Platform.OS == 'ios'}
          />
          {showDownloadButton && (
            <CButtonInput
              loading={loading}
              label={loading ? 'Downloading...' : 'Download'}
              onPress={handleDownload}
              style={{ marginVertical: 16 }}
            />
          )}
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
    width: '95%',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 8,
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 16,
  },
})
