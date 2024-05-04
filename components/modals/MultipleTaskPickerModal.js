import React, { useState } from 'react'
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

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

export default function MultipleTaskPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  projects,
  milestones,
}) {
  const [search, setSearch] = useState('')
  const [tasks, setTasks] = useState(selected)
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

    if(projects?.length === 0){
      setTasks([])
      return
    }

    api.task
      .getTasks(body)
      .then((res) => {
        setTasks(res)
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err?.response?.message)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }, [query, projects, milestones])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.modalOuterContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Tasks"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 8 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {tasks?.length > 0 &&
              tasks?.map((task, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(task)}
                  >
                    <Text>{task.name}</Text>
                    {checkIfSelected(task) ? <CheckedIcon /> : <CheckedEmptyIcon />}
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
