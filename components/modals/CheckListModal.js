import React, { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import colors from '../../assets/constants/colors'
import { checklist } from '../../assets/constants/checklist'
import g from '../../assets/styles/global'

import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { capitalizeFirstLetter } from '../../utils/Capitalize'

export default function CheckListModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [allChecklist, setAllChecklist] = useState([])
  const [search, setSearch] = useState('')
  const checkIfSelected = (checklist) => {
    return selected.id == checklist.id
  }

  const toggleSelected = (checklist) => {
    if (checklist.id == selected.id) setSelected({ id: -1 })
    else {
      setSelected(checklist)
      closeModal()
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  useEffect(() => {
    setAllChecklist(checklist)
    return () => {}
  }, [allChecklist])
  //   useEffect(() => {
  //     api.checklist
  //       .getallChecklists({
  //         allData: true,
  //       })
  //       .then((res) => {
  //         setchecklists(res)
  //       })
  //       .catch((err) => {
  //         let errorMsg = ''
  //         try {
  //           errorMsg = getErrorMessage(err)
  //         } catch (err) {
  //           errorMsg = 'An error occured. Please try again later.'
  //         }
  //         Alert.alert(errorMsg)
  //       })
  //   }, [])
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={g.outerContainer}>
        <CHeaderWithBack
          onPress={closeModal}
          title="Select Checklist"
          labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
          iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
        />
        {/* <CSearchInput placeholder="Search" value={search} setValue={setSearch} /> */}

        <ScrollView style={s.modalOuterContainer}>
          {allChecklist?.map((checklist, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                style={[g.containerBetween, s.modalInnerContainer]}
                onPress={() => toggleSelected(checklist)}
              >
                <Text>
                  {checklist.name.length > 30
                    ? checklist.name.slice(0, 30) + '...'
                    : capitalizeFirstLetter(checklist.name)}
                </Text>
                {checkIfSelected(checklist) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
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
