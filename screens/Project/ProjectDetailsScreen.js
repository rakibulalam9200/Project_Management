import AsyncStorage from '@react-native-async-storage/async-storage'
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
import GripIcon from '../../assets/svg/grip.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { Dimensions } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
// import RenderHTML from 'react-native-render-html'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { FilterColors, PriorityColors } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import ClockIcon from '../../assets/svg/clock.svg'
import LocationIcon from '../../assets/svg/location-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'
import ProgressBar from '../../components/Completion/ProgressBar'
import CButton from '../../components/common/CButton'
import CButtonInput from '../../components/common/CButtonInput'
import CSelectedUserForDetails from '../../components/common/CSelectedUserForDetails'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import DescriptionComponent from '../../components/common/DescriptionComponent'
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import CommentModal from '../../components/modals/CommentModal'
import DateRangePickerModal from '../../components/modals/DateRangePickerModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import ProjectDetailsSettingsModal from '../../components/modals/ProjectDetailsSettingModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import { setStage } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { extractCustomDateFomratWithTimezone, getDateTime, secondtoHms } from '../../utils/Timer'

const clamp = (value, lowerBound, upperBound) => {
  'worklet'
  return Math.min(Math.max(lowerBound, value), upperBound)
}

const { height, width } = Dimensions.get('window')
export default function ProjectDetailsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let moreTab = route.params ? route.params.moreTab : null
  const { currentProject, navigationFrom, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )
  let refetch = route.params ? route.params?.refetch : null
  const [projectDetails, setProjectDetails] = useState({})
  const [description, setDescription] = useState('')
  const [detailsScreen, setDetailsScreen] = useState('details')
  const [status, setStatus] = useState(projectDetails && projectDetails.stage)
  const [sliderValue, setSliderValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [functionalityListing, setFuntionalityListing] = useState([])
  const [draggable, setDraggable] = useState(false)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const userActivity = useRef(null)
  const [dateSelected, setDateSelected] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [commentModal, setCommentModal] = useState(false)
  const [timeTracker, setTimeTracker] = useState(null)
  const [showTiming, setShowTiming] = useState(true)
  const [timer, setTimer] = useState(0)
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

  const projectFunctionalities = [
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
      name: 'Milestones',
      navigationName: 'Milestones',
      viewNavigation: { projectId: id },
      count: 'milestones',
      addNavigationName: 'MilestoneAdd',
      addNavigation: { project: { id: id, name: projectDetails.name } },
    },
    {
      id: 2,
      name: 'Tasks',
      navigationName: 'Tasks',
      viewNavigation: { projectId: id, onlyProject: 1 },
      count: 'tasks',
      addNavigationName: 'TaskAdd',
      addNavigation: { project: { id: id, name: projectDetails.name } },
    },
    {
      id: 3,
      name: 'Issues',
      navigationName: 'Issues',
      viewNavigation: { projectId: id, onlyProject: 1  },
      count: 'issues',
      addNavigationName: 'IssueAdd',
      addNavigation: { project: { id: id, name: projectDetails.name } },
    },
    {
      id: 4,
      name: 'Notes',
      navigationName: 'Notes',
      viewNavigation: { projectId: id },
      count: 'notes',
      addNavigationName: 'NoteAdd',
      addNavigation: {
        project: { id: id, name: projectDetails.name, from: 'projectDetails' },
        backScreen: true,
      },
    },
    {
      id: 5,
      name: 'Lists',
      navigationName: 'Checklist',
      viewNavigation: { projectId: id },
      count: 'lists',
      addNavigationName: 'ChecklistAdd',
      addNavigation: { autoLoad: true, showNameInputFirst: true },
    },
    {
      id: 6,
      name: 'Files',
      navigationName: 'ProjectFolders',
      viewNavigation: {
        id: projectDetails?.file_management?.id,
      },
      count: 'attachments',
      addNavigationName: 'ProjectFolders',
      addNavigation: {
        openAttachmentModal: true,
      },
    },
    {
      id: 7,
      name: 'Chat',
      navigationName: 'Chat',
      viewNavigation: '',
      count: 0,
      addNavigationName: '',
      addNavigation: '',
    },
  ]

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
    const dy = clamp(diff.value, 0, 100)

    return {
      marginTop: withTiming(Math.max(0, 100 - dy * 5)),
    }
  })

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      // //console.log(e.contentOffset.y)
      prev.value = e.contentOffset.y
    },
    onScroll: (e) => {
      diff.value = e.contentOffset.y - prev.value - prev.value
    },
  })

  //(projectDetails?.notes && projectDetails.notes.length) || '0'

  useEffect(() => {
    // setFuntionalityListing(projectFunctionalities)
    getListingFunc('projectLisitingFunctionality').then((res) => {
      if (res) {
        // //console.log(res,'project functionality liting.......')
        setFuntionalityListing(res)
      } else {
        setFuntionalityListing(projectFunctionalities)
      }
    })
    setDraggable(false)
  }, [])

  useEffect(() => {
    // setDraggable(false)
    const getProjectDetails = async () => {
      if (!currentProject?.id) return
      setLoading(true)
      api.project
        .getProject(currentProject.id)
        .then((res) => {
          if (res.success) {
            //console.log(res.project, '')
            setProjectDetails(res.project)
            const desc = res.project?.description?.value
            setDescription(desc)
            setStatus(res.project.stage)
            setTimeTracker(res?.project?.time_tracking)
            setTimer(res?.project?.time_tracking?.total_time)
            userActivity.current = res?.project?.user_activities
            setSelectedMembers(
              res.project.user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedSupervisors(
              res.project.user_supervisors.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedClients(
              res.project.user_clients.map((user) => {
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

    getProjectDetails()
  }, [
    refetch,
    status,
    isFocused,
    showMemberPickerModal,
    showSupervisorPickerModal,
    refresh,
    showClientPickerModal,
  ])

  const updateProjectStatus = async (status) => {
    if (!currentProject) return
    let body = {
      stage: status,
    }
    api.project
      .changeStatus(body, projectDetails.id)
      .then((res) => {
        if (res.success) {
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

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

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
    if (count === 'milestones') {
      fuctionalitylength = projectDetails?.milestones_count
    } else if (count === 'tasks') {
      fuctionalitylength = projectDetails?.tasks_count
    } else if (count === 'issues') {
      fuctionalitylength = projectDetails?.issues_count
    } else if (count === 'notes') {
      fuctionalitylength = projectDetails?.notes_count
    } else if (count === 'attachments') {
      fuctionalitylength = projectDetails?.attachments_count
    } else if (count === 'lists') {
      fuctionalitylength = projectDetails?.todolists_count
    } else if (count === 'activity') {
      fuctionalitylength = projectDetails?.user_activities_count
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
          <TouchableOpacity
            style={[s.listItemContainer, { flex: 1 }]}
            onLongPress={() => {
              //console.log('clicked.')
            }}
          >
            <TouchableOpacity
              style={[s.listItemTitle]}
              onLongPress={() => {
                setDraggable((prev) => !prev)
              }}
              onPress={() => {
                if (name !== 'Chat') {
                  if (name == 'Activity') {
                    navigation.navigate(navigationName, {
                      // activity: projectDetails?.user_activities,
                      title: projectDetails?.name,
                      state: 'Project',
                      loggerId: projectDetails?.id,
                    })
                  } else if (name == 'Files') {
                    navigation.navigate(navigationName, {
                      id: projectDetails?.file_management?.id,
                      onlyFiles: true,
                    })
                  } else navigation.navigate(navigationName, viewNavigation)
                } else {
                  dispatch(setStage('project'))
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
              style={{ marginleft: 16 }}
              onPress={() => {
                if (name == 'Chat') {
                  dispatch(setStage('project'))
                  navigation.navigate('Chat')
                } else if (name == 'Files') {
                  //console.log(projectDetails?.file_management?.id)
                  navigation.navigate(addNavigationName, {
                    id: projectDetails?.file_management?.id,
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
    setListingFunc('projectLisitingFunctionality', functionalityListing)
    setDraggable(false)
  }

  const updateProject = () => {
    if (!dateSelected.firstDate || !dateSelected.secondDate) return
    let startDate = moment(dateSelected.firstDate).utc(true).toDate()
    let endDate = moment(dateSelected.secondDate).utc(true).toDate()
    const { acceptance_needed, priority, name, complete_method } = projectDetails
    let body = {
      acceptance_needed,
      priority,
      name,
      complete_method,
    }
    body['start_date'] = getDateTime(startDate)
    body['end_date'] = getDateTime(endDate)
    body['_method'] = 'PUT'

    api.project
      .updateProject(body, id)
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
      type: 'project',
    }

    api.timeTracking
      .timeTrackingStart(body, projectDetails.id)
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

  const attemptDelete = async () => {
    try {
      if (id) {
        setBtnLoader(true)
        let res = await api.project.deleteProject(id)

        if (res.success) {
          setShowDeleteModal(false)
          navigation.navigate('Projects', { refetch: Math.random() })
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
        let res = await api.project.cloneProjects({
          project_ids: [id],
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
      <ProjectDetailsSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('ProjectEdit', { id: id })}
        onDelete={() => setShowDeleteModal(true)}
        // onFilter={() => setShowFiltersModal(true)}
        onClone={() => setShowCloneModal(true)}
      />
      <MemberPickerModal
        visibility={showMemberPickerModal}
        setVisibility={setShowMemberPickerModal}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        modelId={projectDetails?.id}
        from={'project'}
        // alreadySelected={alreadySelectedMemebers}
      />
      <SupervisorPickerModal
        visibility={showSupervisorPickerModal}
        setVisibility={setShowSupervisorPickerModal}
        selected={selectedSupervisors}
        setSelected={setSelectedSupervisors}
        modelId={projectDetails?.id}
        from={'project'}
      />
      <ClientPickerModal
        visibility={showClientPickerModal}
        setVisibility={setShowClientPickerModal}
        selected={selectedClients}
        setSelected={setSelectedClients}
        modelId={projectDetails?.id}
        from={'project'}
      />
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateProject}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoader}
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        // setSelectable={setSelectable}
        // multipleSelect={multipleSelect}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone this Project? The Project will be clone with same state with its childs"
      />
      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={projectDetails?.id}
        model={'Project'}
        setRefresh={setRefresh}
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
              } else if (navigationFrom === 'Notification') {
                navigation.navigate('Notifications', { refetch: Math.random() })
              } else if (navigationFrom == 'day') {
                navigation.navigate('DayView')
              } else if (navigationFrom == 'CalendarSearch') {
                navigation.navigate('CalendarSearch')
              } else if (navigationFrom === 'week') {
                navigation.navigate('WeekView')
              } else {
                navigation.navigate('Projects', { refetch: Math.random() })
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Project details</Text>
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
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
            }}
          >
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
              <View>
                <View style={[s.headerContainer, { marginBottom: 8 }]}>
                  <CText style={[g.title2, s.titleText]}>
                    {projectDetails.name}
                    {/* {abbreviateString(projectDetails.name, 15)} */}
                  </CText>
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
                  
                )} */}
              </View>
            </Animated.View>
            <View style={{ flex: 1, width: '100%' }}>
              {/* <View style={{ height: 100 }}></View> */}
              <View style={{ flex: 1 }}>
                {detailsScreen === 'details' && (
                  <Animated.ScrollView
                    onScroll={scrollHandler}
                    style={[paddingY]}
                    showsVerticalScrollIndicator={false}
                  >
                    <View>
                      <View style={[s.containerLeft, { marginTop: 0 }]}>
                        <IconWrap
                          onPress={() => {
                          //   if (
                          //     timeTracker?.stage === 'work_start' ||
                          //     timeTracker?.stage === 'work_pause'
                          //   ) {
                          //     setShowTiming(false)
                          //     navigation.navigate('Timer', {
                          //       timeTracker: timeTracker,
                          //       detailsInfo: projectDetails,
                          //       showTiming: showTiming,
                          //       setShowTiming: setShowTiming,
                          //       type: 'project',
                          //     })
                          //   } else if (timeTracker?.stage === 'work_completed') {
                          //     setShowTiming(true)
                          //     startTimeTracking()
                          //   } else {
                          //     startTimeTracking()
                          //   }
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

                        {/* projectDetails?.progress?.expend_time */}
                        <CText style={s.normalText}>
                          {timeTracker
                            ? timeTracker?.stage === 'work_completed'
                              ? projectDetails?.progress?.expend_time
                              : secondtoHms(timer)
                            : projectDetails?.progress?.expend_time}
                        </CText>
                      </View>
                      <TouchableOpacity
                        style={[s.containerLeft]}
                        onPress={() => setDatePickerVisible((prev) => !prev)}
                      >
                        <IconWrap
                          onPress={() => setDatePickerVisible((prev) => !prev)}
                          outputRange={iconWrapColors}
                        >
                          <CalendarIcon fill={colors.NORMAL} />
                        </IconWrap>
                        {projectDetails.start_date && (
                          <CText style={s.normalText}>
                            {extractCustomDateFomratWithTimezone(
                              projectDetails.start_date,
                              userSettings?.js_date_format,
                              userSettings?.user_timezone
                            ) +
                              ' - ' +
                              extractCustomDateFomratWithTimezone(
                                projectDetails.end_date,
                                userSettings?.js_date_format,
                                userSettings?.user_timezone
                              )}
                          </CText>
                        )}
                      </TouchableOpacity>
                      <View style={[s.containerLeft, { marginTop: 0 }]}>
                        <View
                          style={{
                            width: 44,
                          }}
                        ></View>

                        {/* projectDetails?.progress?.expend_time */}
                        <View style={{ flex: 1, paddingLeft: 8 }}>
                          <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>
                            Time Constrain:
                          </Text>
                          <Text style={[g.body2, { color: colors.NORMAL, marginTop: 4 }]}>
                            Auto
                          </Text>
                        </View>
                      </View>
                      {projectDetails?.address && (
                        <TouchableOpacity
                          style={s.containerLeft}
                          onPress={() => {
                            projectDetails?.address
                              ? Linking.openURL(
                                  `http://maps.google.com/?q=${projectDetails?.address.replace(
                                    ' ',
                                    '+'
                                  )}`
                                )
                              : console.log('No address')
                          }}
                        >
                          <IconWrap
                            onPress={() => {
                              projectDetails?.address
                                ? Linking.openURL(
                                    `http://maps.google.com/?q=${projectDetails?.address.replace(
                                      ' ',
                                      '+'
                                    )}`
                                  )
                                : console.log('No address')
                            }}
                            outputRange={iconWrapColors}
                          >
                            <LocationIcon />
                          </IconWrap>
                          <CText style={[s.normalText, { flex: 1 }]}>
                            {projectDetails?.address !== 'null' && projectDetails?.address}
                          </CText>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D6E2FF',
                        marginVertical: 12,
                      }}
                    ></View>

                    <View style={s.containerLeft}>
                      <Text
                        style={[
                          g.gCardStatus,
                          status && { backgroundColor: FilterColors[status].color },
                        ]}
                      >
                        {status}
                      </Text>
                      <Text
                        style={[
                          g.gCardStatus,
                          { backgroundColor: 'white', marginLeft: 10 },
                          projectDetails.priority && {
                            color: PriorityColors[projectDetails.priority].color,
                          },
                        ]}
                      >
                        {capitalizeFirstLetter(projectDetails.priority)}
                      </Text>
                    </View>

                    <View style={{ backgroundColor: colors.CONTAINER_BG }}>
                      <ProgressBar
                        title={'Progress:'}
                        // sliderText={'ahead of schedule'}
                        type={'project'}
                        id={projectDetails.id}
                        status={status}
                        progressData={{
                          completion: projectDetails?.progress?.completion,
                          is_can_completion: projectDetails?.progress?.is_can_completion,
                        }}
                        // style={{backgroundColor:'yellow'}}
                      />
                      <ProgressBar
                        title={'Time:'}
                        sliderText={'ahead of schedule'}
                        type={'project'}
                        id={projectDetails.id}
                        status={status}
                        progressData={{
                          completion: projectDetails?.progress?.time,
                          is_can_completion: false,
                        }}
                        // style={{backgroundColor:'green'}}
                      />
                      {/* <ProgressBar
                        title={'Cost:'}
                        sliderText={'under budget'}
                        type={'project'}
                        id={projectDetails.id}
                        status={status}
                        progressData={{
                          completion: projectDetails?.progress?.cost,
                          is_can_completion: false,
                        }}
                      /> */}
                    </View>

                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D6E2FF',
                        marginTop: 16,
                      }}
                    ></View>

                    <View style={[s.headerContainer, { marginVertical: 16 }]}>
                      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <CSelectedUserForDetails
                          label={'Owner'}
                          selectedUsers={
                            projectDetails['user_owner'] ? [projectDetails['user_owner']] : []
                          }
                        />
                        <CSelectedUserForDetails
                          navigationFrom={'details'}
                          userSelection={openSupervisorPickerModal}
                          label={'Supervisor'}
                          selectedUsers={
                            projectDetails['user_supervisors']
                              ? projectDetails['user_supervisors']
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
                            projectDetails['user_members'] ? projectDetails['user_members'] : []
                          }
                        />
                        <CSelectedUserForDetails
                          navigationFrom={'details'}
                          userSelection={openClientPickerModal}
                          label={'Clients'}
                          selectedUsers={
                            projectDetails['user_clients'] ? projectDetails['user_clients'] : []
                          }
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D6E2FF',
                        marginBottom: 16,
                      }}
                    ></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>
                        Complete method:
                      </Text>
                      <Text style={[g.body1, { marginTop: 4 }]}>Number of task completed</Text>
                    </View>
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#D6E2FF',
                        marginTop: 16,
                        marginBottom: 8,
                      }}
                    ></View>

                    {description && <DescriptionComponent description={description} />}
                  </Animated.ScrollView>
                )}

                {detailsScreen === 'functionality' && (
                  <DraggableFlatList
                    ListHeaderComponent={() => (
                      <Animated.View style={[{ marginTop: 80, marginBottom: 16 }]}></Animated.View>
                    )}
                    onScrollOffsetChange={(offset) => {
                      diff.value = offset - prev.value
                    }}
                    onScrollBeginDrag={(e) => {
                      prev.value = e.nativeEvent.contentOffset.y
                    }}
                    showsVerticalScrollIndicator={false}
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
                      // paddingTop:90,
                    }}
                  />
                )}
              </View>
              {/* <View>{}</View> */}

              <View style={[{ marginBottom: Platform.OS === 'ios' && height > 670 ? 24 : 0 }]}>
                {draggable ? (
                  <CButtonInput label="Save" onPress={savedListFunctionality} />
                ) : (
                  <View>
                    {(status === 'New' ||
                      status === 'In Progress' ||
                      status === 'Review' ||
                      status === 'Issue') && (
                      <View style={[s.listItemContainer, { width: '98%' }]}>
                        <CButton
                          style={[s.closeButton]}
                          onPress={() => updateProjectStatus('Completed')}
                        >
                          <CText style={g.title3}>Complete</CText>
                        </CButton>
                        <CButton
                          type="gray"
                          style={[s.holdButton]}
                          onPress={() => updateProjectStatus('On Hold')}
                        >
                          <CText style={g.title3}>On Hold</CText>
                        </CButton>
                      </View>
                    )}

                    {status === 'Completed' && (
                      <View style={[s.listItemContainer, { width: '100%' }]}>
                        <CButton
                          style={[s.reOpenButton]}
                          onPress={() => updateProjectStatus('In Progress')}
                        >
                          <CText style={g.title3}>Re-Open Project</CText>
                        </CButton>
                      </View>
                    )}

                    {status === 'On Hold' && (
                      <View style={[s.listItemContainer, { width: '100%' }]}>
                        <CButton
                          style={[s.reOpenButton]}
                          onPress={() => updateProjectStatus('In Progress')}
                        >
                          <CText style={g.title3}>Continue</CText>
                        </CButton>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
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
    // backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingVertical: 8,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: colors.PRIM_BG,
  },
  headerCutomization: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    height: 100,
    elevation: 0,
    zIndex: 100,
    backgroundColor: colors.CONTAINER_BG,
    paddingHorizontal: 16,
  },
  progressCutomization: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    elevation: 0,
    zIndex: 100,
    backgroundColor: colors.CONTAINER_BG,
    // paddingTop: 20,
    // paddingHorizontal: 16,

    //  backgroundColor:'green'
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
    // backgroundColor:'green'
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
    // backgroundColor:"yellow"
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
    marginVertical: 8,
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

  // statusBarBackground: {
  //   height: Platform.OS === 'ios' ? 18 : 0,
  //   backgroundColor: colors.CONTAINER_BG,
  // },
})
