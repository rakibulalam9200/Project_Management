import { StyleSheet, View, Pressable } from 'react-native'
import { useLayoutEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import CText from './CText'
import CInput from './CInput'

import CButton from './CButton'
import EditIcon from '../../assets/svg/edit.svg'
import CheckIcon from '../../assets/svg/check.svg'
import PlusIcon from '../../assets/svg/plus-filled.svg'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import api from '../../api/api'

const Steps = ({ steps, taskId, setSteps, allSteps, addEnabled }) => {
  const result = []
  let lSteps = steps ? [...steps] : []
  const user = useSelector(state => state.user.value)
  const setStepText = (id, text) => {
    setSteps((state) => {
      let newState = [...state]
      newState[id].description = text
      return newState
    })
  }

  const addNewStep = () => {
    setSteps((ps) => {
      let newSteps
      if (ps) { newSteps = [...ps] }
      else { newSteps = [] }
      newSteps.push({
        description: 'Edit me',
      })
      return newSteps
    })
  }
  let i = 0
  if (!allSteps) { lSteps = steps.slice(0, 4) }

  for (let step of lSteps) {
    result.push(<EditableInput user={user} taskId={taskId} key={i} stepID={i} value={step.description} step={step} setValue={setStepText} />)
    i++
  }

  if (addEnabled) {
    result.push(
      <CButton key={'btn'} onPress={addNewStep} type={'white'}>
        <PlusIcon fill={colors.NORMAL} />
        <CText style={[g.button, { color: colors.NORMAL, marginLeft: 10 }]}>Add new Step</CText>
      </CButton>
    )
  }

  return result
}

export const EditableInput = ({ value, user, taskId, setValue, stepID, step, style }) => {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)

  useLayoutEffect(() => {
    if (editing) { setLocalValue('') }
    if (step && step.id && !editing && localValue !== value && localValue.length > 2) {
      api.task.update(taskId, {
        steps_for_update: [{ id: step.id, description: localValue }],
      })
    }
    if (!editing && localValue && localValue !== value && stepID !== null && localValue && localValue.length > 2) { setValue(stepID, localValue) }
    if (stepID === null) { setValue(localValue) }

  }, [editing])

  const containerStyles = [stepStyle.stepArea]

  if (editing) { containerStyles.push(stepStyle.editArea) }

  if (style) { containerStyles.push(style) }

  return (
    <View style={containerStyles}>
      {editing ? (
        <CInput
          autoFocus
          inputStyle={{
            paddingLeft: 10,
            width: '95%',
            minHeight: 40,
            maxHeight: 40,
            backgroundColor: colors.WHITE,
          }}
          style={{
            padding: 0,
            marginTop: -4,
            maxHeight: 32,
          }}
          value={localValue}
          setValue={setLocalValue}
        />
      ) : (
        <CText style={[stepStyle.stepText, user && user.role === 'owner' ? {} : { maxWidth: '100%' }]}>{value}</CText>
      )}

      {user && user.role === 'owner' ? editing ? (
        <Pressable onPress={() => setEditing(false)} style={{ padding: 12, margin: -8 }}>
          <CheckIcon width={24} height={24} fill={colors.NORMAL} />
        </Pressable>
      ) : (
        <Pressable onPress={() => setEditing(true)} style={{ padding: 8, margin: -8 }}>
          <EditIcon width={32} height={32} fill={colors.NORMAL} />
        </Pressable>
      ) : null}
    </View>
  )
}

export default Steps

const stepStyle = StyleSheet.create({
  stepArea: {
    backgroundColor: colors.PRIM_BG,
    paddingVertical: 21,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    minHeight: 64,
  },
  editArea: {
    paddingLeft: 10,
  },
  stepText: {
    ...g.body1,
    color: colors.HEADING,
    flex: 1,
    maxWidth: '80%',
  },
})
