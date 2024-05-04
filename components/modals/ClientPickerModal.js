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
import { getAssignableIdsObjFromSelectedUsers } from '../../utils/User'
import CButton from '../common/CButton'
import CText from '../common/CText'

export default function ClientPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  alreadySelected,
  modelId,
  from,
  navigationFrom,
}) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelIds, setModelIds] = useState([])

  const checkIfSelected = (user) => {
    const found = selected.find((singleuser) => singleuser.id == user.id)
    return found
  }
  useEffect(() => {
    setModelIds([modelId])
    // //console.log(modelIds,"id________________")
  }, [modelId])

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      if (navigationFrom !== 'Add') {
        Alert.alert("You cann't uncheck client")
      } else {
        setSelected((prev) => {
          const copy = [...prev]
          return copy.filter((singleuser) => user.id != singleuser.id)
        })
      }
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
      role_name: 'Client',
    }
    if (query != '') {
      body['search'] = query
    }
    api.user
      .getMembers(body)
      .then((res) => {
        console.log('Client............')
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

  const memberAssign = () => {
    setLoading(true)
    let assignableIds = getAssignableIdsObjFromSelectedUsers(selected)
    let body = {
      type: 'Client',
      assignable_ids: assignableIds,
      model_ids: [modelId],
    }

    if (from === 'task') {
      body['state'] = 'task'
    } else if (from === 'project') {
      body['state'] = 'project'
    } else if (from === 'milestone') {
      body['state'] = 'milestone'
    } else if (from === 'issue') {
      body['state'] = 'issue'
    }

    // body = {...body,...assignableIds,...modelsIds}

    // console.log(body, 'body..........')
    api.user
      .assignMemeber(body)
      .then((res) => {
        console.log(res, 'res..........')
      })
      .catch((err) => {
        console.log(err, '000000000000000')
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
        closeModal()
      })
  }
  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[g.modalOuterContainer]}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Client"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 8 }}
          />
          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            filterIcon={true}
          />

          <ScrollView style={s.modalOuterContainer} showsVerticalScrollIndicator={false}>
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
          {navigationFrom !== 'Add' && (
            <CButton
              style={{ backgroundColor: colors.SECONDARY, marginBottom: 32 }}
              onPress={memberAssign}
              loading={loading}
              loadingColor={'white'}
            >
              <CText style={g.title3}>Apply</CText>
            </CButton>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
