import React, { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import { FILES_SORT_BY, SORT_BY } from '../../assets/constants/filesSortBy'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CButtonInput from '../common/CButtonInput'
import CHeaderWithBack from '../common/CHeaderWithBack'

const FilesSortModal = ({
  children,
  sortBy,
  setSortBy,
  visibility,
  setVisibility,
  onDelete = null,
}) => {
  const [sort, setSort] = useState({ id: -1 })

  const closeModal = () => {
    setVisibility(false)
  }

  const checkIfSelected = (value) => {
    if (sort.id === value) {
      // //console.log(sortBy.value)
      return true
    }
  }

  const toggleSelected = (value) => {
    setSort(value)
  }

  const handleApply = () => {
    setSortBy(sort)
    closeModal()
  }

  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Sort by"
            labelStyle={s.headerLabel}
            iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          <ScrollView style={s.scrollContainer}>
            {SORT_BY.map((fileSort) => (
              <View key={fileSort.id}>
                <TouchableOpacity
                  style={[g.containerBetween, s.sortOptions]}
                  onPress={() => toggleSelected(fileSort)}
                >
                  <Text style={{ fontSize: 18 }}>{fileSort.value}</Text>
                  {checkIfSelected(fileSort.id) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <CButtonInput onPress={handleApply} label="Apply" style={{ paddingVertical: 10 }} />
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '70%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },

  sortOptions: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  },
  scrollContainer: {
    maxHeight: 300,
    padding: 8,
  },
})

export default FilesSortModal
