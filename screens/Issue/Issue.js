import React, { useCallback, useState } from 'react'
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
import { Swipeable } from 'react-native-gesture-handler'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'

import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import AllCollapseIcon from '../../assets/svg/all-collapse.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CollapseIcon from '../../assets/svg/collapse-icon.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import ExpandIcon from '../../assets/svg/expand.svg'
import GripIcon from '../../assets/svg/grip.svg'
import LocationIcon from '../../assets/svg/location.svg'
import MoreIcon from '../../assets/svg/more.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import HideKeyboard from '../../components/common/HideKeyboard'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { setCurrentIssue, setNavigationFrom } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getUserIdsFromSelectedUsers } from '../../utils/User'
// import CrossIcon from '../../assets/svg/cross.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Linking, Platform } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import { FilterColors, PriorityColors } from '../../assets/constants/filters'
import DownIcon from '../../assets/svg/arrow-down.svg'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'
import ListingCompletion from '../../components/Completion/ListingCompletion'
import CSelectedUsersWithoutEdit from '../../components/common/CSelectedUsersWithoutEdit'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import IconWrap from '../../components/common/IconWrap'
import CSettingsModal from '../../components/modals/CSettingModal'
import CSortModal from '../../components/modals/CSortModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import IssueCustomizationModal from '../../components/modals/IssueCustomizationModal'
import IssueOrTaskFilterModal from '../../components/modals/IssueOrTaskFilterModal'
import MoveModal from '../../components/modals/MoveModal'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { dateFormatter } from '../../utils/Timer'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

const expandViewData = [
  { id: 1, label: 'Status' },
  { id: 2, label: 'Priority' },
  { id: 3, label: 'Members' },
  { id: 4, label: 'Address' },
  { id: 5, label: 'Project' },
  { id: 6, label: 'Completion %' },
]

const collapseViewData = [
  {
    id: 10,
    text: 'Collapse view:',
    items: [
      { id: 11, label: 'Status', collapse: true },
      { id: 12, label: 'Priority', collapse: true },
    ],
  },
]

const ItemViewData = [
  { id: 13, label: 'Address', collapse: false },
  { id: 14, label: 'Project', collapse: false },
  { id: 15, label: 'Completion %', collapse: false },
  { id: 16, label: 'Members', collapse: false },
]

const { height, width } = Dimensions.get('window')

