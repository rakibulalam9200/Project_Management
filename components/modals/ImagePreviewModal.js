import React from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from 'react-native'
import colors from '../../assets/constants/colors'
import CrossIcon from '../../assets/svg/crossIcon.svg'
import Image from 'react-native-scalable-image'
import CButtonInput from '../common/CButtonInput'
import global from '../../assets/styles/global'
import { downLoadImage } from '../../utils/DownloadAttachment'
import { getAttachmentFileNameFromUri, getFileExtenstionFromUri } from '../../utils/Attachmets'
import Toast from 'react-native-toast-message'

export default function ImagePreviewModal({
  children,
  visibility,
  setVisibility,
  navigation,
  image,
  showDownload = false,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  let filename = getAttachmentFileNameFromUri(image)
  let fileExt = getFileExtenstionFromUri(image)
  const [loading, setLoading] = React.useState(false)
  const handleDownload = async () => {
    setLoading(true)
    const message  = await downLoadImage(image, filename, fileExt)
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

          <Image
            source={{ uri: image }}
            width={Dimensions.get('window').width - 32}
            height={Dimensions.get('window').height - 200}
            style={{
              alignSelf: 'center',
            }}
          />
          {showDownload && (
            <CButtonInput
              loading={loading}
              label={loading ? 'Downloading...' : 'Download'}
              onPress={handleDownload}
              style={global.marginVertical1x}
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
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 5,
    padding: 6,
  },
})
