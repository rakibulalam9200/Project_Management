import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
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

import CheckedIcon from '../../assets/svg/blue-check-circle.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import AllCollapseIcon from '../../assets/svg/all-collapse.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import HideKeyboard from '../../components/common/HideKeyboard'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getUserIdsFromSelectedUsers } from '../../utils/User'
// import CrossIcon from '../../assets/svg/cross.svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import { TimelogColor } from '../../assets/constants/filters'
import DownIcon from '../../assets/svg/arrow-down.svg'
import MoreIcon from '../../assets/svg/more.svg'
import CSortModal from '../../components/modals/CSortModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import TSettingsModal from '../../components/modals/TSettingModal'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { dateFormatter, statusBarSecondtoHms } from '../../utils/Timer'
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

export default function TimelogsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const refreshControlRef = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  // const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedMilestones, setSelectedMilestones] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [selectedIssues, setSelectedIssues] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [expandFilters, setExpandFilters] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [timelogs, setTimelogs] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [loadingReorder, setLoadingReorder] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  let allData = route.params ? route.params.allData : null
  let taskIds = route.params ? route.params.taskIds : null
  let fromHome = route?.params?.fromHome ? route.params.fromHome : null
  let issueId = route.params ? route.params.issueId : null
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
  const [showActionModal, setShowActionModal] = useState(false)

  const [showCloneModal, setShowCloneModal] = useState(false)
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
    if (selectedIssues.length > 0) {
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
    selectedIssues,
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

  const { currentProject, currentMilestone, currentTaskIds, currentTask } = useSelector(
    (state) => state.navigation
  )

  const toggleRefresh = () => {
    setPage(1)
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const ListFooterComponent = () => <ActivityIndicator size="small" color={colors.NORMAL} />

  const TimelogCard = ({ item, drag, isActive }) => {
    // console.log(item, 'iem...........')
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })
    const [isCollapsed, setIsCollapsed] = useState(false)

    let dateRange =
      item?.start_date?.split('T')[0] + ' ' + item?.start_date?.split('T')[1].slice(0, 5)
    if (item?.end_date) {
      dateRange = dateRange + '-' + item?.end_date?.split('T')[1].slice(0, 5)
    }

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

    // const RightActions = () => {
    //   return (
    //     <TouchableOpacity
    //       onPress={() => {
    //         singleSelect.current = item.id
    //         setShowDeleteModal(true)
    //       }}
    //       style={s.deleteItemWrapper}
    //     >
    //       <DeleteIcon />
    //       <Text style={s.deleteItemText}>Delete</Text>
    //     </TouchableOpacity>
    //   )
    // }
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
        // renderRightActions={RightActions}
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
          }}
          onPress={() => navigation.navigate('TimelogDetail', { id: item.id })}
        >
          <View style={g.containerBetween}>
            {/* {draggable && (
              <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
                <GripIcon />
              </TouchableOpacity>
            )} */}
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
            <View style={[s.cardContainer]}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                }}
              >
                <Image style={s.personAvatar} source={{ uri: item?.user_owner?.image }} />
                <View style={{ flex: 4, marginLeft: 8 }}>
                  <View style={s.cardRowLeft}>
                    {
                      <Text style={[s.cardTitleTextContainer]}>
                        {item?.issue
                          ? item?.issue?.name
                          : item.task
                          ? item?.task?.name
                          : item?.milestone
                          ? item?.milestone?.name
                          : item?.project && item?.project?.name}
                      </Text>
                    }
                  </View>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[s.cardText, { color: colors.ICON_BG }]}>
                      {statusBarSecondtoHms(item?.total_time)}
                    </Text>
                    <Text style={[s.cardText]}>{dateRange}</Text>
                  </View>

                  <View
                    style={{
                      marginLeft: 8,
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text style={[s.cardText, { fontWeight: '500' }]}>${item?.labor}</Text>
                    <Text
                      style={[
                        g.gCardStatus,
                        // { marginLeft: 7},
                        { backgroundColor: TimelogColor[item.stage]?.color },
                      ]}
                    >
                      {item?.stage}
                    </Text>
                  </View>
                </View>
                <View style={{ alignSelf: 'center' }}>
                  <Menu>
                    <MenuTrigger>
                      <MoreIcon />
                    </MenuTrigger>

                    <MenuOptions optionsContainerStyle={s.menuOptionsContainer}>
                      {item?.stage === 'Draft' && (
                        <MenuOption
                          onSelect={() => {
                            singleSelect.current = item.id
                            attemptStatusChange('Submitted')
                          }}
                        >
                          <View style={s.menuContainer}>
                            <Text style={[g.menuText, { color: colors.NORMAL }]}>Submit</Text>
                            <CheckedIcon />
                          </View>
                        </MenuOption>
                      )}
                      {item?.stage === 'Draft' && (
                        <MenuOption onSelect={() => alert(`Edit`)}>
                          <View style={s.menuContainer}>
                            <Text style={[g.menuText, { color: colors.NORMAL }]}>Edit</Text>
                            <EditIcon />
                          </View>
                        </MenuOption>
                      )}
                      {(item?.stage === 'Submitted' ||
                        item?.stage === 'Approved' ||
                        item?.stage === 'Declined') && (
                        <MenuOption
                          onSelect={() => {
                            singleSelect.current = item.id
                            attemptStatusChange('Draft')
                          }}
                        >
                          <View style={s.menuContainer}>
                            <Text style={[g.menuText, { color: colors.NORMAL }]}>
                              Revert to draft
                            </Text>
                            <EditIcon />
                          </View>
                        </MenuOption>
                      )}
                      {(item?.stage === 'Draft' || item?.stage === 'Declined') && (
                        <MenuOption
                          onSelect={() => {
                            singleSelect.current = item.id
                            setShowDeleteModal(true)
                          }}
                        >
                          <View style={s.menuContainer}>
                            <Text style={[g.menuText, { color: colors.NORMAL }]}>Delete</Text>
                            <DeleteIcon />
                          </View>
                        </MenuOption>
                      )}
                    </MenuOptions>
                  </Menu>
                </View>
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
          let res = await api.timelog.deleteMultipleTimelogs({
            timelog_ids: toDeleteArray,
          })
          //console.log(res)
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
        let res = await api.timelog.deleteTimelog(singleSelect.current)
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

  const attemptStatusChange = async (stage) => {
    try {
      let body = {
        stage: stage,
      }
      // setBtnLoading(true)
      let res = await api.timelog.timelogStatusChange(singleSelect.current, body)
      // //console.log(res)
      if (res.success) {
        // setShowDeleteModal(false)
        toggleRefresh()
        Alert.alert('Submitted Successful.')
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
      // setBtnLoading(false)
    }
  }

  const attemptClone = async () => {
    try {
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.timelog.cloneTimelogs({
            timelog_ids: toCloneArray,
          })
          // //console.log(res)
          if (res.success) {
            Alert.alert('Clone Successful.')
            multipleSelect.current = {}
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
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
    }
  }

  const attemptOrder = async () => {
    setLoadingReorder(true)
    setSortBy(SORT_BY[5])
    try {
      let orderArray = getSortingOrderData(timelogs)
      let res = await api.timelog.orderTimelogs({
        sorting_data: orderArray,
      })
      // //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
        setDraggable(false)
        setLoadingReorder(false)
      }
    } catch (err) {
      // //console.log(err.response,"0000000000000000000")
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setLoadingReorder(false)
    }
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetFilters = () => {
    setSelected([])
    toggleRefresh()
  }

  const resetUsers = () => {
    setUsers([])
    toggleRefresh()
  }

  const resetProject = () => {
    setSelectedProjects([])
    toggleRefresh()
  }

  const resetMilestone = () => {
    setSelectedMilestones([])
    toggleRefresh()
  }

  const resetTask = () => {
    setSelectedTasks([])
    toggleRefresh()
  }

  const resetDate = () => {
    setSelectedDate(null)
    toggleRefresh()
  }

  const resetStatuses = () => {
    setSelectedStatuses([])
    toggleRefresh()
  }

  const resetPriority = () => {
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
      selectedPriorities.length == 0 &&
      selectedIssues.length == 0
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
    selectedIssues,
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

  const timelogCallBack = useCallback(() => {
    setLoading(true)
    const body = {
      pagination: 10,
      page: page,
      selectData: 1,
      // task_ids: currentTaskIds,
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
    }

    if (selectedMilestones.length > 0) {
      body['milestone_ids'] = getProjectFromSelectedProjects(selectedMilestones)
    }
    if (selectedTasks.length > 0) {
      body['task_ids'] = getProjectFromSelectedProjects(selectedTasks)
    }
    if (selectedIssues.length > 0) {
      body['issue_ids'] = getProjectFromSelectedProjects(selectedIssues)
    }

    if (selectedDate != null) {
      body['start_date'] = selectedDate
    }

    // if (sortBy) {
    //   body['sort_by'] = sortBy.param
    // }

    // body['groupByDate'] = true

    // console.log({ body })
    api.timelog
      .getTimelog(body)
      .then((res) => {
        setCurrentPage(res.meta.current_page)
        setLastPage(res.meta.last_page)
        if (page == 1) {
          //console.log(res.data, 'result...')
          setTimelogs(res.data)
        } else if (page > 1) {
          setTimelogs((pre) => [...pre, ...res.data])
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
    selectedIssues,
  ])

  useEffect(() => {
    timelogCallBack()
  }, [timelogCallBack, isFocused])

  useEffect(() => {
    if (currentProject?.id) {
      setSelectedProjects([{ id: currentProject.id, name: currentProject.name }])
      setShowFilters(true)
      setExpandFilters(true)
    }
    if (currentMilestone?.id) {
      setSelectedMilestones([{ id: currentMilestone.id, name: currentMilestone.name }])
      setShowFilters(true)
      setExpandFilters(true)
    }
    if (currentTask?.id) {
      setSelectedTasks([{ id: currentTask.id, name: currentTask.name }])
      setShowFilters(true)
      setExpandFilters(true)
    }
  }, [currentProject, currentMilestone, currentTask])

  const openFilterModal = () => {
    toggleRefresh()
    setShowFiltersModal(true)
  }

  return (
    <HideKeyboard>
      <SafeAreaView style={g.safeAreaStyle}>
        <StatusBar backgroundColor={colors.CONTAINER_BG} />
        <TSettingsModal
          visibility={showSettingsModal}
          setVisibility={setShowSettingsModal}
          onDelete={() => {
            setActionType('delete')
            setSelectable(true)
            setDraggable(false)
          }}
          onApprove={() => {}}
          onExport={() => {}}
          onGroupBy={() => {}}
        />
        <DeleteConfirmationModal
          confirmationMessage={'Do you want to delete this Timelog? This cannot be undone'}
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
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  if (currentProject) {
                    if (currentMilestone) {
                      if (currentTask) {
                        // //console.log("Go to task details")
                        navigation.navigate('TaskDetails', { refetch: Math.random() })
                      } else {
                        navigation.navigate('MilestoneDetails', { refetch: Math.random() })
                      }
                    } else {
                      navigation.navigate('ProjectDetails', { refetch: Math.random() })
                    }
                  } else {
                    navigation.goBack()
                  }
                }}
                outputRange={iconWrapColors}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>Timelogs</CText>
              <View style={s.buttonGroup}>
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => {
                    // setAllCollapsable(!allCollapsable)
                  }}
                  // outputRange={iconWrapColors}
                  style={s.buttonGroupBtn}
                >
                  <AllCollapseIcon fill={colors.NORMAL} />
                </TouchableOpacity>
                <TouchableOpacity style={s.buttonGroupBtn}>
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
                  top: 60,
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
                      marginBottom: 10,
                    }}
                  >
                    <Text style={s.filterText}>{`Filters (${filterCount})`}</Text>
                    {!expandFilters ? (
                      <TouchableOpacity
                        onPress={() => {
                          setExpandFilters(true)
                        }}
                      >
                        <UpIcon />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setExpandFilters(false)
                        }}
                      >
                        <DownIcon />
                      </TouchableOpacity>
                    )}
                  </View>

                  {!expandFilters && (
                    <View style={[s.filterBoxesContainer]}>
                      <View style={s.filterContainer}>
                        {users.length > 0 &&
                          users.map((user, id) => {
                            return (
                              <View style={[s.userItemContainer]} key={id}>
                                <Text style={s.userItemTextDark}>
                                  {user?.name ? user?.name : user?.email.split('@')[0]}
                                </Text>
                              </View>
                            )
                          })}
                        {users.length > 0 && (
                          <TouchableOpacity onPress={resetUsers}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedProjects.length > 0 &&
                          selectedProjects.map((project, id) => {
                            return (
                              <>
                                {project && (
                                  <View style={[s.userItemContainer]} key={id}>
                                    <Text style={s.userItemTextDark}>{project?.name}</Text>
                                  </View>
                                )}
                              </>
                            )
                          })}
                        {selectedProjects.length > 0 && (
                          <TouchableOpacity onPress={resetProject}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedMilestones.length > 0 &&
                          selectedMilestones.map((milestone, id) => {
                            return (
                              <>
                                {milestone && (
                                  <View style={[s.userItemContainer]} key={id}>
                                    <Text style={s.userItemTextDark}>{milestone?.name}</Text>
                                  </View>
                                )}
                              </>
                            )
                          })}
                        {selectedMilestones.length > 0 && (
                          <TouchableOpacity onPress={resetMilestone}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedTasks.length > 0 &&
                          selectedTasks.map((task, id) => {
                            return (
                              <>
                                {task && (
                                  <View style={[s.userItemContainer]} key={id}>
                                    <Text style={s.userItemTextDark}>{task?.name}</Text>
                                  </View>
                                )}
                              </>
                            )
                          })}
                        {selectedTasks.length > 0 && (
                          <TouchableOpacity onPress={resetTask}>
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
                        {selectedStatuses.length > 0 &&
                          selectedStatuses.map((status, id) => {
                            return (
                              <View
                                style={[s.statusItemContainer, { backgroundColor: status.color }]}
                                key={id}
                              >
                                <Text style={{ color: colors.WHITE }}>{status?.label}</Text>
                              </View>
                            )
                          })}
                        {selectedStatuses.length > 0 && (
                          <TouchableOpacity onPress={resetStatuses}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={s.filterContainer}>
                        {selectedPriorities.length > 0 &&
                          selectedPriorities.map((priority, id) => {
                            return (
                              <View
                                style={[s.statusItemContainer, { backgroundColor: priority.color }]}
                                key={id}
                              >
                                <Text style={{ color: colors.WHITE }}>{priority?.label}</Text>
                              </View>
                            )
                          })}
                        {selectedPriorities.length > 0 && (
                          <TouchableOpacity onPress={resetPriority}>
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
              />
            </Animated.View>
            {/* Filters view end */}
          </View>
          {!loading && timelogs.length == 0 && (
            <Animated.View style={[msgY, { zIndex: -100 }]}>
              <Text style={s.noIssue}>
                No Timelog to show. Please create your Timelog by pressing the plus button.
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
            showsVerticalScrollIndicator={false}
            data={timelogs}
            onDragBegin={() => {}}
            onDragEnd={({ data }) => {
              setTimelogs(data)
            }}
            refreshing={loading}
            onEndReachedThreshold={0.1}
            initialNumToRender={5}
            onScrollOffsetChange={(offset) => {
              diff.value = offset - prev.value
            }}
            onScrollBeginDrag={(e) => {
              prev.value = e.nativeEvent.contentOffset.y
            }}
            onEndReached={() => {
              // //console.log(currentPage, lastPage, "------------------")
              // if (lastPage == 1) {
              //   currentPage < lastPage && setPage(page + 1)
              // } else {
              //   currentPage <= lastPage && setPage(page + 1)
              // }
              if (currentPage < lastPage) {
                setPage(page + 1)
              }
              //console.log(lastPage, currentPage, 'last current')
            }}
            keyExtractor={(item, index) => index}
            renderItem={(props) => <TimelogCard {...props} />}
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              paddingHorizontal: 16,
              zIndex: -1,
            }}
            ListHeaderComponent={() => (
              <Animated.View style={[paddingY, { zIndex: -1000 }]}></Animated.View>
            )}
          />

          {!loading && !draggable && !selectable && (
            <CFloatingPlusIcon onPress={() => navigation.navigate('TimelogAdd')} />
          )}

          <View style={s.dragableSaveButton}>
            {!draggable && selectable && actionType == 'delete' && (
              <CButtonInput
                label="Delete"
                onPress={() => setShowDeleteModal(true)}
                loading={loading}
                style={{ marginBottom: 32 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
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
    padding: 8,
    // borderWidth: 1,
  },
  cardRowLeft: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // paddingVertical: 8,
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
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 4,
  },
  cardTitleTextContainer: {
    marginLeft: 8,
    marginVertical: 4,
    color: colors.NORMAL,
    fontWeight: '400',
    fontSize: 14,
  },
  cardText: {
    color: colors.NORMAL,
    fontWeight: '400',
    fontSize: 14,
  },
  menuOptionsContainer: {
    // marginTop: 76,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: 'hidden',
    borderRadius: 8,
    marginLeft: 10,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
})
