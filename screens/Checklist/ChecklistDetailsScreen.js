import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import CheckIcon from '../../assets/svg/filled-circle-check.svg'
import GripIcon from '../../assets/svg/grip.svg'
import MoreIcon from '../../assets/svg/more.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import CommentModal from '../../components/modals/CommentModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import ListCompleteModal from '../../components/modals/ListCompleteModal'
import ListReOpenModal from '../../components/modals/ListReopenModal'
import MoveModal from '../../components/modals/MoveModal'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { abbreviateString } from '../../utils/Strings'

const listFunctionaliteis = [
  {
    id: 8,
    name: 'Activity',
    navigationName: 'Activity',
    viewNavigation: {},
    count: 'activity',
    addNavigationName: '',
    addNavigation: {},
  },
]

const { height, width } = Dimensions.get('window')

const ChecklistDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null

  let checklistDetails = route.params ? route.params?.checklist : null
  let checklistDetailsRefetch = route.params ? route.params?.checklistDetailsRefetch : null

  const { searchNavigationFrom } = useSelector((state) => state.navigation)

  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [functionalityListing, setFuntionalityListing] = useState(listFunctionaliteis)
  const [detailsScreen, setDetailsScreen] = useState('details')
  const [draggable, setDraggable] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const { navigationFrom } = useSelector((state) => state.navigation)
  const [listItems, setListItems] = useState([])
  const [list, setList] = useState()
  const [commentModal, setCommentModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [showMoveModal, setShowMoveModal] = useState(false)
  const isFocused = useIsFocused()

  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const statusChange = useRef(null)
  const listStatusChange = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [completeModal, setCompleteModal] = useState(false)
  const [statusLoader, setStatusLoader] = useState(false)
  const [reOpenModal, setReOpenModal] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [listStatus, setListStatus] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    let body = {}
    if (query != '') {
      body['search'] = query
    }

    //console.log(body, 'body......')
    api.checklist
      .getChecklist(id, body)
      .then((res) => {
        //console.log(res?.todolist)

        setListItems(
          res?.todolist?.list_items.map((item, idx) => {
            return { ...item, order: idx + 1 }
          })
        )
        setList(res?.todolist)
        //console.log(res?.todolist, 'to do list.......')
      })
      .catch((err) => {
        //console.log(err.response)
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          //console.log(err)
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, refetch, isFocused, query,statusLoader])

  const ListingFunctionality = ({ item, drag }) => {
    const {
      navigationName,
      addNavigationName,
      count,
      viewNavigation,
      addNavigation,
      dispatchNavigation,
      name,
    } = item

    const LeftActions = () => {
      return (
        <View style={s.dragItemWrapper}>
          <Text style={s.dragItemText}>Drag</Text>
        </View>
      )
    }
    let fuctionalitylength = 0
    if (name === 'Activity') {
      fuctionalitylength = list?.user_activities_count
    }
    // if (count === 'issues') {
    //   fuctionalitylength = (issueDetails?.issues && issueDetails.issues.length) || '0'
    // } else if (count === 'attachments') {
    //   fuctionalitylength = (issueDetails?.attachments && issueDetails.attachments.length) || '0'
    // }else if(count === 'todolist'){
    //   fuctionalitylength = (issueDetails?.todolists && issueDetails.todolists.length) || '0'
    // }
    return (
      <Swipeable
        key={item.id}
        renderLeftActions={LeftActions}
        onSwipeableLeftWillOpen={() => {
          setDraggable((prev) => !prev)
        }}
      >
        <View style={[g.containerBetween]}>
          {draggable && (
            <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
              <GripIcon />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.listItemContainer, { flex: 1 }]}>
            <TouchableOpacity
              style={s.listItemTitle}
              onPress={() => {
                if (name == 'Activity') {
                  navigation.navigate(navigationName, {
                    // activity: userActivity.current,
                    title: list?.name,
                    state: 'List',
                    loggerId: list?.id,
                  })
                }
                // if (name !== 'Chat') {
                //   navigation.navigate(navigationName, viewNavigation)
                // }
                // else {
                //   dispatch(setStage('task'))
                //   navigation.navigate('Chat')
                // }
              }}
            >
              <CText style={[g.title1, s.listItemTitleText]}>
                {name + ' '}
                {/* (projectDetails?.notes && projectDetails.notes.length) || '0' */}
                <CText style={s.listItemSubTitle}>{`(${fuctionalitylength})`}</CText>
              </CText>
              <RightArrowIcon fill={colors.NORMAL} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (name == 'Activity') {
                  setCommentModal(true)
                }
                // if (navigationName !== 'ProjectFiles' && name !== 'Chat') {
                //   navigation.navigate(addNavigationName, addNavigation)
                // } else if (name === 'Chat') {
                //   dispatch(setStage('milestone'))
                //   navigation.navigate('Chat')
                // } else {
                //   naviGateToFileScreenAndOpenAddFileModal()
                // }
              }}
            >
              <PlusIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Swipeable>
    )
  }

  const ItemsCard = ({ item, drag, isActive, index }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })

    const [status, setStatus] = useState(item?.is_done)

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

    const toggleStatusChange = () => {
      statusChange.current = item.id
      attemptSingleItemStatusChange()
    }
    // //console.log(item)

    const RightActions = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            singleSelect.current = item.id
            setShowDeleteModal(true)
          }}
          style={s.deleteItemWrapper}
        >
          <DeleteIcon />
          <Text style={s.deleteItemText}>Delete</Text>
        </TouchableOpacity>
      )
    }
    const LeftActions = () => {
      return (
        <View style={s.dragItemWrapper}>
          <Text style={s.dragItemText}>Drag</Text>
        </View>
      )
    }
    return (
      <Swipeable
        key={item.id}
        renderLeftActions={LeftActions}
        renderRightActions={RightActions}
        onSwipeableLeftWillOpen={() => {
          setDraggable((prev) => !prev)
        }}
      >
        <TouchableWithoutFeedback
          onLongPress={() =>
            setSelectable((prev) => {
              return !prev
            })
          }
        >
          <View style={[g.containerBetween, { gap: 10 }]}>
            {draggable && (
              <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
                <GripIcon />
              </TouchableOpacity>
            )}
            {!draggable && selectable && (
              <CCheckbox
                showLabel={false}
                checked={checked}
                setChecked={setChecked}
                onChecked={toggleDeleteMultiple}
              />
            )}
            <View style={[s.cardContainer, g.containerBetween]}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={s.cardRowBetween}
                  onLongPress={() =>
                    setSelectable((prev) => {
                      return !prev
                    })
                  }
                  onPress={() =>
                    navigation.navigate('AddChecklistItem', {
                      id: item.id,
                      checklist: checklistDetails,
                      todoId: id,
                      itemOrder: item.order,
                    })
                  }
                >
                  <Text
                    style={[
                      g.body2,
                      {
                        color: item?.is_done ? colors.GREY : colors.NORMAL,
                        textDecorationLine: item?.is_done ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {/* {item?.description?.value.length > 45
                      ? item?.description?.value.slice(0, 45) + '...'
                      : item?.description?.value} */}
                    <Text style={{ color: item?.is_done ? colors.GREY : colors.ICON_BG }}>
                      {`${item.order >= 10 ? item.order : '0' + item.order}. `}
                    </Text>
                    {abbreviateString(item?.description?.plain_text_value.trim(), 30)}
                  </Text>

                  {!selectable && (
                    <CCheckbox
                      showLabel={false}
                      checked={status}
                      setChecked={setStatus}
                      onChecked={() => {
                        statusChange.current = item.id
                        // setCompleteModal(true)
                        if (status) {
                          setReOpenModal(true)
                        } else {
                          setCompleteModal(true)
                        }
                      }}
                    />
                  )}

                  {/* <CheckEmptyIcon/> */}
                </TouchableOpacity>
                <View style={s.cardRowLeft}>
                  <Text
                    style={{
                      color: colors.WHITE,
                      backgroundColor: item?.is_done ? colors.GREY : colors.GREEN_NORMAL,
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    {item?.is_done ? 'Completed' : 'Open'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const attemptSingleItemStatusChange = () => {
    if (statusChange.current) {
      setStatusLoader(true)
      api.checklist
        .toggleListItemStatus(statusChange.current)
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
          statusChange.current = null
          setRefresh((prev) => !prev)
          setShowStatusChangeModal(false)
          setCompleteModal(false)
          setReOpenModal(false)
          setStatusLoader(false)
        })
    }
  }

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const attemptDelete = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        //console.log(toDeleteArray)
        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.checklist.deleteMultipleChecklistItems({
            listitem_ids: toDeleteArray,
          })

          if (res.success) {
            setShowDeleteModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            setBtnLoader(false)
            multipleSelect.current = {}
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        if (singleSelect.current) {
          // //console.log(singleSelect.current, '.......................')
          let res = await api.checklist.deleteChecklistItem(singleSelect.current)

          if (res.success) {
            toggleRefresh()
            setBtnLoader(false)
            setShowDeleteModal(false)
            Alert.alert('Delete Successful.')
            // multipleSelect.current = {}
          }
        } else {
          Alert.alert('Please select at least one Checklist to delete')
          setShowDeleteModal(false)
        }
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
      setBtnLoader(false)
    }
  }
  const attemptTodolistStatusChange = () => {
    api.checklist
      .changeListStatus(id, { status: 'Complete' })
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
        setShowStatusChangeModal(false)
        toggleRefresh()
      })
  }

 

  const attemptClone = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
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
            multipleSelect.current = {}
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            // setBtnLoader(true)
            toggleRefresh()
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
      setShowCloneModal(false)
      setActionType('')
      setBtnLoader(false)
    }
  }

  const attemptOrdering = async () => {
    try {
      setLoading(true)
      let orderArray = getSortingOrderData(listItems)

      let res = await api.checklist.orderChecklistItem({
        sorting_data: orderArray,
      })
      //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        setDraggable(false)
        setLoading(false)
      }
    } catch (err) {
      //console.log(err)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setLoading(false)
    }
  }

  const attemptListStatusChange = () => {
    let body = {}
    if (list?.status) {
      if (list?.status === 'Opened') {
        body['status'] = 'Complete'
      } else {
        body['status'] = 'Opened'
      }
      setStatusLoader(true)
      api.checklist
        .changeListStatus(id, body)
        .then((res) => {
          Alert.alert('List status changed successfully.')
        })
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
          // setRefresh((prev) => !prev)
          // setShowStatusChangeModal(false)
          setCompleteModal(false)
          setReOpenModal(false)
          setStatusLoader(false)
          setListStatus(false)
        })
    }
  }

  const attemptMove = async (project, milestone, task, issue, copy) => {
    try {
      setBtnLoader(true)
      let params = {
        model_ids: [list.id],
        state: 'list',
        project_id: project.id,
        milestone_id: milestone.id,
        task_id: task.id,
        issue_id: issue.id,
        make_copy: copy,
      }
      milestone.id == -1 && delete params.milestone_id
      task.id == -1 && delete params.task_id
      issue.id == -1 && delete params.issue_id

      let res = await api.project.moveItems(params)
      if (res.success) {
        Alert.alert('Move Successful.')
        setShowMoveModal(false)
        setRefresh((prev) => !prev)
        setBtnLoader(false)
      }
    } catch (err) {
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setShowMoveModal(false)
      setBtnLoader(false)
    }
  }

  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('ChecklistAdd', { id: id })}
        // onDelete={attemptDelete}
        onClone={() => {
          setActionType('clone')
          setSelectable(true)
          setDraggable(false)
        }}
        onDelete={() => {
          setActionType('delete')
          setSelectable(true)
          setDraggable(false)
        }}
        onMove={() => setShowMoveModal(true)}
      />
      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        state={'list'}
        onMove={attemptMove}
      />
      {/* <StatusChangeModal
        visibility={showStatusChangeModal}
        setVisibility={setShowStatusChangeModal}
        onComplete={attemptTodolistStatusChange}
      /> */}
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this list items? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        setSelectable={setSelectable}
        multipleSelect={multipleSelect}
        btnLoader={btnLoader}
      />
      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={list?.id}
        model={'List'}
        setRefresh={setRefresh}
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        setSelectable={setSelectable}
        multipleSelect={multipleSelect}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone list Items? Lists Items will be clone with same state."
      />

      <ListCompleteModal
        visibility={completeModal}
        setVisibility={setCompleteModal}
        onComplete={listStatus ? attemptListStatusChange : attemptSingleItemStatusChange}
        confirmationMessage={
          listStatus
            ? 'Do you want to complete this list?'
            : 'Do you want to complete this list items?'
        }
        statusLoader={statusLoader}
        setStatusLoader={setStatusLoader}
        setListStatus={setListStatus}
      />
      <ListReOpenModal
        visibility={reOpenModal}
        setVisibility={setReOpenModal}
        onComplete={listStatus ? attemptListStatusChange : attemptSingleItemStatusChange}
        confirmationMessage={
          listStatus ? 'Do you want to reopen this list?' : 'Do you want to reopen this list items?'
        }
        statusLoader={statusLoader}
        setStatusLoader={setStatusLoader}
        setListStatus={setListStatus}
      />
      <View style={[s.outerContainer]}>
        
      <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              if (navigationFrom === 'GlobalSearch') {
                if (searchNavigationFrom) {
                  navigation.navigate('Search')
                } else {
                  navigation.jumpTo('Search')
                }
              } else {
                navigation.navigate('Checklist')
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1, list?.status === 'Complete'&& { textDecorationLine: 'line-through' }]}>
            {list?.name.length > 25 ? list?.name.slice(0, 25) + '...' : list?.name}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[s.buttonGroup]}
              onPress={() => {
                setListStatus(true)
                if (list.status === 'Opened') {
                  setCompleteModal(true)
                } else {
                  setReOpenModal(true)
                }
              }}
            >
              <CheckIcon />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.buttonGroup, { marginRight: 0 }]}
              onPress={() => {
                setShowSettingsModal(true)
              }}
            >
              <MoreIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={s.smallTitle}>
              {`${list?.project && list?.project?.name + ' / '}${
                list?.milestone ? list?.milestone?.name + ' / ' : ''
              }${list?.task ? list?.task?.name + ' / ' : ''}${
                list?.issue ? list?.issue?.name + ' / ' : ''
              }${list?.name} `}
            </Text>
          </View>
          <View style={[g.containerBetween, s.detailsPickerContainer]}>
            <TouchableOpacity
              style={[
                s.detailsPickerButton,
                detailsScreen === 'details' ? s.detailsPickerButtonActive : null,
              ]}
              onPress={() => {
                setDetailsScreen('details')
              }}
            >
              <Text
                style={[
                  s.detailsPickerButtonText,
                  detailsScreen === 'details' ? s.detailsPickerButtonTextActive : null,
                ]}
              >
                Items
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.detailsPickerButton,
                detailsScreen === 'functionality' ? s.detailsPickerButtonActive : null,
              ]}
              onPress={() => {
                setDetailsScreen('functionality')
              }}
            >
              <Text
                style={[
                  s.detailsPickerButtonText,
                  detailsScreen === 'functionality' ? s.detailsPickerButtonTextActive : null,
                ]}
              >
                Resources
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {detailsScreen === 'details' && (
              <View style={{ flex: 1 }}>
                <CSearchInput
                  style={{ marginTop: 0 }}
                  searchIcon={true}
                  isGSearch={true}
                  placeholder={'Search'}
                  value={search}
                  setValue={setSearch}
                  onPress={() => {
                    setSearch('')
                  }}
                />
                {loading && <ActivityIndicator size={'small'} color={colors.NORMAL} />}
                {!loading && listItems.length == 0 && (
                  <Text style={{ textAlign: 'left' }}>
                    No list items to show. Create a new list item by pressing the plus button
                  </Text>
                )}
                {!loading && (
                  <DraggableFlatList
                    showsVerticalScrollIndicator={false}
                    data={listItems}
                    onDragBegin={() => {}}
                    onDragEnd={({ data }) => {
                      setListItems(
                        data.map((item, idx) => {
                          return { ...item, order: idx + 1 }
                        })
                      )
                    }}
                    keyExtractor={(item) => item.id}
                    renderItem={(props) => <ItemsCard {...props} />}
                    containerStyle={{
                      flex: 1,
                      flexDirection: 'row',
                      // paddingHorizontal: 20,
                    }}
                  />
                )}
                <View style={{ marginBottom: 64 }}>
                  {draggable && !loading && (
                    <View style={s.buttonContainer}>
                      <CButtonInput
                        label="Cancel"
                        onPress={() => {
                          setDraggable(false)
                          setRefresh((pre) => !pre)
                        }}
                        style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
                      />
                      <CButtonInput
                        label="Save"
                        onPress={attemptOrdering}
                        loading={btnLoader}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                  {!draggable && selectable && actionType == 'clone' && (
                    <View style={s.buttonContainer}>
                      <CButtonInput
                        label="Cancel"
                        onPress={() => {
                          setSelectable(false)
                          multipleSelect.current = {}
                          setActionType('')
                        }}
                        style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
                      />
                      <CButtonInput
                        label="Clone"
                        onPress={() => setShowCloneModal(true)}
                        // loading={btnLoader}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                  {!draggable && selectable && actionType == 'delete' && (
                    <View style={s.buttonContainer}>
                      <CButtonInput
                        label="Cancel"
                        onPress={() => {
                          setSelectable(false)
                          multipleSelect.current = {}
                          setActionType('')
                        }}
                        style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
                      />
                      <CButtonInput
                        label="Delete"
                        onPress={() => setShowDeleteModal(true)}
                        // loading={btnLoader}
                        style={{ flex: 1, backgroundColor: colors.RED_NORMAL }}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}

            {detailsScreen === 'functionality' && (
              <View style={{ flex: 1 }}>
                <DraggableFlatList
                  data={functionalityListing}
                  onDragBegin={() => {}}
                  onDragEnd={({ data }) => {
                    setFuntionalityListing(data)
                  }}
                  keyExtractor={(item) => item.id}
                  renderItem={(props) => <ListingFunctionality {...props} />}
                  containerStyle={{
                    width: '100%',
                    flex: 1,
                    flexDirection: 'row',
                    height: '100%',
                    marginBottom: 8,
                  }}
                />
              </View>
            )}
          </View>
          {/* <View>{}</View> */}
        </View>

        {!loading && !draggable && !selectable && (
          <CFloatingPlusIcon
            style={[{ bottom: Platform.OS === 'ios' && height > 670 ? 70 : 40 }]}
            onPress={() =>
              navigation.navigate('AddChecklistItem', {
                todoId: id,
                checklist: checklistDetails,
                order: listItems.length + 1,
              })
            }
          />
        )}
        {/* <View style={s.divider}></View> */}
      </View>
      {/* </View> */}
    </View>
  )
}

//navigation.navigate('IssueEdit', { id: id })

export default ChecklistDetailsScreen

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
  cardRowBetweenForAdressComponent: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // padding: 10,
    // borderWidth: 1,
  },
  outerContainer: {
    // paddingTop: Platform.OS !== 'ios' ? StatusBar.currentHeight : StatusBar.currentHeight + 25,
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    // marginBottom: 55,
    paddingTop: 10,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
    // backgroundColor:'yellow',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonGroupBtn: {
    marginLeft: 8,
  },
  titleText: {
    fontSize: 24,
    color: '#000E29',
    // marginBottom: 16,
    // fontFamily: 'inter-bold',
    fontWeight: '700',
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatarText: {
    color: 'dodgerblue',
  },
  normalText: {
    color: '#001D52',
    marginLeft: 8,
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    // fontFamily:'inter',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgb(45, 156, 219)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    // marginVertical: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 10,
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
    marginTop: 40,
  },
  margin1x: {
    marginBottom: 10,
  },
  holdButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '50%',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: colors.SECONDARY,
    width: '50%',
  },
  reOpenButton: {
    backgroundColor: colors.SECONDARY,
    width: '100%',
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  detailsPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginBottom: 24,
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
    // fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  detailsPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  dragItemWrapper: {
    backgroundColor: colors.CONTAINER_BG,
    width: '0.1%',
  },
  smallTitle: {
    color: '#9CA2AB',
    fontSize: 12,
    marginTop: 4,
  },
  deleteItemWrapper: {
    backgroundColor: colors.RED_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    marginVertical: 10,
    borderRadius: 8,
  },
  deleteItemText: {
    color: colors.WHITE,
  },
  dragItemText: {
    color: colors.CONTAINER_BG,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,

    // padding: 10,
  },
  project: {
    fontSize: 14,
    color: '#9CA2AB',
    marginRight: 5,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 32 : 0,
    // marginBottom: 16,
  },
})
