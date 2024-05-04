import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
} from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import BellIcon from '../../assets/svg/bell-normal.svg'
import BellCrossIcon from '../../assets/svg/bell-crossed-normal.svg'
import SearchIcon from '../../assets/svg/search-normal.svg'
import CrossIcon from '../../assets/svg/cross-normal.svg'
import PersonIcon from '../../assets/svg/person.svg'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import MoreIcon from '../../assets/svg/more.svg'
import InfoIcon from '../../assets/svg/question-icon-white.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import { getAttachmentFileNameFromUri, getFileExtenstionFromUri } from '../../utils/Attachmets'
import api from '../../api/api'
import ImagePreviewModal from '../../components/modals/ImagePreviewModal'
import PdfPreviewModal from '../../components/modals/PdfPreviewModal'
import ChatUserPickerModal from '../../components/modals/ChatUserPickerModal'
import { getMembersObjFromSelectedUsers } from '../../utils/User'
import { Swipeable } from 'react-native-gesture-handler'
import { Alert } from 'react-native'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { useSelector } from 'react-redux'
import CSettingsModal from '../../components/modals/ChatMenuScreenModal'
import { getErrorMessage } from '../../utils/Errors'
import { downLoadImage, downloadPdf } from '../../utils/DownloadAttachment'
import Toast from 'react-native-toast-message'

