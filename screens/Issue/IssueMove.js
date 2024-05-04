import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import g from '../../assets/styles/global'

import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { priorities } from '../../assets/constants/priority'
import DotsIcon from '../../assets/svg/dots.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CDocumentPicker from '../../components/common/CDocumentPicker'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import HideKeyboard from '../../components/common/HideKeyboard'
import IconWrap from '../../components/common/IconWrap'
import CheckListModal from '../../components/modals/CheckListModal'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'
import PriorityModal from '../../components/modals/PriorityModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import UserPickerModal from '../../components/modals/UserPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsFromDocuments,
  getAttachmentsIdsFromDeleteIndexArrays
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import {
  getErrorMessage,
  hasPriorityPickerErrors,
  hasProjectPickerErrors,
  hasTaskNameErrors
} from '../../utils/Errors'
import { extractDate, getDateTime } from '../../utils/Timer'
import { getMembersObjFromSelectedUsers } from '../../utils/User'
import { StatusBar } from 'react-native'
import TaskPickerModal from '../../components/modals/TaskPickerModal'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'

export default function IssueMoveScreen({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let projectInfo = route.params ? route.params.project : null
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showTaskPicker, setShowTaskPicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState({ id: -1, name: '' })
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [checklistSelected, setChecklistSelected] = useState({ id: -1, name: '' })
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    project: '',
    milestone: '',
    priority: '',
  })
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const { currentProject, currentMilestone } = useSelector((state) => state.navigation)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
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

  const openTaskPickerModal = () => {
    setShowTaskPicker(true)
  }

  const openPriorityModal = () => {
    setShowPriority(true)
  }

  const openCheckListModal = () => {
    setShowChecklist(true)
  }

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }


  const attemptMove = () => {
    if (
      hasTaskNameErrors(name, setErrorMessages) ||
      hasProjectPickerErrors(selected.name, setErrorMessages) ||
      hasPriorityPickerErrors(prioritySelected.name, setErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    setLoading(true)
    let body = {
      name: name,
      description: description,
      acceptance_needed: acceptance,
      priority: prioritySelected.name,
      project_id: selected.id,
    }

    if (milestoneSelected.id != -1) body['milestone_id'] = milestoneSelected.id
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)

    let attachments = getAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    body = { ...body, ...attachments, ...attachmentIds, ...members }

    //console.log('Body ->>', body)
    return
    if (id) {
      body['_method'] = 'PUT'
      api.task
        .updateTask(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('TaskDetails', { id: id, refetch: Math.random() })
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
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

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
    }

    const getIssueDetails = async () => {
      api.issue.getIssue(id)
        .then((res) => {
          if (res.success) {
            const {
              name,
              description,
              start_date,
              end_date,
              attachments,
              project,
              milestone,
              task,
              priority,
              acceptance_needed,
              user_members,
            } = res.issue
            //console.log('Here ->>', res.issue)
            if (name != 'null') setName(name)
            setSelected(project)
            milestone && setMilestoneSelected(milestone)
            task && setTaskSelected(task)
            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            acceptance_needed ? setAcceptance(true) : setAcceptance(false)

            if (description?.value != 'null')
              setDescription(description?.value ? description.value : '')
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
        .catch((err) => {})
    }
    getIssueDetails()
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])



  return (
    <SafeAreaView style={[g.safeAreaStyle]}>
      <StatusBar animated={true} backgroundColor={colors.SEC_BG} />
      <ScrollView style={[g.listingOuterContainer, s.background]} ref={scrollViewRef}>
        <ProjectPickerModal
          visibility={showProjectPicker}
          setVisibility={setShowProjectPicker}
          selected={selected}
          setSelected={setSelected}
        />

        <MilestonePickerModal
          visibility={showMilestonePicker}
          setVisibility={setShowMilestonePicker}
          selected={milestoneSelected}
          projectId={selected.id}
          setSelected={setMilestoneSelected}
        />

        <TaskPickerModal
          visibility={showTaskPicker}
          setVisibility={setShowTaskPicker}
          selected={taskSelected}
          projectId={selected.id}
          milestoneId={milestoneSelected.id}
          setSelected={setTaskSelected}
        />


        <PriorityModal
          visibility={showPriority}
          setVisibility={setShowPriority}
          selected={prioritySelected}
          setSelected={setPrioritySelected}
        />
        <CheckListModal
          visibility={showChecklist}
          setVisibility={setShowChecklist}
          selected={checklistSelected}
          setSelected={setChecklistSelected}
        />
        <UserPickerModal
          visibility={showUserPickerModal}
          setVisibility={setShowUserPickerModal}
          selected={selectedUsers}
          setSelected={setSelectedUsers}
        />
        <View style={[{ justifyContent: 'space-between', paddingBottom: 60 }]}>


          <HideKeyboard>
            <View style={{}}>

              <View style={{ backgroundColor: colors.SEC_BG, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                {/* <View style={s.header}>
                  <TouchableOpacity
                    onPress={() => {
                      // //console.log(refetch)
                      navigation.goBack()
                    }}
                  >
                    <BackArrow fill={colors.NORMAL} />
                  </TouchableOpacity>
                  <View style={{}}>
                    <Text style={[g.body1]}>Move</Text>
                  </View>
                  <View style={{}}>

                  </View>
                </View> */}
                <CHeaderWithBack
                  onPress={goBack}
                  title="Move"
                  labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
                  iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                  containerStyle={{ marginTop: 0 }}
                />

                <View style={{ marginTop: 10, }}>
                  <Text style={{ fontSize: 16 }}>Please, select Project, milestone, and task where to move</Text>
                </View>

              </View>
              <View style={s.gapVertical}>
                <CInputWithLabel
                  value={name}
                  setValue={setName}
                  placeholder="Name"
                  label="Name"
                  required
                  showErrorMessage={errorMessages.name}
                  errorMessage={errorMessages.name}
                />
                <CSelectWithLabel
                  label="Project"
                  onPress={openProjectPickerModal}
                  selectText={selected.id != -1 ? selected.name : 'Select'}
                  errorMessage={errorMessages.project}
                  showErrorMessage={errorMessages.project}
                  required
                />
                <CSelectWithLabel
                  label="Milestone"
                  onPress={openMilestonePickerModal}
                  selectText={milestoneSelected.id != -1 ? milestoneSelected.name : 'Select'}
                  errorMessage={errorMessages.project}
                  showErrorMessage={errorMessages.project}

                />
                <CSelectWithLabel
                  label="Task"
                  onPress={openTaskPickerModal}
                  selectText={taskSelected.id != -1 ? taskSelected.name : 'Select'}
                  errorMessage={errorMessages.project}
                  showErrorMessage={errorMessages.project}

                />
                <CSelectWithLabel
                  label="Priority"
                  onPress={openPriorityModal}
                  selectText={
                    prioritySelected.id != -1 ? capitalizeFirstLetter(prioritySelected.name) : 'Select'
                  }
                  errorMessage={errorMessages.priority}
                  showErrorMessage={errorMessages.priority}
                  required
                />
                <TextInput
                  style={s.inputStyle}
                  spaces={false}
                  maxLength={2000}
                  placeholder="Issue Description"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.HEADER_TEXT}
                  value={description}
                  onChangeText={setDescription}
                  height={164}
                />
              </View>

              <View style={[g.containerRight, { paddingHorizontal: 16, marginBottom: 10 }]}>
                <Text style={s.inputHeader}>{showAdvanced ? 'Hide ' : 'More '} Options</Text>
                <IconWrap
                  onPress={() => {
                    setShowAdvanced((prev) => !prev)
                  }}
                  outputRange={iconWrapColors}
                >
                  <DotsIcon fill={'dodgerblue'} />
                </IconWrap>
              </View>

              {showAdvanced && (
                <View style={{ paddingHorizontal: 16 }}>
                  <View style={g.containerBetween}>
                    <CDateTime pickedDate={startDate} setPickedDate={setStartDate} type="datetime" />
                    <CDateTime pickedDate={endDate} setPickedDate={setEndDate} type="datetime" />
                  </View>
                  {selectedUsers.length == 0 && (
                    <CSelectWithLabel label="Members" onPress={openUserPickerModal} />
                  )}
                  {selectedUsers.length > 0 && (
                    <CSelectedUsers
                      selectedUsers={selectedUsers}
                      setSelectedUsers={setSelectedUsers}
                      onEditPress={openUserPickerModal}
                    />
                  )}

                  <CAttachments
                    attachments={attachments}
                    setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                    attachmentDeleteIndexes={attachmentDeleteIndexes}
                  />
                  <CDocumentPicker documents={documents} setDocuments={setDocuments} />

                  <CCheckbox
                    checked={acceptance}
                    setChecked={setAcceptance}
                    label={'Acceptance Needed'}
                  />
                </View>
              )}

            </View>
          </HideKeyboard>
          <View style={{ paddingHorizontal: 16 }}>
            <CButtonInput label="Move" onPress={attemptMove} loading={loading} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    paddingBottom: 60,
    flex: 1,

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
    paddingHorizontal: 16
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    // borderWidth: 1,
    // marginBottom: 20,
  },

  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

})
