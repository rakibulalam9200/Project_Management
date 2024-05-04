import React, { useEffect } from 'react'
import {
  Alert,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
// import * as DocumentPicker from 'expo-document-picker'
import DocumentPicker, { types } from 'react-native-document-picker'
import AttachmentIcon from '../../assets/svg/clip.svg'
import DeleteIcon from '../../assets/svg/delete_2.svg'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'

export default function ShowPickedAttachments({
  label = '',
  showLabel = true,
  style,
  documents,
  setDocuments,
  attachmentType = 'Attachments',
}) {
  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((document, idx) => idx != id))
  }

  useEffect(() => {
    //console.log(documents, 'documents....')
    return () => { }
  }, [documents])
  return (
    <ScrollView
      onStartShouldSetResponder={(event) => true}
      onTouchEnd={(e) => {
        e.stopPropagation()
      }}
      style={{ maxHeight: 300 }}
    >
      {documents.map((document, idx) => {
        let ext = getFileExtenstionFromUri(document?.fileCopyUri)
        let name = document?.name.replace(ext, '')
        name = name.slice(0, 10) + '..' + name.slice(-3) + ext
        return (
          <View onStartShouldSetResponder={(event) => true} style={[s.inputStyle, style]} key={idx}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>

              {(ext == '.png' || ext == '.jpg' || ext == '.jpeg') && (
                <RNImage source={{ uri: document?.fileCopyUri }} style={s.attachmentImage} />
              )}
              {(ext == '.pdf' || ext == '.docx' || ext == '.doc') && (
                <View style={[s.pdfContainer]}>
                  <Text style={{ fontWeight: '500' }}>{ext.replace('.', '').toUpperCase()}</Text>
                </View>
              )}
              <Text style={s.attachmentItemText}>{name}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteDocument(idx)}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )
      })}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  documentsContainer: {
    // flex: 1,
    // maxHeight: 300,
    // marginBottom: 100,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 16,
    borderRadius: 10,
    // marginBottom: 12,
    fontSize: 16,
    fontWeight: '500',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderStyle: 'dotted',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ICON_BG,
    marginVertical: 8,
  },
  attachmentItem: {},
  attachmentImage: {
    width: 42,
    height: 42,
  },
  attachmentItemText: {
    color: colors.HOME_TEXT,
  },
  attachmentText: {
    fontSize: 16,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    color: colors.HEADER_TEXT,
  },
  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
})
