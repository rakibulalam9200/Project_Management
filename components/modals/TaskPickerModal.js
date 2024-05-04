import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useEffect } from 'react'
import { Alert } from 'react-native-web'
import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

export default function TaskPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  projectId,
  milestoneId,
  isMultiplePicker,
}) {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const checkIfSelected = (task) => {
    if (isMultiplePicker) {
      const found = selected.find((singleTask) => singleTask.id == task.id)
      return found
    } else {
      return selected.id == task.id
    }
  }

  const toggleSelected = (task) => {
    if (isMultiplePicker) {
      if (checkIfSelected(task)) {
        setSelected((prev) => {
          const copy = [...prev]
          return copy.filter((singleTask) => task.id != singleTask.id)
        })
      } else {
        setSelected((prev) => [...prev, task])
      }
    } else {
      if (task.id == selected.id) setSelected({ id: -1 })
      else {
        setSelected(task)
        closeModal()
      }
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  useEffect(() => {
    if (projectId && milestoneId) {
      //console.log(projectId, milestoneId, '==============================')
      api.task
        .getTaskByMilestoneIdAndProjectId(
          {
            allData: true,
          },
          projectId,
          milestoneId
        )
        .then((res) => {
          //console.log(res, 'task............')
          setTasks(res)
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
    } else {
      Alert.alert('Please, Select Project and Milestone First')
    }
  }, [projectId, milestoneId])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Task"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {tasks.length > 0 ? (
              tasks.map((task, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(task)}
                  >
                    <Text>
                      {task.name.length > 30 ? task.name.slice(0, 30) + '...' : task.name}
                    </Text>
                    {checkIfSelected(task) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                  </TouchableOpacity>
                )
              })
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No Task Found</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    padding: 16,
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
