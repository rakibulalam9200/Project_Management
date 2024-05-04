import React, { useEffect, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CDocumentPicker from '../../components/common/CDocumentPicker'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsFromDocuments,
  getAttachmentsIdsFromDeleteIndexArrays
} from '../../utils/Attachmets'
import { getErrorMessage } from '../../utils/Errors'

export default function ItemAddOrEditScreen({ navigation, route }) {
  let listId = route.params ? route.params.listId : null
  let itemId = route.params ? route.params.itemId : null
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [itemDescription, setItemDescription] = useState('')
  const [documents, setDocuments] = useState([])

  const [errorMessages, setSErrorMessages] = useState({
    name: '',
  })
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])

  const goBack = () => {
    navigation.goBack()
  }
  const addOrUpdateProject = () => {
    let body = {
      description: itemDescription,
      todolist_id: listId,
    }

    let attachments = getAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    body = { ...body, ...attachments, ...attachmentIds }
    //console.log(body, 'body...')
    if (itemId) {
      api.checklist
        .updateItem(body, itemId)
        .then((res) => {
          if (res.success) {
            navigation.navigate('ItemDetails', { id: itemId, refetch: Math.random() })
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
    } else {
      api.checklist
        .createItem(body)
        .then((res) => {
          if (res.success) {
            //console.log(res)
            navigation.navigate('Items', { refetch: Math.random(), id: listId })
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
    }
    //console.log(body)
  }

  useEffect(() => {
    const showItemdetails = async () => {
      api.checklist
        .getItemDetails(itemId)
        .then((res) => {
          //console.log(res)
          if (res.success) {
            //console.log(res.list_item, '======')
            const { description, attachments } = res.list_item

            if (description?.value != 'null') {
              setItemDescription(description?.value ? description.value : '')
            }

            setAttachments(attachments)
          }
        })
        .catch((err) => {})
    }
    if (itemId) showItemdetails()
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  // useEffect(() => {
  //   //console.log({ projectAddress })
  // }, [projectAddress])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={[g.outerContainer, s.background]}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        horizontal={false}
      >
        <View style={[g.innerContainer]}>
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
              <Text style={[g.body1, { textAlign: 'center' }]}>
                {itemId ? 'Update Item' : 'Add Item'}
              </Text>
            </View>
          </View>
          {/* <CHeaderWithBack
            style={{fontSize:16}}
            navigation={navigation}
            title={id ? 'Update Project' : 'Add New Project'}
            onPress={goBack}
          /> */}
          <TextInput
            style={s.inputStyle}
            spaces={false}
            maxLength={255}
            placeholder="Description"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={colors.HEADER_TEXT}
            value={itemDescription}
            onChangeText={setItemDescription}
          />

          <CAttachments
            attachments={attachments}
            setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
            attachmentDeleteIndexes={attachmentDeleteIndexes}
          />
          <CDocumentPicker documents={documents} setDocuments={setDocuments} />

          <CButtonInput label="Save" onPress={addOrUpdateProject} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    marginBottom: 60,
  },
  container: {
    marginTop: 24,
  },
  headerTitle: {
    marginLeft: 24,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  gapVertical: {
    marginVertical: 10,
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
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
})
