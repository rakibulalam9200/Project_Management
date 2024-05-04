import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import { useRef } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { completionMethods } from '../../assets/constants/completion-methods'
import { priorities } from '../../assets/constants/priority'
import DotsIcon from '../../assets/svg/dots.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CRadio from '../../components/common/CRadio'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import IconWrap from '../../components/common/IconWrap'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import ClientPickerModal from '../../components/modals/ClientPickerModal'
import CompletionMethodModal from '../../components/modals/CompletionMethodsModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import PriorityModal from '../../components/modals/PriorityModal'
import SupervisorPickerModal from '../../components/modals/SupervisorPickerModal'
import TemplatePickerModal from '../../components/modals/TemplatePickerModal'
import { setNavigationFrom } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import {
  getErrorMessage,
  hasPriorityPickerErrors,
  hasProjectNameErrors,
  hasSupervisorPickerErrors,
} from '../../utils/Errors'
import { getDateTime, jsCoreDateCreator } from '../../utils/Timer'
import {
  getClientObjFromSelectedClients,
  getMembersObjFromSelectedUsers,
  getSupervisorObjFromSelectedUsers,
} from '../../utils/User'
import { useKeyboard } from '@react-native-community/hooks'
import { useClearByFocusCell } from 'react-native-confirmation-code-field'
import { Platform } from 'react-native'

const RichTextField = ({
  projectDescription,
  setProjectDescription,
  richText,
  handleHeightChagne,
}) => {
  return (
    <RichEditor
      androidHardwareAccelerationDisabled={true}
      disabled={false}
      editorStyle={{
        backgroundColor: colors.CONTAINER_BG,
        color: colors.BLACK,
        placeholderColor: colors.HEADER_TEXT,
      }}
      scrollEnabled={false}
      ref={richText}
      initialContentHTML={projectDescription}
      onChange={(descriptionText) => {
        setProjectDescription(descriptionText)
      }}
      // // usecontainer={true}
      // onFocus={() => {
      //   setModalVisible(true)
      // }}
      initialHeight={200}
      onHeightChange={handleHeightChagne}
    />
  )
}

