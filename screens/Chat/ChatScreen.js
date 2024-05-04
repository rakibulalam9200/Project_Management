import { Audio } from 'expo-av'
import * as DocumentPicker from 'expo-document-picker'
import Echo from 'laravel-echo'
import moment from 'moment-mini'
import Pusher from 'pusher-js/react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CameraIcon from '../../assets/svg/camera-2.svg'
import AttachmentIcon from '../../assets/svg/clip.svg'
import DocIcon from '../../assets/svg/docicon.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SendMessage from '../../assets/svg/sendMessage.svg'
import PauseIconbIG from '../../assets/svg/stop-blue.svg'
import VoiceRecorderICon from '../../assets/svg/voice-recorder.svg'
import ChatAttachment from '../../components/chats/ChatAttachment'
import VoiceAttachment from '../../components/chats/VoiceAttachment'
import CText from '../../components/common/CText'
import AttachmentModal from '../../components/modals/AttachmentModal'
import CameraModal from '../../components/modals/CameraModal'
import EditChatModal from '../../components/modals/EditChatModal'
import ImagePreviewModal from '../../components/modals/ImagePreviewModal'
import PdfPreviewModal from '../../components/modals/PdfPreviewModal'
import getEnvVars from '../../environment.js'
import {
  getAttachmentsFromDocuments,
  getAttachmentsIdsFromDeleteIndexArrays,
} from '../../utils/Attachmets'
import { getErrorMessage } from '../../utils/Errors'
import AudioCard from './AudioCard.js'
import RecordingPreview from './RecordingPreview.js'

