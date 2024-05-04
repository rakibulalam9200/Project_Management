import { useKeyboard } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { priorities } from '../../assets/constants/priority'
import g from '../../assets/styles/global'
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
import CustomStatusBar from '../../components/common/CustomStatusBar'
import IconWrap from '../../components/common/IconWrap'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'
import PriorityModal from '../../components/modals/PriorityModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import TaskPickerModal from '../../components/modals/TaskPickerModal'
import { setNavigationFrom } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import {
  getErrorMessage,
  hasInvalidDateErrors,
  hasIssueNameErrors,
  hasPriorityPickerErrors,
  hasProjectPickerErrors,
  hasSupervisorPickerErrors,
} from '../../utils/Errors'
import { extractDate, getDateTime } from '../../utils/Timer'
import {
  getClientObjFromSelectedClients,
  getMembersObjFromSelectedUsers,
  getSupervisorObjFromSelectedUsers,
} from '../../utils/User'

export default function IssueAddOrEditScreen({ navigation, route }) {
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
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
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
    priority: '',
    date: '',
    supervisor: '',
  })
  const [issueAddress, setIssueAddress] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { currentProject, currentMilestone, currentTask, navigationFrom } = useSelector(
    (state) => state.navigation
  )
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [selectedClient, setSelectedClient] = useState([])
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const richText = useRef()
  const [showDesValue, setShowDesValue] = useState(false)
  const [editorHeight, setEditorHeight] = useState(164)
  const refOuterScrollView = useRef()

  const resetIssue = () => {
    setIssueName('')
    setIssueDescription('')
    setShowAdvanced(false)
    if (!currentProject) {
      setSelected({ id: -1, name: '' })
    }
    if (!currentMilestone) {
      setMilestoneSelected({ id: -1, name: '' })
    }

    if (!currentTask) {
      setTaskSelected({ id: -1, name: '' })
    }
    // setMilestoneSelected({ id: -1, name: '' })
    //
    setPrioritySelected({ id: -1, name: '' })
    setStartDate(new Date())
    setEndDate(new Date())
    setSelectedUsers([])
    setSelectedSupervisors([])
    setAttachments([])
    setAttachmentDeleteIndexes([])
    setDocuments([])
  }

  const openSupervisorPickerModal = () => {
    setShowSupervisorPickerModal(true)
  }
  const scrollViewRef = useRef(null)

  const goBack = () => {
    if (navigationFrom == 'day') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('DayView')
    } else if (navigationFrom === 'week') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('WeekView')
    } else if (navigationFrom === 'month') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('MonthView')
    } else {
      navigation.goBack()
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

  const openTaskModal = () => {
    setShowTask(true)
  }

  useEffect(() => {
    if (selected?.address) {
      setIssueAddress(selected?.address)
    }
  }, [selected])

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const addorUpdateIssue = () => {
    if (
      hasIssueNameErrors(issueName, setErrorMessages) ||
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
      hasSupervisorPickerErrors(selectedSupervisors, acceptance, setErrorMessages)
    ) {
      return
    }
    setLoading(true)
    let body = {
      name: issueName,
      description: issueDescription,
      acceptance_needed: acceptance,
      priority: prioritySelected?.name,
      project_id: selected?.id,
      // address: issueAddress,
    }
    if (taskSelected?.id > -1) {
      body['task_id'] = taskSelected?.id
      // task_id: taskSelected.id,
    }
    if (milestoneSelected?.id > -1) {
      body['milestone_id'] = milestoneSelected?.id
      // task_id: taskSelected.id,
    }
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)
    if (issueAddress) body['address'] = issueAddress

    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    let supervisors = getSupervisorObjFromSelectedUsers(selectedSupervisors)
    let clients = getClientObjFromSelectedClients(selectedClient)
    body = { ...body, ...attachments, ...attachmentIds, ...members, ...supervisors, ...clients }
    //console.log(body, 'body before post check...')
    if (id) {
      body['_method'] = 'PUT'
      api.issue
        .updateIssue(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('IssueDetails', { id: id, refetch: Math.random() })
          }
          setLoading(false)
        })
        .catch((err) => {
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
          setLoading(false)
        })
    } else {
      api.issue
        .createIssue(body)
        .then((res) => {
          if (res.success) {
            // //console.log(res, 'res.data')
            navigation.navigate('Issues', { refetch: Math.random() })
          }
          resetIssue()
          setLoading(false)
        })
        .catch((err) => {
          let errMsg = ''
          setLoading(false)
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            //console.log(err, 'error')
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    // //console.log(body)
  }

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
      setIssueAddress(currentProject?.address)
    }
    if (currentMilestone) {
      setSelected(currentMilestone?.project)
      setMilestoneSelected(currentMilestone)
    }
    if (currentTask) {
      //console.log(currentTask, 'current task####')
      setTaskSelected(currentTask)
      setMilestoneSelected(currentTask?.milestone)
      setSelected(currentTask?.project)
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
              address,
              project,
              task,
              milestone,
              priority,
              acceptance_needed,
              user_members,
              user_supervisors,
              user_clients,
            } = res.issue
            if (name != 'null') setIssueName(name)
            setSelected(project)

            if (milestone === null) {
              setMilestoneSelected({ id: -1, name: '' })
            } else {
              setMilestoneSelected(milestone)
            }

            if (task === null) {
              setTaskSelected({ id: -1, name: '' })
            } else {
              setTaskSelected(task)
            }
            // setMilestoneSelected(task.milestone)

            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            acceptance_needed ? setAcceptance(true) : setAcceptance(false)
            if (address != 'null') setIssueAddress(address)
            if (description?.value && description?.value != 'null') {
              setIssueDescription(description?.value ? description.value : '')
              setShowDesValue(true)
            }
            //
            if (start_date) setStartDate(new Date(extractDate(start_date)))
            if (end_date) setEndDate(new Date(extractDate(end_date)))
            setAttachments(attachments)
            setSelectedUsers(
              user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedSupervisors(
              user_supervisors.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedClient(
              user_clients.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
          }
        })
        .catch((err) => {})
    }
    getIssueDetails()
  }, [])

  const setDescriptionHtml = () => {
    if (issueDescription) richText.current?.setContentHTML(issueDescription)
  }

  useEffect(() => {
    setDescriptionHtml()
  }, [showDesValue])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])
  const keyboard = useKeyboard()
  const {
    coordinates: {
      end: { screenY },
    },
  } = keyboard
  const [addressFocused, setAddressFocused] = useState(false)
  const handleScroll = (scrollHeight) => {
    if (scrollHeight > 100) {
      scrollViewRef.current?.scrollTo({
        y: scrollHeight,
        animated: false,
      })
    }
  }
  const handleFocusOnAddress = (myFocused) => {
    setAddressFocused(myFocused)
  }
  const { height, width } = Dimensions.get('window')
  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[{ flex: 1, backgroundColor: colors.WHITE, height: '100%' }]}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            richText.current?.dismissKeyboard()
            setKeyboardShow(false)
          }}
        >
          <View
            style={[
              { flex: 1 },
              keyboardShow
                ? { marginBottom: 0 }
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 92 : 76 },
            ]}
          >
            {/* <CHeaderWithBack
              navigation={navigation}
              title={`${id ? 'Edit Issue' : 'Add Issue'}`}
              onPress={goBack}
              containerStyle={{ marginTop: 0, paddingHorizontal: 16 }}
              loading={loading}
            /> */}

            <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
              <TouchableOpacity disabled={loading} onPress={goBack}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={[g.body1, { textAlign: 'center' }]}>
                  {id ? 'Update Issue' : 'Add New Issue'}
                </Text>
              </View>
            </View>

            <ScrollView
              style={[g.listingOuterContainer, { backgroundColor: colors.WHITE }]}
              ref={scrollViewRef}
              automaticallyAdjustKeyboardInsets={addressFocused}
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
              />
              <MilestonePickerModal
                projectId={selected?.id}
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
              <TaskPickerModal
                projectId={selected && selected?.id}
                milestoneId={milestoneSelected?.id}
                visibility={showTask}
                setVisibility={setShowTask}
                selected={taskSelected}
                setSelected={setTaskSelected}
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
                selected={selectedSupervisors}
                setSelected={setSelectedSupervisors}
                navigationFrom={'Add'}
              />
              <ClientPickerModal
                visibility={showClientPickerModal}
                setVisibility={setShowClientPickerModal}
                selected={selectedClient}
                setSelected={setSelectedClient}
                navigationFrom={'Add'}
              />
              {/* <HideKeyboard> */}
              <View style={[g.innerContainer]} onStartShouldSetResponder={() => !keyboardShow}>
               
                  <CInputWithLabel
                    value={issueName}
                    setValue={setIssueName}
                    placeholder="Name"
                    label="Name"
                    required
                    showErrorMessage={errorMessages.name !== ''}
                    errorMessage={errorMessages.name}
                  />
                  <CSelectWithLabel
                    label="Project"
                    onPress={openProjectPickerModal}
                    selectText={selected?.id != -1 ? selected?.name : 'Select'}
                    errorMessage={errorMessages.project}
                    showErrorMessage={errorMessages.project !== ''}
                    required
                  />

                  <ScrollView scrollEnabled={false}>
                    <RichEditor
                      placeholder="Issue description"
                      androidHardwareAccelerationDisabled={true}
                      editorStyle={{
                        backgroundColor: colors.CONTAINER_BG,
                        color: colors.BLACK,
                      }}
                      scrollEnabled={false}
                      ref={richText}
                      initialContentHTML={issueDescription}
                      onChange={(descriptionText) => {
                        setIssueDescription(descriptionText)
                      }}
                      onCursorPosition={handleScroll}
                      onFocus={() => {
                        setKeyboardShow(true)
                      }}
                      onBlur={() => setAddressFocused(false)}
                      initialHeight={editorHeight}
                    />
                  </ScrollView>
                  {!keyboardShow && <>
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
                  <CSelectWithLabel
                    label="Milestone"
                    onPress={openMilestonePickerModal}
                    selectText={milestoneSelected?.id != -1 ? milestoneSelected?.name : 'Select'}
                    errorMessage={errorMessages.milestone}
                    showErrorMessage={errorMessages.milestone !== ''}
                    // required
                  />
                  <CSelectWithLabel
                    label="Task"
                    onPress={openTaskModal}
                    selectText={taskSelected.id != -1 ? taskSelected.name : 'Select'}
                    errorMessage={errorMessages.task}
                    showErrorMessage={errorMessages.task !== ''}
                    // required
                  />
                 
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
                  <View style={{ marginBottom: 54 }}>
                    <ScrollView
                      horizontal={true}
                      style={{
                        width: '100%',
                        flex: 1,
                        flexDirection: 'column',
                        marginVertical: 8,
                      }}
                      keyboardShouldPersistTaps="always"
                    >
                      <View style={{ flex: 1, width: '100%', marginBottom: 8 }}>
                        <Text style={s.labelStyle}>Task Address</Text>
                        <AutoCompletePLace
                          onFocus={handleFocusOnAddress}
                          setValue={setIssueAddress}
                          value={issueAddress}
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

                    {selectedClient.length == 0 && (
                      <CSelectWithLabel
                        label="Client"
                        onPress={() => setShowClientPickerModal(true)}
                      />
                    )}
                    {selectedClient.length > 0 && (
                      <CSelectedUsers
                        label={'Client'}
                        selectedUsers={selectedClient}
                        setSelectedUsers={setSelectedClient}
                        onEditPress={() => setShowClientPickerModal(true)}
                      />
                    )}

                    <CAttachments
                      attachments={attachments}
                      setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                      attachmentDeleteIndexes={attachmentDeleteIndexes}
                    />
                    {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
                    <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
                    <CCheckbox
                      checked={acceptance}
                      setChecked={setAcceptance}
                      label={'Acceptance Needed'}
                    />

                    {acceptance && selectedSupervisors.length == 0 && (
                      <CSelectWithLabel
                        label="Supervisor"
                        onPress={() => setShowSupervisorPickerModal(true)}
                        errorMessage={errorMessages.supervisor}
                        showErrorMessage={errorMessages.supervisor !== ''}
                      />
                    )}
                    {acceptance && selectedSupervisors.length > 0 && (
                      <CSelectedUsers
                        label="Supervisor"
                        selectedUsers={selectedSupervisors}
                        setSelectedUsers={setSelectedSupervisors}
                        onEditPress={() => setShowSupervisorPickerModal(true)}
                      />
                    )}
                  </View>
                )}
                </>}
              </View>
              {/* </HideKeyboard> */}
            </ScrollView>
            {keyboardShow && (
              <RichToolbar
                style={{ backgroundColor: colors.WHITE, marginBottom: 0 }}
                editor={richText}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertOrderedList,
                  actions.insertBulletsList,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                  // keyboardShow ? actions.keyboard : null,
                ]}
                selectedButtonStyle={[g.editorActivebuttonStyle]}
              />
            )}
            {!keyboardShow && (
              <View style={{ paddingHorizontal: 16 }}>
                <CButtonInput label="Save" onPress={addorUpdateIssue} loading={loading} />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
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
    // marginVertical: 10,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    // backgroundColor: 'yellow',
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
})
