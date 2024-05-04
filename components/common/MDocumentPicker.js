import React from 'react'
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'

import DeleteIcon from '../../assets/svg/delete_2.svg'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'

export default function MDocumentPicker({
  label = '',
  showLabel = true,
  style,
  documents,
  setDocuments,
  pickDocument,
}) {
  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((document, idx) => idx != id))
  }

  // ext == ".png" || ext == ".jpg" || ext == ".jpeg "|| ext == 'gif' || ext == "heic" || ext == "svg"
  return (
    <View style={{}}>
      {documents.map((document, idx) => {
        if(document?.mime){
          let ext = document?.mime.split("/")[1];
          return (
            <View style={[s.inputStyle, style]} key={idx}>
              {(ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'gif' || ext == "heic" || ext == "svg") && (
                <RNImage source={{ uri: document?.sourceURL }} style={s.attachmentImage} />
              )}
              <Text style={s.attachmentItemText}> {document?.filename?.length > 20
                  ? document?.filename?.slice(0, 20) + '... ' + "."+ext
                  : document?.filename}</Text>
              <TouchableOpacity onPress={() => deleteDocument(idx)}>
                <DeleteIcon />
              </TouchableOpacity>
            </View>
          )
        } if(document?.mimeType){
           let ext = document?.mimeType.split("/")[1];
          return (
            <View style={[s.inputStyle, style]} key={idx}>
              {(ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'gif' || ext == "heic" || ext == "svg") && (
                <RNImage source={{ uri: document?.uri }} style={s.attachmentImage} />
              )}
              <Text style={s.attachmentItemText}> {document?.name?.length > 20
                  ? document?.name?.slice(0, 20) + '... ' + "."+ext
                  : document?.name}</Text>
              <TouchableOpacity onPress={() => deleteDocument(idx)}>
                <DeleteIcon />
              </TouchableOpacity>
            </View>
          )
        }
        else{
          let ext = getFileExtenstionFromUri(document?.fileCopyUri)
        return (
          <View style={[s.inputStyle, style]} key={idx}>
            {(ext == '.png' || ext == '.jpg' || ext == '.jpeg' || ext == '.gif' || ext == ".heic" || ext == ".svg") && (
              <RNImage source={{ uri: document?.fileCopyUri }} style={s.attachmentImage} />
            )}
            {(ext == '.pdf' || ext == '.docx' || ext == '.doc') && (
              <View style={[s.pdfContainer]}>
                <Text style={{ fontWeight: '500' }}>{ext.replace('.', '').toUpperCase()}</Text>
              </View>
            )}

            <Text style={s.attachmentItemText}> {document?.name?.length > 20
                ? document?.name?.slice(0, 20) + '... ' + ext
                : document?.name}</Text>
            <TouchableOpacity onPress={() => deleteDocument(idx)}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )
      }
      })}
    </View>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  attachmentImage: {
    width: 42,
    height: 42,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '500',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderStyle: 'dotted',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ICON_BG,
  },
  attachmentItem: {},
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
    height: 42,
    width: 42,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 5,
  },
})
