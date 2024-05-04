import React, { useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import MilestonePickerModal from '../../components/modals/MilestonePickerModal'

import api from '../../api/api'
import IssuePickerModal from '../../components/modals/IssuePickerModal'
import ProjectPickerModal from '../../components/modals/ProjectPickerModal'
import TaskPickerModal from '../../components/modals/TaskPickerModal'
import { hasProjectPickerErrors } from '../../utils/Errors'

export default function TeamAssignScreen({ navigation, route }) {
  // team id for assignment
  let id = route.params ? route.params.id : null
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showTask, setShowTask] = useState(false)
  const [showIssuePickerModal, setShowIssuePickerModal] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState({ id: -1, name: '' })
  const [issueSelected, setIssueSelected] = useState({ id: -1, name: '' })
  const [errorMessages, setErrorMessages] = useState({
    project: '',
  })

  console.log(id, 'id.............')

  const [loading, setLoading] = useState(false)

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

  const openTaskModal = () => {
    setShowTask(true)
  }
  const openIssueModal = () => {
    setShowIssuePickerModal(true)
  }

  const assignTeam = () => {
    if (
      hasProjectPickerErrors(selected.name, setErrorMessages)
    ) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

    setLoading(true)
    let body = {}

    if (id) {
      body[`team_ids[0]`] = id
    }

    if (selected.id != -1) {
      body[`project_ids[0]`] = selected?.id
    }
    if (milestoneSelected.id != -1) {
      body[`milestone_ids[0]`] = milestoneSelected?.id
    }
    if (taskSelected.id != -1) {
      body[`task_ids[0]`] = taskSelected?.id
    }
    if (issueSelected.id != -1) {
      body[`issue_ids[0]`] =issueSelected?.id
    }
    api.assign
      .assignTeam(body)
      .then((res) => {
        if (res.success) {
          // console.log(res, 'assigned ....')
          navigation.navigate('Teams',{refetch:Math.random()})
        }
      })
      .catch((err) => {
        console.log(err,'error..........')
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setLoading(false)
      })

    //console.log(body)
  }

  const { height, width } = Dimensions.get('window')

  return (
    <SafeAreaView style={g.safeAreaStyle}>
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
      <TaskPickerModal
        projectId={selected && selected?.id}
        milestoneId={milestoneSelected?.id}
        visibility={showTask}
        setVisibility={setShowTask}
        selected={taskSelected}
        setSelected={setTaskSelected}
      />
      <IssuePickerModal
        projectId={selected && selected?.id}
        milestoneId={milestoneSelected?.id}
        taskId={taskSelected?.id}
        visibility={showIssuePickerModal}
        setVisibility={setShowIssuePickerModal}
        selected={issueSelected}
        setSelected={setIssueSelected}
      />
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
      >
        <View
          style={[
            s.container,
            {
              marginBottom:
                Platform.OS === 'ios' ? (height > 670 ? 54 : 40) : Platform.OS === 'android' && 60,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <CHeaderWithBack
              navigation={navigation}
              title={`New Assignment`}
              onPress={goBack}
              containerStyle={{ marginTop: 0 }}
            />
            <CSelectWithLabel
              label="Project"
              onPress={openProjectPickerModal}
              selectText={selected?.id != -1 ? selected?.name : 'Select'}
              errorMessage={errorMessages.project}
              showErrorMessage={errorMessages.project !== ''}
              style={s.selectStyle}
              required
            />
            <CSelectWithLabel
              label="Milestone"
              onPress={openMilestonePickerModal}
              selectText={milestoneSelected?.id != -1 ? milestoneSelected?.name : 'Select'}
              // errorMessage={errorMessages.milestone}
              // showErrorMessage={errorMessages.milestone !== ''}
              style={s.selectStyle}
            />
            <CSelectWithLabel
              label="Task"
              onPress={openTaskModal}
              selectText={taskSelected?.id != -1 ? taskSelected.name : 'Select'}
              // errorMessage={errorMessages.task}
              // showErrorMessage={errorMessages.task !== ''}
              style={s.selectStyle}
            />
            <CSelectWithLabel
              label="Issue"
              onPress={openIssueModal}
              selectText={issueSelected?.id != -1 ? issueSelected.name : 'Select'}
              // errorMessage={errorMessages.issue}
              // showErrorMessage={errorMessages.issue !== ''}
              style={s.selectStyle}
            />
          </View>

          <CButtonInput
            label="Assign"
            onPress={assignTeam}
            loading={loading}
            style={s.assignButton}
          />
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
  assignButton: {},
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // paddingBottom: 64,
    // minHeight: Dimensions.get('window').height - 64 - StatusBar.currentHeight,
  },
  headerTitle: {
    marginLeft: 24,
  },
  selectStyle: {
    backgroundColor: colors.WHITE,
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
