import { useIsFocused } from '@react-navigation/native'
import DocumentPicker, { types } from 'react-native-document-picker'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import FileLoadIcon from '../../assets/svg/file_load.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CAttachments from '../../components/common/CAttachments'
import CButton from '../../components/common/CButton'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import MDocumentPicker from '../../components/common/MDocumentPicker'
import AttachmentModal from '../../components/modals/AttachmentModal'
import {
  getAttachmentsFromDocuments,
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { getErrorMessage, getOnlyErrorMessage, hasNoteDescriptionErros } from '../../utils/Errors'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import NoteDetailsSettingModal from '../../components/modals/NoteDetailsSettingModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MoveModal from '../../components/modals/MoveModal'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import SaveIcon from '../../assets/svg/save-icon.svg'
import ImageCropPicker from 'react-native-image-crop-picker'
import CameraModal from '../../components/modals/CameraModal'


const { height, width } = Dimensions.get('window')
const NoteDetailsScreen = ({ navigation, route }) => {
  const tabBarHeight = useBottomTabBarHeight()
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const richText = useRef()
  const [noteDetails, setNoteDetails] = useState({})
  const { plusDestinationParams } = useSelector((state) => state.tab)
  const { currentProject } = useSelector((state) => state.navigation)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [openConvertModal, setOpenConvertModal] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const scrollViewRef = useRef(null)
  const richTextScrollViewRef = useRef(null)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [documents, setDocuments] = useState([])
  const [showAttchment, setShowAttchment] = useState(false)
  const [noteDescription, setNoteDescription] = useState('')
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)

  const [errorMessages, setErrorMessages] = useState({
    des: '',
    project: '',
  })

  // const [selectedProject, setSelectedProject] = useState({})
  // const [selectedMilestone, setselectedMilestone] = useState([])
  // const [selectedDateTime, setSelectedDateTime] = useState({})

  useEffect(() => {
    const getNoteDetails = async () => {
      if (!id) return
      api.note
        .getNote(id)
        .then((res) => {
          if (res.success) {
          //  console.log('-----res.note-----', res?.note)
            setNoteDetails(res.note)
            setNoteDescription(res.note.description.value)
            setAttachments(res.note.attachments)
          }
        })
        .catch((err) => {
          //console.log(err, '-------------------')
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
    }
    getNoteDetails()
  }, [refetch])

  const setNoteHtml = () => {
    if (noteDetails?.description?.value)
      richText.current?.setContentHTML(noteDetails?.description?.value)
  }

  useEffect(() => {
    setNoteHtml()
  }, [noteDetails])

  const updateNote = () => {
    if (
      hasNoteDescriptionErros(noteDescription, setErrorMessages)
    ) {
      Alert.alert("Please, Add note Description.")
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

   
    let body = {
      description: noteDescription,
      project_id: noteDetails.project.id,
      _method: 'put',
    }

    // console.log(documents,'-----documents----------')
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    body = { ...body, ...attachments, ...attachmentIds }

    setBtnLoader(true)

    //console.log(body, id)
    api.note
      .updateNote(body, id)
      .then((res) => {
        setBtnLoader(false)
        navigation.navigate('Notes', { refetch: Math.random() })
      })
      .catch((err) => {
        //console.log(err, 'error...........')
        setBtnLoader(false)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          //console.log(err, 'error')
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
    //console.log(body)
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

  const addCameraImage = (uri) => {
    console.log(uri,'-----uri------')
    setDocuments((prev) => {
      return [...prev,{
        mimeType: 'image/jpeg',
        name: 'tempimage.jpg',
        uri: uri,
      }]
    })
    // setVisibleAttachment(true)
  }

  // const pickDocument = async () => {
  //   let result = await DocumentPicker.getDocumentAsync({})

  //   if ((result.type = 'success')) {
  //     if (result.uri) {
  //       setDocuments((prev) => {
  //         return [...prev, result]
  //       })
  //     }
  //     setShowAttchment(false)
  //   } else {
  //     //console.log('Cancelled')
  //   }
  // }

  const pickDocument = async () => {
    try {
      let results = await DocumentPicker.pick({
        allowMultiSelection: true,
        type: [types.pdf, types.docx, types.images],
        copyTo: 'cachesDirectory',
      })

      for (const res of results) {
        if (res.uri) {
          if (res.size < 10 * 1024 * 1024) {
            setDocuments((prev) => {
              return [...prev, res]
            })
            setShowAttchment(false)
          } else {
            Alert.alert('File Size too large!')
          }
        }
      }
    } catch (err) {
      console.warn(err)
    }
  }

  const attemptDelete = async () => {
    try {
      setBtnLoader(true)
      let res = await api.note.deleteNote(id)
      if (res.success) {
        Alert.alert('Delete Successful.')
        navigation.navigate('Notes', { refetch: Math.random() })
        setShowDeleteModal(false)
        setBtnLoader(false)
      }
    } catch (err) {
      // //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        // //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setBtnLoader(false)
    }
  }

  const attemptMove = async (project, milestone, task, issue, copy) => {
    try {
      setBtnLoader(false)

      const params = {
        model_ids: [id],
        state: 'note',
        project_id: project?.id,
        make_copy: copy,
      }

      let res = await api.project.moveItems(params)
      if (res.success) {
        Alert.alert('Move Successful.')
        setShowMoveModal(false)
        setBtnLoader(false)
      }
    } catch (err) {
      // //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        // //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setShowMoveModal(false)
      setBtnLoader(false)
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

  // useEffect(() => {
  //   const getNoteDetails = async () => {
  //     //console.log(id, 'id...........')
  //     api.note
  //       .getNote(id)
  //       .then((res) => {
  //         if (res.success) {
  //           //console.log(res?.note?.description?.value, '----------details-----------')
  //           const { description, attachments, project } = res.note
  //           //console.log('------------', attachments)
  //           setSelected(project)

  //           setNoteDescription(description?.value)
  //           //console.log(noteDescription)
  //           setAttachments(attachments)
  //         }
  //       })
  //       .catch((err) => //console.log(err.response))
  //   }
  //   if (id) getNoteDetails()
  // }, [])
  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
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
            style={[s.outerContainer, keyboardShow ? { marginBottom: 16 } : { marginBottom: 92 }]}
          >
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
              confirmationMessage={'Do you want to delete this note? This cannot be undone'}
              visibility={showDeleteModal}
              setVisibility={setShowDeleteModal}
              onDelete={attemptDelete}
              btnLoader={btnLoader}
            />

            <MoveModal
              visibility={showMoveModal}
              setVisibility={setShowMoveModal}
              // multipleSelect={multipleSelect}
              // setSelectable={setSelectable}
              state="note"
              onMove={attemptMove}
              btnLoader={btnLoader}
            />

            <NoteDetailsSettingModal
              visibility={showSettingsModal}
              setVisibility={setShowSettingsModal}
              onComplete={() => {
                //   setCompleteModal(true)
              }}
              convertToTask={() => {
                navigation.navigate('TaskEdit', { noteDetails: noteDetails, fromNote: true })
              }}
              // onDelete={attemptDelete}
              onMove={() => {
                setShowMoveModal(true)
                //   setShowCloneModal(true)
              }}
              onDelete={() => {
                setShowDeleteModal(true)
              }}
            />
            <View style={{ flex: 1 }}>
              <View style={s.headerContainer}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack()
                  }}
                  // outputRange={iconWrapColors}
                >
                  <BackArrow fill={colors.NORMAL} />
                </TouchableOpacity>
                <View>
                  <CText style={[g.title3, s.textColor]}>Note</CText>
                </View>

                

                <View style={s.buttonGroup}>
                  <IconWrap
                    onPress={() => {
                      setShowAttchment(true)
                    }}
                    style={s.buttonGroupBtn}
                  >
                    <FileLoadIcon />
                  </IconWrap>
                  <TouchableOpacity
                          // disabled={btnLoading}
                          onPress={updateNote}
                          style={[s.buttonGroupBtn]}
                        >
                          <SaveIcon />
                        </TouchableOpacity>
                  <IconWrap
                    onPress={() => {
                      setShowSettingsModal(true)
                    }}
                    style={s.buttonGroupBtn}
                  >
                    <MoreIcon fill={colors.NORMAL} />
                  </IconWrap>
                </View>
                
              </View>
              {btnLoader && 
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.HOVER} />
                </View>
              }

              {!btnLoader && 
              <ScrollView style={{ flex: 1 }}>
               
              <View
                    style={{
                      minHeight: 320,
                    }}
                    // ref={richTextScrollViewRef}
                  >    
                <ScrollView
                  style={{ height: height-tabBarHeight, marginBottom:16}}
                >
                  <RichEditor
                    
                    ref={richText}
                    initialContentHTML={noteDescription}
                    onChange={(descriptionText) => {
                      setNoteDescription(descriptionText)
                    }}
                    usecontainer={true}
                    onFocus={() => setKeyboardShow(true)}
                    initialHeight={height-tabBarHeight}
                  />
                  {errorMessages.des && <Text style={s.errorText}>{errorMessages.des}</Text>}
                </ScrollView>

                </View>

               

                <View style={{ marginVertical: 16, paddingBottom: 16 }}>
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
                </View>
              </ScrollView>
              }
            </View>

            { keyboardShow && (<RichToolbar
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
                />)}
            {/* <View style={s.divider}>
              <CButton
                style={[s.margin1x, { backgroundColor: '#246BFD' }]}
                onPress={updateNote}
              >
                <CText style={g.title3}>Save</CText>
              </CButton>
            </View> */}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

export default NoteDetailsScreen

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  outerContainer: {
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    // alignItems: 'flex-start',
    // marginBottom: 34,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 8,
  },
  titleText: {
    fontSize: 30,
    color: 'black',
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon2: {
    position: 'relative',
    left: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  calendarText: {
    color: 'black',
    marginLeft: 5,
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
  },
  descriptionContainer: {
    flex: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    // backgroundColor: 'yellow',
    padding: 10,
    width: '100%',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgb(45, 156, 219)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 10,
  },
  priorityStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 20,
    backgroundColor: 'white',
    color: '#1DAF2B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 10,
    marginLeft: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  listItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  listItemTitleText: {
    fontSize: 20,
    color: 'black',
  },
  listItemIcon: {
    marginLeft: 10,
  },
  listItemSubTitle: {
    color: 'gray',
  },
  divider: {
    // marginTop: 40,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    // alignSelf: 'flex-end',
    // marginBottom: 16,
  },
  margin1x: {
    // marginVertical: 10,
  },
  holdButton: {
    backgroundColor: 'red',
  },
  timeWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeContent: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#D6E2FF',
    padding: 6,
    borderRadius: 6,
  },
  marginL: {
    marginLeft: 12,
  },
  marginT: {
    marginTop: 8,
  },
  marginB: {
    marginBottom: 8,
  },
  dFlex: {
    display: 'flex',
    flexDirection: 'row',
    marginRight: 5,
  },
  marginTopNull: {
    marginTop: 0,
  },
  marginBottomNull: {
    marginBottom: 0,
  },
  ownerContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  textColor: {
    color: 'black',
  },
  errorText: {
    color: colors.RED_NORMAL,
  },
})
