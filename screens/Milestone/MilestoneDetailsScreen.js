import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import ClockIcon from '../../assets/svg/clock.svg'
import MoreIcon from '../../assets/svg/more.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { FilterColors, PriorityColors } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import GripIcon from '../../assets/svg/grip.svg'
import LocationIcon from '../../assets/svg/location-blue.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'
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
import DateRangePickerModal from '../../components/modals/DateRangePickerModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import MoveModal from '../../components/modals/MoveModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import {
  setCurrentMilestone,
  setCurrentTask,
  setCurrentTaskIds,
  setStage,
} from '../../store/slices/navigation'
import { setNormal, setShowFileUploadModal } from '../../store/slices/tab'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import {
  extractCustomDateFomratWithTimezone,
  getDateTime
} from '../../utils/Timer'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

export default function MilestoneDetailsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const [milestoneDetails, setMilestoneDetails] = useState({})
  const [detailsScreen, setDetailsScreen] = useState('details')
  const [status, setStatus] = useState(milestoneDetails && milestoneDetails.stage)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const { currentMilestone, currentProject, navigationFrom, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )
  const [taskIds, setTaskIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [functionalityListing, setFuntionalityListing] = useState([])
  const [draggable, setDraggable] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [dateSelected, setDateSelected] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const userActivity = useRef(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const [timeTracker, setTimeTracker] = useState(null)
  const [showTiming, setShowTiming] = useState(true)
  const [timer, setTimer] = useState(0)
  const [commentModal, setCommentModal] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const { userSettings } = useSelector((state) => state.user)

  const openMemberPickerModal = () => {
    setShowMemberPickerModal(true)
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

  const diff = useSharedValue(0)
  const prev = useSharedValue(0)
  const headerY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, 135)
    return {
      transform: [
        {
          translateY: withTiming(-dy * 5),
        },
      ],
    }
  })

  const paddingY = useAnimatedStyle(() => {
    const dy = clamp(diff.value, 0, 124)
    let timing = Math.max(0, 124 - dy * 5)
    //console.log(timing, 'timing...')

    return {
      marginTop: withTiming(timing),
    }
  })

  const milestoneFunctionalities = [
    {
      id: 8,
      name: 'Activity',
      navigationName: 'Activity',
      viewNavigation: {},
      count: 'activity',
      addNavigationName: '',
      addNavigation: { milestone: { id: id, name: milestoneDetails?.name } },
    },
    {
      id: 1,
      name: 'Tasks',
      navigationName: 'Tasks',
      viewNavigation: { milestoneId: currentMilestone?.id },
      count: 'tasks',
      addNavigationName: 'TaskAdd',
      // addNavigation: { project: { id: id, name: milestoneDetails.name } },
    },
    {
      id: 2,
      name: 'Issues',
      navigationName: 'Issues',
      viewNavigation: { milestoneId: currentMilestone?.id },
      count: 'issues',
      addNavigationName: 'IssueAdd',
      // addNavigation: { project: { id: id, name: milestoneDetails.name } },
    },
    {
      id: 3,
      name: 'Files',
      navigationName: 'ProjectFolders',
      viewNavigation: {},
      count: 'attachments',
      addNavigationName: 'ProjectFolders',
      addNavigation: '',
    },
    {
      id: 5,
      name: 'Lists',
      navigationName: 'Checklist',
      viewNavigation: { parent_id: currentMilestone?.id },
      count: 'todo_lists',
      addNavigationName: 'ChecklistAdd',
      addNavigation:{
        showNameInputFirst:true,
        autoLoad: true,
      }
    },
    {
      id: 4,
      name: 'Chat',
      navigationName: 'Chat',
      viewNavigation: '',
      count: 0,
      addNavigationName: '',
      addNavigation: '',
    },
  ]

  useEffect(() => {
    getListingFunc('milestoneLisitingFunctionality').then((res) => {
      if (res) {
        setFuntionalityListing(res)
      } else {
        setFuntionalityListing(milestoneFunctionalities)
      }
    })
    setDraggable(false)
  }, [])

  useEffect(() => {
    const getMilestoneDetails = async () => {
      if (!currentMilestone) return
      setLoading(true)
      api.milestone
        .getMilestone(currentMilestone?.id)
        .then((res) => {
          if (res.success) {
            // //console.log(res.milestone, 'milestone...')
            setMilestoneDetails(res.milestone)
            setStatus(res.milestone.stage)
            setTimeTracker(res?.milestone?.time_tracking)
            setTimer(res?.milestone?.time_tracking?.total_time)
            userActivity.current = res?.milestone?.user_activities
            dispatch(setCurrentTaskIds(res.milestone.task_ids))
            setSelectedMembers(
              res.milestone.user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedSupervisors(
              res.milestone.user_supervisors.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedClients(
              res.milestone.user_clients.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
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
    getMilestoneDetails()
  }, [refetch, isFocused, status, refresh, showMemberPickerModal, showSupervisorPickerModal,showClientPickerModal])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      dispatch(setCurrentTask(null))
    }
  }, [isFocused])

  useEffect(() => {
    dispatch(setCurrentMilestone(milestoneDetails))
  }, [milestoneDetails?.id])

  useEffect(() => {
    //console.log(timeTracker?.stage)
    let interval
    if (timeTracker?.stage === 'work_start' && showTiming) {
      interval = setInterval(() => setTimer((pre) => pre + 1), 1000)
    }
    return () => {
      clearInterval(interval)
    }
  }, [timeTracker?.stage, showTiming])

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      // //console.log(e.contentOffset.y)
      prev.value = e.contentOffset.y
    },
    onScroll: (e) => {
      diff.value = e.contentOffset.y - prev.value - prev.value
    },
  })

  const naviGateToFileScreenAndOpenAddFileModal = () => {
    navigation.navigate('ProjectFiles', {
      milestoneId: id,
      milestoneName: milestoneDetails.name,
      fromMilestone: true,
      hidePlus: true,
    })
    // //console.log('naviGateToFileScreenAndOpenAddFileModal')
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
    if (count === 'tasks') {
      fuctionalitylength = milestoneDetails?.tasks_count
    } else if (count === 'issues') {
      fuctionalitylength = milestoneDetails?.issues_count
    } else if (count === 'attachments') {
      fuctionalitylength = milestoneDetails?.attachments_count
    } else if (count === 'activity') {
      fuctionalitylength = milestoneDetails?.user_activities_count
    } else if (count === 'todo_lists') {
      fuctionalitylength = milestoneDetails?.todolists_count
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
                      title: milestoneDetails?.name,
                      state: 'Milestone',
                      loggerId: milestoneDetails?.id,
                    })
                  } else if (name == 'Files') {
                    navigation.navigate(navigationName, {
                      id: milestoneDetails?.file_management?.id,
                      onlyFiles: true,
                    })
                  } else navigation.navigate(navigationName, viewNavigation)
                } else {
                  dispatch(setStage('milestone'))
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
                  dispatch(setStage('milestone'))
                  navigation.navigate('Chat')
                } else if (name == 'Files') {
                  navigation.navigate(addNavigationName, {
                    id: milestoneDetails?.file_management?.id,
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

  const updateMilestoneStatus = async (status) => {
    // //console.log('hit here......')

    // if (milestoneDetails?.id) return

    let body = {
      stage: status,
    }
    api.milestone
      .changeMilestoneStatus(body, milestoneDetails.id)
      .then((res) => {
        if (res.success) {
          // //console.log(status, 'status............')
          setStatus(status)
          Alert.alert(res.message)
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

  const savedListFunctionality = () => {
    setListingFunc('milestoneLisitingFunctionality', functionalityListing)
    setDraggable(false)
  }

  let dateRange =
    extractCustomDateFomratWithTimezone(
      milestoneDetails.start_date,
      userSettings?.js_date_format,
      userSettings?.user_timezone
    ) +
    ' - ' +
    extractCustomDateFomratWithTimezone(
      milestoneDetails.end_date,
      userSettings?.js_date_format,
      userSettings?.user_timezone
    )

  const updateMilestone = () => {
    if (!dateSelected.firstDate || !dateSelected.secondDate) return
    let startDate = moment(dateSelected.firstDate).utc(true).toDate()
    let endDate = moment(dateSelected.secondDate).utc(true).toDate()
    const { acceptance_needed, priority, name, project_id } = milestoneDetails
    let body = {
      acceptance_needed,
      priority,
      name,
      project_id,
    }
    body['start_date'] = getDateTime(startDate)
    body['end_date'] = getDateTime(endDate)
    body['_method'] = 'PUT'

    api.milestone
      .updateMilestone(body, id)
      .then((res) => {
        if (res.success) {
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

  const startTimeTracking = async () => {
    // //console.log('start time tracking....')
    let body = {
      type: 'milestone',
    }

    api.timeTracking
      .timeTrackingStart(body, milestoneDetails.id)
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

  const attemptMove = async (project, copy) => {
    try {
      setBtnLoader(true)
      let res = await api.project.moveItems({
        model_ids: [milestoneDetails.id],
        state: 'milestone',
        project_id: project.id,
        make_copy: copy,
      })
      if (res.success) {
        setShowMoveModal(false)
        setRefresh((prev) => !prev)
        Alert.alert('Move Successful.')
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
        let res = await api.milestone.deleteMilestone(id)

        if (res.success) {
          setShowDeleteModal(false)
          navigation.navigate('Milestones', { refetch: Math.random() })
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
        let res = await api.milestone.cloneMilestones({
          milestone_ids: [id],
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

  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />

      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        state={'milestone'}
        onMove={attemptMove}
        btnLoader={btnLoader}
      />
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('MilestoneEdit', { id: id })}
        onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        onClone={() => setShowCloneModal(true)}
      />
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateMilestone}
      />
      <MemberPickerModal
        visibility={showMemberPickerModal}
        setVisibility={setShowMemberPickerModal}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        modelId={milestoneDetails?.id}
        from={'milestone'}
        // alreadySelected={alreadySelectedMemebers}
      />
      <SupervisorPickerModal
        visibility={showSupervisorPickerModal}
        setVisibility={setShowSupervisorPickerModal}
        selected={selectedSupervisors}
        setSelected={setSelectedSupervisors}
        modelId={milestoneDetails?.id}
        from={'milestone'}
      />
      <ClientPickerModal
        visibility={showClientPickerModal}
        setVisibility={setShowClientPickerModal}
        selected={selectedClients}
        setSelected={setSelectedClients}
        modelId={milestoneDetails?.id}
        from={'milestone'}
      />
      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={milestoneDetails?.id}
        model={'Milestone'}
        setRefresh={setRefresh}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to delete this Milestone? The Milestone will be clone with same state with its childs"
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        // setSelectable={setSelectable}
        // multipleSelect={multipleSelect}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone this Milestone? The Milestone will be clone with same state with its childs"
      />
      <View style={[s.outerContainer]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              if (navigationFrom === 'dashboard') {
                navigation.navigate('Home', { refetch: Math.random() })
              } else if (navigationFrom === 'GlobalSearch') {
                if (searchNavigationFrom) {
                  navigation.navigate('Search')
                } else {
                  navigation.jumpTo('Search')
                }
              } else if (navigationFrom == 'day') {
                navigation.navigate('DayView')
              } else if (navigationFrom == 'CalendarSearch') {
                navigation.navigate('CalendarSearch')
              } else if (navigationFrom === 'week') {
                navigation.navigate('WeekView')
              } else {
                navigation.navigate('Milestones', { refetch: Math.random() })
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Milestone details</Text>
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
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={'blue'} />
          </View>
        )}
        {!loading && (
          <View style={{ flex: 1, width: '100%' }}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  backgroundColor: colors.PRIM_BG,
                },
                headerY,
              ]}
            >
              <View style={{ marginBottom: 16, marginTop: 8 }}>
                <CText style={[g.title2, s.titleText]}>
                  {milestoneDetails.name}
                  {/* {abbreviateString(milestoneDetails.name, 15)} */}
                </CText>
                <Text
                  style={s.smallTitle}
                >{`${milestoneDetails?.project?.name} / ${milestoneDetails?.name} `}</Text>
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
              {/* {detailsScreen === 'functionality' && (
                <>
                  
                </>
              )} */}
            </Animated.View>
            <View style={{ flex: 1 }}>
              {detailsScreen === 'details' && (
                <Animated.ScrollView
                  onScroll={scrollHandler}
                  style={[paddingY]}
                  showsVerticalScrollIndicator={false}
                >
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
                          //     detailsInfo: milestoneDetails,
                          //     showTiming: showTiming,
                          //     setShowTiming: setShowTiming,
                          //     type: 'milestone',
                          //   })
                          // } else if (timeTracker?.stage === 'work_completed') {
                          //   setShowTiming(true)
                          //   startTimeTracking()
                          // } else {
                          //   startTimeTracking()
                          // }
                        }}
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
                      <CText style={s.normalText}>
                        {"00h:00m:00s"}
                        {/* {timeTracker
                          ? timeTracker?.stage === 'work_completed'
                            ? milestoneDetails?.progress?.expend_time
                            : secondtoHms(timer)
                          : milestoneDetails?.progress?.expend_time} */}
                      </CText>
                    </View>
                    <TouchableOpacity
                      style={s.containerLeft}
                      onPress={() => setDatePickerVisible((prev) => !prev)}
                    >
                      <IconWrap onPress={() => {}} outputRange={iconWrapColors}>
                        <CalendarIcon fill={colors.NORMAL} />
                      </IconWrap>
                      <CText style={s.normalText}>{dateRange}</CText>
                    </TouchableOpacity>
                    {milestoneDetails?.address && (
                      <TouchableOpacity
                        style={s.containerLeft}
                        onPress={() => {
                          milestoneDetails?.address
                            ? Linking.openURL(
                                `http://maps.google.com/?q=${milestoneDetails?.address.replace(
                                  ' ',
                                  '+'
                                )}`
                              )
                            : console.log('No address')
                        }}
                      >
                        <IconWrap onPress={() => {}} outputRange={iconWrapColors}>
                          <LocationIcon />
                        </IconWrap>
                        <CText style={[s.normalText, { flex: 1 }]}>
                          {milestoneDetails?.address ? milestoneDetails?.address : ''}
                        </CText>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={s.containerLeft}>
                    <Text
                      style={[
                        g.gCardStatus,
                        milestoneDetails?.stage && {
                          backgroundColor: FilterColors[milestoneDetails?.stage].color,
                        },
                      ]}
                    >
                      {milestoneDetails.stage}
                    </Text>
                    <Text
                      style={[
                        g.gCardStatus,
                        { backgroundColor: 'white', marginLeft: 10 },
                        milestoneDetails.priority && {
                          color: PriorityColors[milestoneDetails.priority].color,
                        },
                      ]}
                    >
                      {capitalizeFirstLetter(milestoneDetails.priority)}
                    </Text>
                  </View>
                  {/* <DetailsCompletion
                    type={'milestone'}
                    id={milestoneDetails?.id}
                    status={milestoneDetails?.stage}
                    progressData={{
                      completion: milestoneDetails?.progress?.completion,
                      is_can_completion: milestoneDetails?.progress?.is_can_completion,
                    }}
                  /> */}
                  <View style={{ backgroundColor: colors.CONTAINER_BG }}>
                    <ProgressBar
                      title={'Progress:'}
                      // sliderText={'ahead of schedule'}
                      type={'milestone'}
                      id={milestoneDetails.id}
                      status={status}
                      progressData={{
                        completion: milestoneDetails?.progress?.completion,
                        is_can_completion: milestoneDetails?.progress?.is_can_completion,
                      }}
                      // style={{backgroundColor:'yellow'}}
                    />
                    <ProgressBar
                      title={'Time: '}
                      sliderText={'ahead of schedule'}
                      type={'milestone'}
                      id={milestoneDetails.id}
                      status={status}
                      progressData={{
                        completion: milestoneDetails?.progress?.time,
                        is_can_completion: false,
                      }}
                    />
                    {/* <ProgressBar
                      title={'Cost: '}
                      sliderText={'under budget'}
                      type={'milestone'}
                      id={milestoneDetails.id}
                      status={milestoneDetails?.stage}
                      progressData={{
                        completion: milestoneDetails?.progress?.cost,
                        is_can_completion: false,
                      }}
                    /> */}
                  </View>

                  <View style={[s.headerContainer, { marginVertical: 16 }]}>
                      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <CSelectedUserForDetails
                          label={'Owner'}
                          selectedUsers={
                            milestoneDetails['user_owner'] ? [milestoneDetails['user_owner']] : []
                          }
                        />
                        <CSelectedUserForDetails
                          navigationFrom={'details'}
                          userSelection={openSupervisorPickerModal}
                          label={'Supervisor'}
                          selectedUsers={
                            milestoneDetails['user_supervisors']
                              ? milestoneDetails['user_supervisors']
                              : []
                          }
                        />
                      </View>
                    </View>
                    <View style={[s.headerContainer, { marginBottom: 16 }]}>
                      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <CSelectedUserForDetails
                          navigationFrom={'details'}
                          label={'Members'}
                          userSelection={openMemberPickerModal}
                          selectedUsers={
                            milestoneDetails['user_members'] ? milestoneDetails['user_members'] : []
                          }
                        />
                        <CSelectedUserForDetails
                          navigationFrom={'details'}
                          userSelection={openClientPickerModal}
                          label={'Clients'}
                          selectedUsers={
                            milestoneDetails['user_clients'] ? milestoneDetails['user_clients'] : []
                          }
                        />
                      </View>
                    </View>
                  {milestoneDetails?.description?.value && (
                    <DescriptionComponent description={milestoneDetails?.description?.value} />
                  )}
                  {/* <View style={{ marginBottom: 16, marginTop: 8 }}>
                    {!readMore && milestoneDetails?.description?.value.length > 100 ? (
                      <CText style={s.descriptionText}>
                        {milestoneDetails?.description?.value.slice(0, 100) + '...'}
                        <Text style={{ color: '#246BFD' }} onPress={() => setReadMore(true)}>
                          {' '}
                          Read More
                        </Text>
                      </CText>
                    ) : (
                      <CText style={s.descriptionText}>
                        {milestoneDetails?.description?.value}
                      </CText>
                    )}
                  </View> */}
                </Animated.ScrollView>
              )}

              {detailsScreen === 'functionality' && (
                <DraggableFlatList
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={() => (
                    <Animated.View style={[{ marginTop: 100, marginBottom: 16 }]}></Animated.View>
                  )}
                  data={functionalityListing}
                  onDragBegin={() => {}}
                  onDragEnd={({ data }) => {
                    setFuntionalityListing(data)
                  }}
                  keyExtractor={(item) => item.id}
                  onScrollOffsetChange={(offset) => {
                    diff.value = offset - prev.value
                  }}
                  onScrollBeginDrag={(e) => {
                    prev.value = e.nativeEvent.contentOffset.y
                  }}
                  renderItem={(props) => <ListingFunctionality {...props} />}
                  containerStyle={{
                    width: '100%',
                    flex: 1,
                    flexDirection: 'row',
                    height: '100%',
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                />
              )}
              <View style={[Platform.OS === 'ios' ? { marginBottom: 24 } : null]}>
                {draggable ? (
                  <CButtonInput label="Save" onPress={savedListFunctionality} />
                ) : (
                  <View>
                    {(status === 'New' ||
                      status === 'In Progress' ||
                      status === 'Review' ||
                      status === 'Issue') && (
                      <View style={[s.listItemContainer, { width: '100%' }]}>
                        <CButton
                          style={[s.reOpenButton]}
                          onPress={() => updateMilestoneStatus('Completed')}
                        >
                          <CText style={g.title3}>Complete</CText>
                        </CButton>
                      </View>
                    )}

                    {status === 'Completed' && <></>}
                  </View>
                )}
              </View>
              {/* <View>
                {draggable ? (
                  <CButtonInput label="Save" onPress={savedListFunctionality} style={s.margin1x} />
                ) : (
                  <View>
                    {status == 'Completed' ? (
                      <></>
                    ) : (
                      <View style={[s.listItemContainer, { width: '100%' }]}>
                        <CButton
                          style={[s.reOpenButton]}
                          onPress={() => updateMilestoneStatus('Completed')}
                        >
                          <CText style={g.title3}>Complete</CText>
                        </CButton>
                      </View>
                    )}
                  </View>
                )}
              </View> */}
            </View>
            {/* <View>{}</View> */}
          </View>
        )}

        {/* <View style={s.divider}></View> */}
      </View>
      {/* </View> */}
    </View>
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
    // paddingTop: Platform.OS !== 'ios' ? StatusBar.currentHeight : StatusBar.currentHeight + 25,
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 60,
    // paddingTop: 10,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
    zIndex: 10,
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
    marginVertical: 8,
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
    marginBottom: 8,
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
    marginBottom: 16,
    // backgroundColor:"green"
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
