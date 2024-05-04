import React, { useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
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
import { Image } from 'react-native'
import CButtonInput from '../common/CButtonInput'
import CCheckbox from '../common/CCheckbox'

export default function ChatUserPickerModal({
  visibility,
  setVisibility,
  setSelected,
  selected,
  label,
  onUpdate = () => {},
  members,
  chatType = 'Project',
}) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const checkIfSelected = (id) => {
    const found = members.find((singleuser) => singleuser.user_id == id)
    return found
  }

  const toggleNotSelected = (id) => {
    const newUsers = users.map((user) => {
      if (user.id === id && !user.added) {
        user.selected = !user.selected
      }
      return user
    })
    setUsers(newUsers)
  }

  const closeModal = () => {
    setVisibility(false)
  }
  useEffect(() => {
    setSelected(users.filter((user) => user.selected && !user.added).map((user) => user.id) || [])
  }, [users])
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])
  useEffect(() => {
    setLoading(true)
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
        //console.log(res)
        setUsers(
          res.members.map((member) => {
            const selected = checkIfSelected(member.id)
            return {
              ...member,
              selected: selected,
              added: selected,
            }
          })
        )
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
      .finally(() => {
        setLoading(false)
      })
  }, [query])

  const UserCard = ({ item }) => {
    const setChecked = () => {
      toggleNotSelected(item)
    }
    return (
      <TouchableOpacity
        key={item.id}
        style={[g.containerBetween, s.modalInnerContainer]}
        onPress={() => toggleNotSelected(item.id)}
      >
        <Image source={{ uri: item?.image }} style={s.userImage} />
        <Text>
          {item.name ? abbreviateString(item.name, 30) : abbreviateString(item.email, 30)}
        </Text>
        {/* {checkIfSelected(item) ? <CheckedIcon /> : <CheckedEmptyIcon />} */}
        <CCheckbox showLabel={false} checked={item.selected} setChecked={setChecked} />
      </TouchableOpacity>
    )
  }
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={g.safeModalOuterContainer}>
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <CHeaderWithBack
            onPress={closeModal}
            title={'Select'}
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} filterIcon />

          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={UserCard}
            ListHeaderComponent={
              loading && <ActivityIndicator size="small" color={colors.NORMAL} />
            }
          />

          <CButtonInput
            label="Save"
            onPress={() => {
              if (onUpdate) {
                onUpdate()
              }
            }}
            style={s.bottomButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,

    paddingBottom: 56,
  },
  modalInnerContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  userImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  bottomButton: {
    marginVertical: 8,
  },
})
