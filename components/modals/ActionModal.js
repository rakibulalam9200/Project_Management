import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import { SORT_BY } from '../../assets/constants/filesSortBy'
import g from '../../assets/styles/global'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CButtonInput from '../common/CButtonInput'
import CHeaderWithBack from '../common/CHeaderWithBack'

const ActionModal = ({ children, visibility, setVisibility}) => {
//   const [sort, setSort] = useState(sortBy)
//   const [mLoding, setMLoding] = useState(false)
  
  const closeModal = () => {
    setVisibility(false)
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
          {SORT_BY.map((sort) => (
            <View key={sort.id}>
              <TouchableOpacity
                style={[g.containerBetween, s.sortOptions]}
                onPress={() => toggleSelected(sort)}
              >
                <Text style={s.sortText}>{sort.value}</Text>
                {checkIfSelected(sort.value) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              </TouchableOpacity>
            </View>
          ))}

          <CButtonInput onPress={handleApply} label="Apply" style={{ paddingVertical: 10 }} loading={mLoding}/>
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
    width: '60%',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  },
  sortText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
    fontWeight: '500',
  },
})

export default ActionModal
