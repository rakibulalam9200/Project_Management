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
import CDateTimePicker from '../common/CDateTimePicker'
import { useEffect } from 'react'
import MilestonePickerModal from './MilestonePickerModal'
import CDateTime from '../common/CDateTime'
import DateRangePicker from 'rn-select-date-range'
import DateRangePickerModal from './DateRangePickerModal'
import { getDateWithZeros } from '../../utils/Timer'
import moment from 'moment'

const FilesFilterModal = ({
  visibility,
  setVisibility,
  setSelectedProject,
  setSelectedMembers,
  setSelectedDateTime,
  setShowFiltersInParent,
  milestone,
  setMilestone,
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [selectedMilestone, setSelectedMilestone] = useState({ id: -1, name: '' })
  const [selectedDate, setSelectedDate] = useState(null)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [pickedDate, setPickedDate] = useState(null)
  const [users, setUsers] = useState([])

  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const openMilestonePickerModal = () => {
    setShowMilestonePicker(true)
  }

  const openDatePickerModal = () => {
    setDatePickerVisible(true)
  }

  const closeModal = () => {
    setVisibility(false)
  }

  const setFilters = () => {
    setSelectedProject(selected)
    setSelectedMembers(users)
    setSelectedDateTime(pickedDate)
    setMilestone(selectedMilestone)
  }

  const applyFilters = () => {
    setFilters()
    setShowFiltersInParent(true)
    closeModal()
  }
  const resetFilters = () => {
    setUsers([])
    setSelectedDate(null)
    setSelected({ id: -1 })
    setSelectedMilestone({ id: -1 })
    setFilters()
  }

  useEffect(() => {
    setSelectedDateTime(pickedDate)

    //console.log(pickedDate, 'filters date')
  }, [pickedDate])

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.CONTAINER_BG }}>
        <View style={[g.outerContainer]}>
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            <ProjectPickerModal
              visibility={showProjectPicker}
              setVisibility={setShowProjectPicker}
              selected={selected}
              setSelected={setSelected}
            />
            <DateRangePickerModal
              visibility={datePickerVisible}
              setVisibility={setDatePickerVisible}
              dateRange={pickedDate}
              setDateRange={setPickedDate}
            />
            <MilestonePickerModal
              visibility={showMilestonePicker}
              setVisibility={setShowMilestonePicker}
              selected={selectedMilestone}
              setSelected={setSelectedMilestone}
              projectId={selected.id}
              isMultiplePicker
            />
            <UserPickerModal
              visibility={showUserPickerModal}
              setVisibility={setShowUserPickerModal}
              selected={users}
              setSelected={setUsers}
            />

            <CHeaderWithBack
              onPress={closeModal}
              title="Files Filter"
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
                style={{ backgroundColor: colors.WHITE }}
                label="Milestone"
                onPress={openMilestonePickerModal}
                selectText={selectedMilestone.id != -1 ? selectedMilestone.name : 'Select'}
              />
              <CSelectWithLabel
                label="Members"
                style={{ backgroundColor: colors.WHITE }}
                onPress={openUserPickerModal}
              />
              <CSelectWithLabel
                label="Date Range"
                style={{ backgroundColor: colors.WHITE }}
                onPress={openDatePickerModal}
                showDate
                selectText={
                  pickedDate
                    ? `${moment(pickedDate.firstDate).utc(true).format('YYYY-MM-DD')} - ${moment(
                      pickedDate.secondDate
                    )
                      .utc(true)
                      .format('YYYY-MM-DD')}`
                    : `Select`
                }
              />
            </View>
          </ScrollView>
          <View style={[g.containerBetween, styles.resetContainer]}>
            <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
              <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                <ResetIcon />
              </IconWrap>
              <Text style={styles.resetText}>Reset Filters</Text>
            </TouchableOpacity>
            <CButtonInput
              label="Apply Filter"
              onPress={applyFilters}
              style={{ paddingHorizontal: 54 }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  selects: {
    marginTop: 16,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    // marginTop: 90,
    marginBottom: 16,
  },
})

export default FilesFilterModal
