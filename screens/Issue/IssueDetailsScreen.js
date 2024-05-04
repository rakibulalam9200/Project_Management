import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import colors from '../../assets/constants/colors'

import CalendarIcon from '../../assets/svg/calendar2.svg'
import ClockIcon from '../../assets/svg/clock.svg'
import GripIcon from '../../assets/svg/grip.svg'
import LocationIcon from '../../assets/svg/location-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import AsyncStorage from '@react-native-async-storage/async-storage'
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
import { setCurrentIssue, setStage } from '../../store/slices/navigation'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getOnlyErrorMessage } from '../../utils/Errors'
import { extractCustomDateFomratWithTimezone, getDateTime, secondtoHms } from '../../utils/Timer'

const IssueDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const [issueDetails, setIssueDetails] = useState({})
  const [loading, setLoading] = useState(false)
  const [readMore, setReadMore] = useState(false)
  const [functionalityListing, setFuntionalityListing] = useState([])
  const [detailsScreen, setDetailsScreen] = useState('details')
  const [draggable, setDraggable] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const { navigationFrom, currentIssue, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )

  const [commentModal, setCommentModal] = useState(false)

  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const [dateSelected, setDateSelected] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const user = useSelector((state) => state.user)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [status, setStatus] = useState(issueDetails && issueDetails.stage)
  const dispatch = useDispatch()

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
  const openDeclineModal = () => {
    setShowDeclineModal(true)
  }

  const openCompleteModal = () => {
    setShowCompleteModal(true)
  }

  const userActivity = useRef(null)
  const setListingFunc = async (key, arr) => {
    await AsyncStorage.setItem(key, JSON.stringify(arr))
  }

  const getListingFunc = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) { }
  }

  const issueFunctionalities = [
    {
      id: 8,
      name: 'Activity',
      navigationName: 'Activity',
      viewNavigation: {},
      count: 'activity',
      addNavigationName: '',
      addNavigation: { issue: { id: id, name: issueDetails.name } },
    },
    {
      id: 1,
      name: 'Lists',
      navigationName: 'Checklist',
      viewNavigation: { parent_id: currentIssue?.id },
      count: 'todo_lists',
      addNavigationName: 'ChecklistAdd',
      addNavigation: {
        // parent_id: currentIssue?.id,
        autoLoad: true,
        showNameInputFirst: true,
        // backScreen: true,
      },
      // addNavigation: { project: { id: id, name: milestoneDetails.name } },
    },
    {
      id: 2,
      name: 'Chat',
      navigationName: '',
      viewNavigation: '',
      count: 0,
      addNavigationName: '',
      addNavigation: '',
    },
    {
      id: 3,
      name: 'Files',
      navigationName: 'ProjectFolders',
      viewNavigation: '',
      count: 'attachments',
      addNavigationName: 'ProjectFolders',
      addNavigation: '',
    },
    // {
    //   id: 4,
    //   name: 'Materials',
    //   navigationName: '',
    //   viewNavigation: '',
    //   count: 0,
    //   addNavigationName: '',
    //   addNavigation: '',
    // },
  ]

  useEffect(() => {
    getListingFunc('IssueLisitingFunctionality').then((res) => {
      if (res) {
        //console.log(res, 'task functionality listing.......')
        setFuntionalityListing(res)
      } else {
        setFuntionalityListing(issueFunctionalities)
      }
    })
    // setFuntionalityListing(issueFunctionalities)
    setDraggable(false)
  }, [])

  useEffect(() => {
    const getIssueDetails = async () => {
      //console.log(refetch, '99999999999999')
      if (!currentIssue?.id) return
      setLoading(true)
      api.issue
        .getIssue(currentIssue?.id)
        .then((res) => {
          if (res.success) {
            // //console.log(res?.issue, '---------issue....')
            setIssueDetails(res.issue)
            setStatus(res.issue.stage)
            // //console.log(res?.issue?.time_tracking,"issue time tracking....")
            setTimeTracker(res?.issue?.time_tracking)
            setTimer(res?.issue?.time_tracking?.total_time)
            setSelectedSupervisors(
              res.issue.user_supervisors.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedMembers(
              res.issue.user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedClients(
              res.issue.user_clients.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            //console.log(res.issue)
            userActivity.current = res?.issue?.user_activities
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
        .finally(() => setLoading(false))
    }
    if (currentIssue?.id) getIssueDetails()
  }, [refresh, showMemberPickerModal, showSupervisorPickerModal, status, currentIssue, refetch,showClientPickerModal])

  useEffect(() => {
    dispatch(setCurrentIssue(issueDetails))
  }, [issueDetails?.id])

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
    if (count === 'todo_lists') {
      fuctionalitylength = issueDetails?.todolists_count
    } else if (count === 'activity') {
      fuctionalitylength = issueDetails?.user_activities_count
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
                      title: issueDetails?.name,
                      state: 'Issue',
                      loggerId: issueDetails?.id,
                    })
                  } else if (name == 'Files') {
                    navigation.navigate(navigationName, {
                      id: issueDetails?.file_management?.id,
                      onlyFiles: true,
                    })
                  } else navigation.navigate(navigationName, viewNavigation)
                } else {
                  dispatch(setStage('issue'))
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
                  dispatch(setStage('issue'))
                  navigation.navigate('Chat')
                } else if (name == 'Files') {
                  navigation.navigate(addNavigationName, {
                    id: issueDetails?.file_management?.id,
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
    setListingFunc('IssueLisitingFunctionality', functionalityListing)
    setDraggable(false)
  }

  let dateRange =
    extractCustomDateFomratWithTimezone(issueDetails.start_date, userSettings
      ?.js_date_format, userSettings?.user_timezone
    ) +
    ' - ' +
    extractCustomDateFomratWithTimezone(issueDetails.end_date, userSettings
      ?.js_date_format, userSettings?.user_timezone)

  const updateDateRange = () => {
    if (!dateSelected.firstDate || !dateSelected.secondDate) return
    let startDate = moment(dateSelected.firstDate).utc(true).toDate()
    let endDate = moment(dateSelected.secondDate).utc(true).toDate()
    const { acceptance_needed, priority, name, project_id, milestone, task } = issueDetails
    let body = {
      acceptance_needed,
      priority,
      name,
      project_id,
    }
    if (milestone?.id) body['milestone_id'] = milestone.id
    if (task?.id) body['task_id'] = task.id
    body['start_date'] = getDateTime(startDate)
    body['end_date'] = getDateTime(endDate)
    body['_method'] = 'PUT'

    api.issue
      .updateIssue(body, id)
      .then((res) => {
        if (res.success) {
          // //console.log(res.success, '*************')
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
          style={[s.cardRowBetweenForAdressComponent, { flex: 1 }]}
        >
          {/* <View style={{backgroundColor:'yellow'}}> */}
          <IconWrap
            onPress={() => {
              address
                ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
                : console.log('No address')
            }}
            outputRange={iconWrapColors}
          >
            <LocationIcon />
          </IconWrap>
          {/* <Text style={[{ marginRight: 4, }, s.normalText]}>{address}</Text> */}
          <CText style={s.normalText}>{address}</CText>
          {/* </View> */}
        </TouchableOpacity>
      )
    ) : (
      <></>
    )
  }

  const updateIssueStatus = async (status) => {
    let body = {
      stage: status,
    }
    api.issue
      .changeIssueStatus(body, issueDetails.id)
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

  const completeWorking = () => {
    //console.log(issueDetails.id, 'issue id')
    setLoading(true)
    let body = {
      type: 'issue',
    }
    //console.log(body)
    api.workingHour
      .completeHour(body, issueDetails.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, '#########################')
          setRefresh((prev) => !prev)
          // setStatus(status)
          // Alert.alert(res.message)
        }
      })
      .catch((err) => {
        //console.log(err?.response.data, 'error...........')
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

  const updateIssueWorking = async (status) => {
    // //console.log(workingHours,'working hours')
    if (!issueDetails?.is_can_start_working) return
    if (issueDetails?.is_can_start_working) {
      setLoading(true)
      let body = {
        type: 'issue',
      }

      api.workingHour
        .startingHour(body, issueDetails.id)
        .then((res) => {
          if (res.success) {
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

  const issueReviewAccept = () => {
    // //console.log(taskDetails.id,'task id')
    setLoading(true)
    let body = {
      type: 'issue',
    }
    api.workingHour
      .reviewAccept(body, issueDetails.id)
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

  const issueReviewDecline = () => {
    // //console.log(taskDetails.id,'task id')
    setLoading(true)
    let body = {
      type: 'issue',
    }
    api.workingHour
      .reviewDecline(body, issueDetails.id)
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

  const startTimeTracking = async () => {
    // //console.log('start time tracking....')
    let body = {
      type: 'issue',
    }

    api.timeTracking
      .timeTrackingStart(body, issueDetails.id)
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

  const attemptMove = async (project, milestone, task, copy) => {
    try {
      let params = {
        model_ids: [issueDetails.id],
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
    }
  }

  const attemptDelete = async () => {
    try {
      if (id) {
        setBtnLoader(true)
        let res = await api.issue.deleteIssue(id)

        if (res.success) {
          setShowDeleteModal(false)
          navigation.navigate('Issues', { refetch: Math.random() })
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
        let res = await api.issue.cloneIssue({
          issue_ids: [id],
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
        onEdit={() => navigation.navigate('IssueEdit', { id: id })}
        onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        onClone={() => setShowCloneModal(true)}
      />
      <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        state={'issue'}
        onMove={attemptMove}
      />
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateDateRange}
      />
      <MemberPickerModal
        visibility={showMemberPickerModal}
        setVisibility={setShowMemberPickerModal}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        modelId={issueDetails?.id}
        from={'issue'}
      // alreadySelected={alreadySelectedMemebers}
      />
      <SupervisorPickerModal
        visibility={showSupervisorPickerModal}
        setVisibility={setShowSupervisorPickerModal}
        selected={selectedSupervisors}
        setSelected={setSelectedSupervisors}
        modelId={issueDetails?.id}
        from={'issue'}
      />
      <ClientPickerModal
        visibility={showClientPickerModal}
        setVisibility={setShowClientPickerModal}
        selected={selectedClients}
        setSelected={setSelectedClients}
        modelId={issueDetails?.id}
        from={'issue'}
      />
      <DeclineModal
        visibility={showDeclineModal}
        setVisibility={setShowDeclineModal}
        taskId={issueDetails.id}
        moduleName={'issue'}
        // setRefresh={setRefresh}
        navigation={navigation}
        navigationName={'Issues'}
      />
      <CompleteModal
        visibility={showCompleteModal}
        setVisibility={setShowCompleteModal}
        taskId={issueDetails.id}
        moduleName={'issue'}
        navigation={navigation}
        navigationName={'Issues'}
        setRefresh={setRefresh}
      />
      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={issueDetails?.id}
        model={'Issue'}
        setRefresh={setRefresh}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to delete this Issue? The Issue will be clone with same state with its childs"
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone this Issue? The issue will be clone with same state with its childs"
      />
      <View style={[s.outerContainer, { marginBottom: Platform.OS === 'ios' && height > 670 ? 80 : 64 } ]}>
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
                navigation.navigate('Issues', { refetch: Math.random(), issueId: issueDetails?.id })
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>Issue details</Text>
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
          <View style={g.loaderContainer}>
            <ActivityIndicator size="small" color={'blue'} />
          </View>
        )}
        {!loading && (
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ marginBottom: 24 }}>
              <CText style={[g.title2, s.titleText]}>{issueDetails.name}</CText>
              <Text style={s.smallTitle}>{`${issueDetails?.project && issueDetails?.project?.name + ' / '
                }${issueDetails?.milestone ? issueDetails?.milestone?.name + ' / ' : ''}${issueDetails?.task ? issueDetails?.task?.name + ' / ' : ''
                }${issueDetails?.name} `}</Text>
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
                          //     detailsInfo: issueDetails,
                          //     showTiming: showTiming,
                          //     setShowTiming: setShowTiming,
                          //     type: 'issue',
                          //   })
                          // } else if (timeTracker?.stage === 'work_completed') {
                          //   if (!issueDetails?.is_can_start_working) {
                          //     setShowTiming(true)
                          //     startTimeTracking()
                          //   } else {
                          //     Alert.alert('You need to start work first to enable time tracking.')
                          //   }
                          // } else {
                          //   !issueDetails?.is_can_start_working
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
                      // outputRange={iconWrapColors}
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
                    {/* <View style={s.containerLeft}> */}
                    {/* <IconWrap onPress={() => { }} outputRange={iconWrapColors}>
                        <LocationIcon />
                      </IconWrap> */}
                    {/* <CText style={s.normalText}>
                        {issueDetails?.address
                          ? issueDetails?.address
                          : '8 Harold StManchester, Massachusetts(MA),01944'}
                      </CText> */}
                    {issueDetails?.address && <AddressComponent address={issueDetails?.address} />}
                    {/* </View> */}
                  </View>

                  <View style={[s.containerLeft, { marginVertical: 16 }]}>
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
                        issueDetails.priority && {
                          color: PriorityColors[issueDetails.priority].color,
                        },
                      ]}
                    >
                      {capitalizeFirstLetter(issueDetails.priority)}
                    </Text>
                  </View>
                  {/* <DetailsCompletion
                    type={'task'}
                    id={issueDetails.id}
                    status={status}
                    progressData={{
                      completion: issueDetails?.progress?.completion,
                      is_can_completion: issueDetails?.progress?.is_can_completion,
                    }}
                  /> */}
                  <View style={{ backgroundColor: colors.CONTAINER_BG, marginBottom: 16 }}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', width: '100%', flex: 1 }}
                    >
                      <Text style={[g.body2, { marginRight: 4 }]}>Progress: </Text>
                      <DetailsCompletion
                        style={{ flex: 1 }}
                        type={'issue'}
                        id={issueDetails.id}
                        status={status}
                        progressData={{
                          completion: issueDetails?.progress?.completion,
                          is_can_completion: issueDetails?.progress?.is_can_completion,
                        }}
                        updateIssueWorking={updateIssueWorking}
                        setRefresh={setRefresh}
                      />
                    </View>

                    <ProgressBar
                      title={'Time:'}
                      sliderText={'ahead of schedule'}
                      type={'issue'}
                      id={issueDetails.id}
                      status={status}
                      progressData={{
                        completion: issueDetails?.progress?.time,
                        is_can_completion: false,
                      }}
                    // style={{backgroundColor:'green'}}
                    />
                    {/* <ProgressBar
                      title={'Cost:'}
                      sliderText={'under budget'}
                      type={'issue'}
                      id={issueDetails.id}
                      status={status}
                      progressData={{
                        completion: issueDetails?.progress?.cost,
                        is_can_completion: false,
                      }}
                    /> */}
                  </View>

                  <View style={[s.headerContainer, { marginVertical: 16 }]}>
                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                      <CSelectedUserForDetails
                        label={'Owner'}
                        selectedUsers={
                          issueDetails['user_owner'] ? [issueDetails['user_owner']] : []
                        }
                      />
                      <CSelectedUserForDetails
                        navigationFrom={'details'}
                        userSelection={openSupervisorPickerModal}
                        label={'Supervisor'}
                        selectedUsers={
                          issueDetails['user_supervisors']
                            ? issueDetails['user_supervisors']
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
                          issueDetails['user_members'] ? issueDetails['user_members'] : []
                        }
                      />
                      <CSelectedUserForDetails
                        navigationFrom={'details'}
                        userSelection={openClientPickerModal}
                        label={'Clients'}
                        selectedUsers={
                          issueDetails['user_clients'] ? issueDetails['user_clients'] : []
                        }
                      />
                    </View>
                  </View>

                  {/* <View style={s.headerContainer}>
                    <View>
                      <CText
                        style={[
                          s.smallText,
                          issueDetails['user_members']?.length >= 2 && { marginLeft: 10 },
                        ]}
                      >
                        Members
                      </CText>
                      <CSelectedUsersWithEdit
                        style={[issueDetails['user_members']?.length >= 2 && { marginLeft: 10 }]}
                        userSelection={openMemberPickerModal}
                        selectedUsers={
                          issueDetails['user_members'] ? issueDetails['user_members'] : []
                        }
                      />
                    </View>
                    <View
                      style={[issueDetails['user_members']?.length >= 2 && { marginLeft: -30 }]}
                    >
                      <CText style={s.smallText}>Owner</CText>
                      <CSelectedUsersWithEdit
                        selectedUsers={
                          issueDetails['user_owner'] ? [issueDetails['user_owner']] : []
                        }
                      />
                    </View>
                    <View>
                      <CText style={s.smallText}>Supervisors</CText>
                      <CSelectedUsersWithEdit
                        userSelection={openSupervisorPickerModal}
                        selectedUsers={
                          issueDetails['user_supervisors'] ? issueDetails['user_supervisors'] : []
                        }
                      />
                    </View>
                  </View> */}
                  {issueDetails?.description?.value && (
                    <DescriptionComponent description={issueDetails?.description?.value} />
                  )}
                  {/* <View style={{ marginBottom: 16, marginTop: 8 }}>
                    {!readMore && issueDetails?.description?.value.length > 100 ? (
                      <CText style={s.descriptionText}>
                        {issueDetails?.description?.value.slice(0, 100) + '...'}
                        <Text style={{ color: '#246BFD' }} onPress={() => setReadMore(true)}>
                          {' '}
                          Read More
                        </Text>
                      </CText>
                    ) : (
                      <CText style={s.descriptionText}>{issueDetails?.description?.value}</CText>
                    )}
                  </View> */}
                </ScrollView>
              )}

              {detailsScreen === 'functionality' && (
                <View style={{ flex: 1 }}>
                  {/* <ProgressBar
                    title={'Time: '}
                    sliderText={'ahead of schedule'}
                    type={'project'}
                    id={issueDetails.id}
                    status={issueDetails?.stage}
                    progressData={{ completion: 14, is_can_completion: false }}
                  />
                  <ProgressBar
                    title={'Cost: '}
                    sliderText={'under budget'}
                    type={'project'}
                    id={issueDetails.id}
                    status={issueDetails?.stage}
                    progressData={{ completion: 42, is_can_completion: false }}
                  /> */}

                  <DraggableFlatList
                    data={functionalityListing}
                    onDragBegin={() => { }}
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
                      // marginTop: 16,
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
                    issueDetails?.is_can_start_working && (
                      <View style={{ flexDirection: 'row' }}>
                        <CButton
                          style={[
                            s.margin1x,
                            { backgroundColor: '#E9203B', width: '50%', marginRight: 8 },
                          ]}
                          onPress={openDeclineModal}
                        >
                          <CText style={g.title3}>Decline</CText>
                        </CButton>
                        <CButton
                          style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                          onPress={() => updateIssueWorking('In Progress')}
                          loading={loading}
                        >
                          <CText style={g.title3}>Start working</CText>
                        </CButton>
                      </View>
                    )}
                  {status === 'In Progress' && !issueDetails?.is_can_start_working && (
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
                          onPress={issueReviewDecline}
                          loading={loading}
                        >
                          <CText style={g.title3}>Decline</CText>
                        </CButton>
                        <CButton
                          style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                          onPress={issueReviewAccept}
                          loading={loading}
                        >
                          <CText style={g.title3}>Accept</CText>
                        </CButton>
                      </View>
                    )}
                  {status === 'Completed' && (
                    <View style={[s.listItemContainer, { width: '100%' }]}>
                      <CButton
                        style={[s.reOpenButton]}
                        onPress={() => updateIssueStatus('In Progress')}
                        loading={loading}
                      >
                        <CText style={g.title3}>Re-Open Issue</CText>
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

//navigation.navigate('IssueEdit', { id: id })

export default IssueDetailsScreen

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
    marginBottom: 55,
    paddingTop: 10,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
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
    marginBottom: 16,
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
