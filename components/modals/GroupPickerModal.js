import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'

import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'

import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import { useEffect } from 'react'
import api from '../../api/api'
import { getErrorMessage } from '../../utils/Errors'

export default function GroupPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')

  const [query, setQuery] = useState('')
  const checkIfSelected = (group) => {
    return selected.id == group.id
  }

  const toggleSelected = (group) => {
    if (group.id == selected.id) setSelected({ id: -1, value: '' })
    else {
      setSelected(group)
      closeModal()
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
    const body = {
      allData: true,
    }
    if (query != '') {
      body['search'] = query
    }
    api.group
      .getGroups(body)
      .then((res) => {
        //console.log(res)
        setGroups(res)
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
      <View style={g.outerContainer}>
        <CHeaderWithBack
          onPress={closeModal}
          title="Select Group"
          labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
          iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
        />
        <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

        <ScrollView style={s.modalOuterContainer}>
          {groups.map((group, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                style={[g.containerBetween, s.modalInnerContainer]}
                onPress={() => toggleSelected(group)}
              >
                <Text>{group.name.length > 30 ? group.name.slice(0, 30) + '...' : group.name}</Text>
                {checkIfSelected(group) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
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