const iconWrapColors = [colors.END_BG, colors.MID_BG, colors.END_BG]
export default function ChatMenuScreen({ navigation, route }) {
  const channelData = route.params ? route.params?.channelData : null
  const titleIcon =
    channelData?.name?.split(' ').length > 1
      ? channelData?.name?.split(' ')[0][0].toUpperCase() +
        channelData?.name?.split(' ')[1][0].toUpperCase()
      : channelData?.name?.split(' ')[0][0].toUpperCase() +
        channelData?.name?.split(' ')[0][1].toUpperCase()

  const [section, setSection] = useState('files')
  const [files, setFiles] = useState([])
  const [members, setMembers] = useState([])
  const [isMute, setIsMute] = useState(false)
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfDetails, setPdfDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [refetch, setRefetch] = useState(false)
  const singleSelect = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { user } = useSelector((state) => state.user)
  const [isOwner, setIsOwner] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [state, setState] = useState('Project')
  // Files component
  const FilesCard = ({ item }) => {
    const { name, url, created_at } = item
    const extension = getFileExtenstionFromUri(url).toLowerCase()
    const checkIfSelected = (fileId) => {
      const found = selectedAttachments.find((attachment) => attachment == fileId)
      return found
    }
    const toggleSelected = (fileId) => {
      if (checkIfSelected(fileId)) {
        // console.log(fileId, 'fileId');
        setSelectedAttachments((prev) => {
          const copy = [...prev]
          return copy.filter((singlefile) => fileId !== singlefile)
        })
      } else {
        setSelectedAttachments((prev) => [...prev, fileId])
      }
    }
    return (
      <TouchableWithoutFeedback
        key={item.id}
        // onLongPress={() => {
        //   setSelectable((prev) => !prev)
        // }}
      >
        <View style={g.containerBetween}>
          <View style={{ flex: 1, marginVertical: 8 }}>
            <View style={[s.contentContainer]}>
              <View>
                {extension === '.jpg' || extension === '.jpeg' || extension === '.png' ? (
                  <TouchableOpacity onPress={() => {}}>
                    <Image style={s.image} source={{ uri: url }} />
                  </TouchableOpacity>
                ) : (
                  <View style={[s.pdfContainer]}>
                    <Text style={{ fontWeight: '500' }}>{extension.slice(1).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <View style={[s.itemTitle, { width: '60%' }]}>
                <TouchableOpacity
                  onPress={async () => {
                    if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
                      setImagePreviewUrl(url)
                      setShowImagePreviewModal(true)
                    } else if (extension === '.pdf') {
                      setPdfDetails({ url, name })
                      setShowPdfModal(true)
                    }
                  }}
                  // onLongPress={() => {
                  //   setSelectable((prev) => !prev)
                  // }}
                >
                  <Text
                    lineBreakMode="middle"
                    style={{ marginBottom: 8, fontSize: 16, fontWeight: '500' }}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: '#9CA2AB', fontWeight: '400' }}>{created_at}</Text>
              </View>
              <View style={s.selectMargin}>
                {/* {selectable && ( */}
                <TouchableOpacity onPress={() => toggleSelected(item.url)}>
                  {checkIfSelected(item.url) ? <CheckedIcon /> : <CheckedEmptyIcon />}
                </TouchableOpacity>
                {/* )} */}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  const MembersCard = ({ item }) => {
    // //console.log(item)

    const RightActions = () => {
      return (
        <View key={item?.user_id} style={{ flexDirection: 'row', width: '35%' }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('No Design given in figma!')
            }}
            style={[
              s.deleteItemWrapper,
              {
                backgroundColor: colors.GREEN_NORMAL,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            ]}
          >
            <InfoIcon />
            <Text style={s.deleteItemText}>Info</Text>
          </TouchableOpacity>
          {state.toLowerCase() !== 'project' && (
            <TouchableOpacity
              onPress={() => {
                singleSelect.current = item?.user_id
                setShowDeleteModal(true)
              }}
              style={[s.deleteItemWrapper, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
            >
              <DeleteIcon />
              <Text style={s.deleteItemText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }

    return (
      <Swipeable key={item?.user_id} renderRightActions={!item?.type && RightActions}>
        <View style={s.memberContainer}>
          <Image source={{ uri: item?.image }} style={s.memberImage} />
          <View style={s.memberDetails}>
            <Text ellipsizeMode="tail" numberOfLines={1} style={s.memberName}>
              {item?.name ? item?.name : item?.email}
            </Text>
            <Text style={s.memberRole}>{item?.type ? item.type : 'Member'}</Text>
          </View>
        </View>
      </Swipeable>
    )
  }

  useEffect(() => {
    setLoading(true)
    api.chat
      .getChatDetails(channelData?.id, { state: channelData?.stage })
      .then((res) => {
        setFiles(res?.data?.message_attachments)
        const owner = {
          ...res?.data?.user_owner,
          type: 'Project Owner',
        }
        if (owner.user_id === user.id) {
          setIsOwner(true)
        } else {
          setIsOwner(false)
        }
        setMembers([owner, ...res?.data?.user_members])
        setIsMute(res?.data?.user_message_status?.is_mute)
        setState(res?.data?.state)
        //console.log(res, 'Chat details')
      })
      .catch((err) => {})
      .finally(() => setLoading(false))
  }, [refetch])

  const addSelectedUsers = () => {
    if (selectedUsers.length == 0) {
      setShowUserPickerModal(false)
      return
    }
    let body = {
      stage: channelData?.stage,
      members: selectedUsers, //arrays of user ids
    }

    api.chat
      .addChatMembers(channelData?.id, body)
      .then((res) => {
        if (res.success) {
          setShowUserPickerModal(false)
          setRefetch((prev) => !prev)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
  }

  const removeUser = () => {
    let body = {
      stage: channelData?.stage,
      members: [singleSelect.current],
    }
    //console.log(body, channelData?.id)

    api.chat
      .removeChatMembers(channelData?.id, body)
      .then((res) => {
        //console.log(res)
        if (res.success) {
          Alert.alert('User removed successfully')
          setRefetch((prev) => !prev)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => setShowDeleteModal(false))
  }

  const muteUnmuteChat = () => {
    api.chat
      .muteChat(channelData?.id, { state: channelData?.stage })
      .then((res) => {
        //console.log(res)
        if (res.success) {
          // //console.log(res, 'mute res')
          if (res.data.user_message_status.is_mute) {
            Alert.alert('Chat muted successfully')
          } else {
            Alert.alert('Chat unmuted successfully')
          }
          setRefetch((prev) => !prev)
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
  }

  const leaveOrDeleteChat = () => {
    if (channelData?.stage == 'chat') {
      if (isOwner) {
        api.chat
          .deleteGroupChat(channelData?.id)
          .then((res) => {
            //console.log(res)
            if (res.success) {
              Alert.alert('Chat deleted successfully')
              navigation.navigate('ChatListScreen')
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
          })
      } else {
        api.chat
          .leaveGroupChat(channelData?.id, { stage: channelData?.stage })
          .then((res) => {
            //console.log(res)
            if (res.success) {
              Alert.alert('Chat left successfully')
              navigation.navigate('ChatListScreen')
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
          })
      }
    } else {
      Alert.alert(`You can not leave from ${channelData?.stage} chat`)
      return
    }
  }
  // console.log(selectedAttachments, 'selectedAttachments', channelData)
  const deleteChat = () => {
    const body = {
      deleteAttachmentIds: selectedAttachments,
    }

    api.fileManagement
      .deleteMultipleAttachments(body)
      .then((res) => {
        setRefetch((prev) => !prev)
      })
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        // console.log(err, 'error');
        Alert.alert(errorMsg)
      })
      .finally(() => {})
  }
  const handleAttachmentDelete = () => {
    if (selectedAttachments.length === 0) {
      Alert.alert('Please select atleast one attachment to delete')
      return
    }
    deleteChat()
  }
  const attachmentDownload = async (image, filename, fileExt) => {
    setLoading(true)
    if (fileExt === '.pdf') {
      const message = await downloadPdf(image, filename, fileExt)
      Toast.show({
        type: message.includes('Successful') ? 'success' : 'error',
        text1: message,
        position: 'bottom',
      })
    } else {
      const message = await downLoadImage(image, filename, fileExt)
      Toast.show({
        type: message.includes('Successful') ? 'success' : 'error',
        text1: message,
        position: 'bottom',
      })
    }
    setLoading(false)
    setSelectedAttachments([])
  }
  const handleAttachmentDownload = () => {
    if (selectedAttachments.length === 0) {
      Alert.alert('Please select atleast one attachment to download')
      return
    }
    selectedAttachments.forEach((image) => {
      let filename = getAttachmentFileNameFromUri(image)
      let fileExt = getFileExtenstionFromUri(image)
      attachmentDownload(image, filename, fileExt)
    })
  }
  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={removeUser}
        confirmationMessage="Do you want to remove this user from the chat?"
      />
      <ImagePreviewModal
        image={imagePreviewUrl}
        visibility={showImagePreviewModal}
        setVisibility={setShowImagePreviewModal}
        showDownload
      />
      <PdfPreviewModal
        visibility={showPdfModal}
        setVisibility={setShowPdfModal}
        details={pdfDetails}
      />
      <CSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onDelete={handleAttachmentDelete}
        onDownload={handleAttachmentDownload}
      />
      {showUserPickerModal && (
        <ChatUserPickerModal
          visibility={showUserPickerModal}
          setVisibility={setShowUserPickerModal}
          selected={selectedUsers}
          setSelected={setSelectedUsers}
          members={members}
          chatType={state}
          onUpdate={addSelectedUsers}
        />
      )}
      <View style={[g.outerContainer, s.container]}>
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.title3, s.textColor, { width: '80%' }]}>{channelData?.name}</CText>
          <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>

        <View style={s.titleIconBox}>
          <Text style={s.titleIcon}>{titleIcon}</Text>
        </View>

        <View style={s.buttonContainer}>
          <View>
            <IconWrap outputRange={iconWrapColors} onPress={muteUnmuteChat}>
              {isMute ? <BellCrossIcon /> : <BellIcon />}
            </IconWrap>
            <Text style={s.iconText}>{isMute ? 'Unmute' : 'Mute'}</Text>
          </View>
          <View style={s.borderedIcon}>
            <IconWrap outputRange={iconWrapColors}>
              <SearchIcon />
            </IconWrap>
            <Text style={s.iconText}>Search</Text>
          </View>
          {state.toLowerCase() !== 'project' && (
            <View>
              <IconWrap outputRange={iconWrapColors} onPress={leaveOrDeleteChat}>
                <CrossIcon />
              </IconWrap>
              <Text style={s.iconText}>Leave</Text>
            </View>
          )}
        </View>

        <View style={[g.containerBetween, s.detailsPickerContainer]}>
          <TouchableOpacity
            style={[
              s.detailsPickerButton,
              section === 'files' ? s.detailsPickerButtonActive : null,
            ]}
            onPress={() => {
              setSection('files')
            }}
          >
            <Text
              style={[
                s.detailsPickerButtonText,
                section === 'files' ? s.detailsPickerButtonTextActive : null,
              ]}
            >
              Files
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.detailsPickerButton,
              section === 'members' ? s.detailsPickerButtonActive : null,
            ]}
            onPress={() => {
              setSection('members')
            }}
          >
            <Text
              style={[
                s.detailsPickerButtonText,
                section === 'members' ? s.detailsPickerButtonTextActive : null,
              ]}
            >
              Members
            </Text>
          </TouchableOpacity>
        </View>
        {section == 'files' && (
          <FlatList
            data={files}
            keyExtractor={(item) => item.id}
            renderItem={FilesCard}
            ListHeaderComponent={files.length == 0 && !loading && <Text>No files to show</Text>}
            ListFooterComponent={
              loading && <ActivityIndicator size="small" color={colors.NORMAL} />
            }
          />
        )}
        {section == 'members' && (
          <FlatList
            data={members}
            keyExtractor={(item) => item.user_id}
            renderItem={MembersCard}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {state.toLowerCase() !== 'project' && (
                  <TouchableOpacity
                    style={[g.containerLeft, s.memberAddContainer]}
                    onPress={() => setShowUserPickerModal(true)}
                  >
                    <PersonIcon />
                    <Text style={s.memberAddText}>+ Add new member</Text>
                  </TouchableOpacity>
                )}
                {members.length == 0 && !loading && <Text>No members to show</Text>}
              </View>
            }
            ListFooterComponent={
              loading && <ActivityIndicator size="small" color={colors.NORMAL} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
  },

  titleIcon: {
    color: colors.WHITE,
    fontSize: 28,
    fontWeight: '600',
  },

  titleIconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.REVIEW_BG,
    width: 70,
    height: 70,
    borderRadius: 35,
    marginVertical: 16,
    marginBottom: 24,
  },
  deleteItemWrapper: {
    backgroundColor: colors.RED_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    marginVertical: 10,
    borderRadius: 8,
  },
  deleteItemText: {
    color: colors.WHITE,
    marginTop: 8,
  },

  container: {
    paddingBottom: 64,
  },
  textColor: {
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopColor: colors.SEC_BG,
    borderTopWidth: 1,
  },
  borderedIcon: {
    // borderLeftColor: colors.SEC_BG,
    // borderRightColor: colors.SEC_BG,
    // borderLeftWidth: 2,
    // borderRightWidth: 2,
    // paddingHorizontal: 32,
  },
  iconText: {
    color: colors.NORMAL,
    textAlign: 'center',
    paddingTop: 4,
    fontWeight: 'bold',
  },
  detailsPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginVertical: 16,
  },
  detailsPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  detailsPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  detailsPickerButtonText: {
    color: colors.BLACK,
    fontSize: 16,
    textAlign: 'center',
  },
  detailsPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
    marginRight: 16,
  },
  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginRight: 16,
  },
  memberContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
    width: '100%',
    overflow: 'hidden',
  },
  memberImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  memberDetails: {
    marginRight: 'auto',
    maxWidth: '80%',
  },
  memberName: {
    fontFamily: 'inter-regular',
    color: colors.NORMAL,
    fontWeight: 'bold',
    fontSize: 18,
  },
  memberRole: {
    fontFamily: 'inter-regular',
    color: colors.PRIM_CAPTION,
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberAddContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  memberAddText: {
    color: colors.ICON_BG,
    marginLeft: 16,
    fontFamily: 'inter-regular',
  },
  selectMargin: {
    marginRight: 10,
    marginTop: 10,
  },
})
