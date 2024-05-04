import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import PlusBlueIcon from '../../assets/svg/plus-blue-fill.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CDateTime from '../../components/common/CDateTime'
import CGetHourMinute from '../../components/common/CGetHourMinute'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IssuePickerModal from '../../components/modals/IssuePickerModal'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import TaskPickerModal from '../../components/modals/TaskPickerModal'
import TimelogSaveOrCancelModal from '../../components/modals/TimelogSaveOrCancelModal'
import UserPickerModal from '../../components/modals/UserPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments
} from '../../utils/Attachmets'
import { getErrorMessage, hasProjectPickerErrors } from '../../utils/Errors'
import { getDateTime, jsCoreDateCreator, timeStampToDate } from '../../utils/Timer'

export default function TimelogAddOrEditScreen({ navigation, route }) {
  const userInfo = useSelector((state) => state.user.user)
  let id = route.params ? route.params.id : null
  let start_date = route.params ? route.params.start_date : null
  let end_date = route.params ? route.params.end_date : null
  let detailsInfo = route.params ? route.params.detailsInfo : null
  let timeTracking = route.params ? route.params.timeTracking : null

  //console.log(detailsInfo?.detailsInfo?.project, 'details info...timetrakcing....')
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  // const [startDate, setStartDate] = useState(new Date())
  const [documents, setDocuments] = useState([])

  const [errorMessages, setErrorMessages] = useState({
    name: '',
    project: '',
  })
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])

  const [showProjectPickerModal, setShowProjectPickerModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState({ id: -1, name: '' })

  const [showMilestonePickerModal, setShowMilestonePickerModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState({ id: -1, name: '' })

  const [showTaskPickerModal, setShowTaskPickerModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState({ id: -1, name: '' })

  const [showIssuePickerModal, setShowIssuePickerModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState({ id: -1, name: '' })

  const [timelogDescription, setTimelogDescription] = useState('')
  const [numberOfHours, setNumberOfHours] = useState('0:0')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveOrCancelOption, setSaveOrCancelOption] = useState(null)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState([])
  const [startDate, setStartDate] = useState(start_date ? new Date(start_date) : new Date())
  const [endDate, setEndDate] = useState(end_date ? new Date(end_date) : new Date())

  const scrollViewRef = useRef(null)

  const goBack = () => {
    navigation.goBack()
  }

  const addOrUpdateTimelog = (option = 0) => {
    //console.log('addOrUpdateTimelog')

    let body = {
      start_date: getDateTime(startDate),
      end_date: getDateTime(endDate),
      number_of_hour: numberOfHours,
      project_id: selectedProject.id,
      milestone_id: selectedMilestone.id,
      task_id: selectedTask.id,
      issue_id: selectedIssue.id,
      description: timelogDescription,
      member: userInfo?.id,
    }
    selectedMilestone.id === -1 && delete body.milestone_id
    selectedTask.id === -1 && delete body.task_id
    selectedIssue.id === -1 && delete body.issue_id

    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    body = { ...body, ...attachments, ...attachmentIds }
    //console.log('body', body)

    if (id) {
      body['_method'] = 'PUT'
      api.timelog
        .updateTimelog(id, body)
        .then((res) => {
          //console.log('Response', res)
          if (res.success) {
            Alert.alert('Timelog updated successfully')
            navigation.navigate('Timelogs', { refetch: Math.random() })
          }
        })
        .catch((err) => {
          //console.log('Error', err.response.data)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    } else {
      api.timelog
        .createTimelog(body)
        .then((res) => {
          //console.log('Response', res)
          if (res.success) {
            if (option === 1 || option === 2) {
              setShowSaveModal(false)
              Alert.alert('Timelog created successfully')
            } else if (option === 3) {
              setShowSaveModal(false)
              setStartDate(new Date())
              setNumberOfHours(null)
              setSelectedProject({ id: -1, name: '' })
              setSelectedMilestone({ id: -1, name: '' })
              setSelectedTask({ id: -1, name: '' })
              setTimelogDescription('')
              setDocuments([])
              Alert.alert('Timelog created successfully.')
            }
            navigation.navigate('Timelogs', { refetch: Math.random() })
          }
        })
        .catch((err) => {
          //console.log('Error', err.response.data)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
  }

  const timelogSaveOrCancel = (option) => {
    //console.log('timelogSaveOrCancel', option)
    if (option === 1 || option === 2 || option === 3) {
      addOrUpdateTimelog(option)
    } else if (option === 4) {
      setShowSaveModal(false)
      setStartDate(new Date())
      setNumberOfHours(null)
      setSelectedProject({ id: -1, name: '' })
      setSelectedMilestone({ id: -1, name: '' })
      setSelectedTask({ id: -1, name: '' })
      setTimelogDescription('')
      navigation.navigate('Timelogs', { refresh: true })
    }
  }

  useEffect(() => {
    const getTimelogDetails = () => {
      api.timelog
        .getTimelogDetails(id)
        .then((res) => {
          // //console.log('Response', res)
          if (res.success) {
            let data = res.timelog
            // //console.log('data', data)
            setTimelogDescription(data.description.value)
            setNumberOfHours(timeStampToDate(data.number_of_hour))
            setSelectedProject({ id: data.project.id, name: data.project.name })
            setSelectedMilestone({ id: data.task.milestone.id, name: data.task.milestone.name })
            setSelectedTask({ id: data.task.id, name: data.task.name })
            setStartDate(jsCoreDateCreator(data.start_date))
            setAttachments(data.attachments)
          }
        })
        .catch((err) => {
          //console.log('Error', err)
        })
    }
    if (id) {
      getTimelogDetails()
    }
  }, [id])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    let start_date = new moment(startDate)
    let end_date = new moment(endDate)
    let duration = moment.duration(end_date.diff(start_date))
    let hours = Math.floor(duration.asHours())
    let minutes = Math.floor(duration.asMinutes()) - Math.floor(duration.asHours()) * 60
    if (hours < 0 || minutes < 0) {
      setNumberOfHours(`0:0`)
      Alert.alert('Invalid Date/Time selection')
    } else {
      setNumberOfHours(`${hours}:${minutes}`)
    }
    
  }, [endDate])

  useEffect(() => {
    // need to update logic when add issue /milestone
    if (detailsInfo?.detailsInfo) {
      detailsInfo?.detailsInfo?.project && setSelectedProject(detailsInfo?.detailsInfo?.project)
      detailsInfo?.detailsInfo?.milestone &&
        setSelectedMilestone(detailsInfo?.detailsInfo?.milestone)
      detailsInfo?.detailsInfo &&
        setSelectedTask({ id: detailsInfo?.detailsInfo?.id, name: detailsInfo?.detailsInfo?.name })
    }
    if (timeTracking) {
      setStartDate(new Date(timeTracking?.created_at))
      setEndDate(new Date(timeTracking?.updated_at))
    }
  }, [detailsInfo, timeTracking])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar animated={true} backgroundColor={colors.CONTAINER_BG} />
      <ScrollView style={[s.background]} ref={scrollViewRef}>
        <View style={[g.innerContainer]}>
          <CHeaderWithBack
            navigation={navigation}
            title={id ? 'Update Log' : 'Add Log'}
            onPress={goBack}
            containerStyle={{ marginTop: 24 }}
          />
          <ProjectPickerModal
            visibility={showProjectPickerModal}
            setVisibility={setShowProjectPickerModal}
            selected={selectedProject}
            setSelected={setSelectedProject}
          />
          <MilestonePickerModal
            projectId={selectedProject.id}
            visibility={showMilestonePickerModal}
            setVisibility={setShowMilestonePickerModal}
            selected={selectedMilestone}
            setSelected={setSelectedMilestone}
          />
          <TaskPickerModal
            projectId={selectedProject.id}
            milestoneId={selectedMilestone.id}
            visibility={showTaskPickerModal}
            setVisibility={setShowTaskPickerModal}
            selected={selectedTask}
            setSelected={setSelectedTask}
          />
          <IssuePickerModal
            projectId={selectedProject.id}
            milestoneId={selectedMilestone.id}
            taskId={selectedTask.id}
            visibility={showIssuePickerModal}
            setVisibility={setShowIssuePickerModal}
            selected={selectedIssue}
            setSelected={setSelectedIssue}
          />
          <UserPickerModal
            visibility={showUserPickerModal}
            setVisibility={setShowUserPickerModal}
            selected={selectedUser}
            setSelected={setSelectedUser}
          />
          <TimelogSaveOrCancelModal
            openModal={showSaveModal}
            setOpenModal={setShowSaveModal}
            setSaveOrCancelOption={setSaveOrCancelOption}
            saveOrCancel={timelogSaveOrCancel}
          />
          <View style={s.gapVertical}>
            {/* <View style={g.containerBetween}>
              <CDateTime
                pickedDate={startDate}
                setPickedDate={setStartDate}
                style={{ width: '100%', paddingVertical: 3 }}
                icon
                dateFormate
              />
            </View> */}
            <CSelectWithLabel
              label="Project"
              onPress={() => setShowProjectPickerModal(true)}
              selectText={selectedProject.id != -1 ? selectedProject.name : 'Select'}
              errorMessage={errorMessages.project}
              showErrorMessage={errorMessages.project !== ''}
              required
            />
            <CSelectWithLabel
              label="Milestone"
              onPress={() => setShowMilestonePickerModal(true)}
              selectText={selectedMilestone.id != -1 ? selectedMilestone.name : 'Select'}
              // errorMessage={errorMessages.milestone}
              // showErrorMessage={errorMessages.milestone !== ''}
            />
            <CSelectWithLabel
              label="Task"
              onPress={() => setShowTaskPickerModal(true)}
              selectText={selectedTask.id != -1 ? selectedTask.name : 'Select'}
              // errorMessage={errorMessages.task}
              // showErrorMessage={errorMessages.task !== ''}
            />
            <CSelectWithLabel
              label="Issue"
              onPress={() => setShowIssuePickerModal(true)}
              selectText={selectedIssue.id != -1 ? selectedIssue.name : 'Select'}
              // errorMessage={errorMessages.issue}
              // showErrorMessage={errorMessages.issue !== ''}
            />
            <View style={[g.containerBetween, { marginVertical: 8 }]}>
              <CDateTime
                pickedDate={startDate}
                setPickedDate={setStartDate}
                type="datetime"
                showLabel={true}
                label={'Start'}
                containerStyle={{ marginRight: 8 }}
              />
              <CDateTime
                pickedDate={endDate}
                setPickedDate={setEndDate}
                type="datetime"
                showLabel={true}
                label={'End'}
              />
            </View>
            <View style={[g.containerBetween, { marginVertical: 8 }]}>
              <CGetHourMinute label={'Number of Hours'} numberOfHours={numberOfHours} />
              {/* <CDateTime
                pickedDate={numberOfHours}
                setPickedDate={setNumberOfHours}
                style={{ width: '100%', backgroundColor: colors.WHITE }}
                type="time"
                noIcon
                showLabel
                label="Number of Hours"
              /> */}
            </View>

            <TextInput
              style={s.inputStyle}
              spaces={false}
              maxLength={2000}
              placeholder="Comments"
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={colors.NORMAL}
              value={timelogDescription}
              onChangeText={setTimelogDescription}
            />
          </View>
          {/* <View> */}
          {/* <CAttachments
              attachments={attachments}
              setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
              attachmentDeleteIndexes={attachmentDeleteIndexes}
            /> */}
          {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
          {/* <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
          {/* </View> */}
          {id && (
            <CSelectWithLabel
              label="Supervisor"
              selectText={'Select'}
              onPress={() => setShowUserPickerModal(true)}
            />
          )}

          <TouchableOpacity
            style={{
              backgroundColor: colors.PRIM_BG,
              paddingVertical: 16,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 16,
              marginTop: 8,
              marginBottom: 32,
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <PlusBlueIcon />
              <Text style={[g.button2, { color: colors.SECONDARY, marginLeft: 8 }]}>Add Note</Text>
            </View>
          </TouchableOpacity>

          <CButtonInput
            label={id ? 'Submit' : 'Save'}
            onPress={
              id
                ? addOrUpdateTimelog
                : () => {
                    // //console.log('called save...')
                    if (hasProjectPickerErrors(selectedProject.name, setErrorMessages)) {
                      setShowSaveModal(false)
                      scrollViewRef.current?.scrollTo({
                        y: 0,
                        animated: true,
                      })
                      return
                    } else {
                      setShowSaveModal(true)
                    }
                  }
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    marginBottom: 10,
  },
  container: {
    marginTop: 24,
  },
  headerTitle: {
    marginLeft: 24,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  gapVertical: {
    marginVertical: 8,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  hourContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
})
