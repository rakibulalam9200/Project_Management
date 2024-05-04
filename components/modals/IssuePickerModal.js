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

export default function IssuePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  projectId,
  milestoneId,
  taskId,
  isMultiplePicker,
}) {
  const [issues, setIssues] = useState([])
  const [search, setSearch] = useState('')

  const checkIfSelected = (issue) => {
    if (isMultiplePicker) {
      const found = selected.find((singleIssue) => singleIssue.id == issue.id)
      return found
    } else {
      return selected?.id == issue.id
    }
  }

  const toggleSelected = (issue) => {
    if (isMultiplePicker) {
      if (checkIfSelected(issue)) {
        setSelected((prev) => {
          const copy = [...prev]
          return copy.filter((singleIssue) => issue.id !== singleIssue.id)
        })
      } else {
        setSelected((prev) => [...prev, issue])
      }
    } else {
      if (issue.id == selected?.id) setSelected({ id: -1 })
      else {
        setSelected(issue)
        closeModal()
      }
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  useEffect(() => {
    if (projectId == -1) {
      return
    }
    const body = {
      project_id: projectId,
      milestone_id: milestoneId,
      task_id: taskId,
    }
    milestoneId == -1 && delete body.milestone_id
    taskId == -1 && delete body.task_id
    //console.log(body, 'body')
    api.issue
      .getAllIssues(body)
      .then((res) => {
        // //console.log(res.data, 'issues')
        setIssues(res.data)
      })
      .catch((err) => {
        Alert.alert('Error', err.message)
      })
  }, [projectId, milestoneId, taskId])

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Issue"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {issues?.length > 0 ? (
              issues.map((issue, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(issue)}
                  >
                    <Text>
                      {issue.name.length > 30 ? issue.name.slice(0, 30) + '...' : issue.name}
                    </Text>
                    {checkIfSelected(issue) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                  </TouchableOpacity>
                )
              })
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No issue Found</Text>
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
