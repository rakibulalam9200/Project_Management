import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import colors from '../../assets/constants/colors'
import { setNormal } from '../../store/slices/tab'
import CButtonInput from '../common/CButtonInput'
import CInputWithLabel from '../common/CInputWithLabel'
import MultipleDocumentPickerForFilesDirectory from '../common/MultipleDocumentPickerForFilesDirectory'
import ShowPickedAttachments from '../common/ShowPickedAttachments'

const AttachmentOrFolderModal = ({
  openModal,
  setOpenModal,
  attachments,
  setAttachmentDeleteIndexes,
  attachmentDeleteIndexes,
  documents,
  setDocuments,
  addOrUpdateAttachments,
  saveFolder,
  loading,
  onCamera=null
}) => {
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const { tabbarHeight } = useSelector((state) => state.tab)
  const [modal, setModal] = useState('')
  const [folderName, setFolderName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const closeModal = () => {
    if (setOpenModal) setOpenModal(false)
    // } else {
    //   dispatch(setShowFileUploadModal())
    // }
    // setOpenModal(false)
    // dispatch(setPlus())
    setModal('')
    setFolderName('')
    setDocuments([])
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  return (
    <Modal
      visible={openModal}
      animationType={'slide'}
      transparent={true}
      onRequestClose={closeModal}
      style={{
        flex: 1,
      }}
    >
      {modal == '' && (
        <>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={[styles.modal]}>
              <View style={[styles.modalContent, Platform.OS === 'ios' ? { marginBottom: tabbarHeight } : { marginBottom: 50 }]}>
                <View>
                  <TouchableOpacity onPress={() => setModal('file')}>
                    <Text style={[styles.texts]}>Upload File</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setModal('folder')} style={{ marginVertical: 10 }}>
                  <Text style={[styles.texts, styles.border]}>Create New Folder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    closeModal()
                    if (onCamera) {
                      onCamera()
                    }
                  }}
                  style={{ marginVertical: 10 }}
                >
                  <Text style={[styles.texts, styles.border]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}

      {modal == 'file' && (
        <>
          <TouchableWithoutFeedback onPress={closeModal} style={{}}>
            <View style={[styles.modal2]}>
              <View style={[styles.modalContent2]}>
                {/* <ScrollView style={{ height: '60%' }}> */}
                <View style={[{ marginTop: 20 }]} onStartShouldSetResponder={(event) => true}>
                  <ShowPickedAttachments documents={documents} setDocuments={setDocuments} />
                  <MultipleDocumentPickerForFilesDirectory
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                </View>
                {/* </ScrollView> */}
                <View style={{ marginVertical: 10 }}>
                  <CButtonInput label="Save" onPress={addOrUpdateAttachments} loading={loading} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}

      {modal == 'folder' && (
        <>
          <TouchableWithoutFeedback onPress={closeModal}>
            <KeyboardAvoidingView
              style={[styles.modal2]}
              behavior="padding"
              enabled={Platform.OS == 'ios'}
            >
              <View style={[styles.modalContent2]}>
                {/* <ScrollView style={{ height: '60%' }}> */}
                <View>
                  <CInputWithLabel
                    value={folderName}
                    setValue={setFolderName}
                    showLabel
                    label="Folder"
                    placeholder="New Folder"
                  />
                </View>
                {/* </ScrollView> */}
                <View style={{ marginVertical: 10 }}>
                  <CButtonInput
                    label="Save"
                    onPress={() => {
                      saveFolder(folderName)
                      closeModal()
                    }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '100%',
    justifyContent: 'flex-end',
    height: '100%',
    flex: 1,
    backgroundColor: '#010714B8',
    // backgroundColor: 'red',
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 27,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    // bottom: 56,
  },

  texts: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  border: {
    borderColor: '#FFFFFF',
    borderTopWidth: 1,
  },
  modal2: {
    width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: '#010714B8',
  },
  modalContent2: {
    backgroundColor: colors.WHITE,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
})

export default AttachmentOrFolderModal
