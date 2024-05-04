import * as Linking from 'expo-linking'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import CalendarIcon from '../../assets/svg/calendar2.svg'
import ClockIcon from '../../assets/svg/clock.svg'
import GripIcon from '../../assets/svg/grip.svg'
import LocationIcon from '../../assets/svg/location-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { FilterColors, PriorityColors } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import DetailsCompletion from '../../components/Completion/DetailsCompletion'
import ProgressBar from '../../components/Completion/ProgressBar'
import CButton from '../../components/common/CButton'
import CButtonInput from '../../components/common/CButtonInput'
import CSelectedUserForDetails from '../../components/common/CSelectedUserForDetails'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import DescriptionComponent from '../../components/common/DescriptionComponent'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import CommentModal from '../../components/modals/CommentModal'
import CompleteModal from '../../components/modals/CompleteModal'
import DateRangePickerModal from '../../components/modals/DateRangePickerModal'
import DeclineModal from '../../components/modals/DeclineModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import MoveModal from '../../components/modals/MoveModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import { setCurrentTask, setStage } from '../../store/slices/navigation'
import { setNormal, setShowFileUploadModal } from '../../store/slices/tab'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { extractCustomDateFomratWithTimezone, getDateTime, secondtoHms } from '../../utils/Timer'

// function secondToDhms(seconds) {
//   seconds = Number(seconds);
//   let w = Math.floor(seconds / (3600*24*7));
//   let d = Math.floor(seconds / (3600*24));
//   let h = Math.floor(seconds / 3600);
//   let m = Math.floor(seconds % 3600 / 60);
//   let s = Math.floor(seconds % 3600 % 60);

//   let wDisplay = w > 0 ? d + "w " : "";
//   let dDisplay = d > 0 ? d + "d " : "";
//   let hDisplay = h > 0 ? h + "h " : "";
//   let mDisplay = m > 0 ? m + "m " : "";
//   let sDisplay = s > 0 ? s + "s "  : "";
//   return wDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
// }

const TaskDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const { currentTask, navigationFrom, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )
  const user = useSelector((state) => state.user)
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const dispatch = useDispatch()
  const [taskDetails, setTaskDetails] = useState({})
  const [dateSelected, setDateSelected] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [functionalityListing, setFuntionalityListing] = useState([])
  const [detailsScreen, setDetailsScreen] = useState('details')
  const [draggable, setDraggable] = useState(false)
  const isFocused = useIsFocused()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const [workingHours, setWorkingHours] = useState([])
  const [status, setStatus] = useState(taskDetails && taskDetails.stage)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [timeTracker, setTimeTracker] = useState(null)
  const [showTiming, setShowTiming] = useState(true)
  const [showTimeTrackingModal, setShowTimeTrackingModal] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [isMenuOpen, setIsMenuOPen] = useState(false)
  const [commentModal, setCommentModal] = useState(false)

  const [btnLoader, setBtnLoader] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const { userSettings } = useSelector((state) => state.user)

  const handleMenuToggle = () => {
    setIsMenuOPen(!isMenuOpen)
  }
  const handleItemPress = (item) => {
    //console.log('pressed item', item)
  }

  // //console.log(user?.role?.name,'user........')

  const userActivity = useRef(null)
  const openMemberPickerModal = () => {
    setShowMemberPickerModal(true)
  }

  const openDeclineModal = () => {
    setShowDeclineModal(true)
  }

  const openCompleteModal = () => {
    setShowCompleteModal(true)
  }

  const openSupervisorPickerModal = () => {
    setShowSupervisorPickerModal(true)
  }

  const openClientPickerModal = () => {
    setShowClientPickerModal(true)
  }

  const setListingFunc = async (key, arr) => {
    await AsyncStorage.setItem(key, JSON.stringify(arr))
  }

  const getListingFunc = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) {}
  }

  const taskFunctionalities = [
    {
      id: 8,
      name: 'Activity',
      navigationName: 'Activity',
      viewNavigation: {},
      count: 'activity',
      addNavigationName: '',
      addNavigation: {},
    },
    {
      id: 1,
      name: 'Lists',
      navigationName: 'Checklist',
      viewNavigation: { parent_id: currentTask?.id },
      count: 'todo_lists',
      addNavigationName: 'ChecklistAdd',
      addNavigation: {
        // parent_id: currentTask?.id,
        autoLoad: true,
        showNameInputFirst: true,
        // backScreen: true,
      },
    },
    {
      id: 2,
      name: 'Chat',
      navigationName: 'Chat',
      viewNavigation: '',
      count: 0,
      addNavigationName: '',
      addNavigation: '',
    },
    {
      id: 3,
      name: 'Files',
      navigationName: 'ProjectFolders',
      viewNavigation: {
        taskId: id,
        taskName: taskDetails.name,
        fromTask: true,
      },
      count: 'attachments',
      addNavigationName: 'ProjectFolders',
      addNavigation: '',
    },
    {
      id: 4,
      name: 'Issues',
      navigationName: 'Issues',
      viewNavigation: { taskId: taskDetails?.id },
      count: 'issues',
      addNavigationName: 'IssueAdd',
      // addNavigation: { project: { id: id, name: milestoneDetails.name } },
    },
    {
      id: 5,
      name: 'Dependencies',
      navigationName: '',
      viewNavigation: '',
      count: 0,
      addNavigationName: '',
      addNavigation: '',
    },
  ]

  useEffect(() => {
    getListingFunc('taskLisitingFunctionality').then((res) => {
      if (res) {
        // //console.log(res, 'task functionality listing.......')
        setFuntionalityListing(res)
      } else {
        setFuntionalityListing(taskFunctionalities)
      }
    })
    // setFuntionalityListing(taskFunctionalities)
    setDraggable(false)
  }, [])

  useEffect(() => {
    // //console.log(currentTask,'current task..............')
    const getTaskDetails = async () => {
      if (!currentTask?.id) return
      setLoading(true)
      api.task
        .getTask(currentTask?.id)
        .then((res) => {
          if (res.success) {
            //console.log(res.task, '0000000000000000')
            setTaskDetails(res.task)
            // dispatch(setCurrentTask(res.task))
            setWorkingHours(res?.task?.working_hours)
            setTimeTracker(res?.task?.time_tracking)
            setTimer(res?.task?.time_tracking?.total_time)
            setStatus(res?.task?.stage)
            // setShowTiming(true)
            userActivity.current = res?.task?.user_activities
            setSelectedSupervisors(
              res.task.user_supervisors.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedMembers(
              res.task.user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedClients(
              res.task.user_clients.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
          }
        })
        .catch((err) => {
          //console.log(err.response.data)
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
    }
    if (currentTask?.id) getTaskDetails()
  }, [
    refetch,
    isFocused,
    refresh,
    showMemberPickerModal,
    showSupervisorPickerModal,
    showClientPickerModal,
    currentTask,
    status,
  ])

  useEffect(() => {
    dispatch(setNormal())
  }, [])

  useEffect(() => {
    dispatch(setCurrentTask(taskDetails))
  }, [taskDetails?.id])

  const naviGateToFileScreenAndOpenAddFileModal = () => {
    navigation.navigate('ProjectFiles', {
      taskId: id,
      taskName: taskDetails.name,
      fromTask: true,
      hidePlus: true,
    })
    dispatch(setShowFileUploadModal())
  }

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
    if (count === 'issues') {
      fuctionalitylength = taskDetails?.issues_count
    } else if (count === 'attachments') {
      fuctionalitylength = taskDetails?.attachments_count
    } else if (count === 'todo_lists') {
      fuctionalitylength = taskDetails?.todolists_count
    } else if (name === 'Activity') {
      fuctionalitylength = taskDetails?.user_activities_count
    }
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
                if (name !== 'Chat') {
                  if (name == 'Activity') {
                    navigation.navigate(navigationName, {
                      // activity: userActivity.current,
                      title: taskDetails?.name,
                      state: 'Task',
                      loggerId: taskDetails?.id,
                    })
                  } else if (name == 'Files') {
                    navigation.navigate(navigationName, {
                      id: taskDetails?.file_management?.id,
                      onlyFiles: true,
                    })
                  } else navigation.navigate(navigationName, viewNavigation)
                } else {
                  dispatch(setStage('task'))
                  navigation.navigate('Chat')
                }
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
                if (name == 'Chat') {
                  dispatch(setStage('task'))
                  navigation.navigate('Chat')
                } else if (name == 'Files') {
                  navigation.navigate(addNavigationName, {
                    id: taskDetails?.file_management?.id,
                    openAttachmentModal: true,
                    onlyFiles: true,
                  })
                } else if (name == 'Activity') {
                  setCommentModal(true)
                } else {
                  navigation.navigate(addNavigationName, addNavigation)
                }
              }}
            >
              <PlusIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Swipeable>
    )
  }

  const savedListFunctionality = () => {
    setListingFunc('taskLisitingFunctionality', functionalityListing)
    setDraggable(false)
  }
  let address = taskDetails?.address ? taskDetails?.address : ''
  let dateRange =
    extractCustomDateFomratWithTimezone(
      taskDetails.start_date,
      userSettings?.js_date_format,
      userSettings?.user_timezone
    ) +
    ' - ' +
    extractCustomDateFomratWithTimezone(
      taskDetails.end_date,
      userSettings?.js_date_format,
      userSettings?.user_timezone
    )

  const updateTask = () => {
    if (!dateSelected.firstDate || !dateSelected.secondDate) return
    let startDate = moment(dateSelected.firstDate).utc(true).toDate()
    let endDate = moment(dateSelected.secondDate).utc(true).toDate()
    const { acceptance_needed, priority, name, project_id } = taskDetails
    let body = {
      acceptance_needed,
      priority,
      name,
      project_id,
    }
    body['start_date'] = getDateTime(startDate)
    body['end_date'] = getDateTime(endDate)
    body['_method'] = 'PUT'

    api.task
      .updateTask(body, id)
      .then((res) => {
        if (res.success) {
          // //console.log(res.success,"))))))))))))))))))")
          setRefresh((prev) => !prev)
        }
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }

  const updateTaskStatus = async (status) => {
    let body = {
      stage: status,
    }
    api.task
      .changeTaskStatus(body, taskDetails.id)
      .then((res) => {
        if (res.success) {
          setStatus(status)
          Alert.alert(res.message)
          setRefresh((prev) => !prev)
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
  }

  const completeWorking = () => {
    //console.log(taskDetails.id, 'task id')
    setLoading(true)
    let body = {
      type: 'task',
    }
    api.workingHour
      .completeHour(body, taskDetails.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, '#########################')
          setRefresh((prev) => !prev)
          // setStatus(status)
          // Alert.alert(res.message)
        }
      })
      .catch((err) => {
        //console.log(err, 'error...........')
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
  }

  const taskReviewAccept = () => {
    // //console.log(taskDetails.id,'task id')
    setLoading(true)
    let body = {
      type: 'task',
    }
    api.workingHour
      .reviewAccept(body, taskDetails.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, '#########################')
          setRefresh((prev) => !prev)
          // setStatus(status)
          // Alert.alert(res.message)
        }
      })
      .catch((err) => {
        //console.log(err, 'error...........')
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
  }

  const taskReviewDecline = () => {
    // //console.log(taskDetails.id,'task id')
    setLoading(true)
    let body = {
      type: 'task',
    }
    api.workingHour
      .reviewDecline(body, taskDetails.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, '#########################')
          setRefresh((prev) => !prev)
          // setStatus(status)
          // Alert.alert(res.message)
        }
      })
      .catch((err) => {
        //console.log(err, 'error...........')
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
  }

  const updateTaskWorking = async (status) => {
    // //console.log(workingHours,'working hours')
    if (!taskDetails?.is_can_start_working) return
    if (taskDetails?.is_can_start_working) {
      setLoading(true)
      let body = {
        type: 'task',
      }

      api.workingHour
        .startingHour(body, taskDetails.id)
        .then((res) => {
          if (res.success) {
            //console.log('start working...............')
            setRefresh((prev) => !prev)
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
    }
  }

  const startTimeTracking = async () => {
    // //console.log('start time tracking....')
    let body = {
      type: 'task',
    }

    api.timeTracking
      .timeTrackingStart(body, taskDetails.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, '....time tracking....')
          setRefresh((prev) => !prev)
        }
      })
      .catch((err) => {
        // //console.log(err, 'error...........')
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        // setLoading(false)
      })
  }
  // const items = [
  //   {
  //     label: 'Pause',
  //     image: <PauseIcon />,
  //   },
  //   {
  //     label: 'Stop',
  //     image: <StopIcon />,
  //   },
  // ]

  // const items = [{ label: 'Pause' }, { label: 'Stop' }, { label: 'Play' }]

  // const renderMenuIcon = (menuState) => {
  //   const { menuButtonDown } = menuState

  //   return menuButtonDown ? (
  //     <IconWrap
  //       // onPress={() => setShowTimeTrackingModal(true)}
  //       // onPress={handleMenuToggle}
  //       // outputRange={iconWrapColors}
  //       style={{ backgroundColor: colors.RED_NORMAL }}
  //     >
  //       <PlayIcon />
  //     </IconWrap>
  //   ) : (
  //     <IconWrap
  //       // onPress={() => setShowTimeTrackingModal(true)}
  //       onPress={handleMenuToggle}
  //       // outputRange={iconWrapColors}
  //       style={{ backgroundColor: colors.RED_NORMAL }}
  //     >
  //       <PlayIcon />
  //     </IconWrap>
  //   )
  // }

  // const renderItemIcon = (item, index, menuState) => {
  //   const { itemsDown, dimmerActive } = menuState

  //   const isItemPressed = itemsDown[index]
  //   //console.log(isItemPressed, 'is item pressed')
  //   return item.image
  // }

  //  setInterval(() => {
  //   // setStartTracking((pre)=> pre + 1)
  //   setTimer(pre => pre + 1)
  //   //console.log(timer)
  // }, 100000);

  useEffect(() => {
    //console.log('time  tracking....', timeTracker?.stage, showTiming)
    let interval
    if (timeTracker?.stage === 'work_start' && showTiming) {
      interval = setInterval(() => setTimer((pre) => pre + 1), 1000)
    }
    return () => {
      clearInterval(interval)
    }
  }, [timeTracker?.stage, showTiming])

  const attemptMove = async (project, milestone, copy) => {
    try {
      setBtnLoader(true)
      let params = {
        model_ids: [taskDetails.id],
        state: 'task',
        project_id: project.id,
        milestone_id: milestone.id,
        make_copy: copy,
      }
      milestone.id == -1 && delete params.milestone_id

      let res = await api.project.moveItems(params)
      if (res.success) {
        Alert.alert('Move Successful.')
        setShowMoveModal(false)
        setRefresh((prev) => !prev)
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
    }
  }

  const attemptDelete = async () => {
    try {
      if (id) {
        setBtnLoader(true)
        let res = await api.task.deleteTask(id)

        if (res.success) {
          setShowDeleteModal(false)
          navigation.navigate('Tasks', { refetch: Math.random() })
          Alert.alert('Delete Successful.')
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

  const attemptClone = async () => {
    try {
      setBtnLoader(true)
      if (id) {
        let res = await api.task.cloneTask({
          task_ids: [id],
        })
        //console.log(res)
        if (res.success) {
          setShowCloneModal(false)
          Alert.alert('Clone Successful.')
        }
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
    }
  }

  const { height, width } = Dimensions.get('window')

  return (
    <View
    style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
  >
    <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('TaskEdit', { id: id })}
        onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        onClone={() => setShowCloneModal(true)}
      />
      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        state={'task'}
        onMove={attemptMove}
        btnLoader={btnLoader}
      />
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateTask}
      />
      <DeclineModal
        visibility={showDeclineModal}
        setVisibility={setShowDeclineModal}
        taskId={taskDetails.id}
        moduleName={'task'}
        navigation={navigation}
        navigationName={'Tasks'}
      />
      <CompleteModal
        visibility={showCompleteModal}
        setVisibility={setShowCompleteModal}
        taskId={taskDetails.id}
        moduleName={'task'}
        navigation={navigation}
        navigationName={'Tasks'}
        setRefresh={setRefresh}
      />
      <MemberPickerModal
        visibility={showMemberPickerModal}
        setVisibility={setShowMemberPickerModal}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        modelId={taskDetails?.id}
        from={'task'}
        // alreadySelected={alreadySelectedMemebers}
      />
      <SupervisorPickerModal
        visibility={showSupervisorPickerModal}
        setVisibility={setShowSupervisorPickerModal}
        selected={selectedSupervisors}
        setSelected={setSelectedSupervisors}
        modelId={taskDetails?.id}
        from={'task'}
      />
      <ClientPickerModal
        visibility={showClientPickerModal}
        setVisibility={setShowClientPickerModal}
        selected={selectedClients}
        setSelected={setSelectedClients}
        modelId={taskDetails?.id}
        from={'task'}
      />

      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={taskDetails?.id}
        model={'Task'}
        setRefresh={setRefresh}
      />

      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to delete this Task? The Task will be clone with same state with its childs"
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone this Task? The Task will be clone with same state with its childs"
      />

      {/* <TrackingModal
        visibility={showTimeTrackingModal}
        setVisibility={setShowTimeTrackingModal}
        id={taskDetails?.id}
        type={'task'}
        setRefresh={setRefresh}
        timeTracker={timeTracker}
        setTimeTracker={setTimeTracker}
        detailsInfo= {taskDetails}
        navigation={navigation}
      /> */}

      {/* {startTracking?.stage  && <FloatingMenu
        items={items}
        isOpen={isMenuOpen}
        onMenuToggle={handleMenuToggle}
        onItemPress={handleItemPress}
        position={'top-left'}
        top={203}
        borderColor={'white'}
        // borderWidth={0}
        buttonWidth={24}
        left={26}
        renderMenuIcon={renderMenuIcon}
        renderItemIcon={renderItemIcon}
        backgroundDownColor={'gray'}
        // style={{borderWidth: 0}}
        // dimmerStyle={{backgroundColor:}}
        innerWidth={24}
      />} */}
      <View style={[s.outerContainer, { marginBottom: Platform.OS === 'ios' && height > 670 ? 80 : 64 }]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              // //console.log({ navigationFrom })
              if (navigationFrom === 'dashboard') {
                navigation.navigate('Home', { refetch: Math.random() })
              } else if (navigationFrom === 'GlobalSearch') {
                if (searchNavigationFrom) {
                  navigation.navigate('Search')
                } else {
                  navigation.jumpTo('Search')
                }
              } else if (navigationFrom === 'day') {
                navigation.navigate('DayView')
              } else if (navigationFrom === 'CalendarSearch') {
                navigation.navigate('CalendarSearch')
              } else if (navigationFrom === 'week') {
                navigation.navigate('WeekView')
              } else {
                navigation.navigate('Tasks', { refetch: Math.random(), taskId: taskDetails?.id })
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Task details</Text>
          <TouchableOpacity
            style={s.buttonGroup}
            onPress={() => {
              setShowSettingsModal(true)
            }}
          >
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={s.loaderConterainer}>
            <ActivityIndicator size="small" color={'blue'} />
          </View>
        )}
        {!loading && (
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ marginBottom: 24 }}>
              <CText style={[g.title2, s.titleText]}>
                {taskDetails.name}
                {/* {abbreviateString(taskDetails.name, 15)} */}
              </CText>
              <Text style={s.smallTitle}>{`${taskDetails?.project?.name} / ${
                taskDetails?.milestone ? taskDetails?.milestone?.name + ' / ' : ''
              }${taskDetails?.name} `}</Text>
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
                  Details
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
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <View>
                    <View style={s.containerLeft}>
                      <IconWrap
                        onPress={() => {
                          // if (
                          //   timeTracker?.stage === 'work_start' ||
                          //   timeTracker?.stage === 'work_pause'
                          // ) {
                          //   setShowTiming(false)
                          //   navigation.navigate('Timer', {
                          //     timeTracker: timeTracker,
                          //     detailsInfo: taskDetails,
                          //     showTiming: showTiming,
                          //     setShowTiming: setShowTiming,
                          //     type: 'task',
                          //   })
                          // } else if (timeTracker?.stage === 'work_completed') {
                          //   if (!taskDetails?.is_can_start_working) {
                          //     setShowTiming(true)
                          //     startTimeTracking()
                          //   } else {
                          //     Alert.alert('You need to start work first to enable time tracking.')
                          //   }
                          // } else {
                          //   !taskDetails?.is_can_start_working
                          //     ? startTimeTracking()
                          //     : Alert.alert('You need to start work first to enable time tracking.')
                          // }
                        }}
                        // onPress={handleMenuToggle}
                        outputRange={iconWrapColors}
                        // style={[
                        //   timeTracker?.stage === 'work_start' && {
                        //     backgroundColor: colors.RED_NORMAL,
                        //   },
                        // ]}
                      >
                        <ClockIcon />
                        {/* {timeTracker?.stage ? (
                          timeTracker?.stage === 'work_start' ? (
                            <PlayIcon />
                          ) : timeTracker?.stage === 'work_pause' ? (
                            <PauseIcon />
                          ) : (
                            <ClockIcon />
                          )
                        ) : (
                          <ClockIcon />
                        )} */}
                      </IconWrap>

                      <CText style={s.normalText}>{secondtoHms(timer)}</CText>
                    </View>
                    <TouchableOpacity
                      style={s.containerLeft}
                      onPress={() => setDatePickerVisible((prev) => !prev)}
                    >
                      <IconWrap
                        onPress={() => setDatePickerVisible((prev) => !prev)}
                        outputRange={iconWrapColors}
                      >
                        <CalendarIcon fill={colors.NORMAL} />
                      </IconWrap>
                      <CText style={s.normalText}>{dateRange}</CText>
                    </TouchableOpacity>
                    {address && (
                      <TouchableOpacity
                        style={s.containerLeft}
                        onPress={() =>
                          Linking.openURL('https://www.google.com/maps/search/' + address)
                        }
                      >
                        <IconWrap onPress={() => {}} outputRange={iconWrapColors}>
                          <LocationIcon />
                        </IconWrap>
                        <CText style={s.normalText}>{address}</CText>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={s.containerLeft}>
                    <Text
                      style={[
                        g.gCardStatus,
                        status && {
                          backgroundColor: FilterColors[status].color,
                        },
                      ]}
                    >
                      {status}
                    </Text>
                    <Text
                      style={[
                        g.gCardStatus,
                        { backgroundColor: 'white', marginLeft: 10 },
                        taskDetails.priority && {
                          color: PriorityColors[taskDetails.priority].color,
                        },
                      ]}
                    >
                      {capitalizeFirstLetter(taskDetails.priority)}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.CONTAINER_BG, marginBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        flex: 1,
                      }}
                    >
                      <Text style={[g.body2, { marginRight: 4 }]}>Progress: </Text>
                      <DetailsCompletion
                        style={{ flex: 1 }}
                        type={'task'}
                        id={taskDetails.id}
                        status={status}
                        progressData={{
                          completion: taskDetails?.progress?.completion,
                          is_can_completion: taskDetails?.progress?.is_can_completion,
                        }}
                        updateTaskWorking={updateTaskWorking}
                        setRefresh={setRefresh}
                      />
                    </View>

                    <ProgressBar
                      title={'Time:'}
                      sliderText={'ahead of schedule'}
                      type={'task'}
                      id={taskDetails.id}
                      status={status}
                      progressData={{
                        completion: taskDetails?.progress?.time,
                        is_can_completion: false,
                      }}
                      // style={{backgroundColor:'green'}}
                    />
                  </View>
                  <View style={[s.headerContainer, { marginVertical: 16 }]}>
                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                      <CSelectedUserForDetails
                        label={'Owner'}
                        selectedUsers={
                          taskDetails['user_owner'] ? [taskDetails['user_owner']] : []
                        }
                      />
                      <CSelectedUserForDetails
                        navigationFrom={'details'}
                        userSelection={openSupervisorPickerModal}
                        label={'Supervisor'}
                        selectedUsers={
                          taskDetails['user_supervisors']
                            ? taskDetails['user_supervisors']
                            : []
                        }
                      />
                    </View>
                  </View>
                  <View style={[s.headerContainer, { marginBottom: 16 }]}>
                    <View style={{ flex: 1, flexDirection: 'row', gap:8 }}>
                      <CSelectedUserForDetails
                        navigationFrom={'details'}
                        label={'Members'}
                        userSelection={openMemberPickerModal}
                        selectedUsers={
                          taskDetails['user_members'] ? taskDetails['user_members'] : []
                        }
                      />
                      <CSelectedUserForDetails
                        navigationFrom={'details'}
                        userSelection={openClientPickerModal}
                        label={'Clients'}
                        selectedUsers={
                          taskDetails['user_clients'] ? taskDetails['user_clients'] : []
                        }
                      />
                    </View>
                  </View>

                  {/* <View style={s.headerContainer}>
                    <View>
                      <CText
                        style={[
                          s.smallText,
                          taskDetails['user_members']?.length >= 2 && { marginLeft: 10 },
                        ]}
                      >
                        Members
                      </CText>
                      <CSelectedUsersWithEdit
                        style={[taskDetails['user_members']?.length >= 2 && { marginLeft: 10 }]}
                        userSelection={openMemberPickerModal}
                        selectedUsers={
                          taskDetails['user_members'] ? taskDetails['user_members'] : []
                        }
                      />
                    </View>
                    <View style={[taskDetails['user_members']?.length >= 2 && { marginLeft: -30 }]}>
                      <CText style={[s.smallText]}>Owner</CText>
                      <CSelectedUsersWithEdit
                        // userSelection={openMemberPickerModal}
                        selectedUsers={taskDetails['user_owner'] ? [taskDetails['user_owner']] : []}
                      />
                    </View>
                    <View>
                      <CText style={s.smallText}>Supervisors</CText>
                      <CSelectedUsersWithEdit
                        userSelection={openSupervisorPickerModal}
                        selectedUsers={
                          taskDetails['user_supervisors'] ? taskDetails['user_supervisors'] : []
                        }
                      />
                    </View>
                  </View> */}
                  {taskDetails?.description?.value && (
                    <DescriptionComponent description={taskDetails?.description?.value} />
                  )}
                  {/* <View style={{ marginBottom: 16, marginTop: 8 }}>
                    {!readMore && taskDetails?.description?.value.length > 100 ? (
                      <CText style={s.descriptionText}>
                        {taskDetails?.description?.value.slice(0, 100) + '...'}
                        <Text style={{ color: '#246BFD' }} onPress={() => setReadMore(true)}>
                          {' '}
                          Read More
                        </Text>
                      </CText>
                    ) : (
                      <CText style={s.descriptionText}>{taskDetails?.description?.value}</CText>
                    )}
                  </View> */}
                </ScrollView>
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

            <View>
              {draggable ? (
                <CButtonInput label="Save" onPress={savedListFunctionality} style={s.margin1x} />
              ) : (
                <>
                  {(status == 'New' || status == 'In Progress') &&
                    taskDetails?.is_can_start_working && (
                      <View style={{ flexDirection: 'row' }}>
                        <CButton
                          style={[s.margin1x, { backgroundColor: '#E9203B', width: '49%' }]}
                          onPress={openDeclineModal}
                        >
                          <CText style={g.title3}>Decline</CText>
                        </CButton>
                        <CButton
                          style={[
                            s.margin1x,
                            { backgroundColor: '#246BFD', width: '49%', marginLeft: 10 },
                          ]}
                          onPress={() => updateTaskWorking('In Progress')}
                          loading={loading}
                        >
                          <CText style={g.title3}>Start working</CText>
                        </CButton>
                      </View>
                    )}
                  {status === 'In Progress' && !taskDetails?.is_can_start_working && (
                    <View style={{ flexDirection: 'row' }}>
                      <CButton
                        style={[s.margin1x, { backgroundColor: '#246BFD', width: '100%' }]}
                        // onPress={completeWorking}
                        onPress={openCompleteModal}
                        loading={loading}
                      >
                        <CText style={g.title3}>Complete</CText>
                      </CButton>
                    </View>
                  )}
                  {status === 'Review' && user?.role.name === 'Member' && (
                    <View style={{ flexDirection: 'row' }}>
                      <CButton
                        style={[s.margin1x, { backgroundColor: colors.REVIEW_BG, width: '100%' }]}
                        // onPress={completeWorking}
                        // loading={loading}
                      >
                        <CText style={g.title3}>Waiting for Review</CText>
                      </CButton>
                    </View>
                  )}
                  {status === 'Review' &&
                    (user?.role.name === 'Supervisor' || user?.role.name === 'Owner') && (
                      <View style={{ flexDirection: 'row' }}>
                        <CButton
                          style={[
                            s.margin1x,
                            { backgroundColor: '#E9203B', width: '50%', marginRight: 8 },
                          ]}
                          onPress={taskReviewDecline}
                          loading={loading}
                        >
                          <CText style={g.title3}>Decline</CText>
                        </CButton>
                        <CButton
                          style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                          onPress={taskReviewAccept}
                          loading={loading}
                        >
                          <CText style={g.title3}>Accept</CText>
                        </CButton>
                      </View>
                    )}
                  {/* {status === 'Review' &&
                    (user?.role.name === 'Supervisor' || user?.role.name === 'Owner') && (
                      <View style={{ flexDirection: 'row' }}>
                        <CButton
                          style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                          onPress={() => updateTaskStatus('Completed')}
                          loading={loading}
                        >
                          <CText style={g.title3}>Accept</CText>
                        </CButton>
                        <CButton
                          style={[
                            s.margin1x,
                            { backgroundColor: '#E9203B', width: '50%', marginLeft: 10 },
                          ]}
                          onPress={() => updateTaskStatus('In Progress')}
                          loading={loading}
                        >
                          <CText style={g.title3}>Decline</CText>
                        </CButton>
                      </View>
                    )} */}
                  {status === 'Completed' && (
                    <View style={[s.listItemContainer, { width: '100%' }]}>
                      <CButton
                        style={[s.reOpenButton]}
                        onPress={() => updateTaskStatus('In Progress')}
                        loading={loading}
                      >
                        <CText style={g.title3}>Re-Open Task</CText>
                      </CButton>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* <View style={s.divider}></View> */}
      </View>
      {/* </View> */}
    </View>
  )
}

export default TaskDetailsScreen

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
    // paddingTop: Platform.OS !== 'ios' ? StatusBar.currentHeight : StatusBar.currentHeight + 25,
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    // marginBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
    // backgroundColor:'yellow',
  },
  loaderConterainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
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
    flex: 1,
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
    borderRadius: 8,
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
    marginBottom: 8,
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
})
