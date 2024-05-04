import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native'
import React, { useState } from 'react'
import g from '../../assets/styles/global'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'
import CSearchInput from '../common/CSearchInput'
import PlusIcon from '../../assets/svg/plus-filled-white.svg'
import CheckedIcon from '../../assets/svg/cbchecked-white.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import CSelectWithLabel from '../common/CSelectWithLabel'
import IconWrap from '../common/IconWrap'
import CButtonInput from '../common/CButtonInput'
import filters from '../../assets/constants/filters'
import UserPickerModal from './UserPickerModal'

export default function TaskFilterModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selectedFilters,
  setSelectedFilters,
  selectedUsers,
  setSelectedUsers,
  setShowParentFilters,
}) {
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)

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

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const goBack = () => {
    navigation.goBack()
  }

  const resetFilters = () => {
    setUsers([])
    setSelected([])
  }

  const resetUsers = () => {
    setUsers([])
  }

  const closeModal = () => {
    setVisibility(false)
  }

  const applyFilters = () => {
    setSelectedFilters(selected)
    setSelectedUsers(users)
    setShowParentFilters(true)
    closeModal()
  }
  return (
    <>
      <UserPickerModal
        visibility={showUserPickerModal}
        setVisibility={setShowUserPickerModal}
        selected={users}
        setSelected={setUsers}
      />
      <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
        <SafeAreaView style={[g.outerContainer, g.padding2x]}>
          <ScrollView>
            <CHeaderWithBack
              onPress={closeModal}
              title="Task Filter"
              labelStyle={{ color: colors.HOME_TEXT, fontSize: 24 }}
            />
            <CSelectWithLabel
              label="Member"
              style={{ backgroundColor: colors.WHITE }}
              onPress={openUserPickerModal}
            />

            <View style={s.filterContainer}>
              {users.map((user, idx) => {
                return (
                  <View key={idx} style={[s.userItemContainer]}>
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
                    key={idx}
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
              <CButtonInput label="Apply Filter" onPress={applyFilters} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
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
    borderRadius: 16,
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
