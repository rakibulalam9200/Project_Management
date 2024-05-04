import React from 'react'
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import DeleteIcon from '../../assets/svg/delete_2.svg'
import { getAttachmentFileNameFromUri, getAttachmentNameFromUri, getFileExtenstionFromUri } from '../../utils/Attachmets'
import { downLoadImage, downloadPdf } from '../../utils/DownloadAttachment'
import { atan } from 'react-native-reanimated'

export default function CAttachments({
  attachments,
  attachmentDeleteIndexes = [],
  setAttachmentDeleteIndexes,
  style,
}) {
  // //console.log(attachments,"(((((((((())))))))))))))))))")
  const handleDelete = (id) => {
    setAttachmentDeleteIndexes((prev) => {
      const copy = prev
      return [...copy, id]
    })
  }

  // //console.log('attachments', attachments)
  return (
    <View>
      {attachments.map((attachment) => {
          console.log(attachment,"---------attachment----------")
          let ext = getFileExtenstionFromUri(attachment.url).toLowerCase()
           console.log(ext,'------ext---------')
        return (
          !attachmentDeleteIndexes.includes(attachment.id) && (
            <View style={[s.inputStyle, style]} key={attachment.id}>
              {(ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == '.gif' || ext == ".heic" || ext == "svg") && (
                <Image source={{ uri: attachment.url }} style={s.attachmentImage} />
              )}
              {(ext == '.pdf' || ext == '.docx' || ext == '.doc' || ext == '.csv') && (
                <View style={[s.pdfContainer]}>
                  <Text style={{ fontWeight: '500' }}>{ext.replace('.', '').toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={async () => {
                  if (ext == ".png" || ext == ".jpg" || ext == ".jpeg"|| ext == '.gif' || ext == ".heic" || ext == "svg") {
                    let message = await downLoadImage(attachment.url, attachment.name)
                    if (message) {
                      Alert.alert(JSON.stringify(message))
                    }
                  } else {
                    let message = await downloadPdf(attachment.url, attachment.name)
                    if (message) {
                      Alert.alert(JSON.stringify(message))
                    }
                  }
                }}
              >
                <Text style={s.attachmentItemText}>
                  {getAttachmentNameFromUri(attachment.url,ext)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(attachment.id)}>
                <DeleteIcon />
              </TouchableOpacity>
            </View>
          )
        )
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
    // marginBottom:16,
    marginVertical: 8,
    // backgroundColor:"yellow"
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
