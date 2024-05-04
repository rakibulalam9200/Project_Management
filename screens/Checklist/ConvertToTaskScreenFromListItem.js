import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import DotsIcon from '../../assets/svg/dots.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import HideKeyboard from '../../components/common/HideKeyboard'
import IconWrap from '../../components/common/IconWrap'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import CheckListModal from '../../components/modals/CheckListModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'
import PriorityModal from '../../components/modals/PriorityModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import {
  getErrorMessage,
  hasInvalidDateErrors,
  hasPriorityPickerErrors,
  hasProjectPickerErrors,
  hasSupervisorPickerErrors,
  hasTaskNameErrors,
} from '../../utils/Errors'
import { getDateTime } from '../../utils/Timer'
import { getMembersObjFromSelectedUsers, getSupervisorObjFromSelectedUsers } from '../../utils/User'

export default function ConvertToTaskScreenFromListItem({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let start_date = route.params ? route.params.start_date : null
  let end_date = route.params ? route.params.end_date : null
  let projectInfo = route.params ? route.params.project : null
  const backScreen = route?.params?.backScreen
  const listItem = route.params ? route.params.listItem : null
  //console.log('----listItem------', listItem)
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedSupervisor, setSelectedSupervisor] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [checklistSelected, setChecklistSelected] = useState({ id: -1, name: '' })
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    project: '',
    milestone: '',
    priority: '',
    date: '',
    supervisor: '',
  })
  const [loading, setLoading] = useState(false)
  const [taskAddress, setTaskAddress] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  // const { currentProject, currentMilestone } = useSelector((state) => state.navigation)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const scrollViewRef = useRef(null)

  const goBack = () => {
    navigation.goBack()
  }

  const successGoBack = () => {
    if (backScreen) {
      navigation.navigate(backScreen)
    } else {
      if (id) {
        navigation.navigate('TaskDetails', { id: id, refetch: Math.random() })
      } else {
        navigation.navigate('Tasks', { refetch: Math.random() })
      }
    }
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

  const openCheckListModal = () => {
    setShowChecklist(true)
  }

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  useEffect(() => {
    if (selected?.address) {
      setTaskAddress(selected?.address)
    }
  }, [selected])

  const convertToTask = () => {
    if (
      hasTaskNameErrors(taskName, setErrorMessages) ||
      hasProjectPickerErrors(selected.name, setErrorMessages) ||
      hasPriorityPickerErrors(prioritySelected.name, setErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    if (
      hasInvalidDateErrors(startDate, endDate, setErrorMessages) ||
      hasSupervisorPickerErrors(selectedSupervisor, acceptance, setErrorMessages)
    ) {
      return
    }
    setLoading(true)
    let body = {
      name: taskName,
      description: taskDescription,
      // address: taskAddress,
      acceptance_needed: acceptance,
      priority: prioritySelected.name,
      project_id: selected.id,
    }

    if (listItem) {
      body['list_id'] = listItem?.id
    }

    if (milestoneSelected.id != -1) body['milestone_id'] = milestoneSelected.id
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)
    if (taskAddress) body['address'] = taskAddress
    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    let supervisors = getSupervisorObjFromSelectedUsers(selectedSupervisor)
    body = { ...body, ...attachments, ...attachmentIds, ...members, ...supervisors }

    //console.log('body', body)
    api.checklist
      .convertToTask(body)
      .then((res) => {
        if (res.success) {
          // successGoBack()
          setLoading(false)
          navigation.navigate('ChecklistDetails', {
            id: listItem?.todolist_id,
            refetch: Math.random(),
          })
        }
      })
      .catch((err) => {
        setLoading(false)
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

  useEffect(() => {
    // if (currentProject) {
    //   setSelected(currentProject)
    //   setTaskAddress(currentProject?.address)
    // }
    // if (currentMilestone) {
    //   setSelected(currentMilestone?.project)
    //   setTaskAddress(currentProject?.project?.address)
    //   setMilestoneSelected(currentMilestone)
    // }

    if (listItem) {
      setTaskDescription(listItem?.description?.plain_text_value)
    }
    if (listItem?.attachments.length > 0) {
      setAttachments(listItem?.attachments)
    }
    // const getTaskDetails = async () => {
    //   api.task
    //     .getTask(id)
    //     .then((res) => {
    //       if (res.success) {
    //         const {
    //           name,
    //           description,
    //           address,
    //           start_date,
    //           end_date,
    //           attachments,
    //           project,
    //           milestone,
    //           priority,
    //           acceptance_needed,
    //           user_members,
    //           user_supervisors,
    //         } = res.task
    //         // //console.log('Here ->>', res.task)
    //         if (name != 'null') setTaskName(name)
    //         setSelected(project)
    //         //console.log(milestone)
    //         if (milestone === null) {
    //           setMilestoneSelected({ id: -1, name: '' })
    //         } else {
    //           setMilestoneSelected(milestone)
    //         }
    //         let prioName = priorities.find((prio) => {
    //           return prio.name === priority
    //         })
    //         if (prioName) setPrioritySelected(prioName)
    //         acceptance_needed ? setAcceptance(true) : setAcceptance(false)

    //         if (description?.value != 'null')
    //           setTaskDescription(description?.value ? description.value : '')
    //         if (start_date) setStartDate(new Date(extractDate(start_date)))
    //         if (end_date) setEndDate(new Date(extractDate(end_date)))
    //         if (address != 'null') setTaskAddress(address)
    //         // //console.log(attachments)
    //         setAttachments(attachments)
    //         setSelectedUsers(
    //           user_members.map((user) => {
    //             return { ...user, id: user.user_id }
    //           })
    //         )
    //         setSelectedSupervisor(
    //           user_supervisors.map((user) => {
    //             return { ...user, id: user.user_id }
    //           })
    //         )
    //       }
    //     })
    //     .catch((err) => //console.log(err.response))
    // }
    // if (id) getTaskDetails()
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  // useEffect(() => {
  //   if (route.params?.fromNote) {
  //     setTaskDescription(route.params.noteDetails?.description?.value)
  //     setDocuments(route.params.noteDetails?.attachments)
  //   }
  // }, [route.params])

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.WHITE },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <StatusBar backgroundColor={colors.CONTAINER_BG} />
      <View style={[{ flex: 1 }, s.background]}>
        <ScrollView
          style={[g.listingOuterContainer, { backgroundColor: colors.WHITE }]}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          horizontal={false}
        >
          <ProjectPickerModal
            visibility={showProjectPicker}
            setVisibility={setShowProjectPicker}
            selected={selected}
            setSelected={setSelected}
            // setTaskAddress={setTaskAddress}
          />
          <MilestonePickerModal
            projectId={selected.id}
            visibility={showMilestonePicker}
            setVisibility={setShowMilestonePicker}
            selected={milestoneSelected}
            setSelected={setMilestoneSelected}
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
          <MemberPickerModal
            visibility={showUserPickerModal}
            setVisibility={setShowUserPickerModal}
            selected={selectedUsers}
            setSelected={setSelectedUsers}
            navigationFrom={'Add'}
          />
          <SupervisorPickerModal
            visibility={showSupervisorPickerModal}
            setVisibility={setShowSupervisorPickerModal}
            selected={selectedSupervisor}
            setSelected={setSelectedSupervisor}
            navigationFrom={'Add'}
          />
          <HideKeyboard>
            <View style={[g.innerContainer]}>
              {/* <CHeaderWithBack
              navigation={navigation}
              title={`${id ? 'Update' : 'Add New '} Task`}
              onPress={goBack}
            /> */}
              <View style={[g.hFlex]}>
                <TouchableOpacity onPress={goBack} disabled={loading}>
                  <BackArrow fill={colors.NORMAL} />
                </TouchableOpacity>
                <View style={{ width: '100%', flex: 1 }}>
                  <Text style={[g.body1, { textAlign: 'center' }]}>{`Convert to Task`}</Text>
                </View>
              </View>
              <View>
                <CInputWithLabel
                  value={taskName}
                  setValue={setTaskName}
                  placeholder="Name"
                  label="Name"
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                />
                <CSelectWithLabel
                  label="Project"
                  onPress={openProjectPickerModal}
                  selectText={selected.id != -1 ? selected.name : 'Select'}
                  errorMessage={errorMessages.project}
                  showErrorMessage={errorMessages.project !== ''}
                  required
                />
                <CSelectWithLabel
                  label="Milestone"
                  onPress={openMilestonePickerModal}
                  selectText={milestoneSelected.id != -1 ? milestoneSelected.name : 'Select'}
                  errorMessage={errorMessages.milestone}
                  showErrorMessage={errorMessages.milestone !== ''}
                />
                <CSelectWithLabel
                  label="Priority"
                  onPress={openPriorityModal}
                  selectText={
                    prioritySelected.id != -1
                      ? capitalizeFirstLetter(prioritySelected.name)
                      : 'Select'
                  }
                  errorMessage={errorMessages.priority}
                  showErrorMessage={errorMessages.priority !== ''}
                  required
                />
                <TextInput
                  style={s.inputStyle}
                  spaces={false}
                  maxLength={2000}
                  placeholder="Task Description"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.HEADER_TEXT}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  height={164}
                />
              </View>

              <View style={g.moreContainerRight}>
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
                <View>
                  <ScrollView
                    horizontal={true}
                    style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 8 }}
                    keyboardShouldPersistTaps="always"
                  >
                    <View style={{ flex: 1, width: '100%', marginBottom: 8 }}>
                      <Text style={s.labelStyle}>Task Address</Text>
                      <AutoCompletePLace
                        setValue={setTaskAddress}
                        value={taskAddress}
                        placeholder={'Address'}
                        type=""
                      />
                    </View>
                  </ScrollView>
                  <View style={[{ flex: 1, marginVertical: 8 }]}>
                    <View style={[g.containerBetween]}>
                      <CDateTime
                        pickedDate={startDate}
                        setPickedDate={setStartDate}
                        type="datetime"
                        showLabel={true}
                        label={'Start date'}
                        containerStyle={{ marginRight: 8 }}
                      />
                      <CDateTime
                        pickedDate={endDate}
                        setPickedDate={setEndDate}
                        type="datetime"
                        showLabel={true}
                        label={'End date'}
                      />
                    </View>
                    {errorMessages.date !== '' && (
                      <Text style={s.errorMessage}>{errorMessages.date}</Text>
                    )}
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
                  {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
                  <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
                  {/* <TouchableOpacity style={s.checklistContainer} onPress={openCheckListModal}>
                  <PlusIcon />
                  <Text style={s.checklistText}>Add Checklist</Text>
                </TouchableOpacity> */}
                  <CCheckbox
                    checked={acceptance}
                    setChecked={setAcceptance}
                    label={'Acceptance Needed'}
                  />
                  {acceptance && selectedSupervisor.length == 0 && (
                    <CSelectWithLabel
                      label="Supervisor"
                      onPress={() => setShowSupervisorPickerModal(true)}
                      errorMessage={errorMessages.supervisor}
                      showErrorMessage={errorMessages.supervisor !== ''}
                    />
                  )}
                  {acceptance && selectedSupervisor.length > 0 && (
                    <CSelectedUsers
                      label="Supervisor"
                      selectedUsers={selectedSupervisor}
                      setSelectedUsers={setSelectedSupervisor}
                      onEditPress={() => setShowSupervisorPickerModal(true)}
                    />
                  )}
                </View>
              )}
              {/* <CButtonInput label="Save" onPress={convertToTask} loading={loading} /> */}
            </View>
          </HideKeyboard>
        </ScrollView>
        <View style={{ paddingHorizontal: 16 }}>
          <CButtonInput label="Save" onPress={convertToTask} loading={loading} />
        </View>
      </View>
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
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
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
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
})
