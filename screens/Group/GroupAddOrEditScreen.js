import React, { useState, useEffect, useRef } from 'react'
import { Text, View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import { useDispatch, useSelector } from 'react-redux'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import api from '../../api/api'
import CButtonInput from '../../components/common/CButtonInput'
import { useIsFocused } from '@react-navigation/native'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, hasGroupNameErrors } from '../../utils/Errors'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import UserPickerModal from '../../components/modals/UserPickerModal'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import { getUserIdsFromSelectedUsers } from '../../utils/User'

export default function GroupAddOrEditScreen({ navigation, route }) {
  let id = route.params ? route.params.id : null
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [groupName, setGroupName] = useState('')
  const [group, setGroup] = useState()
  const [loading, setLoading] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showMemberPickerModal, setShowMemberPickerModal] = useState(false)
  const enabledMembers = useRef({})
  const [errorMessages, setErrorMessages] = useState({
    name: '',
  })

  const goBack = () => {
    navigation.goBack()
  }

  const saveGroup = () => {
    if (hasGroupNameErrors(groupName, setErrorMessages)) return
    const body = {
      name: groupName,
      members: getUserIdsFromSelectedUsers(selectedMembers),
    }

    if (id) {
      body['_method'] = 'PUT'
      api.group
        .updateGroup(id, body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Groups', { refetch: Math.random() })
          }
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
    } else {
      api.group
        .createGroup(body)
        .then((res) => {
          if (res.success) {
            navigation.navigate('Groups', { refetch: Math.random() })
          }
        })
        .catch((err) => {
          //console.log(err.response)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
  }

  const openMemberPickerModal = () => {
    setShowMemberPickerModal(true)
  }

  useEffect(() => {
    setLoading(true)
    if (id) {
      api.group
        .getGroup(id)
        .then((res) => {
          if (res.success) {
            const { name, user_members } = res.group
            setGroupName(name)
            setSelectedMembers(
              user_members.map((user) => {
                user.id = user.user_id
                return user
              })
            )
          }
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
        .finally(() => {
          setLoading(false)
        })
    }
  }, [])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  return (
    <SafeAreaView style={s.outerContainer}>
      <View style={{ flex: 1 }}>
        <View style={s.container}>
          <UserPickerModal
            visibility={showMemberPickerModal}
            setVisibility={setShowMemberPickerModal}
            selected={selectedMembers}
            setSelected={setSelectedMembers}
          />
          <CHeaderWithBack title={id ? 'Update Group' : 'Add group'} onPress={goBack} />
          <CInputWithLabel
            label="Name"
            placeholder="Name"
            value={groupName}
            setValue={setGroupName}
            showErrorMessage
            errorMessage={errorMessages.name}
          />
          {selectedMembers.length > 0 && (
            <CSelectedUsers
              selectedUsers={selectedMembers}
              setSelectedUsers={setSelectedMembers}
              onEditPress={openMemberPickerModal}
            />
          )}
          {selectedMembers.length < 1 && (
            <CSelectWithLabel label="Members" onPress={openMemberPickerModal} />
          )}
          <CButtonInput label={id ? 'Update' : 'Save'} onPress={saveGroup} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  memberLabel: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberContainer: {
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItemContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  memberItem: {
    width: '50%',
    marginVertical: 10,
    padding: 10,
  },
})
