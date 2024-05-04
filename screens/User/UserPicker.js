import { ScrollView, StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'

import demoUsers from '../../assets/constants/users'

export default function UserPicker({ navigation, route }) {
  const [users, setUsers] = useState([...route.params.users])

  const checkIfSelected = (user) => {
    const found = users.find((singleuser) => singleuser.id == user.id)
    return found
  }

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      setUsers((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    } else {
      setUsers((prev) => [...prev, user])
    }
  }
  const goBack = () => {
    route.params.returnUsers(users)
    navigation.goBack()
  }
  return (
    <SafeAreaView style={[g.outerContainer, g.padding2x]}>
      <ScrollView>
        <CHeaderWithBack
          onPress={goBack}
          title="Select User"
          labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
        />
        <CSearchInput placeholder="Search" />

        <View style={s.userContainer}>
          {demoUsers.map((user, idx) => {
            return (
              <TouchableOpacity
                key={idx}
                style={[g.containerBetween, s.userItemContainer]}
                onPress={() => toggleSelected(user)}
              >
                <Text>{user.name}</Text>
                {checkIfSelected(user) ? <CheckedIcon /> : <CheckedEmptyIcon />}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  filterContainer: {},
  userItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
})