const ChatCard = React.memo(
  ({
    item,
    index,
    setEditMessage,
    setShowEditChat,
    showEditChat,
    setImage,
    setShowImagePreviewModal,
    setPdf,
    setShowPdfModal,
  }) => {
    //console.log(item, 'item')
    const msg = item.message
    const { user } = useSelector((state) => state.user)
    const soundObject = useRef(new Audio.Sound())
    const [soundLoaded, setSoundLoaded] = useState(false)
    const [soundLoading, setSoundLoading] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [isVoice, setIsVoice] = useState(false)
    const [playBackCounter, setPlayBackCounter] = useState(0)
    const [remainingSecs, setRemainingSecs] = useState(0)

    const toggleChat = (item) => {
      if (!item.is_deleted) {
        setEditMessage(item)
        setShowEditChat(!showEditChat)
      }
    }

    useEffect(() => {
      setRemainingSecs(getDurationFormatted(playBackCounter))
    }, [playBackCounter])

    useEffect(() => {
      let myInterval

      if (playing) {
        myInterval = setInterval(() => {
          setPlayBackCounter((prev) => prev - 1000)
        }, 1000)
      } else {
        //console.log('clear')
        clearInterval(myInterval)
      }

      return () => {
        clearInterval(myInterval)
      }
    }, [playing])

    const getDurationFormatted = (milliseconds) => {
      const minutes = milliseconds / 1000 / 60
      const seconds = Math.round((minutes - Math.floor(minutes)) * 60)
      return seconds < 10
        ? `${Math.floor(minutes)}:0${seconds}`
        : `${Math.floor(minutes)}:${seconds}`
    }
    useEffect(() => {
      const voiceMsg = item?.attachments?.find((attach) => attach.content_type === 'm4a')
      if (voiceMsg) {
        setIsVoice(true)
      } else {
        setIsVoice(false)
      }
    }, [item])

    //console.log(item, 'item2')
    if (item?.sender_id === user?.id) {
      return (
        <TouchableOpacity key={index} onPress={() => toggleChat(item)} disabled={item?.is_deleted}>
          {!isVoice && <View style={s.sideView}></View>}
          <View
            style={[
              isVoice ? s.voiceChatContainer : s.chatContainer,
              item?.attachments.length > 0
                ? { flexDirection: 'column' }
                : msg?.length <= 25 || item.is_deleted
                  ? { flexDirection: 'row' }
                  : { flexDirection: 'column' },
            ]}
          >
            {msg && (
              <Text
                style={[
                  { fontSize: 16, marginBottom: 8 },
                  item?.is_deleted ? { color: '#9CA2AB' } : { color: 'black' },
                ]}
              >
                {item.is_deleted ? item.deleted_message : msg}
              </Text>
            )}
            {item?.attachments?.length > 0 &&
              item?.attachments.map((attach, idx) => (
                <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }} key={idx}>
                  {(attach.content_type === 'pdf' || attach.content_type === 'doc') && (
                    <TouchableOpacity
                      style={s.docContainer}
                      onPress={() => {
                        setPdf({
                          url: attach?.url,
                          name: attach?.name,
                        })
                        setShowPdfModal(true)
                      }}
                    >
                      <DocIcon />
                      <Text>{attach?.name}</Text>
                    </TouchableOpacity>
                  )}
                  {(attach.content_type === 'png' || attach.content_type === 'jpg') && (
                    <TouchableOpacity
                      onPress={() => {
                        setImage(attach?.url)
                        setShowImagePreviewModal(true)
                      }}
                    >
                      <Image
                        source={{
                          uri: `${attach?.url}`,
                          width: 200,
                          height: 200,
                          resizeMode: 'cover',
                        }}
                      />
                    </TouchableOpacity>
                  )}

                  {attach.content_type === 'm4a' && <AudioCard attach={attach} />}
                </View>
              ))}
            {!isVoice && (
              <Text style={[s.mTime]}>{moment(new Date(item.created_at)).format('lll')}</Text>
            )}
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <View key={index} style={s.senderChatContainer}>
          <Image
            source={{ uri: `${item?.sender?.image}`, width: 32, height: 32 }}
            style={s.senderImgStyle}
          />
          <View style={s.senderContent}>
            <View style={s.senderSideView}></View>
            <View
              style={
                ({ marginLeft: 8 },
                [
                  msg?.length <= 20 || item.is_deleted
                    ? { flexDirection: 'row' }
                    : { flexDirection: 'column', flex: 1 },
                ])
              }
            >
              <View style={[s.senderTextContainer]}>
                <Text style={s.senderName}>{item?.sender?.first_name}</Text>
                <Text
                  style={[
                    s.senderMsg,
                    item?.is_deleted ? { color: '#9CA2AB' } : { color: 'black' },
                  ]}
                >
                  {item?.is_deleted ? item?.deleted_message : msg}
                </Text>
                {/* {item?.attachments?.length > 0 && (
                  <Image
                    source={{ uri: `${item?.attachments[0]?.url}`, width: 150, height: 150 }}
                  />
                )} */}
                {item?.attachments?.length > 0 &&
                  item?.attachments.map((attach, idx) => (
                    <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }} key={idx}>
                      {(attach.content_type === 'pdf' || attach.content_type === 'doc') && (
                        <TouchableOpacity
                          style={s.docContainer}
                          onPress={() => {
                            setPdf({
                              url: attach?.url,
                              name: attach?.name,
                            })
                            setShowPdfModal(true)
                          }}
                        >
                          <DocIcon />
                          <Text>{attach?.name}</Text>
                        </TouchableOpacity>
                      )}
                      {(attach.content_type === 'png' || attach.content_type === 'jpg') && (
                        <TouchableOpacity
                          onPress={() => {
                            setImage(attach?.url)
                            setShowImagePreviewModal(true)
                          }}
                        >
                          <Image
                            source={{
                              uri: `${attach?.url}`,
                              width: 150,
                              height: 150,
                              resizeMode: 'cover',
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
              </View>
              <Text
                style={[
                  s.mSenderTime,
                  msg?.length <= 20 || item.is_deleted ? { marginTop: 16 } : { marginTop: 4 },
                ]}
              >
                {moment(new Date(item?.created_at)).format('lll')}
              </Text>
            </View>
          </View>
        </View>
      )
    }
  }
)

const ChatScreen = ({ navigation, route }) => {
  const [chats, setChats] = useState([])

  const { currentProject, currentMilestone, currentTask, currentIssue } = useSelector(
    (state) => state.navigation
  )
  const [loading, setLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.user)
  const { stage } = useSelector((state) => state.navigation)
  const [message, setMessage] = useState('')
  const [messageBoxHeight, setMessageBoxHeight] = useState(40)
  const [editMessage, setEditMessage] = useState(null)
  const [documents, setDocuments] = useState([])
  const [image, setImage] = useState(null)
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [showAttchment, setShowAttchment] = useState(false)
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])

  const [recording, setRecording] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [visibleVoicePreview, setVisibleVoicePreview] = useState(false)

  const [visibleAttachment, setVisibleAttachment] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    message: '',
  })
  const [pdf, setPdf] = useState({})
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showEditChat, setShowEditChat] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const flatListRef = useRef()
  const scrollPositionRef = useRef()
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const autoScrollHappened = useRef(false)
  const channelData = route.params ? route.params?.channelData : null
  // //console.log(channelData, 'channelData')
  // const { authEndpoint, wsHost, wsPort, wssPort, enabledTransports, forceTLS } = getEnvVars()
  const { chatEnv, APP_KEY } = getEnvVars()
  let chatChannel

  if (channelData) {
    chatChannel = channelData
  } else {
    if (currentIssue) {
      chatChannel = currentIssue
    } else if (currentTask) {
      chatChannel = currentTask
    } else if (currentMilestone) {
      chatChannel = currentMilestone
    } else if (currentProject) {
      chatChannel = currentProject
    }
  }

  const closeAttachments = () => {
    setVisibleAttachment(false)
    setDocuments([])
  }

  const closeVoicePreview = () => {
    setVisibleVoicePreview(false)
    setRecordings([])
  }

  const editChat = () => {
    setMessage(editMessage.message)
    setShowEditChat(false)
  }

  useEffect(() => {
    const listenMesage = async () => {
      const client = new Pusher(APP_KEY, {
        ...chatEnv,
        auth: {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      })

      const echo = new Echo({
        broadcaster: 'pusher',
        client,
        disableStats: true,
      })

      echo
        .channel(`chat.${channelData ? channelData.stage : stage}.${chatChannel.id}`)
        .listen('.message', (e) => {
          //console.log(e, 'e..............')
          setChats((pre) => {
            if (Array.isArray(pre)) {
              const index = pre?.findIndex((chat) => chat?.id == e.message.id)
              if (index > -1) {
                const copy = [...pre]
                copy.splice(index, 1, e.message)
                return copy
              } else {
                return [{ ...e.message }, ...pre]
              }
            } else {
              //console.log('not found')
              return pre
            }
          })
        })
        .error((err) => {})
    }
    let isMounted = true
    if (isMounted) {
      listenMesage()
      // setVisibleAttachment(false)
    }
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (page > lastPage) {
      return
    }
    //console.log('use Effect')
    setLoading(true)
    api.chat
      .getChat({
        id: chatChannel?.id,
        stage: channelData ? channelData.stage : stage,
        type: 'message',
        allData: 0,
        pagination: 10,
        page: page,
      })
      .then((res) => {
        if (page == 1) {
          setChats(res.data)
        } else {
          setChats((prev) => [...prev, ...res.data])
        }
        setLastPage(res.meta.last_page)
      })
      .catch((err) => {
        // let errorMsg = ''
        // try {
        //   errorMsg = getErrorMessage(err)
        // } catch (err) {
        //   errorMsg = 'An error occured. Please try again later.'
        // }
        // Alert.alert(errorMsg)
        //console.log(err.response.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page])

  const addCameraImage = (uri) => {
    // console.log(uri, '......uri.......')
    setDocuments([
      {
        mimeType: 'image/jpeg',
        name: 'tempimage.jpg',
        uri: uri,
      },
    ])
    setVisibleAttachment(true)
  }

  const sendMessage = async () => {
    //console.log(documents, 'documents')
    if (message === '' && !documents?.length) {
      Alert.alert('Please, Enter a message or attachments!')
      return
    }
    let attachments = getAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)

    let body = {
      receiver_id: chatChannel?.id,
      stage: channelData ? channelData?.stage : stage,
      message: message,
      type: 'message',
    }

    let largeDoc = documents.find((doc) => {
      if (doc.size > 10 * 1024 * 1024) {
        return doc
      }
    })

    // //console.log(largeDoc,'largeDoc...')

    if (largeDoc) {
      Alert.alert(` Please, upload attachment ${largeDoc.name.slice(0, 15)} less than 2Mb`)
      setDocuments([])
      setVisibleAttachment(false)
      return
    }

    // //console.log(attachments && attachments,"---++++++---------")

    body = { ...body, ...attachments, ...attachmentDeleteIndexes }
    //console.log(body, 'body..........')
    // return
    setChatLoading(true)
    if (editMessage) {
      body['_method'] = 'PUT'
      setBtnDisabled(true)
      api.chat
        .updateChat(editMessage?.id, body)
        .then((res) => {
          setMessage('')
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setBtnDisabled(false)
          setDocuments([])
          setVisibleAttachment(false)
          setEditMessage(null)
          setChatLoading(false)
        })
    } else {
      // //console.log(body, 'body..........')
      setBtnDisabled(true)
      api.chat
        .createChat(body)
        .then((res) => {
          // //console.log({ res })
          //console.log('Chat created!')
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {
          setMessage('')
          setBtnDisabled(false)
          setDocuments([])
          setVisibleAttachment(false)
          setVisibleVoicePreview(false)
          setChatLoading(false)
        })
    }
  }

  const deleteChat = () => {
    const msg = {
      id: editMessage?.id,
      receiver_id: editMessage?.receiver_id,
      stage: channelData ? channelData.stage : stage,
      type: editMessage?.attachments?.length > 0 ? 'attachment' : 'message',
    }

    api.chat
      .deleteChat(editMessage.id, msg)
      .then((res) => {})
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setBtnDisabled(false)
        setShowEditChat(false)
        setEditMessage(null)
      })
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync()
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        })
        //console.log('Starting recording..')
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        )
        setRecording(recording)
      }
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  async function stopRecording() {
    setRecording(undefined)

    await recording.stopAndUnloadAsync()
    let allRecordings = [...recordings]
    const { sound, status } = await recording.createNewLoadedSoundAsync()
    allRecordings.push({
      sound: sound,
      duration: status.durationMillis,
      file: recording.getURI(),
    })
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    })
    //console.log(allRecordings, 'allRecordings')
    setRecordings(allRecordings)
    setDocuments(allRecordings)
    setVisibleVoicePreview(true)
  }
  const cancleRecording = async () => {
    await recording.stopAndUnloadAsync()
    setRecording(undefined)
  }
  const pickImage = async () => {
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
        setVisibleAttachment(true)
        setShowAttchment(false)
      }
    } else {
      //console.log('Cancelled')
      setVisibleAttachment(false)
      setShowAttchment(false)
    }
  }

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      // type: "application/*",
      // multiple: true,
      // copyToCacheDirectory: true,
    })

    if (result.type == 'success') {
      if (result.uri) {
        setDocuments((prev) => {
          return [...prev, result]
        })
      }
      setVisibleAttachment(true)
      setShowAttchment(false)
    } else {
      setVisibleAttachment(false)
    }
  }
  useEffect(() => {
    ;(async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })
    })()
  }, [])
  // useEffect(() => {
  //   // stop recording when unmount
  //   return () => {
  //     console.log('unmounting', recording);
  
  //       stopRecording()
  //   }
  // }, [])
  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS == 'ios' ? -45 : 0}
        style={s.container}
        enabled={Platform.OS == 'ios'}
      >
        <EditChatModal
          visibility={showEditChat}
          setVisibility={setShowEditChat}
          editMessage={editMessage}
          deleteChat={deleteChat}
          editChat={editChat}
        />
        <ImagePreviewModal
          visibility={showImagePreviewModal}
          setVisibility={setShowImagePreviewModal}
          image={image}
          showDownload
        />
        <PdfPreviewModal visibility={showPdfModal} setVisibility={setShowPdfModal} details={pdf} />
        <AttachmentModal
          visibility={showAttchment}
          setVisibility={setShowAttchment}
          documents={documents}
          setDocuments={setDocuments}
          pickImage={pickImage}
          pickDocument={pickDocument}
          onCamera={() => setShowCameraModal(true)}
        />
        <CameraModal
          visibility={showCameraModal}
          setVisibility={setShowCameraModal}
          onSave={addCameraImage}
          onPressGallery={pickImage}
        />
        <View style={[g.outerContainer]}>
          <View style={s.outerPadding}>
            <View style={s.headerContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack()
                  }}
                  outputRange={iconWrapColors}
                >
                  <BackArrow fill={colors.NORMAL} />
                </TouchableOpacity>

                <Image
                  source={{
                    uri: `https://myproderp.s3.us-east-2.amazonaws.com/default/images/default_organization_logo.png`,
                    width: 32,
                    height: 32,
                  }}
                  style={{ borderRadius: 16 }}
                />

                <View style={{ width: '73%' }}>
                  <CText numberOfLines={1} ellipsizeMode="tail" style={[s.chatHeader]}>
                    {chatChannel?.name}
                  </CText>
                  <Text
                    style={{ fontSize: 12, color: colors.LIGHT_GRAY, textTransform: 'capitalize' }}
                  >
                    {chatChannel?.stage}
                  </Text>
                </View>
              </View>
              <View style={s.buttonGroup}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ChatMenuScreen', {
                      channelData: channelData
                        ? channelData
                        : {
                            ...chatChannel,
                            stage: stage,
                          },
                    })
                  }}
                  outputRange={iconWrapColors}
                  style={s.buttonGroupBtn}
                >
                  <MoreIcon fill={colors.NORMAL} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              style={{ flex: 1 }}
              data={chats}
              renderItem={(props) => (
                <ChatCard
                  {...props}
                  setEditMessage={setEditMessage}
                  setShowEditChat={setShowEditChat}
                  showEditChat={showEditChat}
                  setImage={setImage}
                  setShowImagePreviewModal={setShowImagePreviewModal}
                  setPdf={setPdf}
                  setShowPdfModal={setShowPdfModal}
                />
              )}
              keyExtractor={(item, index) => index}
              ref={flatListRef}
              inverted={true}
              onEndReached={() => {
                if (page < lastPage) setPage((prev) => prev + 1)
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                loading && <ActivityIndicator size="small" color={colors.NORMAL} />
              }
            />
            {visibleAttachment && (
              <ChatAttachment
                documents={documents}
                setDocuments={setDocuments}
                closeAttachments={closeAttachments}
                setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                attachmentDeleteIndexes={attachmentDeleteIndexes}
              />
            )}
            {visibleVoicePreview && (
              <VoiceAttachment
                allRecordings={recordings}
                closeVoicePreview={closeVoicePreview}
                setAllRecordings={setRecordings}
              />
            )}

            <View style={s.SendMessageOutter}>
              <TouchableOpacity
                onPress={() => {
                  setShowAttchment(true)
                }}
              >
                <AttachmentIcon />
              </TouchableOpacity>
              <View style={s.SendMessageCotainer}>
                {recording ? (
                  <RecordingPreview recording={recording} cancleRecording={cancleRecording} />
                ) : (
                  <View style={{ width: '90%' }}>
                    <TextInput
                      style={s.inputStyle}
                      spaces={false}
                      maxLength={2000}
                      placeholder="Example Text Here"
                      multiline={true}
                      numberOfLines={5}
                      textAlignVertical="top"
                      placeholderTextColor={colors.HEADER_TEXT}
                      value={message}
                      onChangeText={setMessage}
                      height={messageBoxHeight}
                      onContentSizeChange={(e) => {
                        // //console.log(e.nativeEvent.contentSize.height, 'height')
                        if (e.nativeEvent.contentSize.height < 19.333333333333332 * 5) {
                          setMessageBoxHeight(e.nativeEvent.contentSize.height)
                        }
                      }}
                    />
                  </View>
                )}
                {!recording && (
                  <TouchableOpacity onPress={sendMessage} disabled={btnDisabled}>
                    {chatLoading ? (
                      <ActivityIndicator size="small" color={colors.NORMAL} />
                    ) : (
                      <SendMessage />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {!recording && (
                <TouchableOpacity onPress={() => setShowCameraModal(true)}>
                  <CameraIcon />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
                {recording ? <PauseIconbIG /> : <VoiceRecorderICon />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatScreen

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  fill: {},
  container: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
    // paddingTop: Platform.OS === 'android' ? 26 : 0,
  },
  outerPadding: {
    flex: 1,
    paddingBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // borderWidth: 1
  },

  chatHeader: {
    color: colors.BLACK,
    fontSize: 16,
    // lineHeight: 24,
    fontFamily: 'inter-semibold',
    // textAlignVertical: 'center',
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
    color: colors.BLACK,
    padding: 2,
    fontSize: 16,
    fontWeight: '500',
  },
  chatContainer: {
    minWidth: '30%',
    maxWidth: '100%',
    backgroundColor: '#D6E2FF',
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    display: 'flex',
    padding: 8,
    marginRight: 8,
    flex: 1,
  },

  voiceChatContainer: {
    minWidth: '50%',
    maxWidth: '100%',
    backgroundColor: '#D6E2FF',
    marginBottom: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    display: 'flex',
    padding: 8,
    marginRight: 8,
    flex: 1,
  },

  sideView: {
    position: 'absolute',
    content: '',
    width: 0,
    height: 0,
    borderBottomColor: '#d6e2ff',
    borderBottomWidth: 18,
    top: 0,
    right: 0,
    borderLeftColor: ' rgba(0,0,0,0)',
    borderRightColor: ' rgba(0,0,0,0)',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    transform: [{ rotate: '180deg' }],
  },

  senderSideView: {
    position: 'absolute',
    content: '',
    width: 0,
    height: 0,
    borderBottomColor: 'white',
    borderBottomWidth: 18,
    top: 0,
    left: -8,
    borderLeftColor: ' rgba(0,0,0,0)',
    borderRightColor: ' rgba(0,0,0,0)',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    transform: [{ rotate: '180deg' }],
  },

  senderChatContainer: {
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '40%',
    maxWidth: '100%',
  },
  SendMessageCotainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  SendMessageOutter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // backgroundColor: 'yellow',
  },
  docContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  mTime: {
    paddingLeft: 8,
    fontSize: 10,
    color: '#9CA2AB',
    alignSelf: 'flex-end',
  },
  mSenderTime: {
    paddingLeft: 16,
    fontSize: 10,
    color: '#9CA2AB',
    alignSelf: 'flex-end',
  },
  senderMsg: {
    fontSize: 16,
    textAlign: 'justify',
  },
  senderImgStyle: {
    borderRadius: 16,
    marginRight: 8,
  },
  senderContent: {
    minWidth: '30%',
    maxWidth: '100%',
    paddingHorizontal: 8,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    display: 'flex',
  },
  senderTextContainer: {
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  senderName: {
    fontSize: 12,
    color: '#246BFD',
    textAlign: 'justify',
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'column',
  },

  playPauseIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.HOVER,
    borderRadius: 15,
  },
})
