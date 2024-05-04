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
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { useKeyboard } from '@react-native-community/hooks'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { priorities } from '../../assets/constants/priority'
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
import CheckListModal from '../../components/modals/CheckListModal'
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'
import PriorityModal from '../../components/modals/PriorityModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
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
  hasPriorityPickerErrors,
  hasProjectPickerErrors,
  hasSupervisorPickerErrors,
  hasTaskNameErrors,
} from '../../utils/Errors'
import { extractDate, getDateTime } from '../../utils/Timer'
import {
  getClientObjFromSelectedClients,
  getMembersObjFromSelectedUsers,
  getSupervisorObjFromSelectedUsers,
} from '../../utils/User'

export default function TaskAddOrEditScreen({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let start_date = route.params ? route.params.start_date : null
  let end_date = route.params ? route.params.end_date : null
  let projectInfo = route.params ? route.params.project : null
  const backScreen = route?.params?.backScreen
  // //console.log(backScreen)
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [startDate, setStartDate] = useState(start_date ? new Date(start_date) : new Date())
  const [endDate, setEndDate] = useState(end_date ? new Date(end_date) : new Date())
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedSupervisor, setSelectedSupervisor] = useState([])
  const [selectedClient, setSelectedClient] = useState([])
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [checklistSelected, setChecklistSelected] = useState({ id: -1, name: '' })
  const [keyboardShow, setKeyboardShow] = useState(false)
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
  const { currentProject, navigationFrom, currentMilestone } = useSelector(
    (state) => state.navigation
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const scrollViewRef = useRef(null)
  const richText = useRef()
  const [editorHeight, setEditorHeight] = useState(164)
  const refOuterScrollView = useRef()
  const [showDesValue, setShowDesValue] = useState(false)

  const resetTask = () => {
    setTaskName('')
    setTaskDescription('')
    setShowAdvanced(false)
    if (!currentProject) {
      setSelected({ id: -1, name: '' })
    }
    if (!currentMilestone) {
      setMilestoneSelected({ id: -1, name: '' })
    }
    // setMilestoneSelected({ id: -1, name: '' })
    //
    setPrioritySelected({ id: -1, name: '' })
    setStartDate(start_date ? new Date(start_date) : new Date())
    setEndDate(end_date ? new Date(end_date) : new Date())
    setSelectedUsers([])
    setSelectedSupervisor([])
    setAttachments([])
    setAttachmentDeleteIndexes([])
    setDocuments([])
  }

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

  const addorUpdateTask = () => {
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

    if (milestoneSelected.id != -1) body['milestone_id'] = milestoneSelected.id
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)
    if (taskAddress) body['address'] = taskAddress
    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    let supervisors = getSupervisorObjFromSelectedUsers(selectedSupervisor)
    let clients = getClientObjFromSelectedClients(selectedClient)
    body = { ...body, ...attachments, ...attachmentIds, ...members, ...supervisors, ...clients }

    //console.log('body', body)

    if (route.params?.fromNote) {
      // //console.log('Converting notes to task ->', route.params.noteDetails?.description?.id, 'Note id',)
      body['note_id'] = route.params.noteDetails?.id
      // //console.log('Converting notes to task note id->', body)
      api.task
        .notesConvertToTask(body)
        .then((res) => {
          //console.log(res)
          Alert.alert('Converted Successfully')
          navigation.navigate('Notes')
          resetTask()
        })
        .catch((err) => {
          Alert.alert('An Error Occured')
          //console.log(err.response.data)
        })
    } else if (id) {
      body['_method'] = 'PUT'
      api.task
        .updateTask(body, id)
        .then((res) => {
          if (res.success) {
            successGoBack()
            setLoading(false)
            resetTask()
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
    } else {
      api.task
        .createTask(body)
        .then((res) => {
          if (res.success) {
            successGoBack()
            setLoading(false)
            resetTask()
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
  }

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
      setTaskAddress(currentProject?.address)
    }
    if (currentMilestone) {
      setSelected(currentMilestone?.project)
      setTaskAddress(currentProject?.project?.address)
      setMilestoneSelected(currentMilestone)
    }

    const getTaskDetails = async () => {
      api.task
        .getTask(id)
        .then((res) => {
          if (res.success) {
            const {
              name,
              description,
              address,
              start_date,
              end_date,
              attachments,
              project,
              milestone,
              priority,
              acceptance_needed,
              user_members,
              user_supervisors,
              user_clients,
            } = res.task
            // //console.log('Here ->>', res.task)
            if (name != 'null') setTaskName(name)
            setSelected(project)
            //console.log(milestone)
            if (milestone === null) {
              setMilestoneSelected({ id: -1, name: '' })
            } else {
              setMilestoneSelected(milestone)
            }
            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            acceptance_needed ? setAcceptance(true) : setAcceptance(false)

            if (description?.value && description?.value != 'null') {
              // richText.current?.setContentHTML(description?.value)
              setTaskDescription(description?.value ? description.value : '')
              setShowDesValue(true)
            }

            if (start_date) setStartDate(new Date(extractDate(start_date)))
            if (end_date) setEndDate(new Date(extractDate(end_date)))
            if (address != 'null') setTaskAddress(address)
            // //console.log(attachments)
            setAttachments(attachments)
            setSelectedUsers(
              user_members.map((user) => {
                return { ...user, id: user.user_id }
              })
            )
            setSelectedSupervisor(
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
    if (id) getTaskDetails()
  }, [])

  const setDescriptionHtml = () => {
    if (taskDescription) richText.current?.setContentHTML(taskDescription)
  }

  useEffect(() => {
    setDescriptionHtml()
  }, [showDesValue])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    if (route.params?.fromNote) {
      richText.current?.setContentHTML(route.params.noteDetails?.description?.plain_text_value)
      // setTaskDescription(route.params.noteDetails?.description?.plain_text_value)
      setDocuments(route.params.noteDetails?.attachments)
    }
  }, [route.params])

  const { height, width } = Dimensions.get('window')
  const keyboard = useKeyboard()
  const {
    coordinates: {
      end: { screenY },
    },
    keyboardShown
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

  return (
    <View
      style={[{ flex: 1 }, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
    >
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={100}
        style={[{ flex: 1, backgroundColor: colors.WHITE, height: '100%' }]}
        enabled={keyboardShow}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            richText.current?.dismissKeyboard()
            // //console.log('clicked for dismiss')
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
            <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
              <TouchableOpacity onPress={goBack} disabled={loading}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={[g.body1, { textAlign: 'center' }]}>
                  {id ? 'Update Task' : 'Add New Task'}
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
                // setTaskAddress={setTaskAddress}
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
                  selectText={selected?.id != -1 ? selected?.name : 'Select'}
                  errorMessage={errorMessages.project}
                  showErrorMessage={errorMessages.project !== ''}
                  required
                />
                <ScrollView scrollEnabled={false}>
                  <RichEditor
                  placeholder="Task description"
                    androidHardwareAccelerationDisabled={true}
                    editorStyle={{
                      backgroundColor: colors.CONTAINER_BG,
                      color: colors.BLACK,
                    }}
                    scrollEnabled={false}
                    ref={richText}
                    initialContentHTML={taskDescription}
                    onChange={(descriptionText) => {
                      setTaskDescription(descriptionText)
                    }}
                    onCursorPosition={handleScroll}
                    onFocus={() => {
                      setKeyboardShow(true)
                    }}
                    onBlur={() => setAddressFocused(false)}
                    initialHeight={editorHeight}
                  />
                </ScrollView>

                {!keyboardShow && ( 
                <>
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
                  selectText={milestoneSelected.id != -1 ? milestoneSelected.name : 'Select'}
                  errorMessage={errorMessages.milestone}
                  showErrorMessage={errorMessages.milestone !== ''}
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
                      <View>
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
                  </>
                )}
                {/* <CButtonInput label="Save" onPress={addorUpdateTask} loading={loading} /> */}
              </View>
              {/* </HideKeyboard> */}
            </ScrollView>
            {keyboardShow && (
              <RichToolbar
                style={[{ backgroundColor: colors.WHITE, marginBottom: 8 }]}
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
                <CButtonInput label="Save" onPress={addorUpdateTask} loading={loading} />
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