export default function ProjectAddOrEditScreen({ navigation, route }) {
  let id = route.params ? route.params.id : null
  let start_date = route.params ? route.params.start_date : null
  let end_date = route.params ? route.params.end_date : null
  const iconWrapColors = [colors.PRIM_BG, colors.MID_BG, colors.END_BG]
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectAddress, setProjectAddress] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedSupervisor, setSelectedSupervisor] = useState([])
  const [selectedClient, setSelectedClient] = useState([])
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showClientPickerModal, setShowClientPickerModal] = useState(false)
  const [showSupervisorPickerModal, setShowSupervisorPickerModal] = useState(false)
  const [acceptance, setAcceptance] = useState(false)
  const [template, setTemplate] = useState(false)
  const richText = useRef()
  const [errorMessages, setSErrorMessages] = useState({
    name: '',
    priority: '',
    date: '',
    supervisor: '',
  })
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedConstrain, setSelectedConstrain] = useState({ id: 1, label: 'Auto' })
  const [showPriority, setShowPriority] = useState(false)
  const [prioritySelected, setPrioritySelected] = useState({ id: -1, name: '' })
  const [projectAttachments, setProjectAttachments] = useState([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [showDesValue, setShowDesValue] = useState(false)
  const [completionSelected, setCompletionSelected] = useState({
    id: 1,
    value: 'potc-m',
    label: 'Percentage of Tasks Completed (Manual)',
  })
  const [loading, setLoading] = useState(false)
  const { navigationFrom } = useSelector((state) => state.navigation)
  const scrollViewRef = useRef(null)
  const [keyboardShow, setKeyboardShow] = useState(false)
  const [editorHeight, setEditorHeight] = useState(164)
  const refOuterScrollView = useRef()

  const openTemplatePickerModal = () => {
    setShowTemplatePicker(true)
  }
  const openPriorityModal = () => {
    setShowPriority(true)
  }

  const openCompletionModal = () => {
    setShowCompletion(true)
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

  const addOrUpdateProject = () => {
    if (
      hasProjectNameErrors(projectName, setSErrorMessages) ||
      hasPriorityPickerErrors(prioritySelected.name, setSErrorMessages)
      // hasCompletionPickerErrors(prioritySelected.name, setSErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    if (hasSupervisorPickerErrors(selectedSupervisor, acceptance, setSErrorMessages)) {
      return
    }

    setLoading(true)

    let body = {
      name: projectName,
      description: projectDescription,
      // address: projectAddress,
      priority: prioritySelected.name,
      complete_method: completionSelected.value,
      acceptance_needed: acceptance,
    }
    if (!id && selected.id > -1) {
      body['template_id'] = selected.id
    }
    if (startDate) body['start_date'] = getDateTime(startDate)
    if (endDate) body['end_date'] = getDateTime(endDate)
    if (projectAddress) body['address'] = projectAddress

    // let attachments = getAttachmentsFromDocuments(documents)
    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let members = getMembersObjFromSelectedUsers(selectedUsers)
    let supervisors = getSupervisorObjFromSelectedUsers(selectedSupervisor)
    let clients = getClientObjFromSelectedClients(selectedClient)
    body = { ...body, ...attachments, ...attachmentIds, ...members, ...supervisors, ...clients }

    if (id) {
      body['_method'] = 'PUT'
      body['is_template'] = template
      api.project
        .updateProject(body, id)
        .then((res) => {
          if (res.success) {
            navigation.navigate('ProjectDetails', { id: id, refetch: Math.random() })
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
    } else {
      api.project
        .createProject(body)
        .then((res) => {
          if (res.success) {
            ////console.log(res)
            navigation.navigate('Projects', { refetch: Math.random() })
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
    ////console.log(body)
  }

  // useEffect(() => {
  //   // ////console.log(projectAttachments,"projectAttachments")
  // }, [projectAttachments])

  useEffect(() => {
    const getProjectDetails = async () => {
      api.project
        .getProject(id)
        .then((res) => {
          //console.log(res)
          if (res.success) {
            const {
              name,
              address,
              description,
              complete_method,
              start_date,
              end_date,
              attachments,
              priority,
              acceptance_needed,
              user_members,
              user_supervisors,
              user_clients,
            } = res.project
            // ////console.log(attachments, '==========attachments===========')

            if (name != 'null') setProjectName(name)
            if (address != 'null') setProjectAddress(address)
            if (description?.value && description?.value != 'null') {
              // richText.current?.setContentHTML(description?.value )
              setProjectDescription(description?.value ? description.value : '')
              setShowDesValue(true)
            }
            //
            //
            if (start_date) {
              setStartDate(jsCoreDateCreator(start_date))
            }
            if (end_date) {
              setEndDate(jsCoreDateCreator(end_date))
            }
            let prioName = priorities.find((prio) => {
              return prio.name === priority
            })
            if (prioName) setPrioritySelected(prioName)
            // ////console.log('completion method...',complete_method)
            let completionValue = completionMethods.find((cValue) => {
              return cValue.label === complete_method
            })
            if (completionValue) setCompletionSelected(completionValue)
            setAcceptance(acceptance_needed)
            setProjectAttachments(attachments)

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
          ////console.log(err.response)
        })
    }
    if (id) getProjectDetails()
  }, [])

  const setDescriptionHtml = () => {
    if (projectDescription) richText.current?.setContentHTML(projectDescription)
  }

  useEffect(() => {
    setDescriptionHtml()
  }, [showDesValue])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const { height, width } = Dimensions.get('window')
  const [modalVisible, setModalVisible] = useState(false)
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
            setKeyboardShow(false)
            setModalVisible(false)
          }}
        >
          <View
            style={[
              { flex: 1 },
              keyboardShown
                ? { marginBottom: 0 }
                : { marginBottom: Platform.OS === 'ios' && height > 670 ? 80 : 64 },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}
            >
              <TouchableOpacity disabled={loading} onPress={goBack}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <View style={{ width: '100%', flex: 1 }}>
                <Text style={[g.body1, { textAlign: 'center' }]}>
                  {id ? 'Update Project' : 'Add New Project'}
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
              <TemplatePickerModal
                visibility={showTemplatePicker}
                setVisibility={setShowTemplatePicker}
                selected={selected}
                setSelected={setSelected}
              />
              <PriorityModal
                visibility={showPriority}
                setVisibility={setShowPriority}
                selected={prioritySelected}
                setSelected={setPrioritySelected}
              />
              <CompletionMethodModal
                visibility={showCompletion}
                setVisibility={setShowCompletion}
                selected={completionSelected}
                setSelected={setCompletionSelected}
              />
              <View
                style={[g.innerContentContainer, { backgroundColor: colors.WHITE }]}
                onStartShouldSetResponder={() => !keyboardShow}
              >
                <CInputWithLabel
                  value={projectName}
                  setValue={setProjectName}
                  placeholder="Project Name"
                  label="Project Name"
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                />
                <ScrollView scrollEnabled={false}>
                  <RichEditor
                  placeholder="Project description"
                    androidHardwareAccelerationDisabled={true}
                    editorStyle={{
                      backgroundColor: colors.CONTAINER_BG,
                      color: colors.BLACK,
                    }}
                    scrollEnabled={false}
                    ref={richText}
                    initialContentHTML={projectDescription}
                    onChange={(descriptionText) => {
                      setProjectDescription(descriptionText)
                    }}
                    onCursorPosition={handleScroll}
                    style={{ marginBottom: keyboardShown ? 5 : 0 }}
                    onFocus={() => setKeyboardShow(true)}
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
                      label="Complete Method"
                      onPress={openCompletionModal}
                      selectText={completionSelected.label}
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

                    {showAdvanced ? (
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
                            <Text style={s.labelStyle}>Project Address</Text>
                            <AutoCompletePLace
                              onFocus={handleFocusOnAddress}
                              setValue={setProjectAddress}
                              value={projectAddress}
                              placeholder={'Address'}
                              type=""
                            />
                          </View>
                        </ScrollView>
                        {!id && (
                          <CSelectWithLabel
                            label="Template"
                            selectText={selected.id != -1 ? selected.name : 'Select'}
                            onPress={openTemplatePickerModal}
                          />
                        )}
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
                        <CRadio
                          selected={selectedConstrain}
                          setSelected={setSelectedConstrain}
                        ></CRadio>

                        {selectedUsers.length == 0 && (
                          <CSelectWithLabel
                            label="Project Members"
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
                          attachments={projectAttachments}
                          setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                          attachmentDeleteIndexes={attachmentDeleteIndexes}
                        />
                        <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
                        <CCheckbox
                          checked={acceptance}
                          setChecked={setAcceptance}
                          label={'Acceptance Needed'}
                        />
                        {acceptance && selectedSupervisor.length == 0 && (
                          <CSelectWithLabel
                            label="Project Supervisor"
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
                        {id && (
                          <CCheckbox
                            checked={template}
                            setChecked={setTemplate}
                            label={'Is Template?'}
                          />
                        )}
                      </View>
                    ) : (
                      <View
                        style={{
                          height: 200,
                        }}
                      ></View>
                    )}
                  </>
                )}
              </View>
            </ScrollView>

            {keyboardShown && (
              <RichToolbar
                style={{
                  backgroundColor: colors.COLUMN,
                }}
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
                ]}
                selectedButtonStyle={[g.editorActivebuttonStyle]}
              />
            )}
            {!keyboardShown && (
              <View style={[{ paddingHorizontal: 16, marginBottom: 16 }]}>
                <CButtonInput label="Save" onPress={addOrUpdateProject} loading={loading} />
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
    // marginBottom: 50,
    // backgroundColor: 'green',
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
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    overflow: 'hidden',
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
