import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import { FilterColors } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import AllCollapseIcon from '../../assets/svg/all-collapse.svg'
import { default as CollapseIcon, default as UpIcon } from '../../assets/svg/collapse-icon.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import { default as DownIcon, default as ExpandIcon } from '../../assets/svg/expand.svg'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'
import GripIcon from '../../assets/svg/grip.svg'
import LocationIcon from '../../assets/svg/location.svg'
import MoreIcon from '../../assets/svg/more.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import SortIcon from '../../assets/svg/sort.svg'
import ListingCompletion from '../../components/Completion/ListingCompletion'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import CSelectedUsersWithoutEdit from '../../components/common/CSelectedUsersWithoutEdit'
import CText from '../../components/common/CText'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import HideKeyboard from '../../components/common/HideKeyboard'
import IconWrap from '../../components/common/IconWrap'
import CSettingModal from '../../components/modals/CSettingModal'
import CSortModal from '../../components/modals/CSortModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MilestoneCustomizationModal from '../../components/modals/MilestoneCustomizationModal'
import MilestoneFilterModal from '../../components/modals/MilestoneFilterModal'
import MoveModal from '../../components/modals/MoveModal'
import {
  setCurrentMilestone,
  setCurrentTask,
  setCurrentTaskIds,
  setNavigationFrom,
  setStage,
} from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import { getOnlyErrorMessage } from '../../utils/Errors'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getUserIdsFromSelectedUsers } from '../../utils/User'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}
// const AnimateDraggableFlatList = Animated.createAnimatedComponent(DraggableFlatList)

const expandViewData = [
  { id: 1, label: 'Status' },
  { id: 2, label: 'Members' },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Project' },
  { id: 5, label: 'Completion %' },
]

const collapseViewData = [
  {
    id: 10,
    text: 'Collapse view:',
    items: [{ id: 11, label: 'Status', collapse: true }],
  },
]

const ItemViewData = [
  { id: 12, label: 'Address', collapse: false },
  { id: 13, label: 'Project', collapse: false },
  { id: 14, label: 'Completion %', collapse: false },
  { id: 15, label: 'Members', collapse: false },
]

const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) { }
}

const { height, width } = Dimensions.get('window')

