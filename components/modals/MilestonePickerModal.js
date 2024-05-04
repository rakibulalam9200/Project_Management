import React, { useState } from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useEffect } from 'react'

import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'

export default function MilestonePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  projectId,
}) {
  const [milestones, setMilestones] = useState([])
  const [search, setSearch] = useState('')
  const checkIfSelected = (milestone) => {
    return selected?.id == milestone?.id
  }

  const toggleSelected = (milestone) => {
    if (milestone?.id == selected?.id) setSelected({ id: -1 })
    else {
      setSelected(milestone)
      closeModal()
    }
  }
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  useEffect(() => {
    if (projectId) {
      api.milestone
        .getMilestones(
          {
            allData: true,
          },
          projectId
        )
        .then((res) => {
          setMilestones(res)
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
      Alert.alert('Please, Select Project First')
    }
  }, [projectId])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={g.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select milestone"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer} showsVerticalScrollIndicator={false}>
            {/*  {milestones.map((milestone, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(milestone)}
                >
                  <Text>
                    {milestone.name.length > 30
                      ? milestone.name.slice(0, 30) + '...'
                      : milestone.name}
                  </Text>
                  {checkIfSelected(milestone) ? <RadioFilledIcon /> : <RadioEmptyIcon />} 
                </TouchableOpacity>
              )
            })} */}
            {milestones.length > 0 ? (
              milestones.map((milestone, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[g.containerBetween, s.modalInnerContainer]}
                    onPress={() => toggleSelected(milestone)}
                  >
                    <Text>
                      {milestone?.name?.length > 30
                        ? milestone?.name?.slice(0, 30) + '...'
                        : milestone?.name}
                    </Text>
                    {checkIfSelected(milestone) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                  </TouchableOpacity>
                )
              })
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No Milestone Found</Text>
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
    // padding: 16,
    marginBottom: 24,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
