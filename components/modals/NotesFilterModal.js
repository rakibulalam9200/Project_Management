import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CHeaderWithBack from '../common/CHeaderWithBack'
import CSelectWithLabel from '../common/CSelectWithLabel'
import IconWrap from '../common/IconWrap'
import ResetIcon from '../../assets/svg/reset.svg'
import CButtonInput from '../common/CButtonInput'
import ProjectPickerModal from './ProjectPickerModal'
import { useState } from 'react'
import UserPickerModal from './UserPickerModal'

const NotesFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  setSelectedFilters,
  selectedUsers,
  setSelectedUsers,
  setShowParentFilters,
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [selected, setSelected] = useState({ id: -1 })
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [users, setUsers] = useState([])

  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }
  const closeModal = () => {
    setShowFilterModal(false)
  }

  const applyFilters = () => {
    setSelectedFilters(selected)
    setSelectedUsers(users)
    setShowParentFilters(true)
    closeModal()
  }
  const resetFilters = () => {
    setUsers([])
    setSelected({ id: -1 })
  }
  return (
    <Modal visible={showFilterModal} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={[g.outerContainer]}>
        <ScrollView>
          <ProjectPickerModal
            visibility={showProjectPicker}
            setVisibility={setShowProjectPicker}
            selected={selected}
            setSelected={setSelected}
          />
          <UserPickerModal
            visibility={showUserPickerModal}
            setVisibility={setShowUserPickerModal}
            selected={users}
            setSelected={setUsers}
          />
          <CHeaderWithBack
            onPress={closeModal}
            title="Notes Filter"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            containerStyle={{ marginTop: 0 }}
          />
          <View style={[styles.selects]}>
            <CSelectWithLabel
              style={{ backgroundColor: colors.WHITE }}
              label="Project"
              onPress={openProjectPickerModal}
              selectText={selected.id != -1 ? selected.name : 'Select'}
              required
            />
            <CSelectWithLabel
              label="Author"
              style={{ backgroundColor: colors.WHITE }}
              onPress={openUserPickerModal}
            />
          </View>
          <View style={{}}>

            <View style={[g.containerBetween, styles.resetContainer]}>
              <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                  <ResetIcon />
                </IconWrap>
                <Text style={styles.resetText}>Reset Filters</Text>
              </TouchableOpacity>
              <CButtonInput label="Apply Filter" onPress={applyFilters} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  selects: {
    marginTop: 20,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    marginTop: 90,

  },
})

export default NotesFilterModal
