import React, { useState } from 'react'
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useEffect } from 'react'
import api from '../../api/api'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
import { getErrorMessage } from '../../utils/Errors'

export default function RolePickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
}) {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')

  const [query, setQuery] = useState('')
  const checkIfSelected = (role) => {
    return selected.id == role.id
  }

  const toggleSelected = (role) => {
    if (role.id == selected.id) setSelected({ id: -1, value: '' })
    else {
      setSelected(role)
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
      except: ['Owner','Client']
    }
    if (query != '') {
      body['search'] = query
    }
    api.role
      .getRoles(body)
      .then((res) => {
        console.log(res)
        setRoles(res)
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
      <SafeAreaView style={[{ flex: 1, backgroundColor: colors.CONTAINER_BG }]}>
        <View style={s.modalOuterContainer}>

          <CHeaderWithBack
            onPress={closeModal}
            title="Select Role"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {roles.map((role, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(role)}
                >
                  <Text>{role.name.length > 30 ? role.name.slice(0, 30) + '...' : role.name}</Text>
                  {checkIfSelected(role) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
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
    paddingHorizontal: 16,
    // backgroundColor: colors.GREEN_NORMAL,
    marginTop: 0,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
