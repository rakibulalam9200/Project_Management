import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CHeaderWithBack from '../common/CHeaderWithBack'

import CloneIcon from '../../assets/svg/clone.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import FilterIcon from '../../assets/svg/filter.svg'
import MoveIcon from '../../assets/svg/move.svg'
import SettingIcon from '../../assets/svg/settings.svg'
import CButtonInput from '../common/CButtonInput'
import IconWrap from '../common/IconWrap'

export default function CSettingsModal({
  children,
  visibility,
  setVisibility,
  navigation,
  onDelete = null,
  onClone = null,
  onFilter = null,
  from,
  onCustomiztion = null,
  onMove = null,
  stage = null
}) {
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
            title="Settings"
            labelStyle={s.headerLabel}
            // iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />
          {onFilter && <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              if (onFilter) onFilter()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Filter</Text>
            <IconWrap outputRange={iconWrapColors}>
              <FilterIcon />
            </IconWrap>
          </TouchableOpacity>}

          {onClone && <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              if (onClone) onClone()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Clone</Text>
            <IconWrap outputRange={iconWrapColors}>
              <CloneIcon />
            </IconWrap>
          </TouchableOpacity>}

          {!stage && onMove &&  <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              if (onMove) onMove()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Move</Text>
            <IconWrap style={{ paddingTop: 8 }} outputRange={iconWrapColors}>
              <MoveIcon />
            </IconWrap>
          </TouchableOpacity>}

          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={() => {
              if (onDelete) onDelete()
              closeModal()
            }}
          >
            <Text style={s.settingsItemText}>Delete</Text>
            <IconWrap outputRange={iconWrapColors}>
              <DeleteIcon />
            </IconWrap>
          </TouchableOpacity>
          {from !== 'checklist' && onCustomiztion && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onCustomiztion) onCustomiztion()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Customization</Text>
              <IconWrap outputRange={iconWrapColors}>
                <SettingIcon />
              </IconWrap>
            </TouchableOpacity>
          )}
          <CButtonInput label="Save" onPress={() => closeModal()} style={{ marginTop: 24 }} />
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  headerContainerStyle: {
    marginVertical: 8,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    // marginLeft: 8,
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
})
