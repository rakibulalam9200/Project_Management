import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import { FilterColors, PriorityColors } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import AllCollapseIcon from '../../assets/svg/all-collapse.svg'
import { default as CollapseIcon, default as UpIcon } from '../../assets/svg/collapse-icon.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import DollarIcon from '../../assets/svg/dollar-circle.svg'
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
import ProjectCustomizationModal from '../../components/modals/ProjectCustomizationModal'
import ProjectFilterModal from '../../components/modals/ProjectFilterModal'
import { setCurrentProject, setNavigationFrom, setStage } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getFilterStagesFromSelectedFilters } from '../../utils/Filters'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getUserIdsFromSelectedUsers } from '../../utils/User'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}
const expandViewData = [
  {
    id: 100,
    text: 'Expand Card view:',
    items: [
      { id: 1, label: 'Status', expand: true },
      { id: 2, label: 'Priority', expand: true },
      { id: 3, label: 'Address', expand: true },
      { id: 4, label: 'Budget', expand: true },
      { id: 5, label: 'Completion', expand: true },
    ],
  },
]

const moreExpandData = [{ id: 6, label: 'Members', expand: false }]

const collapseViewData = [
  {
    id: 10,
    text: 'Collapse Card view:',
    items: [
      { id: 11, label: 'Status', collapse: true },
      { id: 12, label: 'Priority', collapse: true },
    ],
  },
]

const ItemViewData = [
  { id: 13, label: 'Address', collapse: false },
  { id: 14, label: 'Budget', collapse: false },
  { id: 15, label: 'Completion', collapse: false },
  { id: 16, label: 'Members', collapse: false },
]

const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) { }
}

const { height, width } = Dimensions.get('window')

