import React, { useState } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import ToggleSwitch from 'toggle-switch-react-native'
import CButtonInput from '../common/CButtonInput'
import CSelectWithLabel from '../common/CSelectWithLabel'
import IssuePickerModal from './IssuePickerModal'
import MilestonePickerModal from './MilestonePickerModal'
import ProjectPickerModal from './ProjectPickerModal'
import TaskPickerModal from './TaskPickerModal'

export default function MoveModal({
  children,
  visibility,
  setVisibility,
  onMove = null,
  setSelectable = () => {},
  multipleSelect,
  state,
  setSelectedProject,
  btnLoader,
}) {
  const text = `Select Project${
    state != 'milestone' && state != 'note'
      ? state == 'task'
        ? '/Milestone'
        : state == 'issue'
        ? '/Milestone/Task'
        : '/Milestone/Task or Issue'
      : ''
  } to move`
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showTaskPicker, setShowTaskPicker] = useState(false)
  const [showIssuePicker, setShowIssuePicker] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState({ id: -1, name: '' })
  const [issueSelected, setIssueSelected] = useState({ id: -1, name: '' })
  const [moveAndCopy, setMoveAndCopy] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    project: '',
  })

  const resetState = () => {
    setSelected({ id: -1, name: '' })
    setMilestoneSelected({ id: -1, name: '' })
    setTaskSelected({ id: -1, name: '' })
    setIssueSelected({ id: -1, name: '' })
    setMoveAndCopy(false)
    setErrorMessages({
      project: '',
    })
  }

  const closeModal = () => {
    setSelectable(false)
    setVisibility(false)
    resetState()
    if (multipleSelect?.current) multipleSelect.current = {}
  }

  const openProjectPickerModal = () => setShowProjectPicker(true)
  const openMilestonePickerModal = () => setShowMilestonePicker(true)
  const openTaskPickerModal = () => setShowTaskPicker(true)
  const openIssuePickerModal = () => setShowIssuePicker(true)

  const handleMove = () => {
    if (selected.id == -1) {
      setErrorMessages({ ...errorMessages, project: 'Please select a project' })
      return
    }
    setErrorMessages({ ...errorMessages, project: '' })
    if (state == 'milestone') {
      onMove(selected, moveAndCopy ? 1 : 0)
    } else if (state == 'task') {
      onMove(selected, milestoneSelected, moveAndCopy ? 1 : 0)
    } else if (state == 'issue') {
      onMove(selected, milestoneSelected, taskSelected, moveAndCopy ? 1 : 0)
    } else {
      onMove(selected, milestoneSelected, taskSelected, issueSelected, moveAndCopy ? 1 : 0)
    }
    closeModal()
  }

  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
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
      <IssuePickerModal
        visibility={showIssuePicker}
        setVisibility={setShowIssuePicker}
        selected={issueSelected}
        projectId={selected.id}
        milestoneId={milestoneSelected.id}
        taskId={taskSelected.id}
        setSelected={setIssueSelected}
      />

      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <Text style={{ fontWeight: '700', fontSize: 18 }}>{text}</Text>
          <View style={{ marginVertical: 16 }}>
            <CSelectWithLabel
              label="Project"
              onPress={openProjectPickerModal}
              selectText={selected.id != -1 ? selected.name : 'Select'}
              errorMessage={errorMessages.project}
              showErrorMessage={errorMessages.project}
              required
            />
            {state != 'milestone' && state != 'note' && (
              <>
                <CSelectWithLabel
                  label="Milestone"
                  onPress={openMilestonePickerModal}
                  selectText={milestoneSelected.id != -1 ? milestoneSelected.name : 'Select'}
                />
                {state != 'task' && (
                  <>
                    <CSelectWithLabel
                      label="Task"
                      onPress={openTaskPickerModal}
                      selectText={taskSelected.id != -1 ? taskSelected.name : 'Select'}
                    />
                    {state != 'issue' && (
                      <CSelectWithLabel
                        label="Issue"
                        onPress={openIssuePickerModal}
                        selectText={issueSelected.id != -1 ? issueSelected.name : 'Select'}
                      />
                    )}
                  </>
                )}
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <ToggleSwitch
                isOn={moveAndCopy}
                onColor={colors.ICON_BG}
                offColor={colors.SEC_BG}
                labelStyle={{ color: 'black', fontWeight: '900' }}
                size="medium"
                onToggle={(isOn) => {
                  setMoveAndCopy(isOn)
                }}
                animationSpeed={150}
              />
              <Text style={{ fontSize: 16, fontWeight: '600' }}>Move and make copy</Text>
            </View>
          </View>
          <View style={[g.containerBetween]}>
            <CButtonInput label="Cancel" onPress={closeModal} style={s.cancelButton} />
            <CButtonInput
              label="Move"
              onPress={handleMove}
              style={s.moveButton}
              loading={btnLoader}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    padding: 24,
    margin: 8,
  },
  moveButton: {
    backgroundColor: colors.ICON_BG,
    paddingHorizontal: 44,
  },
  cancelButton: {
    backgroundColor: colors.PRIM_CAPTION,
  },
  headerText: {
    fontFamily: 'inter-regular',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BLACK,
    textAlign: 'center',
    marginVertical: 16,
  },
  subHeaderText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    marginVertical: 16,
    color: colors.BLACK,
    textAlign: 'center',
    marginBottom: 48,
  },
})
