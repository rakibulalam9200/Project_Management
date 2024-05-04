import React, { useEffect, useState } from 'react'
import {
  Alert,
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

import api from '../../api/api'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
// import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProjectPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  isMultiplePicker,
}) {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const checkIfSelected = (project) => {
    if (isMultiplePicker) {
      const found = selected.find((singleProject) => singleProject.id == project.id)
      return found
    } else {
      return selected?.id == project?.id
    }
  }

  const toggleSelected = (project) => {
    if (isMultiplePicker) {
      if (checkIfSelected(project)) {
        setSelected((prev) => {
          const copy = [...prev]
          return copy.filter((singleProject) => project.id != singleProject.id)
        })
      } else {
        setSelected((prev) => [...prev, project])
      }
    } else {
      if (project.id == selected.id) setSelected({ id: -1 })
      else {
        setSelected(project)
        closeModal()
      }
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  useEffect(() => {
    api.project
      .getAllProjects({
        allData: true,
      })
      .then((res) => {
        setProjects(res)
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
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Project"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={[s.modalOuterContainer]} showsVerticalScrollIndicator={false}>
            {projects.map((project, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(project)}
                >
                  <Text>
                    {project.name.length > 30 ? project.name.slice(0, 30) + '...' : project.name}
                  </Text>

                  {isMultiplePicker ? (
                    checkIfSelected(project) ? (
                      <CheckedIcon />
                    ) : (
                      <CheckedEmptyIcon />
                    )
                  ) : checkIfSelected(project) ? (
                    <RadioFilledIcon />
                  ) : (
                    <RadioEmptyIcon />
                  )}
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
    // padding: 16,
    marginBottom: 24,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
  outerContainer: {
    flex: 1,
    // borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.CONTAINER_BG,
  },
})
