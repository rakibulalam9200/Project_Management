import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import FileLoadIcon from '../../assets/svg/attachment-icon.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SaveIcon from '../../assets/svg/save-icon.svg'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CText from '../../components/common/CText'
import MDocumentPicker from '../../components/common/MDocumentPicker'
import AttachmentModal from '../../components/modals/AttachmentModal'
import ChecklistItemSaveOrCancelModal from '../../components/modals/ChecklistItemSaveOrCancelModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import ItemsSettingModal from '../../components/modals/ItemsSettingModal'
import ListCloneConfirmationModal from '../../components/modals/ListCloneConfirmationModal'
import ListCompleteModal from '../../components/modals/ListCompleteModal'
import ListReOpenModal from '../../components/modals/ListReopenModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import {
  getErrorMessage,
  getOnlyErrorMessage,
  hasListItemDescriptionErros,
} from '../../utils/Errors'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import ImageCropPicker from 'react-native-image-crop-picker'
import CameraModal from '../../components/modals/CameraModal'


const { height, width } = Dimensions.get('window')

export default function AddChecklistItemScreen({ navigation, route }) {
  const tabBarHeight = useBottomTabBarHeight()
  let id = route.params ? route.params.id : null
  let todoId = route.params ? route.params.todoId : null
  let checklistDetails = route.params ? route.params?.checklist : null
  let [order, setOrder] = useState(route.params ? route.params?.order : null)
  let [itemOrder, setItemOrder] = useState(route.params ? route.params?.itemOrder : null)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const userInfo = useSelector((state) => state.user.user)
  const { plusDestinationParams } = useSelector((state) => state.tab)
  const { currentProject } = useSelector((state) => state.navigation)

  const [description, setDescription] = useState('')
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showAttchment, setShowAttchment] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [itemStatus, setItemStatus] = useState(true)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [dataLoader, setDataLoader] = useState(false)
  const richText = useRef()

  const [errorMessages, setErrorMessages] = useState({
    des: '',
    project: '',
  })
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const scrollViewRef = useRef(null)
  const [completeModal, setCompleteModal] = useState(false)
  const [statusLoader, setStatusLoader] = useState(false)
  const [reOpenModal, setReOpenModal] = useState(false)
  const [refersh, setRefresh] = useState(false)
  const [listItem, setListItem] = useState(null)
  const [btnLoading, setBtnLoading] = useState(false)

  const goBack = () => {
    navigation.goBack()
  }
  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const hideSaveModal = () => {
    setShowSaveModal(false)
  }

  const allowSaveModal = () => {
    if (hasListItemDescriptionErros(description, setErrorMessages)) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    setShowSaveModal(true)
  }

  const addOrUpdateListItem = (redirect = true) => {
    let body = {}
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    body = { ...body, ...attachments, ...attachmentIds }
    
    if (id) {
      body['description'] = description
      setLoading(true)
      setDataLoader(true)
      api.checklist
        .updateItem(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('ChecklistDetails', {
              id: todoId,
              checklist: checklistDetails,
              refetch: Math.random(),
            })
          }
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            //console.log(err.response, 'error')
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
        .finally(() => {
          setBtnLoading(false)
          setLoading(false)
          setDataLoader(false)
        })
    } else {
      body['todolist_id'] = todoId
      body['description'] = description

      //console.log(body)

      // return
      setLoading(true)
      setDataLoader(true)
      api.checklist
        .createItem(body)
        .then((res) => {
          if (res.success) {
            setDataLoader(false)
            if (redirect) {
              navigation.navigate('ChecklistDetails', {
                id: todoId,
                checklist: checklistDetails,
                refetch: Math.random(),
              })
            } else {
              setDescription('')
              setDocuments([])
            }
          }
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            //console.log(err.response, 'error')
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
        .finally(() => {
          setLoading(false)
          setDataLoader(false)
        })
    }
  }

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
          if (res.size < 2 * 1024 * 1024) {
            setDocuments((prev) => {
              return [...prev, res]
            })
            setShowAttchment(false)
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

  const pickCameraImage = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      multiple: true,
      copyToCacheDirectory: true,
    })

    if ((result.type = 'success')) {
      if (result.uri) {
        setDocuments((prev) => {
          return [...prev, result]
        })
        setShowAttchment(false)
      }
    } else {
      setShowAttchment(false)
    }
  }

  const addCameraImage = (uri) => {
    setDocuments((prev) => {
      return [...prev,{
        mimeType: 'image/jpeg',
        name: 'tempimage.jpg',
        uri: uri,
      }]
    })
    // setVisibleAttachment(true)
  }

  const pickImage = async () => {
    ImageCropPicker.openPicker({
      multiple: true
    }).then(images => {
      for (const img of images) {
        if (img.sourceURL) {
          if (img.size < 10 * 1024 * 1024) {
            setDocuments((prev) => {
              return [...prev, img]
            })
            setShowAttchment(false)
          } else {
            Alert.alert('File Size too large!')
          }
        }
      }
      setShowAttchment(false)
    });
  }

  const attemptSingleItemStatusChange = () => {
    if (id) {
      setStatusLoader(true)
      api.checklist
        .toggleListItemStatus(id)
        .then((res) => {})
        .catch((err) => {
          //console.log(err.response)
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          // statusChange.current = null
          setRefresh((prev) => !prev)
          // setShowStatusChangeModal(false)
          setCompleteModal(false)
          setReOpenModal(false)
          setStatusLoader(false)
        })
    }
  }

  const attemptDelete = async () => {
    try {
      if (id) {
        setStatusLoader(true)
        // //console.log(singleSelect.current, '.......................')
        let res = await api.checklist.deleteChecklistItem(id)

        if (res.success) {
          Alert.alert('Delete Successful.')
          navigation.navigate('ChecklistDetails', {
            id: todoId,
            checklist: checklistDetails,
            refetch: Math.random(),
          })
        }
        setShowDeleteModal(false)
      } else {
        Alert.alert('Please select at least one Checklist to delete')
        setShowDeleteModal(false)
      }
    } catch (err) {
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setStatusLoader(false)
    }
  }

  const attemptClone = async () => {
    try {
      if (id) {
        setStatusLoader(true)
        let toCloneArray = [id]
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          //console.log(toCloneArray, 'to clone array....')
          let res = await api.checklist.cloneChecklistItem({
            list_item_ids: toCloneArray,
          })
          //console.log(res)
          if (res.success) {
            Alert.alert('Clone Successful.')
            navigation.navigate('ChecklistDetails', {
              id: todoId,
              checklist: checklistDetails,
              refetch: Math.random(),
            })
          }
        }
      } else {
        Alert.alert('Please select at least one Checklist to clone.')
      }
    } catch (err) {
      //console.log(err.response.message)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setStatusLoader(false)
    }
  }

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
    }
    const getCheckListItemDetails = async () => {
      setDataLoader(true)
      api.checklist
        .getItemDetails(id)
        .then((res) => {
          // //console.log({ res })
          if (res?.success) {
            setListItem(res?.list_item)
            setDescription(res?.list_item?.description?.value)
            setAttachments(res?.list_item?.attachments)
            setItemStatus(res?.list_item?.is_done)
            setDataLoader(false)
          }
        })
        .catch((err) => {
          setDataLoader(false)
        })
    }
    if (id) getCheckListItemDetails()
  }, [itemStatus, refersh])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])
  return (
    <SafeAreaView style={[g.safeAreaStyle]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.CONTAINER_BG }}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            richText.current?.dismissKeyboard()
            setKeyboardShow(false)
          }}
        >
          <View
            style={[
              g.outerContainer,
              s.background,
              keyboardShow ? { marginBottom: 16 } : { marginBottom: 60 },
            ]}
          >
            <ProjectPickerModal
              visibility={showProjectPicker}
              setVisibility={setShowProjectPicker}
              selected={selected}
              setSelected={setSelected}
            />
            <AttachmentModal
              visibility={showAttchment}
              setVisibility={setShowAttchment}
              documents={documents}
              setDocuments={setDocuments}
              pickDocument={pickDocument}
              pickImage={pickImage}
              onCamera={() => setShowCameraModal(true)}
            />

            <CameraModal
              visibility={showCameraModal}
              setVisibility={setShowCameraModal}
              onSave={addCameraImage}
              onPressGallery={pickCameraImage}
            />
            
            <DeleteConfirmationModal
              confirmationMessage={'Do you want to delete this list item? This cannot be undone'}
              visibility={showDeleteModal}
              setVisibility={setShowDeleteModal}
              onDelete={attemptDelete}
              btnLoader={statusLoader}
            />
            <ListCloneConfirmationModal
              visibility={showCloneModal}
              setVisibility={setShowCloneModal}
              onClone={attemptClone}
              btnLoader={statusLoader}
              confirmationMessage="Do you want to Clone list Item? List Items will be clone with same state."
            />
            <ItemsSettingModal
              visibility={showSettingsModal}
              setVisibility={setShowSettingsModal}
              onComplete={() => {
                setCompleteModal(true)
              }}
              convertToTask={() => {
                navigation.navigate('ConvertToTaskFromListItem', {
                  listItem: listItem,
                })
              }}
              // onDelete={attemptDelete}
              onClone={() => {
                setShowCloneModal(true)
              }}
              onDelete={() => {
                setShowDeleteModal(true)
              }}
            />
            <ChecklistItemSaveOrCancelModal
              openModal={showSaveModal}
              setOpenModal={setShowSaveModal}
              onSave={addOrUpdateListItem}
              loading={dataLoader}
              setLoading={setDataLoader}
              onSaveAndCreateNew={() => {
                addOrUpdateListItem(false)
                hideSaveModal()
                setOrder((prev) => {
                  if (prev) {
                    return prev + 1
                  } else {
                    return prev
                  }
                })
              }}
              onCancel={hideSaveModal}
            />

            <ListReOpenModal
              visibility={reOpenModal}
              setVisibility={setReOpenModal}
              onComplete={attemptSingleItemStatusChange}
              confirmationMessage={'Do you want to reopen this list items?'}
              statusLoader={statusLoader}
              setStatusLoader={setStatusLoader}
            />

            <ListCompleteModal
              visibility={completeModal}
              setVisibility={setCompleteModal}
              onComplete={attemptSingleItemStatusChange}
              confirmationMessage={'Do you want to complete this list items?'}
              statusLoader={statusLoader}
              setStatusLoader={setStatusLoader}
            />
            {!dataLoader ? (
              <>
                <View style={[s.headerContainer]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.goBack()
                      }}
                      outputRange={iconWrapColors}
                    >
                      <BackArrow fill={colors.NORMAL} />
                    </TouchableOpacity>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <CText style={[g.title3, s.textColor]}>
                        {id
                          ? `Item ${itemOrder >= 10 ? itemOrder : ' 0' + itemOrder} details`
                          : 'Add list item'}

                        {!id && (
                          <Text style={s.orderText}>{`${
                            order >= 10 ? order : ' 0' + order
                          } `}</Text>
                        )}
                      </CText>
                    </View>
                  </View>

                  <View style={s.buttonGroup}>
                    {(!itemStatus || !id) && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setShowAttchment(true)
                          }}
                          style={[s.buttonGroupBtn, { marginRight: 8 }]}
                        >
                          <FileLoadIcon />
                        </TouchableOpacity>

                        <TouchableOpacity
                          disabled={btnLoading}
                          onPress={id ? addOrUpdateListItem : allowSaveModal}
                          style={[s.buttonGroupBtn, { marginRight: 8 }]}
                        >
                          <SaveIcon />
                        </TouchableOpacity>
                      </>
                    )}
                    {id && !itemStatus && (
                      <TouchableOpacity
                        onPress={() => {
                          setShowSettingsModal(true)
                        }}
                        style={s.buttonGroupBtn}
                      >
                        <MoreIcon />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <ScrollView style={{ flex: 1 }}>

                <ScrollView style={{ height: height-tabBarHeight,marginBottom:16}}>
                      <RichEditor
                        ref={richText}
                        initialContentHTML={description}
                        onChange={(descriptionText) => {
                          setDescription(descriptionText)
                        }}
                        usecontainer={true}
                        onFocus={() => setKeyboardShow(true)}
                        initialHeight={height-tabBarHeight}
                    
                      />
                    </ScrollView>
                 
                  <CAttachments
                    attachments={attachments}
                    setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                    attachmentDeleteIndexes={attachmentDeleteIndexes}
                  />
                  <MDocumentPicker
                    documents={documents}
                    setDocuments={setDocuments}
                    pickDocument={pickDocument}
                  />
                </ScrollView>

                {itemStatus && id && (
                  <CButtonInput
                    label="Open"
                    onPress={() => setReOpenModal(true)}
                    // loading={btnLoading}
                    style={{ marginTop: 32 }}
                  />
                )}
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.HOVER} />
              </View>
            )}

           { keyboardShow && (
              <RichToolbar
                style={{ backgroundColor: colors.WHITE, marginBottom: 0 }}
                editor={richText}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertOrderedList,
                  actions.insertBulletsList,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                  // keyboardShow ? actions.keyboard : null,
                ]}
                selectedButtonStyle={[g.editorActivebuttonStyle]}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.PRIM_BG,
    // marginBottom: 60,
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
    backgroundColor: colors.WHITE,
    color: colors.BLACK,
    padding: 16,
    borderRadius: 10,
    // marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
  },
  checklistContainer: {
    backgroundColor: '#F2F6FF',
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  checklistText: {
    color: '#246BFD',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 5,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // flex: 1,
    // paddingHorizontal: 16,
    // marginTop: 24,
  },
  orderText: {
    color: colors.ICON_BG,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textColor: {
    color: 'black',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  errorText: {
    color: colors.RED_NORMAL,
  },
})
