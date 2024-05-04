import React, { useCallback } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'

import * as DocumentPicker from 'expo-document-picker'
// import DocumentPicker from 'react-native-document-picker'
import AttachmentIcon from '../../assets/svg/clip.svg'
import DeleteIcon from '../../assets/svg/delete_2.svg'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'

export default function CDocumentPicker({
  label = '',
  showLabel = true,
  style,
  documents,
  setDocuments,
  attachmentType = 'Attachments',
}) {
  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({})

    if ((result.type = 'success')) {
      if (result.uri) {
        if (result.size < 2 * 1024 * 1024) {
          setDocuments((prev) => {
            return [...prev, result]
          })
        } else {
          Alert.alert('File Size too large!')
        }
      }
    } else {
      //console.log('Cancelled')
    }
  }
  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((document, idx) => idx != id))
  }
  return (
    <View>
      {documents.map((document, idx) => {
        let ext = getFileExtenstionFromUri(document.uri)
        return (
          <View style={[s.inputStyle, style]} key={idx}>
            {(ext == '.png' || ext == '.jpg' || ext == '.jpeg') && (
              <Image source={{ uri: document.uri }} style={s.attachmentImage} />
            )}
            <Text style={s.attachmentItemText}>{document.name}</Text>
            <TouchableOpacity onPress={() => deleteDocument(idx)}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )
      })}
      <TouchableOpacity style={[s.inputStyle, style]} onPress={pickDocument}>
        <Text style={s.attachmentText}>{attachmentType}</Text>
        <AttachmentIcon />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
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
})
