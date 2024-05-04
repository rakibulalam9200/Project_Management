import React, { useState } from 'react'
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
import GripIcon from '../../assets/svg/grip.svg'
import MoreIcon from '../../assets/svg/more.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CText from '../../components/common/CText'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import g from '../../assets/styles/global'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import IconWrap from '../../components/common/IconWrap'
import CSettingsModal from '../../components/modals/CSettingModal'
import CSortModal from '../../components/modals/CSortModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MoveModal from '../../components/modals/MoveModal'
import NoteFilterModal from '../../components/modals/NoteFilterModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { extractDateFormatNew } from '../../utils/Timer'
import { getUserIdsFromSelectedUsers } from '../../utils/User'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

const { height, width } = Dimensions.get('window')

export default function NoteScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const { currentProject } = useSelector((state) => state.navigation)
  let refetch = route.params ? route.params.refetch : null
  let id = route.params ? route.params.id : null
  let name = route.params ? route.params.name : null
  let from = route.params ? route.params.from : null
  let allData = route.params ? route.params.allData : null
  const refreshControlRef = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState(() => {
    if (currentProject?.id) {
      return [{ id: currentProject.id, name: currentProject.name }]
    } else {
      return []
    }
  })

  
  const [users, setUsers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [expandFilters, setExpandFilters] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [notes, setNotes] = useState([])
  const [displayableNotes, setDisplayAbleNotes] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [selectable, setSelectable] = useState(false)
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [sortBy, setSortBy] = useState(SORT_BY[0])

  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const filterHeight = useSharedValue(0)

  const [filterCount, setFilterCount] = useState(0)

  const headerY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, filterHeight.value + 64)
    return {
      transform: [
        {
          translateY: withTiming(-dy),
        },
      ],
      // top: filterHeight.value
    }
  })
  const paddingY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 72,
    }
  })

  const msgY = useAnimatedStyle(() => {
    return {
      paddingTop: filterHeight.value + 64,
    }
  })

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const handleText = (text) => {
    // const replaceText = text.replace(/<(.|\n)*?>/g, '').trim()
    const replaceText = text.replace(/&nbsp;/g, '').trim()
    if (replaceText?.length > 45) {
      return replaceText.slice(0, 45) + '...'
    } else {
      return replaceText
    }
  }

  const NoteCard = (props) => {
    const { item, index, drag, isActive } = props
    let nodeListIndex = props.getIndex()
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })

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
          onPress={() => {
            navigation.navigate('NoteDetails', {
              id: item.id,
            })
            multipleSelect.current = {}
            setActionType('')
            setSelectable(false)
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

            <View
              style={[s.cardContainer, g.containerBetween, nodeListIndex === 0 && { marginTop: 0 }]}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={[s.cardRowBetween]}
                  onLongPress={() => {
                    setSelectable((prev) => {
                      return !prev
                    })
                    multipleSelect.current = {}
                    setActionType('')
                  }}
                  onPress={() =>
                    navigation.navigate('NoteDetails', {
                      id: item.id,
                    })
                  }
                >
                  <Text style={[g.body2, { color: colors.NORMAL, width: '100%', flex: 1 }]}>
                    {handleText(item?.description?.plain_text_value)}
                  </Text>
                </TouchableOpacity>
                <View style={[s.cardRowLeft, { paddingBottom: 0 }]}>
                  <Text style={s.project}>By: </Text>
                  <Text style={[g.body2, { color: colors.NORMAL }]}>
                    {item?.user_owner?.first_name}
                  </Text>
                </View>
                <View style={[s.cardRowLeft, { marginTop: 0 }]}>
                  <Text style={s.project}>Project: </Text>
                  <Text style={[g.body2, { color: colors.NORMAL }]}>{item?.project?.name}</Text>
                </View>
                <View
                  style={[
                    selectable
                      ? { flexDirection: 'column', paddingHorizontal: 16 }
                      : s.cardRowBetween,
                    ,
                  ]}
                >
                  <View style={[{ flexDirection: 'row' }]}>
                    <Text style={s.project}>Created date: </Text>
                    <Text style={[g.body2, { color: colors.NORMAL }]}>
                      {extractDateFormatNew(item.created_at)}
                    </Text>
                  </View>
                  {/* <Text style={s.project}>{extractDateFormatNew(item.created_at)}</Text> */}
                  <Text style={[s.project, selectable && { marginTop: 8 }]}>
                    {item?.attachments?.length < 10
                      ? `0${item?.attachments?.length} attachments`
                      : `${item?.attachments?.length} attachments`}
                  </Text>
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
          let res = await api.note.deleteMultipleNotes({
            note_ids: toDeleteArray,
          })
          // //console.log(res)
          if (res.success) {
            setBtnLoading(false)
            setShowDeleteModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            multipleSelect.current = {}
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        // //console.log('hit here for single delete ...', singleSelect.current)
        let res = await api.note.deleteNote(singleSelect.current)
        // //console.log(res)
        if (res.success) {
          Alert.alert('Delete Successful.')
          setShowDeleteModal(false)
          toggleRefresh()
          setBtnLoading(false)
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
      setBtnLoading(false)
    }
  }

  const attemptClone = async () => {
    try {
      if (selectable) {
        setBtnLoading(true)
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        // //console.log(toCloneArray, 'toCloneArray')
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.note.cloneNote({
            note_ids: toCloneArray,
          })
          // //console.log(res)
          if (res.success) {
            multipleSelect.current = {}
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            setBtnLoading(false)
            multipleSelect.current = {}
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
        // //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setBtnLoading(false)
    }
  }

  const attemptOrdering = async () => {
    try {
      setBtnLoading(true)
      setSortBy(SORT_BY[5])
      let orderArray = getSortingOrderData(displayableNotes)
      let res = await api.note.orderNote({
        sorting_data: orderArray,
      })
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
        setDraggable(false)
        setBtnLoading(false)
        multipleSelect.current = {}
      }
    } catch (err) {
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
      setBtnLoading(false)
      multipleSelect.current = {}
    }
  }

  const attemptMove = async (project, milestone, task, issue, copy) => {
    try {
      if (selectable) {
        setBtnLoading(false)
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
            setSelectable(false)
            setActionType('')
            multipleSelect.current = {}
            toggleRefresh()
            setBtnLoading(false)
          }
        }
      } else {
        Alert.alert('Please select at least one item to move.')
        setShowMoveModal(false)
        setBtnLoading(false)
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
      setActionType('')
      setBtnLoading(false)
      multipleSelect.current = {}
    }
  }

  

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  useEffect(() => {
    if (selected.length == 0 && users.length == 0) {
      setShowFilters(false)
      filterHeight.value = 0
    } else {
      setShowFilters(true)
    }
  }, [selected, users])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    const body = {
      pagination: 10,
      // sort_by: 'in_order',
      page: page,
      selectData: 1,
    }
    if (query != '') {
      body['search'] = query
    }
    if (selected.length > 0) {
      body['project_ids'] = getProjectFromSelectedProjects(selected)
    }
    if (users.length > 0) {
      body['members'] = getUserIdsFromSelectedUsers(users)
    }
    if (sortBy) {
      body['sort_by'] = sortBy.param
    }

    //console.log(body, 'body..................')

    setLoading(true)
    api.note
      .getAllNotes(body)
      .then((res) => {
        setCurrentPage(res.meta.current_page)
        setLastPage(res.meta.last_page)
        if (page == 1) {
          setDisplayAbleNotes(res.data)
        } else if (page > 1) {
          setDisplayAbleNotes((pre) => [...pre, ...res.data])
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

    //  else {
    //   if (!currentProject) return
    //   setLoading(true)
    //   api.note
    //     .getAllNoteByProject(body, currentProject?.id)
    //     .then((res) => {
    //       setCurrentPage(res.meta.current_page)
    //       setLastPage(res.meta.last_page)
    //       if (page == 1) {
    //         setDisplayAbleNotes(res.data)
    //       } else if (page > 1) {
    //         setDisplayAbleNotes((pre) => [...pre, ...res.data])
    //       }
    //     })
    //     .catch((err) => {
    //       let errorMsg = ''
    //       try {
    //         errorMsg = getErrorMessage(err)
    //       } catch (err) {
    //         errorMsg = 'An error occured. Please try again later.'
    //       }
    //       Alert.alert(errorMsg)
    //     })
    //     .finally(() => {
    //       setLoading(false)
    //     })
    // }
  }, [refresh, refetch, query, users, selected, page, sortBy])

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
    if (selected?.length > 1) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => project.id !== filterItem.id)
      })
    } else if (selected?.length == 1) {
      setSelected([])
    }
    toggleRefresh()
  }
  const resetAllProjects = () => {
    setSelected([])
    toggleRefresh()
  }

  const resetFilters = () => {
    setUsers([])
    setSelected([])
    setSearch('')
    toggleRefresh()
  }

  useEffect(() => {
    setFilterCount(0)
    if (selected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }

    if (users.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
  }, [selected, users])

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
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
      <CSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onDelete={() => {
          setActionType('delete')
          setSelectable(true)
          setDraggable(false)
        }}
        onFilter={() => setShowFilterModal(true)}
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
      />
      <NoteFilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        selectedUsers={users}
        setSelectedUsers={setUsers}
        selectedFilters={selected}
        setSelectedFilters={setSelected}
        setShowParentFilters={setShowFilters}
        search={query}
        setSearch={setSearch}
        onApply={() => setPage(1)}
      />
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete notes? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoading}
      />

      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        setSelectable={setSelectable}
        multipleSelect={multipleSelect}
        btnLoader={btnLoading}
        confirmationMessage="Do you want to clone notes? Notes will be clone with same state with its childs"
      />

      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        multipleSelect={multipleSelect}
        setSelectable={setSelectable}
        state="note"
        onMove={attemptMove}
        btnLoader={btnLoading}
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
      <View style={[g.listingOuterContainer, s.spaceBelow, loading && { opacity: 0.3 }]}>
        <View style={s.outerPadding}>
          <View style={[s.headerContainer]}>
            <TouchableOpacity
              onPress={() => {
                if (currentProject) {
                  navigation.navigate('ProjectDetails', {id: currentProject?.id, refetch: Math.random() })
                } else {
                  navigation.goBack()
                }
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.title3, s.textColor]}>Notes</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity
                onPress={() => {
                  setShowSortModal(true)
                }}
                style={[s.buttonGroupBtn, { marginRight: 10 }]}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                style={s.buttonGroupBtn}
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
              },
              headerY,
            ]}
          >
            {/* Filters view */}
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
                      {selected.length > 0 &&
                        selected.map((project, id) => {
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
                      {selected.length > 0 && (
                        <TouchableOpacity onPress={resetAllProjects} style={{ marginLeft: 8 }}>
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
              onPress={() => setShowFilterModal(true)}
            />
          </Animated.View>

          {/* Filters view end */}
        </View>

        {!loading && displayableNotes.length == 0 && (
          <Animated.View style={[msgY, { zIndex: -100 }]}>
            <Text style={{ paddingHorizontal: 16, marginTop: 8, textAlign: 'center' }}>
              No Notes to show. Please create your Note by pressing the plus button.
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
              width: '100%',
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
          data={displayableNotes}
          onDragBegin={() => {}}
          onDragEnd={({ data }) => {
            setDisplayAbleNotes(data)
          }}
          refreshing={loading}
          onEndReachedThreshold={0.1}
          initialNumToRender={10}
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
          }}
          keyExtractor={(item, index) => index + 1}
          renderItem={(props) => <NoteCard {...props} />}
          containerStyle={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 16,
            zIndex: -1,
          }}
        />

        {!loading && !draggable && !selectable && (
          <CFloatingPlusIcon
            onPress={() => {
              multipleSelect.current = {}
              setSelectable(false)
              setActionType('')
              setSortBy(SORT_BY[0])
              navigation.navigate('NoteAdd')
            }}
            style={[{ bottom: Platform.OS === 'ios' && height > 670 ? 42 : 12 }]}
          />
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
                // loading={loading}
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
                // loading={loading}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    // backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
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
  filterBoxesContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
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
    zIndex: 10,
    backgroundColor: colors.CONTAINER_BG,
  },
  spaceBelow: {
    marginBottom: 30,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
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
    padding: 8,
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    left: 2,
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
  noteDes: {
    fontSize: 14,
    marginRight: 5,
  },
  projectTitle: {
    fontSize: 14,
    color: '#001D52',
    marginRight: 5,
    fontWeight: '500',
  },
  paddingH: {
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
  // dragableSaveButton: {
  //   width: '100%',
  //   padding: 10,
  //   marginBottom: 90,
  // },
  dragableSaveButton: {
    width: '100%',
    padding: 10,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 40 : 8,
  },
  plusButton: {
    position: 'absolute',
    bottom: 40,
    right: 0,
  },
})
