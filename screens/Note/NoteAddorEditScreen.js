import { useIsFocused } from '@react-navigation/native'
// import * as DocumentPicker from 'expo-document-picker'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DocumentPicker, { types } from 'react-native-document-picker'
import ImagePicker from 'react-native-image-crop-picker'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import FileLoadIcon from '../../assets/svg/attachment-icon.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import MDocumentPicker from '../../components/common/MDocumentPicker'
import AttachmentModal from '../../components/modals/AttachmentModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
// import CKEditor from 'react-native-ckeditor'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Dimensions } from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import SaveIcon from '../../assets/svg/save-icon.svg'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import CameraModal from '../../components/modals/CameraModal'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments
} from '../../utils/Attachmets'
import {
  getErrorMessage,
  hasNoteDescriptionErros,
  hasProjectPickerErrors,
} from '../../utils/Errors'

const handleHead = ({ tintColor }) => <Text style={{ color: tintColor }}>H1</Text>

const { height, width } = Dimensions.get('window')

export default function NoteAddOrEditScreen({ navigation, route }) {
  const tabBarHeight = useBottomTabBarHeight()
  let id = route.params ? route.params.id : null
  let projectId = route.params ? route.params.projectId : null
  let backScreen = route.params ? route.params.backScreen : null
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [noteName, setNoteName] = useState('')
  const [projectDetails, setProjectDetails] = useState(null)
  const [noteDescription, setNoteDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showAttchment, setShowAttchment] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [errorMessages, setErrorMessages] = useState({
    des: '',
    project: '',
  })
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const scrollViewRef = useRef(null)
  const richText = useRef()
  const richTextScrollViewRef = useRef(null)
  const { currentProject } = useSelector((state) => state.navigation)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [next, setNext] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)

  const goBack = () => {
    navigation.goBack()
  }
  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }

  const addorUpdateNote = () => {
    if (hasNoteDescriptionErros(noteDescription, setErrorMessages)) {
      Alert.alert('Please, Add note Description.')
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

    setBtnLoader(true)
    let body = {
      description: noteDescription,
      project_id: selected.id,
    }
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    body = { ...body, ...attachments, ...attachmentIds }

    console.log(body, 'body......')
    api.note
      .createNote(body)
      .then((res) => {
        setBtnLoader(false)
        navigation.navigate('Notes', { refetch: Math.random() })
      })
      .catch((err) => {
        console.log(err, '00000000000000')
        setBtnLoader(false)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }

  const handleNext = () => {
    if (hasProjectPickerErrors(selected.name, setErrorMessages)) {
      return
    }
    setNext(true)
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

  const pickImage = async () => {
    ImagePicker.openPicker({
      multiple: true,
    }).then((images) => {
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
    })
  }

  const addCameraImage = (uri) => {
    // console.log(uri,'-----uri------')
    setDocuments((prev) => {
      return [
        ...prev,
        {
          mimeType: 'image/jpeg',
          name: 'tempimage.jpg',
          uri: uri,
        },
      ]
    })
    // setVisibleAttachment(true)
  }

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

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
    }
    const getNoteDetails = async () => {
      api.note
        .getNote(id)
        .then((res) => {
          if (res.success) {
            const { description, attachments, project } = res.note
            setSelected(project)
            if (description?.value != 'null')
              setNoteDescription(description?.value ? description.value : '')
            setAttachments(attachments)
          }
        })
        .catch((err) => {})
    }
    if (id) getNoteDetails()
  }, [])

  const { height, width } = Dimensions.get('window')

  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          { flex: 1 },
          next ? { backgroundColor: colors.CONTAINER_BG } : { backgroundColor: colors.WHITE },
        ]}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            richText.current?.dismissKeyboard()
            // //console.log('clicked for dismiss')
            setKeyboardShow(false)
          }}
        >
          <View
            style={[
              g.outerContainer,
              next ? { backgroundColor: colors.CONTAINER_BG } : { backgroundColor: colors.WHITE },
              // s.background,
              keyboardShow
                ? { marginBottom: 16 }
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 96 : 66 },
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (next) {
                    setNext(false)
                  } else {
                    navigation.navigate('Notes', { refetch: Math.random() })
                  }
                }}
                outputRange={iconWrapColors}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={[g.body1, { textAlign: 'center' }]}>New Note</Text>
              </View>

              {next && (
                <View style={s.buttonGroup}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAttchment(true)
                    }}
                    style={[s.buttonGroupBtn, { marginRight: 8 }]}
                  >
                    <FileLoadIcon />
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={btnLoader}
                    onPress={addorUpdateNote}
                    style={[s.buttonGroupBtn]}
                  >
                    <SaveIcon />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {btnLoader && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.HOVER} />
              </View>
            )}
            {!btnLoader && (
              <>
                <ScrollView style={{ flex: 1 }}>
                  {!next && (
                    <CSelectWithLabel
                      style={{ backgroundColor: colors.CONTAINER_BG }}
                      containerStyle={{ marginVertical: 0 }}
                      label="Project element"
                      onPress={openProjectPickerModal}
                      selectText={selected.id != -1 ? selected.name : 'Select'}
                      errorMessage={errorMessages.project}
                      showErrorMessage
                      required
                    />
                  )}

                  {next && (
                    <>
                      <View
                        style={{
                          minHeight: 320,
                        }}
                      >
                        <ScrollView style={{ height: height - tabBarHeight, marginBottom: 16 }}>
                          <RichEditor
                            ref={richText}
                            initialContentHTML={noteDescription}
                            onChange={(descriptionText) => {
                              setNoteDescription(descriptionText)
                            }}
                            usecontainer={true}
                            onFocus={() => setKeyboardShow(true)}
                            initialHeight={height - tabBarHeight}
                          />
                        </ScrollView>

                        {errorMessages.des && <Text style={s.errorText}>{errorMessages.des}</Text>}
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
                    </>
                  )}
                </ScrollView>

                {!next && (
                  <View style={[keyboardShow ? { marginTop: 16 } : { marginTop: 0 }]}>
                    <CButtonInput label="Next" onPress={handleNext} loading={btnLoader} />
                  </View>
                )}

                {next && keyboardShow && (
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
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  avoidingContainer: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
  },

  innerContainer: {
    paddingHorizontal: 16,
    // borderWidth: 1,
    justifyContent: 'space-between',
    flex: 1,
  },

  background: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
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
    marginVertical: 8,
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
    marginBottom: 8,

    // backgroundColor:"yellow"
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
    // marginLeft: 8,
    paddingLeft: 8,
  },
  errorText: {
    color: colors.RED_NORMAL,
  },
})
