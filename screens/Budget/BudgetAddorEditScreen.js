import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { priorities } from '../../assets/constants/priority'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import PriorityModal from '../../components/modals/PriorityModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
    getAttachmentsFromDocuments,
    getAttachmentsIdsFromDeleteIndexArrays
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import {
    getErrorMessage,
    hasIssueNameErrors,
    hasMilestonePickerErrors,
    hasProjectPickerErrors,
    hasTaskPikerErrors
} from '../../utils/Errors'
import { extractDate, getDateTime } from '../../utils/Timer'
import { getMembersObjFromSelectedUsers } from '../../utils/User'

export default function BudgetAddorEditScreen({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let projectInfo = route.params ? route.params.project : null
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [issueName, setIssueName] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showTask, setShowTask] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState({ id: -1, name: '' })
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    project: '',
    milestone: '',
    task: '',
  })
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const { currentProject, currentMilestone } = useSelector((state) => state.navigation)

  const scrollViewRef = useRef(null)

  const goBack = () => {
    navigation.goBack()
  }
  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const openMilestonePickerModal = () => {
    setShowMilestonePicker(true)
  }
  const openPriorityModal = () => {
    setShowPriority(true)
  }

  const openTaskModal = () => {
    setShowTask(true)
  }

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const addOrUpdateBudget = () => {
    if (
      hasIssueNameErrors(issueName, setErrorMessages) ||
      hasProjectPickerErrors(selected.name, setErrorMessages) ||
      hasMilestonePickerErrors(milestoneSelected.name, setErrorMessages) ||
      hasTaskPikerErrors(taskSelected.name, setErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    let body = {
      name: issueName,
      description: issueDescription,
      acceptance_needed: acceptance,
      priority: prioritySelected.name,
      project_id: selected.id,
      milestone_id: milestoneSelected.id,
      task_id: taskSelected.id,
    }
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)

    let attachments = getAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    body = { ...body, ...attachments, ...attachmentIds, ...members }
    if (id) {
      body['_method'] = 'PUT'
      api.issue
        .updateIssue(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('IssueDetails', { id: id, refetch: Math.random() })
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
    } else {
      api.issue
        .createIssue(body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Issues', { refetch: Math.random() })
          }
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            //console.log(err, 'error')
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    //console.log(body)
  }

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
    }
    if (currentMilestone) {
      setMilestoneSelected(currentMilestone)
    }
    const getIssueDetails = async () => {
      api.issue
        .getIssue(id)
        .then((res) => {
          if (res.success) {
            const {
              name,
              description,
              start_date,
              end_date,
              attachments,
              project,
              task,
              priority,
              acceptance_needed,
              user_members,
            } = res.issue
            // //console.log(res.project)
            if (name != 'null') setIssueName(name)
            setSelected(project)
            setMilestoneSelected(task.milestone)
            setTaskSelected(task)
            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            acceptance_needed ? setAcceptance(true) : setAcceptance(false)

            if (description?.value != 'null')
              setIssueDescription(description?.value ? description.value : '')
            if (start_date) setStartDate(new Date(extractDate(start_date)))
            if (end_date) setEndDate(new Date(extractDate(end_date)))
            setAttachments(attachments)
            setSelectedUsers(
              user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
          }
        })
        .catch((err) => {
          //console.log(err.response)
        })
    }
    getIssueDetails()
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={[g.outerContainer, s.background]} ref={scrollViewRef}>
        <ProjectPickerModal
          visibility={showProjectPicker}
          setVisibility={setShowProjectPicker}
          selected={selected}
          setSelected={setSelected}
        />
        <PriorityModal
          visibility={showPriority}
          setVisibility={setShowPriority}
          selected={prioritySelected}
          setSelected={setPrioritySelected}
        />
        <View style={[g.innerContainer]}>
          <CHeaderWithBack
            navigation={navigation}
            title={'Project Budget'}
            onPress={goBack}
          />
          <View style={s.gapVertical}>
            <CSelectWithLabel
              label="Project"
              onPress={openProjectPickerModal}
              selectText={selected.id != -1 ? selected.name : 'Select'}
              errorMessage={errorMessages.project}
              showErrorMessage
              required
            />
            <CSelectWithLabel
              label="Sponsor"
              onPress={openPriorityModal}
              selectText={
                prioritySelected.id != -1 ? capitalizeFirstLetter(prioritySelected.name) : 'Select'
              }
              errorMessage={errorMessages.priority}
              showErrorMessage
            />
             <CInputWithLabel
              value={issueName}
              setValue={setIssueName}
              placeholder="$"
              label="Spending target"
              required
              showErrorMessage
            //   errorMessage={errorMessages.name}
            />
            <CInputWithLabel
              value={issueName}
              setValue={setIssueName}
              placeholder="%"
              label="Buffer"
              showErrorMessage
            //   errorMessage={errorMessages.name}
            />

          </View>

          <CButtonInput label="Save" onPress={addOrUpdateBudget} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    marginBottom: 60,
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
    marginVertical: 10,
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
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
  },
  checklistContainer: {
    backgroundColor: '#F2F6FF',
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  checklistText: {
    color: '#246BFD',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 5,
  },
})
