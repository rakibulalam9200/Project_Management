import React, { useEffect, useState } from 'react'
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
import { completionMethods } from '../../assets/constants/completion-methods'
import g from '../../assets/styles/global'

import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { capitalizeFirstLetter } from '../../utils/Capitalize'

export default function CompletionMethodModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [allCompletionMethods, setAllCompletionMethods] = useState([])
  const [search, setSearch] = useState('')
  const checkIfSelected = (completion) => {
    return selected.id == completion.id
  }

  const toggleSelected = (completionMethod) => {
    if (completionMethod.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(completionMethod)
      closeModal()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  useEffect(() => {
    setAllCompletionMethods(completionMethods)
    return () => {}
  }, [allCompletionMethods])

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.CONTAINER_BG }}>
        <View style={s.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Completion Method"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
          />
          {/* <CSearchInput placeholder="Search" value={search} setValue={setSearch} /> */}

          <ScrollView style={s.modalOuterContainer}>
            {allCompletionMethods?.map((completionMethod, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(completionMethod)}
                >
                  <Text>
                    {completionMethod.label.length > 30
                      ? completionMethod.label.slice(0, 30) + '...'
                      : capitalizeFirstLetter(completionMethod.label)}
                  </Text>
                  {checkIfSelected(completionMethod) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
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
  outerContainer: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: colors.CONTAINER_BG,
  },
})
