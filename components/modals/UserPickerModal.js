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
import api from '../../api/api'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import { getErrorMessage } from '../../utils/Errors'
import { abbreviateString } from '../../utils/Strings'

export default function UserPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  label,
}) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')

  const checkIfSelected = (user) => {
    const found = selected.find((singleuser) => singleuser.id == user.id)
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
    if (label === 'Members') {
      body['role_name'] = 'Member'
    }
    api.user
      .getUsers(body)
      .then((res) => {
        //console.log({ res })
        setUsers(res.members)
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
            title={label === 'Members' ? 'Select Members' : 'Select Users'}
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={s.modalOuterContainer}>
            {users.map((user, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(user)}
                >
                  <Text>
                    {user.name ? abbreviateString(user.name, 30) : abbreviateString(user.email, 30)}
                  </Text>
                  {checkIfSelected(user) ? <CheckedIcon /> : <CheckedEmptyIcon />}
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
