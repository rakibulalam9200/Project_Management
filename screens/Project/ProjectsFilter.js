import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import filters from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CheckedIcon from '../../assets/svg/cbchecked-white.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import PlusIcon from '../../assets/svg/plus-filled-white.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'

export default function ProjectsFilter({ navigation, route }) {
  const [users, setUsers] = useState([...route.params.users])
  const [selected, setSelected] = useState([...route.params.selected])

  const checkIfSelected = (filter) => {
    const found = selected.find((f) => f.value == filter.value)
    return found
  }

  const toggleSelected = (filter) => {
    if (checkIfSelected(filter)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((selectedFilter) => filter.value != selectedFilter.value)
      })
    } else {
      setSelected((prev) => [...prev, filter])
    }
  }

  const openUserPicker = () => {
    navigation.navigate('UserPicker', { users, returnUsers: setUsers })
  }

  const goBack = () => {
    route.params.returnUsers(users)
    route.params.returnSelected(selected)
    route.params.setShowFilters(true)
    navigation.goBack()
  }

  const resetFilters = () => {
    setUsers([])
    setSelected([])
  }

  const resetUsers = () => {
    setUsers([])
  }
  return (
    <SafeAreaView style={[g.outerContainer, g.padding2x]}>
      <ScrollView>
        <CHeaderWithBack
          onPress={goBack}
          title="Project Filter"
          labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
        />
        <CSelectWithLabel
          label="Member"
          style={{ backgroundColor: colors.WHITE }}
          onPress={openUserPicker}
        />

        <View style={s.filterContainer}>
          {users.map((user) => {
            return (
              <View style={[s.userItemContainer]}>
                <Text style={s.userItemTextDark}>{user.name}</Text>
              </View>
            )
          })}
          {users.length > 0 && (
            <TouchableOpacity onPress={resetUsers}>
              <CrossIcon />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.filterContainer}>
          {filters.map((filter, idx) => {
            return (
              <TouchableOpacity
                style={[s.filterItemContainer, { backgroundColor: filter.color }]}
                onPress={() => toggleSelected(filter)}
              >
                {checkIfSelected(filter) ? <CheckedIcon /> : <PlusIcon />}
                <Text style={s.filterItemText}>{filter.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={[g.containerBetween, s.resetContainer]}>
          <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
            <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
              <ResetIcon />
            </IconWrap>
            <Text style={s.resetText}>Reset Filters</Text>
          </TouchableOpacity>
          <CButtonInput label="Apply Filtegrr" onPress={goBack} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    flexBasis: 1,
    flexWrap: 'wrap',
  },
  filterItemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 5,
    borderRadius: 20,
  },
  filterItemText: {
    color: colors.WHITE,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    marginTop: 90,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  userItemText: {
    color: colors.WHITE,
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
  },
})
