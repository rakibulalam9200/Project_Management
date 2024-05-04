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

export default function MultipleDocumentPickerForFilesDirectory({
  label = '',
  showLabel = true,
  style,
  documents,
  setDocuments,
  attachmentType = 'Attachments',
}) {
  // const pickDocument = useCallback(async () => {
  //   try {
  //     let results = await DocumentPicker.pick({
  //       allowMultiSelection: true,
  //     })

  //     for (const res of results) {
  //       //console.log(res,'res..........')
  //       if (res.uri) {
  //         if (res.size < 2 * 1024 * 1024) {
  //           setDocuments((prev) => {
  //             return [...prev, res]
  //           })
  //         } else {
  //           Alert.alert('File Size too large!')
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.warn(err)
  //   }
  // }, [])
  const pickDocument = async () => {
    try {
      let results = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [types.pdf, types.docx, types.images],
        copyTo: 'cachesDirectory',
      })

      for (const res of results) {
        //console.log(res, 'res..........')
        if (res.uri) {
          // //console.log(res.fileCopyUri, 'file size')
          // let ext = getFileExtenstionFromUri(res?.fileCopyUri)
          // //console.log(ext,'extentions..........')
          // if (ext == '.png' || ext == '.jpg' || ext == '.jpeg') {
          //   const result = await Image.compress(res?.fileCopyUri, {
          //     quality: 0.8,
          //   })
          //   //console.log(result,'result..............')
          // }
          if (res.size <= 50 * 1024 * 1024) {
            setDocuments((prev) => {
              return [...prev, res]
            })
          } else {
            Alert.alert('File Size too large!')
          }
          // setDocuments((prev) => {
          //   return [...prev, res]
          // })
        }
      }
    } catch (err) {
      console.warn(err)
    }
  }
  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((document, idx) => idx != id))
  }

  // useEffect(() => {
  //   //console.log(documents, 'documents....')
  //   return () => { }
  // }, [documents])
  return (
    <View style={{}}>
      {/* {documents.map((document, idx) => {
        let ext = getFileExtenstionFromUri(document?.fileCopyUri)
        return (
          <View style={[s.inputStyle, style]} key={idx}>
            {(ext == '.png' || ext == '.jpg' || ext == '.jpeg') && (
              <RNImage source={{ uri: document?.fileCopyUri }} style={s.attachmentImage} />
            )}
            <Text style={s.attachmentItemText}>{document?.name}</Text>
            <TouchableOpacity onPress={() => deleteDocument(idx)}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )
      })} */}
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
})
