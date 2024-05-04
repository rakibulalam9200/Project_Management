import React, { useState } from 'react'
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import CHeaderWithBack from '../common/CHeaderWithBack'
import CSearchInput from '../common/CSearchInput'

import { useEffect } from 'react'
import api from '../../api/api'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import { getErrorMessage } from '../../utils/Errors'
import { getProjectFromSelectedProjects } from '../../utils/Filters'
import { SafeAreaView } from 'react-native'

export default function MultipleIssuePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  projects,
  milestones,
  tasks,
}) {
  const [search, setSearch] = useState('')
  const [issues, setIssues] = useState(selected)
  const [query, setQuery] = useState('')
  // //console.log(projects, milestones,"projects milestones.....")
  const checkIfSelected = (user) => {
    const found = selected?.find((singleuser) => singleuser.id == user.id)
    return found
  }

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    } else {
      setSelected((prev) => [...prev, user])
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])
  useEffect(() => {
    //console.log(query)
    const body = {
      allData: true,
    }
    if (query != '') {
      body['search'] = query
    }

    if (projects?.length > 0) {
      body['project_ids'] = getProjectFromSelectedProjects(projects)
    }

    if (milestones?.length > 0) {
      body['milestone_ids'] = getProjectFromSelectedProjects(milestones)
    }
    if (tasks?.length > 0) {
      body['task_ids'] = getProjectFromSelectedProjects(tasks)
    }

    api.issue
      .getIssues(body)
      .then((res) => {
        //console.log(res)
        //console.log(res.length, 'issues length...')
        setIssues(res)
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }, [query, projects, milestones, tasks])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.modalOuterContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Issues"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 8 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {issues?.length > 0 &&
              issues?.map((issue, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(issue)}
                  >
                    <Text>{issue.name}</Text>
                    {checkIfSelected(issue) ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  </TouchableOpacity>
                )
              })}
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
    marginBottom: 32,
    // backgroundColor:'yellow'
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
    // flex:1
  },
})
