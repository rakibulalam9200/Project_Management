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

import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import api from '../../api/api'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import { getErrorMessage } from '../../utils/Errors'

export default function MultipleProjectPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState(selected)
  const [query, setQuery] = useState('')

  const checkIfSelected = (project) => {
    const found = selected?.find((singleproject) => singleproject.id == project.id)
    return found
  }

  const toggleSelected = (project) => {
    if (checkIfSelected(project)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((singleproject) => project.id != singleproject.id)
      })
    } else {
      setSelected((prev) => [...prev, project])
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
    api.project
      .getAllProjects(body)
      .then((res) => {
        //console.log({ res })
        setProjects(res)
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
  }, [query])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.modalOuterContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Projects"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 8 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
          <GestureHandlerRootView style={{ flex: 1, paddingBottom: 24 }}>
            <ScrollView style={s.modalOuterContainer}>
              {projects?.map((project, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(project)}
                  >
                    <Text>{project.name}</Text>
                    {checkIfSelected(project) ? <CheckedIcon /> : <CheckedEmptyIcon />}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </GestureHandlerRootView>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    // paddingLeft: 16,
    // padding: 16,
  },
  modalInnerContainer: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomColor: colors.SEC_BG,
  },
})