export default function ProjectScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [projects, setProjects] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [progressBarData, setProgressBarData] = useState({})
  const [projectIds, setProjectIds] = useState({})
  const [allCollapsable, setAllCollapsable] = useState(true)
  const flatListRef = useRef()
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [expandView, setExpandView] = useState(expandViewData)
  const [expandViewObj, setExpandViewObj] = useState({})
  const [moreExpandView, setMoreExpandView] = useState(moreExpandData)
  const [itemView, setItemView] = useState(ItemViewData)
  const [collapseView, setCollapseView] = useState(collapseViewData)
  const [collapseViewObj, setCollapseViewObj] = useState({})
  const [isStatusOrPrority, setIsStatusOrPrority] = useState(false)
  const [isExpandStatusOrPrority, setIsExpandStatusOrPrority] = useState(false)
  const lastContentOffset = useSharedValue(0)
  const isScrolling = useSharedValue(false)
  const [scrollDirection, setScrollDirection] = useState(true)
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [expandFilters, setExpandFilters] = useState(true)
  const { currentProject, navigationFrom } = useSelector((state) => state.navigation)

  const [showSortModal, setShowSortModal] = useState(false)
  const [sortBy, setSortBy] = useState(SORT_BY[0])
  const [actionType, setActionType] = useState('')
  const [filterCount, setFilterCount] = useState(0)
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [btnLoader, setBtnLoader] = useState(false)
  // re-animated scrolling in the react native
  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const filterHeight = useSharedValue(0)

  // const hPadding = useSharedValue(64)

  const headerY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, 64 + filterHeight.value)
    return {
      transform: [
        {
          translateY: withTiming(-dy),
        },
      ],
      // top: filterHeight.value
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
      paddingTop: filterHeight.value + 56,
    }
  })

  const msgY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 68,
    }
  })

  const openSortModal = () => {
    setShowSortModal(true)
  }

 

  // get data from local storage
  useEffect(async () => {
    // setCollapseView(collapseViewData)
    // setItemView(ItemViewData)
    // setExpandView(expandViewData)
    // setMoreExpandView(moreExpandData)
    getItem('projectCollapseView').then((res) => {
      if (res) {
        setCollapseView(res)
      } else {
        setCollapseView(collapseViewData)
      }
    })
    getItem('projectItemView').then((res) => {
      if (res) {
        setItemView(res)
      } else {
        setItemView(ItemViewData)
      }
    })
    getItem('projectExpandView').then((res) => {
      // setExpandView(expandViewData)
      // setExpandView(expandViewData)
      if (res) {
        setExpandView(res)
      } else {
        console.log(expandViewData,"expand view data")
        setExpandView(expandViewData)
      }
    })
    getItem('projectMoreExpandView').then((res) => {
      if (res) {
        setMoreExpandView(res)
      } else {
        setMoreExpandView(moreExpandData)
      }
    })
  }, [])

  useEffect(() => {
    let obj = {}
    collapseView[0]?.items?.forEach((each) => {
      obj[each.label] = each.collapse
    })
    // //console.log(obj, 'response object........')
    setCollapseViewObj(obj)
    // //console.log(collapseView, 'object.......')
  }, [collapseView[0]])

  useEffect(() => {
    let obj = {}
    expandView[0]?.items?.forEach((each) => {
      obj[each.label] = each.expand
    })
    // //console.log(obj, 'expand object........')
    setExpandViewObj(obj)
    // //console.log(expandViewObj, ' expand object.......')
  }, [expandView[0]])

  let refetch = route.params ? route.params.refetch : null
  const toggleRefresh = () => {
    setPage(1)
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  useEffect(() => {
    if (collapseViewObj.Status) {
      setIsStatusOrPrority(true)
    }
    if (collapseViewObj.Priority) {
      setIsStatusOrPrority(true)
    }
  }, [collapseViewObj])

  useEffect(() => {
    if (expandViewObj.Status) {
      setIsExpandStatusOrPrority(true)
    }
    if (expandViewObj.Priority) {
      setIsExpandStatusOrPrority(true)
    }
  }, [expandViewObj])

  useEffect(() => {
    // //console.log('Selected Date', selectedDate)
    if (users.length == 0 && selected.length == 0 && selectedPriorities.length == 0) {
      setShowFilters(false)
      filterHeight.value = 0

      // setBody({})
    } else {
      setShowFilters(true)
    }
  }, [users, selected, selectedPriorities])

  const ListFooterComponent = () => {
    return <>{<ActivityIndicator size="small" color={colors.HOVER} />}</>
  }

  const AddressComponent = ({ address, each }) => {
    return address ? (
      address !== 'null' && (
        <TouchableOpacity
          key={each && each?.id}
          onPress={() => {
            address
              ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
              : console.log('No address')
          }}
          style={[s.cardRowBetween, { marginLeft: 8, flex: 1 }]}
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

  const ProjectCard = ({ item, drag, isActive }) => {
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item?.id]) return true
      else return false
    })
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item?.id] = multipleSelect.current[item?.id] ? undefined : true
    }

    const RightActions = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            singleSelect.current = item?.id
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
        key={item?.id}
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
                <TouchableOpacity
                  onLongPress={() => {
                    setSelectable((prev) => {
                      return !prev
                    })
                    setActionType('')
                    multipleSelect.current = {}
                  }}
                  onPress={() => {
                    dispatch(setCurrentProject(item))
                    dispatch(setStage('project'))
                    dispatch(setNavigationFrom(''))
                    navigation.navigate('ProjectDetails', {
                      id: item?.id,
                    })
                    setActionType('')
                    multipleSelect.current = {}
                    setSelectable(false)
                  }}
                >
                  <View style={[s.cardRowBetween]}>
                    <View style={[s.hFlex]}>
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
                      <Text style={[s.cardTitle]}>{item?.name}</Text>
                    </View>
                    {/* <View style={[s.spaceLeft]}> */}
                    {/* {!selectable && <BellIcon fill={colors.NORMAL} />} */}

                    {/* </View> */}
                  </View>
                  {allCollapsable ? (
                    isCollapsed ? (
                      <>
                        {/* {isStatusOrPrority && ( */}
                        <View
                          style={[
                            isStatusOrPrority
                              ? s.cardRowLeft
                              : { marginVertical: 0, paddingVertical: 0 },
                          ]}
                        >
                          {collapseViewObj?.Status && (
                            <Text
                              // key={each.id}
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
                          )}
                          {collapseViewObj?.Priority && (
                            <Text
                              // key={each.id}
                              style={[
                                g.gCardStatus,
                                {
                                  color: item?.priority && PriorityColors[item?.priority].color,
                                },
                              ]}
                            >
                              {capitalizeFirstLetter(item?.priority)}
                            </Text>
                          )}
                          {collapseViewObj?.Members && (
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                              <CSelectedUsersWithoutEdit
                                selectedUsers={item['user_members'] ? item['user_members'] : []}
                              />
                            </View>
                          )}
                        </View>
                        {/* )} */}
                        {collapseViewObj?.Address && <AddressComponent address={item?.address} />}
                        {collapseViewObj?.Budget && (
                          <View style={s.cardRowLeft}>
                            <DollarIcon fill={colors.NORMAL} />
                            <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                          </View>
                        )}
                        {collapseViewObj?.Completion && (
                          <ListingCompletion
                            // key={each.id}
                            from={'listing'}
                            status={item?.stage}
                            progressData={{
                              completion: item?.progress?.completion,
                              is_can_completion: item?.progress?.is_can_completion,
                            }}
                            type={'project'}
                            id={item?.id}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            // marginRight: 8,
                          }}
                        >
                          <View
                            style={[
                              isExpandStatusOrPrority
                                ? s.cardRowLeft
                                : { marginVertical: 0, paddingVertical: 0 },
                            ]}
                          >
                            {expandViewObj?.Status && (
                              <Text
                                style={[
                                  g.gCardStatus,
                                  { marginRight: 8 },
                                  {
                                    backgroundColor:
                                      item?.stage && FilterColors[item?.stage]?.color,
                                  },
                                ]}
                              >
                                {item?.stage}
                              </Text>
                            )}
                            {expandViewObj?.Priority && (
                              <Text
                                style={[
                                  g.gCardStatus,
                                  { color: item?.priority && PriorityColors[item?.priority].color },
                                ]}
                              >
                                {capitalizeFirstLetter(item?.priority)}
                              </Text>
                            )}
                          </View>
                          {expandViewObj?.Members && (
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                              <CSelectedUsersWithoutEdit
                                selectedUsers={item['user_members'] ? item['user_members'] : []}
                              />
                            </View>
                          )}
                        </View>

                        {expandViewObj?.Address && item?.address && (
                          <AddressComponent address={item?.address} />
                        )}
                        {expandViewObj?.Budget && (
                          <View style={s.cardRowLeft}>
                            <DollarIcon fill={colors.NORMAL} />
                            <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                          </View>
                        )}
                        {expandViewObj?.Budget && (
                          <ListingCompletion
                            from={'listing'}
                            status={item?.stage}
                            progressData={{
                              completion: item?.progress?.completion,
                              is_can_completion: item?.progress?.is_can_completion,
                            }}
                            type={'project'}
                            id={item?.id}
                          />
                        )}
                      </>
                    )
                  ) : isCollapsed ? (
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          // marginRight: 8,
                        }}
                      >
                        <View
                          style={[
                            isExpandStatusOrPrority
                              ? s.cardRowLeft
                              : { marginVertical: 0, paddingVertical: 0 },
                          ]}
                        >
                          {expandViewObj?.Status && (
                            <Text
                              style={[
                                g.gCardStatus,
                                { marginRight: 8 },
                                {
                                  backgroundColor: item?.stage && FilterColors[item?.stage]?.color,
                                },
                              ]}
                            >
                              {item?.stage}
                            </Text>
                          )}
                          {expandViewObj?.Priority && (
                            <Text
                              style={[
                                g.gCardStatus,
                                { color: item?.priority && PriorityColors[item?.priority].color },
                              ]}
                            >
                              {capitalizeFirstLetter(item?.priority)}
                            </Text>
                          )}
                        </View>
                        {expandViewObj?.Members && (
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <CSelectedUsersWithoutEdit
                              selectedUsers={item['user_members'] ? item['user_members'] : []}
                            />
                          </View>
                        )}
                      </View>

                      {expandViewObj?.Address && item?.address && (
                        <AddressComponent address={item?.address} />
                      )}
                      {expandViewObj?.Budget && (
                        <View style={s.cardRowLeft}>
                          <DollarIcon fill={colors.NORMAL} />
                          <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                        </View>
                      )}
                      {expandViewObj?.Budget && (
                        <ListingCompletion
                          from={'listing'}
                          status={item?.stage}
                          progressData={{
                            completion: item?.progress?.completion,
                            is_can_completion: item?.progress?.is_can_completion,
                          }}
                          type={'project'}
                          id={item?.id}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {/* {isStatusOrPrority && ( */}
                      <View style={[isStatusOrPrority && s.cardRowLeft]}>
                        {collapseViewObj?.Status && (
                          <Text
                            // key={each.id}
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
                        )}
                        {collapseViewObj?.Priority && (
                          <Text
                            // key={each.id}
                            style={[
                              g.gCardStatus,
                              {
                                color: item?.priority && PriorityColors[item?.priority].color,
                              },
                            ]}
                          >
                            {capitalizeFirstLetter(item?.priority)}
                          </Text>
                        )}
                        {collapseViewObj?.Members && (
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <CSelectedUsersWithoutEdit
                              selectedUsers={item['user_members'] ? item['user_members'] : []}
                            />
                          </View>
                        )}
                      </View>
                      {/* )} */}
                      {collapseViewObj?.Address && <AddressComponent address={item?.address} />}
                      {collapseViewObj?.Budget && (
                        <View style={s.cardRowLeft}>
                          <DollarIcon fill={colors.NORMAL} />
                          <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                        </View>
                      )}
                      {collapseViewObj?.Completion && (
                        <ListingCompletion
                          // key={each.id}
                          from={'listing'}
                          status={item?.stage}
                          progressData={{
                            completion: item?.progress?.completion,
                            is_can_completion: item?.progress?.is_can_completion,
                          }}
                          type={'project'}
                          id={item?.id}
                        />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetStatus = (item) => {
    if (selected?.length > 1) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => item.value !== filterItem.value)
      })
    } else if (selected?.length == 1) {
      setSelected([])
    }
    toggleRefresh()
  }

  const resetAllStatus = () => {
    setSelected([])
    toggleRefresh()
  }
  const resetFilters = () => {
    setSelected([])
    setUsers([])
    setSelectedPriorities([])
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

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      dispatch(setCurrentProject(null))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const attemptDelete = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        //console.log(toDeleteArray, 'delete array........')
        if (toDeleteArray.length == 0) {
          setShowDeleteModal(false)
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.project.deleteMultipleProjects({
            project_ids: toDeleteArray,
          })

          if (res.success) {
            multipleSelect.current = {}
            setShowDeleteModal(false)
            setSelectable(false)
            toggleRefresh()
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        if (singleSelect.current) {
          let res = await api.project.deleteProject(singleSelect.current)

          if (res.success) {
            multipleSelect.current = {}
            toggleRefresh()
            setShowDeleteModal(false)
            Alert.alert('Delete Successful.')
          }
        } else {
          Alert.alert('Please select at least one project to delete')
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
      setActionType('')
    }
  }

  const attemptOrdering = async () => {
    try {
      setBtnLoader(true)
      setSortBy(SORT_BY[5])
      let orderArray = getSortingOrderData(projects)

      let res = await api.project.orderProject({
        sorting_data: orderArray,
      })
      //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
      }
    } catch (err) {
      // console.log(err,"------------------")
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setActionType('')
      setDraggable(false)
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
          let res = await api.project.cloneProjects({
            project_ids: toCloneArray,
          })
          //console.log(res)
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
    } finally {
      setBtnLoader(false)
      setActionType('')
    }
  }

 

  useEffect(() => {
    setLoading(true)
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

    if (selected?.length > 0) {
      // body['stages'] = getFilterStagesFromSelectedFilters(selectable)
      body['stages'] = getFilterStagesFromSelectedFilters(selected)

      // //console.log(stages,'stages........')
      //  body['stages']
    }

    if (selectedPriorities.length > 0) {
      body['priorities'] = selectedPriorities.map((item) => item.value)
    }

    if (sortBy) {
      body['sort_by'] = sortBy.param
    }

   
    
    api.project
      .getAllProjects(body)
      .then((res) => {
        setCurrentPage(res.meta.current_page)
        setLastPage(res.meta.last_page)
        //console.log(res.data.length, 'project length.....')
        if (page == 1) {
          setProjects(res.data)
        } else {
          setProjects((pre) => [...pre, ...res.data])
        }
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
        setLoading(false)
        setLoadingComplete(true)
      })
    //console.log(refresh, refetch, query, selected, users, page, sortBy, selectedPriorities)
  }, [refresh, refetch, query, selected, users, page, sortBy, selectedPriorities])

  //   useEffect(() => {
  //   let body = {
  //     type: "project",
  //   }
  //   if(Object.keys(projectIds).length > 0){
  //     body = {...body,...projectIds}
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

  // }, [projectIds])

  useEffect(() => {
    setFilterCount(0)
    if (selected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (users.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedPriorities?.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
  }, [selected, users, selectedPriorities])

  const goBack = () => {
    setPage(1)
    if (currentProject) {
      navigation.goBack()
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

  return (
    <HideKeyboard>
      <View
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
          onCustomiztion={() => setShowCustomizationModal(true)}
          stage={'project'}
        />
        <ProjectFilterModal
          visibility={showFiltersModal}
          setVisibility={setShowFiltersModal}
          selectedUsers={users}
          setSelectedUsers={setUsers}
          selectedFilters={selected}
          setSelectedFilters={setSelected}
          setShowParentFilters={setShowFilters}
          setSelectedPriorities={setSelectedPriorities}
          selectedPriorities={selectedPriorities}
          search={query}
          setSearch={setSearch}
          onApply={() => setPage(1)}
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
        <ProjectCustomizationModal
          openModal={showCustomizationModal}
          setOpenModal={setShowCustomizationModal}
          expandView={expandView}
          setExpandView={setExpandView}
          moreExpandView={moreExpandView}
          setMoreExpandView={setMoreExpandView}
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
          btnLoader={btnLoader}
        // confirmationMessage="Do you want to Clone tasks? tasks will be clone with same state with its childs"
        />
        <View style={[g.listingOuterContainer, s.spaceBelow, loading && { opacity: 0.3 }]}>
          <View style={[s.headerContainer, s.outerPadding]}>
            <TouchableOpacity disabled={loading} onPress={goBack}>
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>Projects</CText>
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
              <TouchableOpacity disabled={loading} onPress={openSortModal} style={s.buttonGroupBtn}>
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
            {/* Headin with icons */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 8,
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
                    <View>
                      <View style={s.filterContainer}>
                        {users?.map((user, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                s.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={s.userItemTextDark}>{user?.name || user?.email}</Text>
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
                        {selected.map((filter, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                s.userItemContainer,
                                { backgroundColor: filter.color },
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={s.userItemText}>{filter.label}</Text>
                              <TouchableOpacity
                                onPress={() => resetStatus(filter)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.WHITE} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                        {selected.length > 0 && (
                          <TouchableOpacity onPress={resetAllStatus} style={{ marginLeft: 8 }}>
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
                                  { backgroundColor: priority.color },
                                  { flexDirection: 'row', alignItems: 'center' },
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
                placeholder="Search"
                value={search}
                setValue={setSearch}
                style={[showFilters ? { marginTop: 8 } : { marginVertical: 0 }]}
                filterIcon={true}
                onPress={() => setShowFiltersModal(true)}
              // setShowFiltersModal={setShowFiltersModal}
              />
            </Animated.View>
          </View>
          {/* </Animated.View> */}

          {!loading && projects.length == 0 && loadingComplete && (
            <Animated.View style={[s.outerPadding, msgY, { zIndex: -100 }]}>
              <Text>
                No projects to show. Please create your new project by pressing the plus button.
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
            ListHeaderComponent={() => (
              <Animated.View style={[paddingY, { zIndex: -1000 }]}></Animated.View>
            )}
            bounces={false}
            scrollEventThrottle={16}
            initialNumToRender={5}
            showsVerticalScrollIndicator={false}
            data={projects}
            onDragBegin={() => { }}
            onDragEnd={({ data }) => {
              setProjects(data)
            }}
            onScrollBeginDrag={(e) => {
              prev.value = e.nativeEvent.contentOffset.y
            }}
            onScrollOffsetChange={(offset) => {
              diff.value = offset - prev.value
            }}
           
            refreshing={loading}
            onEndReachedThreshold={0.1}
            onEndReached={() => {
              //console.log(currentPage, lastPage)
              if (currentPage < lastPage) {
                setPage(page + 1)
              }
            }}
            keyExtractor={(item, index) => index+1}
            renderItem={(props) => <ProjectCard {...props} />}
            containerStyle={[
              {
                flex: 1,
                paddingHorizontal: 16,
                zIndex: -100,
              },
            ]}
          />

          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            {draggable && (
              <View style={s.buttonContainer}>
                <CButtonInput
                  label="Cancel"
                  disabled={btnLoading}
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
            {!draggable && selectable && actionType == 'delete' && (
              <View style={s.buttonContainer}>
                <CButtonInput
                  label="Cancel"
                  onPress={() => {
                    setSelectable(false)
                    multipleSelect.current = {}
                    // setRefresh((pre)=>!pre)
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
            {!draggable && selectable && actionType == 'clone' && (
              <View style={s.buttonContainer}>
                <CButtonInput
                  label="Cancel"
                  onPress={() => {
                    setSelectable(false)
                    multipleSelect.current = {}
                    // setRefresh((pre)=>!pre)
                  }}
                  style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
                />
                <CButtonInput
                  label="Clone"
                  onPress={() => setShowCloneModal(true)}
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
                multipleSelect.current = {}
                setSortBy(SORT_BY[0])
                navigation.navigate('ProjectAdd')
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
    // paddingTop: 16,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    backgroundColor: colors.CONTAINER_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 100,
  },
  outerPadding: {
    paddingHorizontal: 16,
    width: '100%',
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
  textColor: {
    color: 'black',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingTop: 16,
    zIndex: 10,
    backgroundColor: colors.PRIM_BG,
    paddingBottom: 8,
    paddingTop: 4,
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
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    // backgroundColor:"green"
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    // padding:8,
    // padding: 10,
    // marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 8,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.PRIM_BG,
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    // marginLeft: 4,
  },
  cardProgressText: {
    marginLeft: 10,
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
  hFlex: {
    flexDirection: 'row',
    // alignItems: 'center',
    flex: 1,
  },
  spaceBelow: {
    marginBottom: 55,
  },
  plusButton: {
    position: 'absolute',
    // bottom: -15,
    right: 0,
    zIndex: 100,
    bottom: Platform.OS === 'ios' && height > 670 ? 15 : -15,
  },
  spaceLeft: {
    paddingLeft: 8,
  },
  statusItemContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 32 : 0,
  },
  resetText: {
    marginLeft: 4,
    color: colors.PRIM_CAPTION,
  },
})
