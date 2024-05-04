import React, { useState } from 'react'
import {
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

import { useEffect } from 'react'
import { Alert } from 'react-native-web'
import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

export default function TemplatePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [templates, setTemplates] = useState([])
  const [search, setSearch] = useState('')
  const checkIfSelected = (task) => {
    return selected.id == task.id
  }

  const toggleSelected = (task) => {
    if (task.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(task)
      closeModal()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  useEffect(() => {
    // //console.log(projectId,milestoneId,'==============================')
    api.template
      .getAllTemplate({
        allData: true,
      })
      .then((res) => {
        // //console.log(res,'task............')
        setTemplates(res.templates)
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
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Template"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {templates.map((template, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(template)}
                >
                  <Text>
                    {template.name && template.name.length > 30
                      ? template.name.slice(0, 30) + '...'
                      : template.name}
                  </Text>
                  {checkIfSelected(template) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
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
  },
  modalInnerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
