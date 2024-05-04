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
import colors from '../../assets/constants/colors'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'
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
import { Swipeable } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import { ListFilterColors } from '../../assets/constants/filters'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import IconWrap from '../../components/common/IconWrap'
import CSettingsModal from '../../components/modals/CSettingModal'
import CSortModal from '../../components/modals/CSortModal'
import CheeklistFilterModal from '../../components/modals/ChecklistFilterModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import ListCompleteModal from '../../components/modals/ListCompleteModal'
import ListReOpenModal from '../../components/modals/ListReopenModal'
import MoveModal from '../../components/modals/MoveModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

const { height, width } = Dimensions.get('window')

export default function ChecklistScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const { currentProject, currentTask, currentMilestone, currentIssue } = useSelector(
    (state) => state.navigation
  )
  const [selected, setSelected] = useState(() => {
    if (currentProject?.id) {
      return [{ id: currentProject.id, name: currentProject.name }]
    } else {
      return []
    }
  })
  const [milestoneSelected, setMilestoneSelected] = useState(() => {
    if (currentMilestone?.id) {
      return [{ id: currentMilestone.id, name: currentMilestone.name }]
    } else {
      return []
    }
  })
  const [taskSelected, setTaskSelected] = useState(() => {
    if (currentTask?.id) {
      return [{ id: currentTask.id, name: currentTask.name }]
    } else {
      return []
    }
  })
  const [issueSelected, setIssueSelected] = useState(() => {
    if (currentIssue?.id) {
      return [{ id: currentIssue.id, name: currentIssue.name }]
    } else {
      return []
    }
  })
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [expandFilters, setExpandFilters] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [Checklists, setChecklists] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [filterCount, setFilterCount] = useState(0)
  const [actionType, setActionType] = useState('')
  const [sortBy, setSortBy] = useState(SORT_BY[0])
  const [showSortModal, setShowSortModal] = useState(false)
  const [btnLoading, setBtnLoader] = useState(false)
  let refetch = route.params ? route.params.refetch : null

  const [completeModal, setCompleteModal] = useState(false)
  const [statusLoader, setStatusLoader] = useState(false)
  const [reOpenModal, setReOpenModal] = useState(false)
  const statusChange = useRef(null)
  const itemStatus = useRef(null)

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
    setPage(1)
  }

  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const filterHeight = useSharedValue(0)
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

  const attemptListStatusChange = () => {
    let body = {}
    if (statusChange.current) {
      if (itemStatus.current === 'Opened') {
        body['status'] = 'Opened'
      } else {
        body['status'] = 'Complete'
      }
      setStatusLoader(true)
      api.checklist
        .changeListStatus(statusChange.current, body)
        .then((res) => {
          console.log(res,'res......')
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
          statusChange.current = null
          setRefresh((prev) => !prev)
          // setShowStatusChangeModal(false)
          setCompleteModal(false)
          setReOpenModal(false)
          setStatusLoader(false)
        })
    }
  }

  const ChecklistCard = ({ item, drag, isActive }) => {
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

    const [status, setStatus] = useState(() => {
      if (item?.status === 'Complete') {
        return true
      } else {
        return false
      }
    })

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
          }}
          onPress={() => {
            multipleSelect.current = {}
            setSelectable(false)
            navigation.navigate('ChecklistDetails', { id: item?.id })
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
                  onLongPress={() =>
                    setSelectable((prev) => {
                      return !prev
                    })
                  }
                  onPress={() => {
                    multipleSelect.current = {}
                    setSelectable(false)
                    navigation.navigate('ChecklistDetails', { id: item?.id, checklist: item })
                  }}
                >
                  <View style={s.cardRowBetween}>
                    <Text
                      style={[
                        s.cardTitle,
                        item?.status === 'Complete' && { textDecorationLine: 'line-through' },
                      ]}
                    >
                      {item?.name}
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
                            itemStatus.current = 'Opened'
                            setReOpenModal(true)
                          } else {
                            itemStatus.current = 'Complete'
                            setCompleteModal(true)
                          }
                        }}
                      />
                    )}
                  </View>
                  <View style={[s.cardRowLeft, { paddingBottom: 8, alignItems: 'flex-start' }]}>
                    <Text style={s.projectBanner}>Project: </Text>
                    <Text style={s.projectText}>{item?.project?.name}</Text>
                  </View>
                  <View style={s.cardRowBetween}>
                    <Text
                      style={[
                        {
                          color: colors.WHITE,
                          backgroundColor: item?.status && ListFilterColors[item?.status].color,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      {item?.status === 'Opened'
                        ? 'Open'
                        : item?.status === 'Complete' && 'Completed'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const resetFilters = () => {
    setSelected([])
    setMilestoneSelected([])
    setTaskSelected([])
    setIssueSelected([])
    setSelectedStatuses([])
    setSearch('')
    toggleRefresh()
  }

  const resetMilestone = () => {
    setMilestoneSelected([])
    toggleRefresh()
  }

  const resetTask = (id) => {
    setTaskSelected((pre) => {
      const copy = pre
      return copy.filter((each) => each.id !== id)
    })
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

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    if (
      taskSelected.length == 0 &&
      selected.length == 0 &&
      milestoneSelected.length == 0 &&
      issueSelected.length == 0 &&
      selectedStatuses.length == 0
    ) {
      setShowFilters(false)
      filterHeight.value = 0
    } else {
      setShowFilters(true)
    }
  }, [selected, taskSelected, milestoneSelected, issueSelected, selectedStatuses])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setFilterCount(0)
    if (selected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (milestoneSelected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (taskSelected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (selectedStatuses.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
    if (issueSelected.length > 0) {
      setFilterCount((pre) => pre + 1)
    }
  }, [selected, milestoneSelected, taskSelected, issueSelected, selectedStatuses])

  const attemptDelete = async () => {
    setBtnLoader(true)
    try {
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        //console.log(toDeleteArray)
        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.checklist.deleteMultipleChecklists({
            todolist_ids: toDeleteArray,
          })

          if (res.success) {
            Alert.alert('Delete Successful.')
          }
          setShowDeleteModal(false)
          setSelectable(false)
          setActionType('')
          toggleRefresh()
          setBtnLoader(false)
        }
      } else {
        if (singleSelect.current) {
          let res = await api.checklist.deleteChecklist(singleSelect.current)

          if (res.success) {
            Alert.alert('Delete Successful.')
            multipleSelect.current = {}
            toggleRefresh()
          }
          setShowDeleteModal(false)
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
      btnLoading(false)
      multipleSelect.current = {}
    }
  }

  const attemptOrdering = async () => {
    setBtnLoader(true)
    setSortBy(SORT_BY[5])
    try {
      let orderArray = getSortingOrderData(Checklists)

      let res = await api.checklist.orderChecklist({
        sorting_data: orderArray,
      })
      //console.log(res)
      if (res.success) {
        Alert.alert('Ordering Successful.')
        toggleRefresh()
        setDraggable(false)
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
    } finally {
      setBtnLoader(false)
    }
  }

  const attemptClone = async () => {
    try {
      if (selectable) {
        setBtnLoader(true)
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          //console.log(toCloneArray, 'to clone array....')
          let res = await api.checklist.cloneChecklists({
            todolist_ids: toCloneArray,
          })
          //console.log(res)
          if (res.success) {
            Alert.alert('Clone Successful.')
            multipleSelect.current = {}
            setShowCloneModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            setBtnLoader(false)
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
      setBtnLoader(false)
      setShowCloneModal(false)
      setActionType('')
      multipleSelect.current = {}
    }
  }

  const attemptMove = async (project, milestone, task, issue, copy) => {
    try {
      if (selectable) {
        setBtnLoader(false)
        let toMoveArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toMoveArray.length == 0) {
          Alert.alert('Please select at least one item to move.')
        } else {
          const params = {
            model_ids: toMoveArray,
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
            setSelectable(false)
            setActionType('')
            multipleSelect.current = {}
            toggleRefresh()
            setBtnLoader(false)
          }
        }
      } else {
        Alert.alert('Please select at least one item to move.')
        setShowMoveModal(false)
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
      setActionType('')
      setBtnLoader(false)
      multipleSelect.current = {}
    }
  }

  useEffect(() => {
    setLoading(true)
    let body = {
      pagination: 10,
      page: page,
    }
    if (query != '') {
      body['search'] = query
    }

    // if (selected.length > 0) {
    //   projectIds = getIdsfromProjects(selected)
    //   body = {...body, ...projectIds}
    // }
    if (selectedStatuses.length > 0) {
      body['statuses'] = selectedStatuses.map((item) => item.value)
      
    }

    if (selected.length > 0) {
      body['project_ids'] = getProjectFromSelectedProjects(selected)
      body['only_project'] = 1
    }

    if (milestoneSelected.length > 0) {
      body['milestone_ids'] = getProjectFromSelectedProjects(milestoneSelected)
      body['only_project'] = 0
    }
    if (taskSelected.length > 0) {
      body['task_ids'] = getProjectFromSelectedProjects(taskSelected)
      body['only_project'] = 0
    }
    if (issueSelected.length > 0) {
      body['issue_ids'] = getProjectFromSelectedProjects(issueSelected)
      body['only_project'] = 0
    }
    if (sortBy) {
      body['sort_by'] = sortBy.param
    }

    api.checklist
      .getAllChecklists(body)
      .then((res) => {
        // //console.log(res.data, 'data')
        setLastPage(res.meta.last_page)
        if (page == 1) {
          // //console.log(res.data)
          setChecklists(res.data)
        } else {
          setChecklists((pre) => [...pre, ...res.data])
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
    milestoneSelected,
    taskSelected,
    issueSelected,
    page,
    isFocused,
    sortBy,
    selectedStatuses,
  ])

  const openSortModal = () => {
    setShowSortModal(true)
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

  const resetMilestones = (milestone) => {
    if (milestoneSelected?.length > 1) {
      setMilestoneSelected((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => milestone.id !== filterItem.id)
      })
    } else if (milestoneSelected?.length == 1) {
      setMilestoneSelected([])
    }
    toggleRefresh()
  }

  const resetAllMilestones = () => {
    setMilestoneSelected([])
    toggleRefresh()
  }

  const resetTasks = (task) => {
    if (taskSelected?.length > 1) {
      setTaskSelected((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => task.id !== filterItem.id)
      })
    } else if (taskSelected?.length == 1) {
      setTaskSelected([])
    }
    toggleRefresh()
  }

  const resetAllTasks = () => {
    setTaskSelected([])
    toggleRefresh()
  }

  const resetIssues = (issue) => {
    if (issueSelected?.length > 1) {
      setIssueSelected((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => issue.id !== filterItem.id)
      })
    } else if (issueSelected?.length == 1) {
      setIssueSelected([])
    }
    toggleRefresh()
  }

  const resetAllIssues = () => {
    setIssueSelected([])
    toggleRefresh()
  }

  // useEffect(() => {
  //   if (currentProject?.id) {
  //     setSelected([{ id: currentProject.id, name: currentProject.name }])
  //     setShowFilters(true)
  //     setExpandFilters(true)
  //   }
  //   if (currentMilestone?.id) {
  //     setMilestoneSelected([{ id: currentMilestone.id, name: currentMilestone.name }])
  //     setShowFilters(true)
  //     setExpandFilters(true)
  //   }
  //   if (currentTask?.id) {
  //     setTaskSelected([{ id: currentTask.id, name: currentTask.name }])
  //     setShowFilters(true)
  //     setExpandFilters(true)
  //   }
  //   if (currentIssue?.id) {
  //     setIssueSelected([{ id: currentIssue.id, name: currentIssue.name }])
  //     setShowFilters(true)
  //     setExpandFilters(true)
  //   }
  //   toggleRefresh()
  // }, [currentProject, currentMilestone, currentTask, currentIssue])

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
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this list? This cannot be undone'}
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
        confirmationMessage="Do you want to Clone lists? Lists will be clone with same state with its childs"
        btnLoader={btnLoading}
      />

      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        multipleSelect={multipleSelect}
        setSelectable={setSelectable}
        state="list"
        onMove={attemptMove}
        btnLoader={btnLoading}
      />

      <CSettingsModal
        from="checklist"
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
      <CheeklistFilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        selectedFilters={selected}
        setSelectedFilters={setSelected}
        setMilestoneFilters={setMilestoneSelected}
        milestoneFilters={milestoneSelected}
        setTaskFilters={setTaskSelected}
        taskFilters={taskSelected}
        issueFilters={issueSelected}
        setIssueFilters={setIssueSelected}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        setShowParentFilters={setShowFilters}
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

      <ListCompleteModal
        visibility={completeModal}
        setVisibility={setCompleteModal}
        onComplete={attemptListStatusChange}
        confirmationMessage="Do you want to complete this list?"
        statusLoader={statusLoader}
        setStatusLoader={setStatusLoader}
      />
      <ListReOpenModal
        visibility={reOpenModal}
        setVisibility={setReOpenModal}
        onComplete={attemptListStatusChange}
        confirmationMessage="Do you want to reopen this list?"
        statusLoader={statusLoader}
        setStatusLoader={setStatusLoader}
      />

      <View style={[s.container, s.spaceBelow, loading && { opacity: 0.3 }]}>
        <View style={s.outerPadding}>
          <View style={[s.headerContainer]}>
            <TouchableOpacity
              disabled={loading}
              onPress={() => {
                  if (currentIssue) {
                    navigation.navigate('IssueDetails', {
                      id: currentIssue?.id,
                      refetch: Math.random(),
                    })
                  }
                    else if (currentTask) {
                      navigation.navigate('TaskDetails', {
                        id: currentTask?.id,
                        refetch: Math.random(),
                      })
                    }
                   else if(currentMilestone){
                      navigation.navigate('MilestoneDetails', {
                        id: currentMilestone?.id,
                        refetch: Math.random(),
                      })
                    }
                   else  if(currentProject){
                      navigation.navigate('ProjectDetails', {
                        id: currentProject?.id,
                        refetch: Math.random(),
                      })
                    }
                  
                 else {
                  navigation.goBack()
                }
              }}
              outputRange={iconWrapColors}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>Lists</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity
                disabled={loading}
                onPress={openSortModal}
                style={[s.buttonGroupBtn, { marginRight: 16 }]}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                outputRange={iconWrapColors}
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
                top: 68,
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
                    marginBottom: 16,
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
                    <View style={s.filterContainer}>
                      {milestoneSelected?.length > 0 &&
                        milestoneSelected?.map((milestone, id) => {
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
                      {milestoneSelected?.length > 0 && (
                        <TouchableOpacity onPress={resetAllMilestones}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.filterContainer}>
                      {taskSelected.length > 0 &&
                        taskSelected.map((task, id) => {
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
                      {taskSelected.length > 0 && (
                        <TouchableOpacity onPress={resetAllTasks}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={s.filterContainer}>
                      {issueSelected.length > 0 &&
                        issueSelected.map((issue, id) => {
                          return (
                            <View
                              style={[
                                s.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                              key={id}
                            >
                              <Text style={s.userItemTextDark}>
                                {issue?.name.length > 30 ? issue?.name.slice(0, 30) : issue?.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => resetIssues(issue)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.SECONDARY} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                      {issueSelected.length > 0 && (
                        <TouchableOpacity onPress={resetAllIssues}>
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
                                s.userItemContainer,
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
                  </View>
                )}
              </View>
            )}
            <CSearchInput
              placeholder="Search"
              value={search}
              setValue={setSearch}
              filterIcon
              onPress={() => setShowFilterModal(true)}
              style={[{ marginVertical: 0 }]}
            />
          </Animated.View>
        </View>

        {!loading && Checklists?.length == 0 && (
          <Animated.View style={[s.outerPadding, msgY, { zIndex: -100 }]}>
            <Text style={{ marginTop: 8, textAlign: 'center' }}>
              No Lists to show. Please create your new Checklist by pressing the plus button.
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
          data={Checklists}
          onDragBegin={() => {}}
          onDragEnd={({ data }) => {
            setChecklists(data)
          }}
          scrollEventThrottle={16}
          initialNumToRender={10}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onScrollBeginDrag={(e) => {
            prev.value = e.nativeEvent.contentOffset.y
          }}
          onScrollOffsetChange={(offset) => {
            diff.value = offset - prev.value
          }}
          renderItem={(props) => <ChecklistCard {...props} />}
          keyExtractor={(item, index) => index+1}
          containerStyle={[
            {
              flex: 1,
              zIndex: -100,
              paddingHorizontal: 16,
            },
          ]}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            currentPage < lastPage && setPage(page + 1)
          }}
        />

        {!loading && !draggable && !selectable && (
          <TouchableOpacity
            style={s.plusButton}
            onPress={() => {
              multipleSelect.current = {}
              setSelectable(false)
              setActionType('')
              setSortBy(SORT_BY[0])
              navigation.navigate('ChecklistAdd', { autoLoad: true })
            }}
          >
            <FloatingPlusButton />
          </TouchableOpacity>
        )}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {draggable && (
            <View style={s.buttonContainer}>
              <CButtonInput
                label="Cancel"
                onPress={() => {
                  setDraggable(false)
                  setRefresh((pre) => !pre)
                  setActionType('')
                  setBtnLoader(false)
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
                  setActionType('')
                  setBtnLoader(false)
                }}
                style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
              />
              <CButtonInput
                label="Delete"
                onPress={() => setShowDeleteModal(true)}
                // loading={btnLoading}
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
                  setActionType('')
                  setBtnLoader(false)
                }}
                style={{ flex: 1, backgroundColor: colors.HEADER_TEXT, marginRight: 8 }}
              />
              <CButtonInput
                label={actionType == 'clone' ? 'Clone' : 'Move'}
                onPress={handleMoveOrClone}
                // loading={btnLoading}
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
    backgroundColor: colors.PRIM_BG,
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
  textColor: {
    color: colors.NORMAL,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    // paddingTop: StatusBar.currentHeight,
    backgroundColor: colors.PRIM_BG,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  projectBanner: {
    color: colors.PRIM_CAPTION,
    fontSize: 14,
    fontFamily: 'inter-regular',
  },
  projectText: {
    color: colors.NORMAL,
    fontSize: 14,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    width: '100%',
    flex: 1,
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
    padding: 16,
    marginVertical: 10,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 8,
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
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
  spaceBelow: {
    marginBottom: 30,
  },
  plusButton: {
    position: 'absolute',
    // bottom: 8,
    bottom: Platform.OS === 'ios' && height > 670 ? 40 : 8,
    right: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Platform.OS === 'ios' && height > 670 ? 48 : 16,
  },
  resetText: {
    marginLeft: 4,
    color: colors.PRIM_CAPTION,
  },
  outerPadding: {
    paddingHorizontal: 16,
    width: '100%',
  },
})