export default function IssueScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const refreshControlRef = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const { currentProject, currentMilestone, currentTaskIds, currentTask, navigationFrom } =
    useSelector((state) => state.navigation)
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  // const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedProjects, setSelectedProjects] = useState(() => {
    if (currentProject?.id) {
      return [{ id: currentProject.id, name: currentProject.name }]
    } else {
      return []
    }
  })
  const [selectedMilestones, setSelectedMilestones] = useState(() => {
    if (currentMilestone?.id) {
      return [{ id: currentMilestone.id, name: currentMilestone.name }]
    } else {
      return []
    }
  })
  const [selectedTasks, setSelectedTasks] = useState(() => {
    if (currentTask?.id) {
      return [{ id: currentTask.id, name: currentTask.name }]
    } else {
      return []
    }
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [expandFilters, setExpandFilters] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [issues, setIssues] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  let allData = route.params ? route.params.allData : null
  let taskIds = route.params ? route.params.taskIds : null
  let fromHome = route?.params?.fromHome ? route.params.fromHome : null
  let issueId = route.params ? route.params.issueId : null
  let onlyProject = route.params ? route.params.onlyProject : null
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectable, setSelectable] = useState(false)

  const [allCollapsable, setAllCollapsable] = useState(true)
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [issueIds, setIssueIds] = useState({})

  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [expandView, setExpandView] = useState(expandViewData)
  const [itemView, setItemView] = useState(ItemViewData)
  const [collapseView, setCollapseView] = useState(collapseViewData)
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortBy, setSortBy] = useState(SORT_BY[0])

  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [actionType, setActionType] = useState('')

  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const filterHeight = useSharedValue(0)

  const [filterCount, setFilterCount] = useState(0)

  const openSortModal = () => {
    setShowSortModal(true)
  }

  const getItem = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) {}
  }

  useEffect(async () => {
    getItem('issueCollapseView').then((res) => {
      if (res) {
        //console.log(res, 'res....................')
        setCollapseView(res)
      } else {
        setCollapseView(collapseViewData)
      }
    })
    getItem('issueItemView').then((res) => {
      if (res) {
        setItemView(res)
      } else {
        setItemView(ItemViewData)
      }
    })
    // setCollapseView(collapseViewData)
    // setItemView(ItemViewData)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [issueId])

  useEffect(() => {
    setFilterCount(0)
    if (selectedProjects.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedMilestones.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedStatuses.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedPriorities.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedDate) {
      setFilterCount((pre) => pre + 1)
    }
    if (users.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedTasks.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
  }, [
    selectedProjects,
    selectedMilestones,
    selectedDate,
    selectedStatuses,
    users,
    selectedTasks,
    selectedPriorities,
  ])

  const headerY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, 64 + filterHeight.value)
    return {
      transform: [
        {
          translateY: withTiming(-dy),
        },
      ],
      // top: withTiming(dy)
    }
  })

  const paddingY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 56,
    }
  })

  const msgY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 64,
    }
  })

  const toggleRefresh = () => {
    setPage(1)
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const ListFooterComponent = () => <ActivityIndicator size="small" color={colors.NORMAL} />

  const AddressComponent = ({ address, each }) => {
    // //console.log(address, 'address...')
    return address ? (
      address !== 'null' && (
        <TouchableOpacity
          key={each && each?.id}
          onPress={() => {
            address
              ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
              : console.log('No address')
          }}
          style={[s.cardRowBetweenForAdressComponent, { marginLeft: 8, flex: 1 }]}
        >
          <Text style={{ marginRight: 4 }}>
            {address.length > 25 ? address.slice(0, 25) + '...' : address}
          </Text>
          {/* <View style={{backgroundColor:'yellow'}}> */}
          <IconWrap>
            <LocationIcon fill={colors.NORMAL} />
          </IconWrap>
          {/* </View> */}
        </TouchableOpacity>
      )
    ) : (
      <></>
    )
  }

  const IssueCard = ({ item, drag, isActive }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

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
          onLongPress={() => {
            setSelectable((prev) => {
              return !prev
            })
            setActionType('')
            multipleSelect.current = {}
          }}
        >
          <View style={g.containerBetween}>
            {draggable && (
              <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
                <GripIcon />
              </TouchableOpacity>
            )}
            {selectable && !draggable && (
              <View style={{ marginRight: 16 }}>
                <CCheckbox
                  showLabel={false}
                  checked={checked}
                  setChecked={setChecked}
                  onChecked={toggleDeleteMultiple}
                />
              </View>
            )}
            <View style={[s.cardContainer, g.containerBetween]}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={s.cardRowBetween}
                  onLongPress={() => {
                    setSelectable((prev) => {
                      return !prev
                    })
                    setActionType('')
                    multipleSelect.current = {}
                  }}
                  onPress={() => {
                    dispatch(setNavigationFrom(''))
                    dispatch(setCurrentIssue(item))
                    navigation.navigate('IssueDetails', {
                      id: item.id,
                    })
                    setActionType('')
                    multipleSelect.current = {}
                    setSelectable(false)
                  }}
                >
                  {/* <LocationIcon fill={colors.NORMAL} /> */}
                  <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => setIsCollapsed(!isCollapsed)}
                  >
                    {allCollapsable ? (
                      isCollapsed ? (
                        <CollapseIcon />
                      ) : (
                        <ExpandIcon />
                      )
                    ) : isCollapsed ? (
                      <ExpandIcon />
                    ) : (
                      <CollapseIcon />
                    )}
                  </TouchableOpacity>
                  <Text style={s.cardTitle}>{item?.name}</Text>
                  {/* {selectable && (
                    <CCheckbox
                      showLabel={false}
                      checked={checked}
                      setChecked={setChecked}
                      onChecked={toggleDeleteMultiple}
                    />
                  )} */}
                </TouchableOpacity>
                {allCollapsable ? (
                  isCollapsed ? (
                    <>
                      <View style={[s.cardRowBetween]}>
                        <View style={[s.cardRowLeft]}>
                          {collapseView[0].items.map((each) => {
                            if (each.label == 'Status') {
                              return (
                                <Text
                                  key={each.id}
                                  style={[
                                    g.gCardStatus,
                                    { marginRight: 8 },
                                    {
                                      backgroundColor:
                                        item?.stage && FilterColors[item?.stage].color,
                                    },
                                  ]}
                                >
                                  {item?.stage}
                                </Text>
                              )
                            }
                          })}
                          {collapseView[0].items.map((each) => {
                            if (each.label == 'Priority') {
                              return (
                                <Text
                                  key={each.id}
                                  style={[
                                    s.cardLevel,
                                    { color: PriorityColors[item.priority].color },
                                  ]}
                                >
                                  {capitalizeFirstLetter(item?.priority)}
                                </Text>
                              )
                            }
                          })}
                        </View>
                        {collapseView[0].items.map((each) => {
                          if (each.label == 'Members') {
                            return (
                              <CSelectedUsersWithoutEdit
                                selectedUsers={item['user_members'] ? item['user_members'] : []}
                              />
                            )
                          }
                        })}
                      </View>
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Project') {
                          return (
                            <View style={[s.cardRowLeft, { paddingBottom: 0, paddingVertical: 8 }]}>
                              <Text style={s.project}>Project:</Text>
                              <Text style={s.projectTitle}>{item?.project?.name}</Text>
                            </View>
                          )
                        }
                      })}
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Completion %') {
                          return (
                            <ListingCompletion
                              from={'listing'}
                              status={item.stage}
                              progressData={{
                                completion: item.progress.completion,
                                is_can_completion: item.progress.is_can_completion,
                              }}
                              type={'issue'}
                              id={item.id}
                            />
                          )
                        }
                      })}
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Address') {
                          return <AddressComponent address={item?.address} />
                        }
                      })}
                    </>
                  ) : (
                    <>
                      <View style={s.cardRowBetween}>
                        <View style={s.cardRowLeft}>
                          <Text
                            style={[
                              g.gCardStatus,
                              { backgroundColor: FilterColors[item.stage].color },
                            ]}
                          >
                            {item.stage}
                          </Text>
                          <Text
                            style={[s.cardLevel, { color: PriorityColors[item.priority].color }]}
                          >
                            {capitalizeFirstLetter(item?.priority)}
                          </Text>
                        </View>

                        <CSelectedUsersWithoutEdit
                          selectedUsers={item['user_members'] ? item['user_members'] : []}
                        />
                      </View>
                      <View style={[s.cardRowLeft, { paddingHorizontal: 10, paddingBottom: 0 }]}>
                        <Text style={s.project}>Project:</Text>
                        <Text style={s.projectTitle}>{item?.project?.name}</Text>
                      </View>
                      <ListingCompletion
                        from={'listing'}
                        status={item.stage}
                        progressData={{
                          completion: item.progress.completion,
                          is_can_completion: item.progress.is_can_completion,
                        }}
                        type={'issue'}
                        id={item.id}
                      />
                      <AddressComponent address={item?.address} />
                    </>
                  )
                ) : isCollapsed ? (
                  <>
                    <View style={[s.cardRowBetween, { padding: 0 }]}>
                      <View style={s.cardRowLeft}>
                        <Text
                          style={[
                            g.gCardStatus,
                            { backgroundColor: FilterColors[item.stage].color },
                          ]}
                        >
                          {item.stage}
                        </Text>
                        <Text style={[s.cardLevel, { color: PriorityColors[item.priority].color }]}>
                          {capitalizeFirstLetter(item?.priority)}
                        </Text>
                      </View>

                      <CSelectedUsersWithoutEdit
                        selectedUsers={item['user_members'] ? item['user_members'] : []}
                      />
                    </View>
                    <View style={[s.cardRowLeft, { paddingHorizontal: 10, paddingBottom: 0 }]}>
                      <Text style={s.project}>Project:</Text>
                      <Text style={s.projectTitle}>{item?.project?.name}</Text>
                    </View>
                    <ListingCompletion
                      from={'listing'}
                      status={item.stage}
                      progressData={{
                        completion: item.progress.completion,
                        is_can_completion: item.progress.is_can_completion,
                      }}
                      type={'issue'}
                      id={item.id}
                    />
                    <AddressComponent address={item?.address} />
                  </>
                ) : (
                  <>
                    <View style={[s.cardRowBetween]}>
                      <View style={s.cardRowLeft}>
                        {collapseView[0].items.map((each) => {
                          if (each.label == 'Status') {
                            return (
                              <Text
                                key={each.id}
                                style={[
                                  g.gCardStatus,
                                  { marginRight: 8 },
                                  {
                                    backgroundColor: item?.stage && FilterColors[item?.stage].color,
                                  },
                                ]}
                              >
                                {item?.stage}
                              </Text>
                            )
                          }
                        })}
                        {collapseView[0].items.map((each) => {
                          if (each.label == 'Priority') {
                            return (
                              <Text
                                key={each.id}
                                style={[
                                  s.cardLevel,
                                  { color: PriorityColors[item.priority].color },
                                ]}
                              >
                                {capitalizeFirstLetter(item?.priority)}
                              </Text>
                            )
                          }
                        })}
                      </View>
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Members') {
                          return (
                            <CSelectedUsersWithoutEdit
                              selectedUsers={item['user_members'] ? item['user_members'] : []}
                            />
                          )
                        }
                      })}
                    </View>
                    {collapseView[0].items.map((each) => {
                      if (each.label == 'Project') {
                        return (
                          <View
                            style={[s.cardRowLeft, { paddingHorizontal: 10, paddingBottom: 0 }]}
                          >
                            <Text style={s.project}>Project:</Text>
                            <Text style={s.projectTitle}>{item?.project?.name}</Text>
                          </View>
                        )
                      }
                    })}
                    {collapseView[0].items.map((each) => {
                      if (each.label == 'Completion %') {
                        return (
                          <ListingCompletion
                            from={'listing'}
                            status={item.stage}
                            progressData={{
                              completion: item.progress.completion,
                              is_can_completion: item.progress.is_can_completion,
                            }}
                            type={'issue'}
                            id={item.id}
                          />
                        )
                      }
                    })}
                    {collapseView[0].items.map((each) => {
                      if (each.label == 'Address') {
                        return <AddressComponent address={item?.address} />
                      }
                    })}
                  </>
                )}

                {/* <View style={[s.cardRowLeft, { marginTop: 0 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[g.gCardStatus, { backgroundColor: FilterColors[item.stage]?.color }]}
                    >
                      {item?.stage}
                    </Text>
                    <Text style={[s.cardLevel, { color: PriorityColors[item.priority]?.color }]}>
                      {capitalizeFirstLetter(item?.priority)}
                    </Text>
                  </View>
                  {!allCollapsable ? (
                    !isCollapsed ? (
                      <View style={[draggable ? s.containerRightDrag : s.containerRight]}>
                        <CSelectedUsersWithoutEdit
                          selectedUsers={item['user_members'] ? item['user_members'] : []}
                        />
                      </View>
                    ) : (
                      <></>
                    )
                  ) : !isCollapsed ? (
                    <></>
                  ) : (
                    <View style={[draggable ? s.containerRightDrag : s.containerRight]}>
                      <CSelectedUsersWithoutEdit
                        selectedUsers={item['user_members'] ? item['user_members'] : []}
                      />
                    </View>
                  )}
                </View> */}
                {/* <>
                {!allCollapsable ? (
                  <>
                    {!isCollapsed ? (
                      <>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                          <Text style={s.project}>Project:</Text>
                          <Text style={s.projectTitle}>{item?.project?.name}</Text>
                        </View>

                        <ListingCompletion
                          from={'listing'}
                          status={item.stage}
                          progressData={{
                            completion: item.progress?.completion,
                            is_can_completion: item.progress?.is_can_completion,
                          }}
                          type={'issue'}
                          id={item.id}
                        />

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            paddingHorizontal: 10,
                          }}
                        >
                         
                          <AddressComponent address={item.address} />
                        </View>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <>
                    {!isCollapsed ? (
                      <></>
                    ) : (
                      <>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                          <Text style={s.project}>Project:</Text>
                          <Text style={s.projectTitle}>{item?.project?.name}</Text>
                        </View>
                        <ListingCompletion
                          status={item.stage}
                          progressData={{
                            completion: item.progress.completion,
                            is_can_completion: item.progress.is_can_completion,
                          }}
                          type={'issue'}
                          id={item.id}
                        />

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                            paddingHorizontal: 10,
                          }}
                        >
                          
                          <AddressComponent address={item.address} />
                        </View>
                      </>
                    )}
                  </>
                )}
                </> */}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const attemptDelete = async () => {
    try {
      setBtnLoading(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)

        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.issue.deleteMultipleIssues({
            issue_ids: toDeleteArray,
          })
          // //console.log(res)
          if (res.success) {
            setShowDeleteModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            multipleSelect.current = {}
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        let res = await api.issue.deleteIssue(singleSelect.current)
        // //console.log(res)
        if (res.success) {
          setShowDeleteModal(false)
          toggleRefresh()
          Alert.alert('Delete Successful.')
        }
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
    } finally {
      setBtnLoading(false)
    }
  }

  const attemptOrdering = async () => {
    setBtnLoading(true)
    setSortBy(SORT_BY[5])
    try {
      let orderArray = getSortingOrderData(issues)
      let res = await api.issue.orderIssue({
        sorting_data: orderArray,
      })
      // //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
        setDraggable(false)
        setBtnLoading(false)
      }
    } catch (err) {
      // //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setBtnLoading(false)
    }
  }

  const attemptClone = async () => {
    try {
      setBtnLoading(true)
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.issue.cloneIssue({
            issue_ids: toCloneArray,
          })
          // //console.log(res)
          if (res.success) {
            multipleSelect.current = {}
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            Alert.alert('Clone Successful.')
          }
        }
      } else {
        Alert.alert('Please select at least one project to clone.')
      }
    } catch (err) {
      // //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setShowCloneModal(false)
      setActionType('')
    } finally {
      setBtnLoading(false)
    }
  }

  const attemptMove = async (project, milestone, task, copy) => {
    try {
      setBtnLoading(true)
      if (selectable) {
        let toMoveArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toMoveArray.length == 0) {
          Alert.alert('Please select at least one item to move.')
        } else {
          const params = {
            model_ids: toMoveArray,
            state: 'issue',
            project_id: project.id,
            milestone_id: milestone.id,
            task_id: task.id,
            make_copy: copy,
          }
          milestone.id == -1 && delete params.milestone_id
          task.id == -1 && delete params.task_id

          let res = await api.project.moveItems(params)
          if (res.success) {
            setShowMoveModal(false)
            setSelectable(false)
            setActionType('')
            multipleSelect.current = {}
            toggleRefresh()
            Alert.alert('Move Successful.')
          }
        }
      } else {
        Alert.alert('Please select at least one item to move.')
        setShowMoveModal(false)
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
      setActionType('')
    } finally {
      setBtnLoading(false)
    }
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetFilters = () => {
    setSelectedStatuses([])
    setUsers([])
    setSelectedPriorities([])
    setSelectedMilestones([])
    setSelectedTasks([])
    setSelectedProjects([])
    setSelectedDate(null)
    setSearch('')
    toggleRefresh()
  }

  const resetUsers = (user) => {
    if (users?.length > 1) {
      setUsers((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => user.email !== filterItem.email)
      })
    } else if (users?.length == 1) {
      setUsers([])
    }
    toggleRefresh()
  }
  const resetAllUsers = () => {
    setUsers([])
    toggleRefresh()
  }

  const resetProjects = (project) => {
    if (selectedProjects?.length > 1) {
      setSelectedProjects((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => project.id !== filterItem.id)
      })
    } else if (selectedProjects?.length == 1) {
      setSelectedProjects([])
    }
    toggleRefresh()
  }
  const resetAllProjects = () => {
    setSelectedProjects([])
    toggleRefresh()
  }

  const resetMilestones = (milestone) => {
    if (selectedMilestones?.length > 1) {
      setSelectedMilestones((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => milestone.id !== filterItem.id)
      })
    } else if (selectedMilestones?.length == 1) {
      setSelectedMilestones([])
    }
    toggleRefresh()
  }

  const resetAllMilestones = () => {
    setSelectedMilestones([])
    toggleRefresh()
  }

  const resetTasks = (task) => {
    if (selectedTasks?.length > 1) {
      setSelectedTasks((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => task.id !== filterItem.id)
      })
    } else if (selectedTasks?.length == 1) {
      setSelectedTasks([])
    }
    toggleRefresh()
  }

  const resetAllTasks = () => {
    setSelectedTasks([])
    toggleRefresh()
  }

  const resetDate = () => {
    setSelectedDate(null)
    toggleRefresh()
  }

  const resetStatuses = (status) => {
    if (selectedStatuses?.length > 1) {
      setSelectedStatuses((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => status.value !== filterItem.value)
      })
    } else if (selectedStatuses?.length == 1) {
      setSelectedStatuses([])
    }
    toggleRefresh()
  }

  const resetAllStatuses = () => {
    setSelectedStatuses([])
    toggleRefresh()
  }

  const resetPriorities = (priority) => {
    if (selectedPriorities?.length > 1) {
      setSelectedPriorities((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => priority.value !== filterItem.value)
      })
    } else if (selectedPriorities?.length == 1) {
      setSelectedPriorities([])
    }
    toggleRefresh()
  }

  const resetAllPriorities = () => {
    setSelectedPriorities([])
    toggleRefresh()
  }

  useEffect(() => {
    //console.log('Selected Date', selectedDate)
    if (
      users.length == 0 &&
      selectedTasks.length == 0 &&
      selectedProjects.length == 0 &&
      selectedMilestones.length == 0 &&
      selectedDate == null &&
      selectedStatuses.length == 0 &&
      selectedPriorities.length == 0
    ) {
      setShowFilters(false)
      filterHeight.value = 0
      // setBody({})
    } else {
      setShowFilters(true)
    }
  }, [
    users,
    selectedProjects,
    selectedMilestones,
    selectedDate,
    selectedStatuses,
    selectedTasks,
    selectedPriorities,
  ])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const issueCallBack = useCallback(() => {
    setLoading(true)
    const body = {
      pagination: 10,
      page: page,
      selectData: 1,
      // sort_by: 'last_updated',
      task_ids: currentTaskIds,
    }
    if (query != '') {
      body['search'] = query
    }
    if (users.length > 0) {
      body['members'] = getUserIdsFromSelectedUsers(users)
    }

    if (selectedStatuses.length > 0) {
      body['stages'] = selectedStatuses.map((item) => item.label)
    }

    if (selectedPriorities.length > 0) {
      body['priorities'] = selectedPriorities.map((item) => item.value)
    }

    if (selectedProjects.length > 0) {
      body['project_ids'] = getProjectFromSelectedProjects(selectedProjects)
      // body['only_project'] = 1
    }

    if (selectedMilestones.length > 0) {
      body['milestone_ids'] = getProjectFromSelectedProjects(selectedMilestones)
      // body['only_project'] = 0
    }
    if (selectedTasks.length > 0) {
      body['task_ids'] = getProjectFromSelectedProjects(selectedTasks)
      // body['only_project'] = 0
    }

    if (selectedDate != null) {
      body['start_date'] = selectedDate
    }

    if (sortBy) {
      body['sort_by'] = sortBy.param
    }

    if (onlyProject) {
      body['only_project'] = onlyProject
    }

    api.issue
      .getIssues(body)
      .then((res) => {
        setCurrentPage(res.meta.current_page)
        setLastPage(res.meta.last_page)
        if (page == 1) {
          // //console.log(res.data)
          setIssues(res.data)
        } else if (page > 1) {
          // //console.log(res.data.map((item) => item.id))
          setIssues((pre) => [...pre, ...res.data])
        }
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
        setLoading(false)
      })
  }, [
    refresh,
    refetch,
    query,
    selected,
    users,
    page,
    selectedProjects,
    selectedMilestones,
    selectedDate,
    selectedStatuses,
    selectedTasks,
    selectedPriorities,
    sortBy,
  ])

  useEffect(() => {
    issueCallBack()
  }, [issueCallBack])

  const openFilterModal = () => {
    toggleRefresh()
    setShowFiltersModal(true)
  }

  const handleMoveOrClone = () => {
    {
      if (actionType == 'clone') {
        setShowCloneModal(true)
      } else if (actionType == 'move') {
        let toMoveArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toMoveArray.length == 0) {
          Alert.alert('Please select at least one item to move.')
        } else {
          setShowMoveModal(true)
        }
      }
    }
  }

  const goBack = () => {
    if (currentProject) {
      if (currentMilestone) {
        if (currentTask) {
          // //console.log("Go to task details")
          navigation.navigate('TaskDetails', { refetch: Math.random() })
        } else {
          navigation.navigate('MilestoneDetails', { refetch: Math.random() })
        }
      } else {
        navigation.navigate('ProjectDetails', { refetch: Math.random(), onlyProject: 1 })
      }
    } else {
      if (navigationFrom == 'day') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
        dispatch(setNavigationFrom(''))
        navigation.navigate('DayView')
      } else if (navigationFrom === 'week') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
        dispatch(setNavigationFrom(''))
        navigation.navigate('WeekView')
      } else if (navigationFrom === 'month') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
        dispatch(setNavigationFrom(''))
        navigation.navigate('MonthView')
      } else {
        navigation.goBack()
      }
    }
  }

  return (
    <HideKeyboard>
      <View
        // backgroundColor: colors.CONTAINER_BG
        style={[
          { flex: 1, backgroundColor: colors.CONTAINER_BG },
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}
      >
        <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
        {/* <StatusBar backgroundColor={colors.CONTAINER_BG} /> */}
        <CSettingsModal
          visibility={showSettingsModal}
          setVisibility={setShowSettingsModal}
          onDelete={() => {
            setActionType('delete')
            setSelectable(true)
            setDraggable(false)
          }}
          onFilter={() => setShowFiltersModal(true)}
          onClone={() => {
            setActionType('clone')
            setSelectable(true)
            setDraggable(false)
          }}
          onMove={() => {
            setActionType('move')
            setSelectable(true)
            setDraggable(false)
          }}
          onCustomiztion={() => setShowCustomizationModal(true)}
        />
        <DeleteConfirmationModal
          confirmationMessage={'Do you want to delete this issue? This cannot be undone'}
          visibility={showDeleteModal}
          setVisibility={setShowDeleteModal}
          onDelete={attemptDelete}
          setSelectable={setSelectable}
          multipleSelect={multipleSelect}
          btnLoader={btnLoading}
        />
        <CloneConfirmationModal
          visibility={showCloneModal}
          setVisibility={setShowCloneModal}
          onClone={attemptClone}
          setSelectable={setSelectable}
          multipleSelect={multipleSelect}
          confirmationMessage="Do you want to Clone issues? Issues will be clone with same state with its childs"
          btnLoader={btnLoading}
        />

        <MoveModal
          visibility={showMoveModal}
          setVisibility={setShowMoveModal}
          multipleSelect={multipleSelect}
          setSelectable={setSelectable}
          state="issue"
          onMove={attemptMove}
          btnLoader={btnLoading}
        />

        <IssueOrTaskFilterModal
          showFilterModal={showFiltersModal}
          setShowFilterModal={setShowFiltersModal}
          selectedUsers={users}
          setSelectedUsers={setUsers}
          setSelectedProject={setSelectedProjects}
          selectedProject={selectedProjects}
          setSelectedMilestone={setSelectedMilestones}
          selectedMilestone={selectedMilestones}
          setSelectedTask={setSelectedTasks}
          selectedTask={selectedTasks}
          setSelectedDate={setSelectedDate}
          setSelectedStatuses={setSelectedStatuses}
          selectedStatuses={selectedStatuses}
          setSelectedPriorities={setSelectedPriorities}
          selectedPriorities={selectedPriorities}
          setShowParentFilters={setShowFilters}
          search={query}
          setSearch={setSearch}
          type={'Issue'}
          onApply={() => setPage(1)}
        />
        <IssueCustomizationModal
          openModal={showCustomizationModal}
          setOpenModal={setShowCustomizationModal}
          expandView={expandView}
          setExpandView={setExpandView}
          itemView={itemView}
          setItemView={setItemView}
          collapseView={collapseView}
          setCollapseView={setCollapseView}
        />
        <CSortModal
          visibility={showSortModal}
          setVisibility={setShowSortModal}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onApply={() => {
            setPage(1)
          }}
        />
        <View style={[s.outerContainer, { paddingBottom: 16 }, loading && { opacity: 0.3 }]}>
          <View style={s.outerPadding}>
            <View style={s.headerContainer}>
              <TouchableOpacity disabled={loading} onPress={goBack} outputRange={iconWrapColors}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>Issues</CText>
              <View style={s.buttonGroup}>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => {
                    setAllCollapsable(!allCollapsable)
                  }}
                  // outputRange={iconWrapColors}
                  style={s.buttonGroupBtn}
                >
                  <AllCollapseIcon fill={colors.NORMAL} />
                </TouchableOpacity>
                <TouchableOpacity onPress={openSortModal} style={s.buttonGroupBtn}>
                  <SortIcon fill={colors.NORMAL} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => {
                    setShowSettingsModal(true)
                  }}
                  // outputRange={iconWrapColors}
                  style={[s.buttonGroupBtn]}
                >
                  <MoreIcon fill={colors.NORMAL} />
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 66,
                  left: 16,
                  right: 16,
                  zIndex: 2,
                  backgroundColor: colors.PRIM_BG,
                  // backgroundColor: 'lightblue',
                },
                headerY,
              ]}
            >
              {/* Filters view */}
              {showFilters && (
                <View
                  // style={{ paddingHorizontal: 16 }}
                  onLayout={(event) => {
                    let { x, y, width, height } = event.nativeEvent.layout
                    filterHeight.value = height
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={s.filterText}>{`Filters (${filterCount})`}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity
                        style={[g.containerLeft, { marginRight: 16 }]}
                        onPress={resetFilters}
                      >
                        <IconWrap
                          outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                          onPress={resetFilters}
                        >
                          <ResetIcon />
                        </IconWrap>
                        <Text style={s.resetText}>Reset Filters</Text>
                      </TouchableOpacity>
                      {!expandFilters ? (
                        <IconWrap
                          onPress={() => {
                            setExpandFilters(true)
                          }}
                          outputRange={iconWrapColors}
                        >
                          <UpIcon />
                        </IconWrap>
                      ) : (
                        <IconWrap
                          onPress={() => {
                            setExpandFilters(false)
                          }}
                          outputRange={iconWrapColors}
                        >
                          <DownIcon />
                        </IconWrap>
                      )}
                    </View>
                  </View>

                  {!expandFilters && (
                    <View style={[s.filterBoxesContainer]}>
                      <View style={s.filterContainer}>
                        {users.length > 0 &&
                          users.map((user, id) => {
                            return (
                              <View
                                style={[
                                  s.userItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                ]}
                                key={id}
                              >
                                <Text style={s.userItemTextDark}>
                                  {user?.name ? user?.name : user?.email.split('@')[0]}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => resetUsers(user)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.SECONDARY} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {users.length > 0 && (
                          <TouchableOpacity onPress={resetAllUsers}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedProjects.length > 0 &&
                          selectedProjects.map((project, id) => {
                            return (
                              <View
                                style={[
                                  s.userItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                ]}
                                key={id}
                              >
                                <Text style={s.userItemTextDark}>
                                  {project?.name.length > 30
                                    ? project?.name.slice(0, 30)
                                    : project?.name}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => resetProjects(project)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.SECONDARY} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedProjects.length > 0 && (
                          <TouchableOpacity onPress={resetAllProjects} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedMilestones?.length > 0 &&
                          selectedMilestones?.map((milestone, id) => {
                            return (
                              <View
                                style={[
                                  s.userItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                ]}
                                key={id}
                              >
                                <Text style={s.userItemTextDark}>
                                  {milestone?.name.length > 30
                                    ? milestone?.name.slice(0, 30)
                                    : milestone?.name}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => resetMilestones(milestone)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.SECONDARY} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedMilestones?.length > 0 && (
                          <TouchableOpacity onPress={resetAllMilestones}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedTasks.length > 0 &&
                          selectedTasks.map((task, id) => {
                            return (
                              <View
                                style={[
                                  s.userItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                ]}
                                key={id}
                              >
                                <Text style={s.userItemTextDark}>
                                  {task?.name.length > 30 ? task?.name.slice(0, 30) : task?.name}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => resetTasks(task)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.SECONDARY} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedTasks.length > 0 && (
                          <TouchableOpacity onPress={resetAllTasks}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedDate && (
                          <View style={[s.userItemContainer]}>
                            <Text style={s.userItemTextDark}>{dateFormatter(selectedDate)}</Text>
                          </View>
                        )}
                        {selectedDate && (
                          <TouchableOpacity onPress={resetDate}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedStatuses?.length > 0 &&
                          selectedStatuses?.map((status, id) => {
                            return (
                              <View
                                style={[
                                  s.statusItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                  { backgroundColor: status.color },
                                ]}
                                key={id}
                              >
                                <Text style={{ color: colors.WHITE }}>{status?.label}</Text>
                                <TouchableOpacity
                                  onPress={() => resetStatuses(status)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.WHITE} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedStatuses?.length > 0 && (
                          <TouchableOpacity onPress={resetAllStatuses}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedPriorities.length > 0 &&
                          selectedPriorities.map((priority, id) => {
                            return (
                              <View
                                style={[
                                  s.statusItemContainer,
                                  { flexDirection: 'row', alignItems: 'center' },
                                  { backgroundColor: priority.color },
                                ]}
                                key={id}
                              >
                                <Text style={{ color: colors.WHITE }}>{priority?.label}</Text>
                                <TouchableOpacity
                                  onPress={() => resetPriorities(priority)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.WHITE} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedPriorities.length > 0 && (
                          <TouchableOpacity onPress={resetAllPriorities}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
              <CSearchInput
                placeholder="Search"
                value={search}
                setValue={setSearch}
                style={[{ marginVertical: 0 }]}
                filterIcon={true}
                onPress={() => setShowFiltersModal(true)}
              />
            </Animated.View>
            {/* Filters view end */}
          </View>
          {!loading && issues.length == 0 && (
            <Animated.View style={[msgY, { zIndex: -100 }]}>
              <Text style={s.noIssue}>
                No Issue to show. Please create your Issue by pressing the plus button.
              </Text>
            </Animated.View>
          )}
          {loading && (
            <View
              style={{
                flex: 1,
                zIndex: 200,
                height: '100%',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color={colors.HOVER} />
            </View>
          )}

          <DraggableFlatList
            ListHeaderComponent={() => (
              <Animated.View style={[paddingY, { zIndex: -1000 }]}></Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            data={issues}
            onDragBegin={() => {}}
            onDragEnd={({ data }) => {
              setIssues(data)
            }}
            refreshing={loading}
            onEndReachedThreshold={0.1}
            initialNumToRender={5}
            keyExtractor={(item, index) => index + 1}
            onScrollOffsetChange={(offset) => {
              diff.value = offset - prev.value
            }}
            onScrollBeginDrag={(e) => {
              prev.value = e.nativeEvent.contentOffset.y
            }}
            onEndReached={() => {
              if (currentPage < lastPage) {
                setPage(page + 1)
              }
              //console.log(lastPage, currentPage, 'last current')
            }}
            renderItem={(props) => <IssueCard {...props} />}
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              paddingHorizontal: 16,
              zIndex: -1,
            }}
          />

          {!loading && !draggable && !selectable && (
            <TouchableOpacity
              style={s.plusButton}
              onPress={() => {
                setActionType('')
                multipleSelect.current = {}
                setSortBy(SORT_BY[0])
                navigation.navigate('IssueAdd')
              }}
            >
              <FloatingPlusButton />
            </TouchableOpacity>
          )}

          <View style={s.dragableSaveButton}>
            {draggable && (
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
                  loading={btnLoading}
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
                    // setRefresh((pre)=>!pre)
                  }}
                  style={{ flex: 1, marginRight: 8, backgroundColor: colors.HEADER_TEXT }}
                />
                <CButtonInput
                  label="Delete"
                  onPress={() => setShowDeleteModal(true)}
                  loading={loading}
                  style={{ flex: 1, backgroundColor: colors.RED_NORMAL }}
                />
              </View>
            )}
            {!draggable && selectable && (actionType == 'clone' || actionType == 'move') && (
              <View style={s.buttonContainer}>
                <CButtonInput
                  label="Cancel"
                  onPress={() => {
                    setSelectable(false)
                    multipleSelect.current = {}
                  }}
                  style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
                />
                <CButtonInput
                  label={actionType == 'clone' ? 'Clone' : 'Move'}
                  onPress={handleMoveOrClone}
                  loading={loading}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </HideKeyboard>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 16,
    // backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  outerContainer: {
    //  paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  outerPadding: {
    paddingHorizontal: 16,

    width: '100%',
  },
  filters: {
    width: '100%',
    padding: 10,
  },
  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
  },
  filterBoxesContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  userItemText: {
    color: colors.WHITE,
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
  },
  statusItemContainer: {
    // backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  textColor: {
    color: 'black',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    zIndex: 10,
    backgroundColor: colors.PRIM_BG,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 8,
    marginRight: 8,
  },
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 20,
    borderRadius: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  searchIcon: {
    padding: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  containerGrip: {
    padding: 10,
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 8,
    marginVertical: 8,
    padding: 16,
    // borderWidth: 1,
  },
  cardRowLeft: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 8,
    // paddingBottom: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 0,

    // padding: 10,
    // borderWidth: 1,
  },
  cardRowBetweenForAdressComponent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // padding: 10,
    // borderWidth: 1,
  },
  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cardLevel: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#F2F6FF',
    color: '#E9203B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  containerRight: {
    position: 'relative',
    flexDirection: 'row',
  },
  containerRightDrag: {
    position: 'relative',

    flexDirection: 'row',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon3: {
    position: 'relative',
    left: -48,
  },
  overLapIcon2: {
    position: 'relative',
    left: -72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  project: {
    fontSize: 14,
    color: '#9CA2AB',
    marginRight: 5,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 14,
    color: '#001D52',
    marginLeft: 8,
    fontWeight: '500',
  },
  noIssue: {
    paddingHorizontal: 16,
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
  dragItemWrapper: {
    backgroundColor: colors.CONTAINER_BG,
    width: '0.1%',
  },
  dragItemText: {
    color: colors.CONTAINER_BG,
  },
  dragableSaveButton: {
    width: '100%',
    padding: 10,
    marginBottom: 16,
  },
  resetText: {
    marginLeft: 4,
    color: colors.PRIM_CAPTION,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 44 : 0,
  },
  plusButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' && height > 670 ? 62 : 32,
    right: 0,
  },
})
