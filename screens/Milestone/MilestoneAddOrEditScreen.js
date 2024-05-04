import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { useKeyboard } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
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
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
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
  hasMilestoneNameErrors,
  hasPriorityPickerErrors,
  hasProjectPickerErrors,
  hasSupervisorPickerErrors,
} from '../../utils/Errors'
import { getDateTime, jsCoreDateCreator } from '../../utils/Timer'
import {
  getClientObjFromSelectedClients,
  getMembersObjFromSelectedUsers,
  getSupervisorObjFromSelectedUsers,
} from '../../utils/User'

export default function MilestoneAddOrEditScreen({ navigation, route }) {
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let projectInfo = route.params ? route.params.project : null
  let start_date = route.params ? route.params.start_date : null
  let end_date = route.params ? route.params.end_date : null
  const [milestoneName, setMilestoneName] = useState('')
  const [milestoneDescription, setMilestoneDescription] = useState('')
  const [milestoneAddress, setMilestoneAddress] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startDate, setStartDate] = useState(start_date ? new Date(start_date) : new Date())
  const [endDate, setEndDate] = useState(end_date ? new Date(end_date) : new Date())
  const [documents, setDocuments] = useState([])
  const [acceptance, setAcceptance] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedSupervisor, setSelectedSupervisor] = useState([])
  const [selectedClient, setSelectedClient] = useState([])
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [milestoneAttachments, setMilestoneAttachments] = useState([])
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [showPriority, setShowPriority] = useState(false)
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    name: '',
    project: '',
    date: '',
    priority: '',
    supervisor: '',
  })
  const [loading, setLoading] = useState(false)
  const { currentMilestone, navigationFrom, currentProject } = useSelector(
    (state) => state.navigation
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const scrollViewRef = useRef()
  const richText = useRef()
  const [showDesValue, setShowDesValue] = useState(false)
  const [editorHeight, setEditorHeight] = useState(164)
  const refOuterScrollView = useRef()

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

  useEffect(() => {
    if (selected?.address) {
      setMilestoneAddress(selected?.address)
    }
  }, [selected])

  const openPriorityModal = () => {
    setShowPriority(true)
  }

  const addOrUpdateMilestone = () => {
    if (
      hasMilestoneNameErrors(milestoneName, setErrorMessages) ||
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
      name: milestoneName,
      description: milestoneDescription,
      project_id: selected.id,
      priority: prioritySelected.name,
      acceptance_needed: acceptance,
    }
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)
    if (milestoneAddress) body['address'] = milestoneAddress
    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    let supervisors = getSupervisorObjFromSelectedUsers(selectedSupervisor)
    let clients = getClientObjFromSelectedClients(selectedClient)
    body = { ...body, ...attachments, ...attachmentIds, ...members, ...supervisors, ...clients }

    //console.log(body, 'body before edit')
    if (id) {
      body['_method'] = 'PUT'
      api.milestone
        .updateMilestone(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('MilestoneDetails', { id: id, refetch: Math.random() })
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
          //console.log(err.response)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    } else {
      //console.log(body)
      api.milestone
        .createMilestone(body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Milestones', {
              refetch: Math.random(),
              projectId: projectInfo?.id,
            })
            setLoading(false)
            setMilestoneName('')
            setSelected({ id: -1, name: '' })
          }
        })
        .catch((err) => {
          setLoading(false)
          //console.log(err)
          //console.log(err.response.data)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            //console.log(err)
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    if (currentProject) {
      setSelected(currentProject)
      setMilestoneAddress(currentProject?.address)
    }
    const getMilestoneDetails = async () => {
      if (currentProject) {
        setSelected(currentProject)
      }
      api.milestone
        .getMilestone(id)
        .then((res) => {
          if (res.success) {
            let {
              name,
              description,
              address,
              start_date,
              end_date,
              attachments,
              project,
              priority,
              acceptance_needed,
              user_members,
              user_supervisors,
              user_clients,
            } = res.milestone
            if (name != 'null') setMilestoneName(name)
            if (description?.value && description?.value != 'null') {
              setMilestoneDescription(description?.value ? description.value : '')
              setShowDesValue(true)
              // richText.current?.setContentHTML(description?.value)
            }
            if (start_date) setStartDate(jsCoreDateCreator(start_date))
            if (end_date) setEndDate(jsCoreDateCreator(end_date))
            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            if (address != 'null') setMilestoneAddress(address)
            setSelected(project)
            setAcceptance(acceptance_needed)
            if (attachments) {
              setMilestoneAttachments(attachments)
            }
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
        .catch((err) => {
          //console.log(err)
        })
    }
    if (id) getMilestoneDetails()
  }, [])

  const setDescriptionHtml = () => {
    if (milestoneDescription) richText.current?.setContentHTML(milestoneDescription)
  }

  useEffect(() => {
    setDescriptionHtml()
  }, [showDesValue])

  const keyboard = useKeyboard()
  const {
    coordinates: {
      end: { screenY },
      start,
    },
    keyboardHeight,
    keyboardShown,
  } = keyboard
  const [addressFocused, setAddressFocused] = useState(false)
  const handleScroll = (scrollHeight) => {
    if (scrollHeight > screenY - keyboardHeight) {
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
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 90 : 70 },
            ]}
          >
            <View style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
              <TouchableOpacity disabled={loading} onPress={goBack}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={[g.body1, { textAlign: 'center' }]}>
                  {id ? 'Update Milestone' : 'Add New Milestone'}
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

              <PriorityModal
                visibility={showPriority}
                setVisibility={setShowPriority}
                selected={prioritySelected}
                setSelected={setPrioritySelected}
              />
              <View style={[g.innerContainer]} onStartShouldSetResponder={() => !keyboardShow}>
                <CInputWithLabel
                  value={milestoneName}
                  setValue={setMilestoneName}
                  placeholder="Name"
                  label="Milestone Name"
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                />
                <ScrollView scrollEnabled={false}>
                  <RichEditor
                  placeholder="Milestone description"
                    androidHardwareAccelerationDisabled={true}
                    editorStyle={{
                      backgroundColor: colors.CONTAINER_BG,
                      color: colors.BLACK,
                    }}
                    scrollEnabled={false}
                    ref={richText}
                    initialContentHTML={milestoneDescription}
                    onChange={(descriptionText) => {
                      setMilestoneDescription(descriptionText)
                    }}
                    onCursorPosition={handleScroll}
                    // style={{ marginBottom: keyboardShown ? 5 : 0 }}
                    onFocus={() => setKeyboardShow(true)}
                    initialHeight={editorHeight}
                  />
                </ScrollView>
                {!keyboardShow && (
                  <>
                    <CSelectWithLabel
                      label="Project"
                      onPress={openProjectPickerModal}
                      selectText={selected.id != -1 ? selected.name : 'Select'}
                      errorMessage={errorMessages.project}
                      showErrorMessage={errorMessages.project !== ''}
                      required
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
                      <View style={{ marginBottom: 60 }}>
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
                            <Text style={s.labelStyle}>Milestone Address</Text>
                            <AutoCompletePLace
                              onFocus={handleFocusOnAddress}
                              setValue={setMilestoneAddress}
                              value={milestoneAddress}
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
                          <CSelectWithLabel
                            label="Milestone Members"
                            onPress={() => setShowUserPickerModal(true)}
                          />
                        )}
                        {selectedUsers.length > 0 && (
                          <CSelectedUsers
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                            onEditPress={() => setShowUserPickerModal(true)}
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
                          attachments={milestoneAttachments}
                          attachmentDeleteIndexes={attachmentDeleteIndexes}
                          setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                        />
                        {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
                        <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />

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
              </View>
            </ScrollView>
            {keyboardShown && (
              <RichToolbar
                style={{ backgroundColor: colors.WHITE, marginBottom: 8 }}
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
            {!keyboardShown && (
              <View style={{ paddingHorizontal: 16 }}>
                <CButtonInput label="Save" onPress={addOrUpdateMilestone} loading={loading} />
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
    marginVertical: 8,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    padding: 8,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
})
