import React, { useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import AddLogWorkPickerModal from '../../components/modals/AddLogWorkPickerModal'
import CheckListItemModal from '../../components/modals/ChecklistItemModal'
import { setNormal } from '../../store/slices/tab'

export default function ChecklistAddOrEditScreen({ navigation, route }) {
  const headerHeight = useHeaderHeight()
  const tabBarHeight = useBottomTabBarHeight()
  let id = route.params ? route.params?.id : null
  let autoLoad = route.params ? route.params?.autoLoad : null
  let backScreen = route.params ? route.params?.backScreen : null
  let showNameInputFirst = route.params ? route.params?.showNameInputFirst : null

  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [list, setList] = useState(null)
  const [checklistName, setChecklistName] = useState('')
  const [navFrom, setNavFrom] = useState(showNameInputFirst)
  const [errorMessages, setSErrorMessages] = useState({
    name: '',
    projectElement: '',
  })
  const [checkListItems, setCheckListItems] = useState([])
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const { currentProject, currentTask, currentMilestone, currentIssue } = useSelector(
    (state) => state.navigation
  )
  const [newListItems, setNewListItems] = useState([])
  const [deleteItems, setDeleteItems] = useState([])
  const [selectedModule, setSelectedModule] = useState(() => {
    if (autoLoad && currentIssue) {
      return currentIssue
    } else if (autoLoad && currentTask) {
      return currentTask
    } else if (autoLoad && currentMilestone) {
      return currentMilestone
    } else if (autoLoad && currentProject) {
      return currentProject
    } else {
      return null
    }
  })
  const [openModulePicker, setOpenModulePicker] = useState(false)
  const [project, setProject] = useState(() => {
    if (autoLoad && currentProject) {
      return currentProject
    }
    if (autoLoad && currentTask) {
      return { id: currentTask?.project?.id, name: currentTask?.project?.name }
    }
    if (autoLoad && currentIssue) {
      return { id: currentIssue?.project?.id, name: currentIssue?.project?.name }
    }
    if (autoLoad && currentMilestone) {
      return { id: currentMilestone?.project?.id, name: currentMilestone?.project?.name }
    }
    return { id: -1, name: '' }
  })
  const [milestone, setMilestone] = useState(null)
  const [task, setTask] = useState(null)
  const [issue, setIssue] = useState(null)
  const [openProjectPickerModal, setOpenProjectPickerModal] = useState(false)
  const [openMilestonePickerModal, setOpenMilestonePickerModal] = useState(false)
  const [openTaskPickerModal, setOpenTaskPickerModal] = useState(false)
  const [openIssuePickerModal, setOpenIssuePickerModal] = useState(false)
  const [next, setNext] = useState(id || showNameInputFirst ? true : false)
  const [keyboardShow, setKeyboardShow] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)

  const deleteItem = (id) => {
    setCheckListItems((prev) => {
      return prev.filter((item) => item.id != id)
    })
    setDeleteItems((prev) => {
      return [...prev, id]
    })
  }

  const goBack = () => {
    navigation.goBack()
  }

  const openChecklistItemModal = () => {
    setShowChecklistModal(true)
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    if (id) {
      setKeyboardShow(false)
    }
  }, [id])

  const handleNext = () => {
    if (!next) {
      if (!selectedModule) {
        setSErrorMessages({ ...errorMessages, projectElement: 'Project Element is required' })
        return
      }
      setNext(true)
      setKeyboardShow(false)
    } else {
      if (checklistName.length == 0) {
        setSErrorMessages({ ...errorMessages, name: 'Checklist name is required' })
        return
      }
      setBtnLoading(true)

      if (id) {
        let body = {
          _method: 'PUT',
          name: checklistName,
          // project_id: list?.project?.id,
        }

        // console.log(selectedModule, 'selected module.......')

        if (selectedModule?.state === 'Project') {
          body['project_id'] = selectedModule.id
        } else {
          body['project_id'] = selectedModule?.project_id
          body['parent_id'] = selectedModule?.id
        }

        api.checklist
          .updateChecklist(body, id)
          .then((res) => {
            setBtnLoading(false)
            if (res.success) navigation.goBack()
          })
          .catch((err) => {
            setBtnLoading(false)
          })
      } else {
        let body = {
          name: checklistName,
        }

        if (selectedModule?.state === 'Project') {
          body['project_id'] = selectedModule.id
        } else {
          body['project_id'] = selectedModule.project_id
          body['parent_id'] = selectedModule.id
        }

        api.checklist
          .createChecklist(body)
          .then((res) => {
            if (res.success) {
              navigation.navigate('ChecklistDetails', { id: res?.data?.id })
              setBtnLoading(false)
            }
          })
          .catch((err) => {
            setBtnLoading(false)
          })
      }
    }
  }
  useEffect(() => {
    if (id) {
      api.checklist
        .getChecklist(id)
        .then((res) => {
          console.log(res,'res...........')
          setList(res?.todolist)
          setChecklistName(res?.todolist?.name)
          setProject(res?.todolist?.project)
          if (res?.todolist?.issue) {
            setSelectedModule(res?.todolist?.issue)
          } else if (!res?.todolist?.issue && res?.todolist?.task) {
            setSelectedModule(res?.todolist?.task)
          } else if (!res?.todolist?.issue && !res?.todolist?.task && res?.todolist?.milestone) {
            setSelectedModule(res?.todolist?.milestone)
          }
        })
        .catch((err) => {
          //console.log(err)
        })
    }
  }, [id])

  return (
    <View style={[{ flex: 1 }]}>
      <CustomStatusBar barStyle="dark-content" backgroundColor={colors.WHITE} />
      <CheckListItemModal
        visibility={showChecklistModal}
        setVisibility={setShowChecklistModal}
        item={checkListItems}
        setItems={setCheckListItems}
        newItems={newListItems}
        setNewItems={setNewListItems}
      />

      <AddLogWorkPickerModal
        visiblility={openModulePicker}
        setVisiblility={setOpenModulePicker}
        selected={selectedModule}
        setSelected={setSelectedModule}
      />
      <KeyboardAvoidingView style={[s.background]} behavior="padding" enabled={!!keyboardShow}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            next & setKeyboardShow(false)
          }}
        >
          <View
            style={[
              s.innerContainer,
              next & keyboardShow
                ? navFrom
                  ? { marginBottom: 92 }
                  : { marginBottom: 16 }
                : { marginBottom: 92 },
            ]}
          >
            <View>
              <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity
                  onPress={() => {
                    if (next) {
                      setNext(false)
                    } else navigation.goBack()
                  }}
                >
                  <BackArrow fill={colors.NORMAL} />
                </TouchableOpacity>
                <View style={{ width: '100%', flex: 1 }}>
                  <Text style={[g.body1, { textAlign: 'center' }]}>
                    {id ? 'Update Checklist' : 'Add List'}
                  </Text>
                </View>
              </View>

              <View>
                {!next && (
                  <>
                    <CSelectWithLabel
                      style={{ backgroundColor: colors.CONTAINER_BG }}
                      label="Project element*"
                      onPress={() => setOpenModulePicker(true)}
                      selectText={selectedModule ? selectedModule.name : 'Select'}
                      titleStyle={{ fontWeight: '500' }}
                      errorMessage={errorMessages.projectElement}
                      showErrorMessage={true}
                      required
                    />
                    {/* <CSelectWithLabel
                      style={{ backgroundColor: colors.WHITE }}
                      label="Project"
                      onPress={() => setOpenProjectPickerModal(true)}
                      selectText={project.id != -1 ? project.name : 'Select'}
                      titleStyle={{ fontWeight: '500' }}
                      errorMessage={errorMessages.project}
                      showErrorMessage={true}
                      required
                    />
                    <CSelectWithLabel
                      style={{ backgroundColor: colors.WHITE }}
                      label="Milestone"
                      onPress={() => setOpenMilestonePickerModal(true)}
                      selectText={milestone.id != -1 ? milestone.name : 'Select'}
                      titleStyle={{ fontWeight: '500' }}
                    />
                    <CSelectWithLabel
                      style={{ backgroundColor: colors.WHITE }}
                      label="Task"
                      onPress={() => setOpenTaskPickerModal(true)}
                      selectText={task.id != -1 ? task.name : 'Select'}
                      titleStyle={{ fontWeight: '500' }}
                    />
                    <CSelectWithLabel
                      style={{ backgroundColor: colors.WHITE }}
                      label="Issue"
                      onPress={() => setOpenIssuePickerModal(true)}
                      selectText={issue.id != -1 ? issue.name : 'Select'}
                      titleStyle={{ fontWeight: '500' }}
                    /> */}
                  </>
                )}
                {next && (
                  <CInputWithLabel
                    value={checklistName}
                    setValue={setChecklistName}
                    placeholder="Name"
                    label="List Name"
                    required
                    showErrorMessage
                    errorMessage={errorMessages.name}
                    style={{ backgroundColor: colors.CONTAINER_BG }}
                    containerStyle={{ marginVertical: 0 }}
                    onFocus={() => {
                      setKeyboardShow(true)
                      setNavFrom(false)
                    }}
                  />
                )}
              </View>
            </View>

            <CButtonInput label={'Next'} onPress={handleNext} loading={btnLoading} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    flex: 1,
    paddingTop: 8,
    // backgroundColor:"yellow"
  },
  descriptionText: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontWeight: '500',
    fontSize: 16,
  },
  status: {
    backgroundColor: colors.GREEN_NORMAL,
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  viewContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    // marginBottom: 56,
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
  checklistContainer: {
    backgroundColor: '#F2F6FF',
    paddingVertical: 16,
    marginVertical: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  checklistText: {
    color: '#246BFD',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 5,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: 'rgba(194, 212, 255)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 0.4,
  },
  deleteItemWrapper: {
    backgroundColor: colors.RED_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    marginVertical: 10,
    borderRadius: 8,
  },
  deleteItemText: {
    color: colors.WHITE,
  },
})
