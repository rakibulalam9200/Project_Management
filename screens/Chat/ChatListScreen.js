import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CText from '../../components/common/CText'
import { chats } from '../../assets/constants/chat'
import moment from 'moment'
import { ActivityIndicator } from 'react-native'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import PinIcon from '../../assets/svg/pin-icon.svg'
import PinDarkIcon from '../../assets/svg/pin-icon-dark.svg'
import CheckIcon from '../../assets/svg/check-icon.svg'
import { abbreviateString, getInitialNameLetters } from '../../utils/Strings'
import { useEffect, useRef, useState } from 'react'
import CSearchInput from '../../components/common/CSearchInput'
import api from '../../api/api'
import { useDispatch } from 'react-redux'
import { setStage } from '../../store/slices/navigation'
import { useIsFocused } from '@react-navigation/native'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import { Swipeable } from 'react-native-gesture-handler'
import CSettingsModal from '../../components/modals/ChatListScreenModal'
import PinOrReadChatModal from '../../components/modals/PinOrReadChatModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import HideKeyboard from '../../components/common/HideKeyboard'
// import CSortModal from '../../components/modals/CSortModal'
// import { CHAT_SORT_BY } from '../../assets/constants/filesSortBy'
export default function ChatListScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [debounchSearch, setDebounchSearch] = useState('')
  const [chats, setChats] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refetch, setRefetch] = useState(false)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const singleSelect = useRef({})
  const [showPinModal, setShowPinModal] = useState(false)
  const [showReadModal, setShowReadModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [readPinDeleteLoading, setReadPinDeleteLoading] = useState({
    read: false,
    pin: false,
    delete: false,
  })
  // const [showSortModal, setShowSortModal] = useState(false)
  // const [sortBy, setSortBy] = useState(CHAT_SORT_BY[0])

  const ChatCard = ({ item }) => {
    const isGroupChat = item?.state.toLowerCase() == 'chat'
    const allowedToDelete = isGroupChat && item?.user_message_status.type.toLowerCase() == 'owner'

    const RightActions = () => {
      return (
        <View
          key={item?.id}
          style={{ flexDirection: 'row', width: allowedToDelete ? '50%' : '35%' }}
        >
          <TouchableOpacity
            onPress={() => {
              singleSelect.current = item
              setShowReadModal(true)
            }}
            style={[
              s.deleteItemWrapper,
              {
                backgroundColor: colors.GREEN_NORMAL,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                width: allowedToDelete ? '33%' : '50%',
              },
            ]}
          >
            <CheckIcon />
            <Text style={s.deleteItemText}>Read</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              singleSelect.current = item
              setShowPinModal(true)
            }}
            style={[
              s.deleteItemWrapper,
              {
                backgroundColor: colors.ICON_BG,
                borderRadius: 0,
                borderTopRightRadius: allowedToDelete ? 0 : 8,
                borderBottomRightRadius: allowedToDelete ? 0 : 8,
                width: allowedToDelete ? '33%' : '50%',
              },
            ]}
          >
            <PinIcon />
            <Text style={s.deleteItemText}>
              {item?.user_message_status?.is_pin ? 'Unpin' : 'Pin'}
            </Text>
          </TouchableOpacity>

          {allowedToDelete && (
            <TouchableOpacity
              onPress={() => {
                singleSelect.current = item
                setShowDeleteModal(true)
              }}
              style={[
                s.deleteItemWrapper,
                {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  width: allowedToDelete ? '33%' : 0,
                },
              ]}
            >
              <DeleteIcon />
              <Text style={s.deleteItemText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }

    return (
      <Swipeable key={item.id} renderRightActions={RightActions}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.navigate('Chat', {
              channelData: {
                id: item?.id,
                name: item?.name,
                stage: item?.state?.toLowerCase(),
              },
            })
          }}
        >
          <View style={s.chatCardContainer}>
            <View style={s.chatNameBox}>
              <Text style={s.chatNameBoxText}>{getInitialNameLetters(item?.name)}</Text>
            </View>
            <View style={s.titleBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                {item?.user_message_status?.is_pin && <PinDarkIcon />}
                <Text style={s.titleText}>{item?.name}</Text>
              </View>
              {/* <Text style={s.projectText}>{item?.project}</Text> */}
              <Text style={s.messageText}>
                {item?.message && (
                  <Text style={s.messageSender}>
                    {item?.message?.sender?.name
                      ? item?.message?.sender?.name
                      : item?.message?.sender?.email}
                    :{' '}
                  </Text>
                )}
                {item?.message?.message?.length > 20
                  ? abbreviateString(item?.message?.message, 20)
                  : item?.message?.message}
              </Text>
            </View>

            <View style={s.chatRightBox}>
              <Text style={s.timeText}>{item?.message?.last_message_time}</Text>
              {item?.unseen_messages_count > 0 && (
                <Text style={s.unreadBadge}>{item?.unseen_messages_count}</Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  useEffect(() => {
    setPage(1)
    setRefetch((prev) => !prev)
  }, [isFocused])

  useEffect(() => {
    let body = {
      type: 'message',
      page: page,
      pagination: 10,
      search: debounchSearch,
      // sort_by: sortBy?.param,
      // order_by: sortBy?.order_by,
    }
    //console.log('query', body)
    setLoading(true)
    api.chat
      .getChatList(body)
      .then((res) => {
        if (page == 1) {
          //console.log('res chat', res)
          setChats(res.data)
          setTotalPages(res?.meta?.last_page)
        } else {
          //console.log('res chat page ', res)
          setChats((prev) => [...prev, ...res.data])
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page, refetch, debounchSearch])
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebounchSearch(search)
      setPage(1)
    }, 700)
    return () => clearTimeout(delayDebounceFn)
  }, [search])
  const attemptPin = () => {
    // //console.log('singleSelect', singleSelect.current)
    // return
    setReadPinDeleteLoading((prev) => ({ ...prev, pin: true }))
    api.chat
      .pinChat(singleSelect.current?.id, { state: singleSelect.current?.state?.toLowerCase() })
      .then((res) => {
        //console.log('res', res)
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => {
        setReadPinDeleteLoading((prev) => ({ ...prev, pin: false }))
        setShowPinModal(false)
        singleSelect.current = {}
        setRefetch(!refetch)
        setPage(1)
      })
  }

  const attemptRead = () => {
    //console.log('Reading')
    const params = {
      stage: singleSelect.current?.state?.toLowerCase(),
      type: 'message',
    }

    setReadPinDeleteLoading((prev) => ({ ...prev, read: true }))
    api.chat
      .messageSeen(singleSelect.current?.id, params)
      .then((res) => {
        //console.log('res', res)
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => {
        setReadPinDeleteLoading((prev) => ({ ...prev, read: false }))
        setShowReadModal(false)
        singleSelect.current = {}
        setRefetch(!refetch)
        setPage(1)
      })
  }

  const attemptDelete = () => {
    setReadPinDeleteLoading((prev) => ({ ...prev, delete: true }))
    api.chat
      .deleteGroupChat(singleSelect?.current?.id)
      .then((res) => {
        //console.log(res, '')
        if (res.success) {
          Alert.alert('Group Chat deleted successfully')
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => {
        setReadPinDeleteLoading((prev) => ({ ...prev, delete: false }))
        setShowDeleteModal(false)
        singleSelect.current = {}
        setRefetch(!refetch)
        setPage(1)
      })
  }
  // const openSortModal = () => {
  //   setShowSortModal(true)
  // }
  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        confirmationMessage="Do you want to delete this group chat?"
        btnLoader={readPinDeleteLoading.delete}
      />
      <PinOrReadChatModal
        visibility={showPinModal || showReadModal}
        setVisibility={showReadModal ? setShowReadModal : setShowPinModal}
        singleSelect={singleSelect}
        onSave={showReadModal ? attemptRead : attemptPin}
        confirmationMessage={
          showReadModal ? 'Do you want to mark this chat as read?' : 'Do you want to Pin this chat?'
        }
        type={showReadModal ? 'Read Chat' : 'Pin Chat'}
      />
      <CSettingsModal visibility={showSettingsModal} setVisibility={setShowSettingsModal} />
      {/* <CSortModal
        visibility={showSortModal}
        setVisibility={setShowSortModal}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onApply={() => {
          setPage(1)
        }}
      /> */}
      <StatusBar backgroundColor={colors.PRIM_BG} />
      <HideKeyboard>
        {/* Container Start*/}
        <View style={[s.container]}>
          {/* Header */}
          <View style={[s.headerContainer]}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>Chat List</CText>
            <View style={s.buttonGroup}>
              {/* <TouchableOpacity disabled={loading} onPress={openSortModal} style={s.buttonGroupBtn}>
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
                <MoreIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Header End */}

          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            searchIcon
            isGSearch
          />
          {!loading && chats.length == 0 && (
            <Text style={[{ textAlign: 'center' }]}>No Chats to show.</Text>
          )}
          <FlatList
            data={chats}
            renderItem={ChatCard}
            keyExtractor={(item, index) => index}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              //console.log('Endnnn')
              if (page <= totalPages) {
                setPage((prev) => prev + 1)
              }
            }}
            ListFooterComponent={loading && <ActivityIndicator color={colors.NORMAL} />}
          />
          <CFloatingPlusIcon onPress={() => navigation.navigate('ChatCreateGroup')} />
        </View>
        {/* Container End */}
      </HideKeyboard>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },

  chatCardContainer: {
    padding: 8,
    borderTopColor: colors.SEC_BG,
    width: '100%',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
  },
  chatNameBox: {
    backgroundColor: colors.NORMAL,
    width: 66,
    height: 66,
    borderRadius: 10,
    justifyContent: 'center',
    alignContent: 'center',
  },
  chatNameBoxText: {
    color: colors.WHITE,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  titleText: {
    flexShrink: 1,
    fontFamily: 'inter-regular',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.NORMAL,
  },
  timeText: {
    color: colors.PRIM_CAPTION,
  },
  projectText: {
    color: colors.PRIM_CAPTION,
    fontSize: 11,
  },
  messageText: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontSize: 14,
  },
  messageSender: {
    fontWeight: 'bold',
  },
  chatRightBox: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    paddingVertical: 8,
  },
  unreadBadge: {
    backgroundColor: colors.RED_NORMAL,
    color: colors.WHITE,
    fontFamily: 'inter-regular',
    fontSize: 11,
    width: 32,
    height: 32,
    borderRadius: 10,
    textAlign: 'center',
    paddingTop: 8,
  },
  deleteItemWrapper: {
    backgroundColor: colors.RED_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    // marginVertical: 10,
    borderRadius: 8,
    // paddingVertical: 8,
  },
  deleteItemText: {
    color: colors.WHITE,
    marginTop: 8,
    fontSize: 16,
  },
})
