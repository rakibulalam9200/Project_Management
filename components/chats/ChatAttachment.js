import React from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CloseIcon from '../../assets/svg/Close_Icon.svg'
import { getAttachmentFileNameFromUri, getFileExtenstionFromUri } from '../../utils/Attachmets'

const ChatAttachment = ({
  documents,
  setDocuments,
  closeAttachments,
  attachmentDeleteIndexes = [],
}) => {
  const handleDelete = (index) => {
    setDocuments((prev) => {
      const copy = prev
      let newDocs = copy.filter((c, i) => i !== index)
      return [...newDocs]
    })
    if (documents?.length === 1) {
      closeAttachments()
    }
  }
  return (
    <View style={[s.container]}>
      {documents.map((document, index) => {
        let ext = getFileExtenstionFromUri(document.uri)
        return (
          !attachmentDeleteIndexes.includes(document.id) && (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
              }}
            >
              <View style={[s.documentContainer, { flexDirection: 'row' }]}>
                {(ext == '.png' || ext == '.jpg') && (
                  <Image source={{ uri: `${document?.uri}`, width: 50, height: 50 }} />
                )}
                {(ext == '.pdf' || ext == '.doc') && (
                  <Text style={s.attachmentItemText}>
                    {getAttachmentFileNameFromUri(document.name)}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => handleDelete(index)}>
                <CloseIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          )
        )
      })}
    </View>
  )
}

export default ChatAttachment

const s = StyleSheet.create({
  container: {
    height: "auto",
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    marginBottom: '1%',
    borderRadius: 8,
  },
  documentContainer: {
    display: 'flex',
  },
  attachmentItemText: {
    color: colors.HOME_TEXT,
  },
})