export default function MilestoneScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const { currentProject, navigationFrom } = useSelector((state) => state.navigation)
  const [selected, setSelected] = useState([])
  const [milestones, setMilestones] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedSupervisor, setSelectedSupervisor] = useState([])
  const [selectedProjects, setSelectedProjects] = useState(() => {
    if (currentProject?.id) {
      return [{ id: currentProject.id, name: currentProject.name }]
    } else {
      return []
    }
  })
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const [showFilters, setShowFilters] = useState(true)
  const [expandFilters, setExpandFilters] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  let refetch = route.params ? route.params.refetch : null
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [allCollapsable, setAllCollapsable] = useState(true)
  let projectId = route.params ? route.params.projectId : null

  // const [progressBarData, setProgressBarData] = useState({})
  const [milestoneIds, setMilestoneIds] = useState({})
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [expandView, setExpandView] = useState(expandViewData)
  const [itemView, setItemView] = useState(ItemViewData)
  const [collapseView, setCollapseView] = useState(collapseViewData)
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortBy, setSortBy] = useState(SORT_BY[0])
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [filterCount, setFilterCount] = useState(0)
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [selectedProjectToMove, setSelectedProjectToMove] = useState(null)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const openSortModal = () => {
    setShowSortModal(true)
  }

  const ListFooterComponent = () => <ActivityIndicator size="small" color={colors.NORMAL} />

  // re-animated scrolling in the react native
  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const filterHeight = useSharedValue(0)

  const headerY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, 64 + filterHeight.value)
    return {
      transform: [
        {
          translateY: withTiming(-dy),
        },
      ],
    }
  })
  const filterY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, filterHeight.value + 64)
    return {
      transform: [
        {
          translateY: withTiming(-dy),
        },
      ],
      top: 0,
    }
  })

  const paddingY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 60,
    }
  })

  const msgY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 68,
    }
  })

  useEffect(() => {
    return () => { }
  }, [collapseView])

  const AddressComponent = ({ address, each }) => {
    // //console.log(address,'milstone address')
    return address ? (
      address !== 'null' && (
        <TouchableOpacity
          key={each && each?.id}
          onPress={() => {
            address
              ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
              : console.log('No address')
          }}
          style={[s.cardRowBetween, { flex: 1 }]}
        >
          <Text style={[{ marginRight: 4 }, g.body1]}>
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
  // added animation when scrolling list data
  // const HEADER_HEIGHT = 130
  // // animation
  // const [scrollAnim] = useState(new Animated.Value(0))
  // const [offsetAnim] = useState(new Animated.Value(0))
  // const [clampedScroll, setClampedScroll] = useState(
  //   Animated.diffClamp(
  //     Animated.add(
  //       scrollAnim.interpolate({
  //         inputRange: [0, 1],
  //         outputRange: [0, 1],
  //         extrapolateLeft: 'clamp',
  //       }),
  //       offsetAnim
  //     ),
  //     0,
  //     1
  //   )
  // )

  // const navbarTranslate = clampedScroll.interpolate({
  //   inputRange: [0, HEADER_HEIGHT],
  //   outputRange: [0, -HEADER_HEIGHT],
  //   extrapolate: 'clamp',
  // })

  const MilestoneCard = ({ item, drag, isActive }) => {
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
            // setSelectable(false)
            setSelectable((prev) => {
              return !prev
            })
            setActionType('')
            multipleSelect.current = {}
          }}
          onPress={() => {
            dispatch(setCurrentMilestone(item))
            dispatch(setNavigationFrom(''))
            setActionType('')
            setSelectable(false)
            multipleSelect.current = {}
            navigation.navigate('MilestoneDetails', { id: item?.id })
          }}
        >
          <View style={[g.containerBetween]}>
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
              <View style={[{ flex: 1 }]}>
                <View style={[s.cardRowBetween, { paddingBottom: 8 }]}>
                  <View style={[s.hFlex]}>
                    <TouchableOpacity
                      style={[{ padding: 8 }]}
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
                    <Text style={[s.cardTitle]}>{item?.name}</Text>
                  </View>
                  {/* {!selectable && <BellIcon fill={colors.NORMAL} />} */}
                  {/* <View style={[s.spaceLeft]}>
                    {selectable && (
                      <CCheckbox
                        showLabel={false}
                        checked={checked}
                        setChecked={setChecked}
                        onChecked={toggleDeleteMultiple}
                      />
                    )}
                  </View> */}
                </View>

                {allCollapsable ? (
                  isCollapsed ? (
                    <>
                      <View style={[s.cardRowBetween, { paddingBottom: 8 }]}>
                        {collapseView[0].items.map((each) => {
                          if (each.label == 'Status') {
                            //console.log(each)
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
                          if (each.label == 'Members') {
                            return (
                              <CSelectedUsersWithoutEdit
                                key={each.id}
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
                              style={[g.containerLeft, { marginTop: 4, marginBottom: 0 }]}
                              key={each.id}
                            >
                              <Text style={[{ color: colors.PRIM_CAPTION }, g.body2]}>
                                Project:{' '}
                              </Text>
                              <Text style={[g.body2, { marginLeft: 4 }]}>{item.project.name}</Text>
                            </View>
                          )
                        }
                      })}
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Completion %') {
                          return (
                            <ListingCompletion
                              key={each.id}
                              // from={'listing'}
                              status={item.stage}
                              progressData={{
                                completion: item.progress.completion,
                                is_can_completion: item.progress.is_can_completion,
                              }}
                              type={'milestone'}
                              id={item.id}
                            />
                          )
                        }
                      })}
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Address') {
                          return <AddressComponent address={item?.address} key={each.id} />
                        }
                      })}
                    </>
                  ) : (
                    <>
                      <View style={[s.cardRowBetween, { paddingBottom: 8 }]}>
                        <Text
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
                        <CSelectedUsersWithoutEdit
                          selectedUsers={item['user_members'] ? item['user_members'] : []}
                        />
                      </View>
                      <View style={[g.containerLeft, { marginTop: 4, marginBottom: 0 }]}>
                        <Text style={[{ color: colors.PRIM_CAPTION }, g.body2]}>Project: </Text>
                        <Text style={[g.body2, { marginLeft: 4 }]}>{item.project.name}</Text>
                      </View>
                      <ListingCompletion
                        // from={'listing'}
                        status={item.stage}
                        progressData={{
                          completion: item.progress.completion,
                          is_can_completion: item.progress.is_can_completion,
                        }}
                        type={'milestone'}
                        id={item.id}
                      />
                      <AddressComponent address={item?.address} />
                    </>
                  )
                ) : isCollapsed ? (
                  <>
                    <View style={[s.cardRowBetween, { paddingBottom: 8 }]}>
                      <Text
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
                      <CSelectedUsersWithoutEdit
                        selectedUsers={item['user_members'] ? item['user_members'] : []}
                      />
                    </View>
                    <View style={[g.containerLeft, { marginTop: 4, marginBottom: 0 }]}>
                      <Text style={[{ color: colors.PRIM_CAPTION }, g.body2]}>Project: </Text>
                      <Text style={[g.body2, { marginLeft: 4 }]}>{item.project.name}</Text>
                    </View>
                    <ListingCompletion
                      // from={'listing'}
                      status={item.stage}
                      progressData={{
                        completion: item.progress.completion,
                        is_can_completion: item.progress.is_can_completion,
                      }}
                      type={'milestone'}
                      id={item.id}
                    />
                    <AddressComponent address={item?.address} />
                  </>
                ) : (
                  <>
                    <View style={[s.cardRowBetween, { paddingBottom: 8 }]}>
                      {collapseView[0].items.map((each) => {
                        if (each.label == 'Status') {
                          //console.log(each)
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
                        if (each.label == 'Members') {
                          return (
                            <CSelectedUsersWithoutEdit
                              key={each.id}
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
                            style={[g.containerLeft, { marginTop: 4, marginBottom: 0 }]}
                            key={each.id}
                          >
                            <Text style={[{ color: colors.PRIM_CAPTION }, g.body2]}>Project: </Text>
                            <Text style={[g.body2, { marginLeft: 4 }]}>{item.project.name}</Text>
                          </View>
                        )
                      }
                    })}
                    {collapseView[0].items.map((each) => {
                      if (each.label == 'Completion %') {
                        return (
                          <ListingCompletion
                            key={each.id}
                            // from={'listing'}
                            status={item.stage}
                            progressData={{
                              completion: item.progress.completion,
                              is_can_completion: item.progress.is_can_completion,
                            }}
                            type={'milestone'}
                            id={item.id}
                          />
                        )
                      }
                    })}
                    {collapseView[0].items.map((each) => {
                      if (each.label == 'Address') {
                        return <AddressComponent address={item?.address} key={each.id} />
                      }
                    })}
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const goBack = () => {
    // //console.log(currentProject, 'current project...')
    if (currentProject) {
      navigation.navigate('ProjectDetails', { refetch: Math.random() })
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
        navigation.navigate('Home')
      }
    }
  }

  const toggleRefresh = () => {
    setPage(1)
    setRefresh((prev) => !prev)
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetFilters = () => {
    setSelectedStatuses([])
    setUsers([])
    setSelectedPriorities([])
    setSelectedProjects([])
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

  const resetStatus = (item) => {
    if (selectedStatuses?.length > 1) {
      setSelectedStatuses((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => item.value !== filterItem.value)
      })
    } else if (selectedStatuses?.length == 1) {
      setSelectedStatuses([])
    }
    toggleRefresh()
  }

  const resetAllStatus = () => {
    setSelectedStatuses([])
    toggleRefresh()
  }

  // const resetStatuses = () => {
  //   setSelectedStatuses([])
  //   toggleRefresh()
  // }

  const resetPriority = (item) => {
    if (selectedPriorities?.length > 1) {
      setSelectedPriorities((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => item.value !== filterItem.value)
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

  useEffect(async () => {
    getItem('milestoneCollapseView').then((res) => {
      if (res) {
        //console.log(res, 'res....................')
        setCollapseView(res)
      } else {
        setCollapseView(collapseViewData)
      }
    })
    getItem('milestoneItemView').then((res) => {
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
    if (
      users.length == 0 &&
      selectedProjects.length == 0 &&
      selectedStatuses.length == 0 &&
      selectedPriorities.length == 0
    ) {
      setShowFilters(false)
      filterHeight.value = 0
      // setBody({})
    } else {
      setShowFilters(true)
    }
  }, [users, selectedProjects, selectedStatuses, selectedPriorities])

  const attemptDelete = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)

        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.milestone.deleteMultipleMilestones({
            milestone_ids: toDeleteArray,
          })
          //console.log(res)
          if (res.success) {
            setShowDeleteModal(false)
            setSelectable(false)
            setBtnLoader(false)
            toggleRefresh()
            multipleSelect.current = {}
            setActionType('')
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        if (singleSelect.current) {
          let res = await api.milestone.deleteMilestone(singleSelect.current)
          //console.log(res)
          if (res.success) {
            multipleSelect.current = {}
            setShowDeleteModal(false)
            toggleRefresh()
            Alert.alert('Delete Successful.')
          }
        } else {
          Alert.alert('Please select at least one project to delete')
          setShowDeleteModal(false)
        }
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
    } finally {
      setBtnLoader(false)
    }
  }

  const attemptClone = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.milestone.cloneMilestones({
            milestone_ids: toCloneArray,
          })
          if (res.success) {
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            multipleSelect.current = {}
            toggleRefresh()
            Alert.alert('Clone Successful.')
          }
        }
      } else {
        Alert.alert('Please select at least one project to clone.')
        setShowCloneModal(false)
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
      setShowCloneModal(false)
      setActionType('')
    } finally {
      setBtnLoader(false)
      setActionType('')
    }
  }

  const attemptOrdering = async () => {
    setLoading(true)
    try {
      setSortBy(SORT_BY[5])
      let orderArray = getSortingOrderData(milestones)
      let res = await api.milestone.orderMilestone({
        sorting_data: orderArray,
      })
      //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
        setDraggable(false)
        setLoading(false)
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
      setLoading(false)
    }
  }

  const attemptMove = async (project, copy) => {
    try {
      setBtnLoader(true)
      if (selectable) {
        let toMoveArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toMoveArray.length == 0) {
          Alert.alert('Please select at least one item to move.')
        } else {
          let res = await api.project.moveItems({
            model_ids: toMoveArray,
            state: 'milestone',
            project_id: project.id,
            make_copy: copy,
          })
          if (res.success) {
            Alert.alert('Move Successful.')
            setShowMoveModal(false)
            setSelectable(false)
            setActionType('')
            multipleSelect.current = {}
            toggleRefresh()
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
    } finally {
      setBtnLoader(false)
      setActionType('')
    }
  }

  

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setCurrentProject(null))
      // dispatch(setPlusDestination('MilestoneAdd'))
      dispatch(setCurrentMilestone(null))
      dispatch(setCurrentTask(null))
      dispatch(setCurrentTaskIds([]))
      dispatch(setStage(''))
    }
  }, [isFocused])

  useEffect(() => {
    const body = {
      pagination: 10,
      page: page,
      selectData: 1,
      // sort_by: 'in_order',
    }
    if (query != '') {
      body['search'] = query
    }
    if (users.length > 0) {
      body['members'] = getUserIdsFromSelectedUsers(users)
    }

    if (selectedProjects.length > 0) {
      body['project_ids'] = getProjectFromSelectedProjects(selectedProjects)
    }

    if (selectedStatuses.length > 0) {
      body['stages'] = selectedStatuses.map((item) => item.label)
    }

    if (selectedPriorities.length > 0) {
      body['priorities'] = selectedPriorities.map((item) => item.value)
    }

    if (sortBy) {
      body['sort_by'] = sortBy.param
    }

    setLoading(true)
    api.milestone
      .getMilestones(body, currentProject?.id)
      .then((res) => {
        setCurrentPage(res.meta.current_page)
        setLastPage(res.meta.last_page)
        if (page == 1) {
          setMilestones(res.data)
        } else {
          setMilestones((pre) => [...pre, ...res.data])
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
        setLoadingComplete(true)
      })
  }, [
    refresh,
    refetch,
    query,
    selected,
    users,
    selectedStatuses,
    selectedProjects,
    page,
    sortBy,
    selectedPriorities,
  ])

  // useEffect(() => {
  //   let body = {
  //     type: "milestone",
  //   }
  //   if(Object.keys(milestoneIds).length > 0){
  //     body = {...body,...milestoneIds}
  //   // completion percetages api call
  //   api.completion
  //     .getListingCompletionPercentages(body)
  //     .then((res) => {
  //       // setProjects(res)
  //       setProgressBarData(res.data)
  //       //console.log(Object.keys(res.data),"---------------------------")
  //       //console.log(res.data,'res data...........')
  //     })
  //     .catch((err) => {
  //       //console.log(err.response)
  //     })
  //     .finally(() => {
  //       setLoading(false)
  //     })
  //   }

  // }, [milestoneIds])

  // useEffect(() => {
  //   if (currentProject?.id) {
  //     setSelectedProjects([{ id: currentProject.id, name: currentProject.name }])
  //     setShowFilters(true)
  //     setExpandFilters(true)
  //   }
  // }, [currentProject])

  useEffect(() => {
    setFilterCount(0)
    if (selectedProjects.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedStatuses.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (users.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedPriorities?.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
  }, [selectedProjects, selectedStatuses, users, selectedPriorities])

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
        <CSettingModal
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
        <MilestoneFilterModal
          showFilterModal={showFiltersModal}
          setShowFilterModal={setShowFiltersModal}
          selectedProject={selectedProjects}
          setSelectedProject={setSelectedProjects}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          setSelectedPriorities={setSelectedPriorities}
          selectedPriorities={selectedPriorities}
          selectedUsers={users}
          setSelectedUsers={setUsers}
          setShowParentFilters={setShowFilters}
          search={query}
          setSearch={setSearch}
          onApply={() => setPage(1)}
        />
        <MilestoneCustomizationModal
          openModal={showCustomizationModal}
          setOpenModal={setShowCustomizationModal}
          expandView={expandView}
          setExpandView={setExpandView}
          itemView={itemView}
          setItemView={setItemView}
          collapseView={collapseView}
          setCollapseView={setCollapseView}
        />
        <DeleteConfirmationModal
          visibility={showDeleteModal}
          setVisibility={setShowDeleteModal}
          onDelete={attemptDelete}
          setSelectable={setSelectable}
          multipleSelect={multipleSelect}
          btnLoader={btnLoader}
        />
        <CloneConfirmationModal
          visibility={showCloneModal}
          setVisibility={setShowCloneModal}
          onClone={attemptClone}
          setSelectable={setSelectable}
          multipleSelect={multipleSelect}
          confirmationMessage="Do you want to Clone milestones? Milestones will be clone with same state with its childs"
          btnLoader={btnLoader}
        />

        <MoveModal
          visibility={showMoveModal}
          setVisibility={setShowMoveModal}
          multipleSelect={multipleSelect}
          setSelectable={setSelectable}
          state="milestone"
          onMove={attemptMove}
          btnLoader={btnLoader}
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
        <View
          style={[
            g.listingOuterContainer,
            // s.background,
            g.listingSpaceBelow,
            loading && { opacity: 0.3 },
          ]}
        >
          <View style={[s.headerContainer, s.outerPadding]}>
            <TouchableOpacity disabled={loading} onPress={goBack}>
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>Milestones</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  setAllCollapsable(!allCollapsable)
                }}
                style={s.buttonGroupBtn}
              >
                <AllCollapseIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity onPress={openSortModal} style={s.buttonGroupBtn} disabled={loading}>
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                style={s.buttonGroupBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[s.outerPadding]}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 12,
                  left: 16,
                  right: 16,
                  zIndex: 2,
                  backgroundColor: colors.PRIM_BG,
                },
                headerY,
              ]}
            >
              {showFilters && (
                <View
                  onLayout={(event) => {
                    let { x, y, width, height } = event.nativeEvent.layout
                    filterHeight.value = height
                    // //console.log(height, 'filter views.......')
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                          <TouchableOpacity onPress={resetAllUsers} style={{ marginLeft: 8 }}>
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
                        {selectedStatuses.length > 0 &&
                          selectedStatuses.map((status, id) => {
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
                                  onPress={() => resetStatus(status)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.WHITE} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedStatuses.length > 0 && (
                          <TouchableOpacity style={{ marginLeft: 8 }} onPress={resetAllStatus}>
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
                                  onPress={() => resetPriority(priority)}
                                  style={{ marginLeft: 4 }}
                                >
                                  <SmallCrossIcon fill={colors.WHITE} />
                                </TouchableOpacity>
                              </View>
                            )
                          })}
                        {selectedPriorities.length > 0 && (
                          <TouchableOpacity onPress={resetAllPriorities} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
              <CSearchInput
                value={search}
                setValue={setSearch}
                placeholder="Search"
                style={[showFilters ? { marginTop: 8 } : { marginVertical: 0 }]}
                filterIcon={true}
                onPress={() => setShowFiltersModal(true)}
              />
            </Animated.View>
          </View>

          {/* <TouchableOpacity style={[g.containerBetween, s.filters]} onPress={toggleFilters}>
            <Text style={s.filterText}>Filters</Text>
            {showFilters ? <DownIcon /> : <UpIcon />}
          </TouchableOpacity> */}

          {/* {loading ? <ActivityIndicator size="small" color={'blue'} style={s.activityStyle} /> : */}

          {!loading && milestones.length == 0 && loadingComplete && (
            <Animated.View style={[s.outerPadding, msgY, { zIndex: -100 }]}>
              <Text>
                No Milestone to show. Please create your new milestone by pressing the plus button.
              </Text>
            </Animated.View>
          )}

          {loading && (
            <View
              style={{
                flex: 1,
                zIndex: 200,
                height: '100%',
                width: '100%',
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
            ListHeaderComponent={() => (
              <Animated.View style={[paddingY, { zIndex: -1000 }]}></Animated.View>
            )}
            data={milestones}
            onDragBegin={() => { }}
            onDragEnd={({ data }) => {
              setMilestones(data)
            }}
            refreshing={loading}
            onEndReachedThreshold={0.1}
            initialNumToRender={5}
            onEndReached={() => {
              if (lastPage == 1) {
                currentPage < lastPage && setPage(page + 1)
              } else {
                currentPage <= lastPage && setPage(page + 1)
              }
            }}
            onScrollBeginDrag={(e) => {
              prev.value = e.nativeEvent.contentOffset.y
            }}
            onScrollOffsetChange={(offset) => {
              diff.value = offset - prev.value
            }}
            keyExtractor={(item, index) => index+1}
            renderItem={(props) => <MilestoneCard {...props} />}
            containerStyle={{
              flex: 1,
              paddingHorizontal: 16,
              zIndex: -100,
            }}
          />

          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
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
                  loading={loading}
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
                    // setRefresh((pre)=>!pre)
                    multipleSelect.current = {}
                  }}
                  style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
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
          {!loading && !draggable && !selectable && (
            <TouchableOpacity
              style={s.plusButton}
              onPress={() => {
                setActionType('')
                setSelectable(false)
                multipleSelect.current = {}
                setSortBy(SORT_BY[0])
                navigation.navigate('MilestoneAdd')
              }}
            >
              <FloatingPlusButton />
            </TouchableOpacity>
          )}
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
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 24,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCutomization: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 70,
    elevation: 0,
    zIndex: 100,
    backgroundColor: colors.CONTAINER_BG,
    paddingTop: 16,
    // backgroundColor:'yellow'
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // paddingVertical: 4,
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
  filterBoxesContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  statusItemContainer: {
    // backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
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
  cardUserSection: {
    marginLeft: 8,
  },
  textColor: {
    color: '#000E29',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: colors.PRIM_BG,
    marginBottom: 8,
    // backgroundColor: 'green',
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
  milestoneCardContainer: {
    width: '100%',
    flex: 1,
    marginBottom: 100,
  },

  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    // paddingVertical:9
    marginVertical: 8,
  },

  containerGrip: {
    padding: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.HEADING,
    paddingLeft: 8,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.PRIM_BG,
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cardProgressText: {
    marginHorizontal: 10,
  },
  spaceRight: {
    position: 'relative',
    right: 10,
  },
  dueText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  dueDate: {
    color: colors.PRIM_BODY,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    marginLeft: 4,
  },
  containerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  noMilestone: {
    // paddingHorizontal: 14,
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
  activityStyle: {
    width: '100%',
    alignContent: 'center',
  },
  plusButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' && height > 670 ? 15 : -15,
    right: 0,
  },
  pH: {
    paddingHorizontal: 16,
  },
  outerPadding: {
    paddingHorizontal: 16,
    width: '100%',
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
  },
  hFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resetText: {
    marginLeft: 4,
    color: colors.PRIM_CAPTION,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 32 : 0,
  },
})
