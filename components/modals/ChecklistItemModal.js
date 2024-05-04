import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import api from '../../api/api'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import {
  getAttachmentsFromDocuments,
  getAttachmentsIdsFromDeleteIndexArrays
} from '../../utils/Attachmets'
import { getErrorMessage } from '../../utils/Errors'
import CAttachments from '../common/CAttachments'
import CButtonInput from '../common/CButtonInput'
import CDocumentPicker from '../common/CDocumentPicker'

export default function CheckListItemModal({
  visibility,
  setVisibility,
  item,
  setItems,
  newItems,
  setNewItems,
  editItem,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [description, setDescription] = useState('')
  const [previousAttachments, setPreviousAttachments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [errorMessages, setErrorMessages] = useState({
    description: '',
  })
  let navigation = useNavigation()

  useEffect(() => {
    if (editItem?.id) {
      setDescription(editItem?.description?.value)
      setPreviousAttachments(editItem?.attachments)
    }
    return () => {}
  }, [editItem])

  const addChecklistItem = () => {
    if (editItem !== undefined) {
      //console.log(attachments, 'attach...........')
      const attachmentsObj = getAttachmentsFromDocuments(attachments)
      let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
      //console.log(attachmentIds,"attchment id........")

      let body = {
        description: description,
      }
      body = { ...body, ...attachmentsObj, ...attachmentIds }
      api.checklist
        .updateItem(body, editItem?.id )
        .then((res) => {
          // //console.log(res)
          if (res.success) {
            navigation.navigate('Checklist', { refetch: Math.random() })
          }
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
      // setAttachments([])
    } else {
      //console.log("hite here sjfdslkfj")
      // const attachmentsObj = getAttachmentsFromDocuments(attachments)
      setItems((prev) => {
        const copy = [...prev]
        copy.push({
          id: copy.length + 1,
          description,
          attachments
        })
        return copy
      })

      setNewItems((prev) => {
        const copy = [...prev]
        copy.push({
          id: copy.length + 1,
          description,
          attachments
        })
        return copy
      })
    }
    setDescription('')
    setPreviousAttachments([])
    setAttachments([])
    closeModal()
  }
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[g.outerContainer, s.containerBG,s.innerContainer]}>
        <View style={g.hFlex}>
            <TouchableOpacity
              onPress={() => {
                // //console.log(refetch)
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <View style={{ width: '100%', flex: 1 }}>
              <Text style={[g.body1, { textAlign: 'center' }]}>{editItem?.id ? 'Update Checklist' : 'Add Checklist'}</Text>
            </View>

          </View>
        <ScrollView style={s.modalOuterContainer}>
          <TextInput
            style={s.inputStyle}
            spaces={false}
            maxLength={255}
            placeholder="Description"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={colors.HEADER_TEXT}
            value={description}
            onChangeText={setDescription}
          />
          <CAttachments
            attachments={previousAttachments}
            setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
            attachmentDeleteIndexes={attachmentDeleteIndexes}
          />
          <CDocumentPicker documents={attachments} setDocuments={setAttachments} />
          <CButtonInput label="Save" onPress={addChecklistItem} />
        </ScrollView>
       
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
  },
  modalInnerContainer: {
    // padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
  containerBG: {
    backgroundColor: colors.WHITE,
    // backgroundColor:"lightblue"
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  innerContainer: {
    flex: 1,
    // padding: 16,
    marginHorizontal:16,
  },
})
