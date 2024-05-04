import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'

import ApproveIcon from '../../assets/svg/approve.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import ExportIcon from '../../assets/svg/export.svg'
import GroupByIcon from '../../assets/svg/groupBy.svg'
import SmallGrayRadioFilledIcon from '../../assets/svg/radio-gray-small-filled.svg'
import SmallGrayRadioOutlineIcon from '../../assets/svg/radio-gray-small-outline.svg'
import CButtonInput from '../common/CButtonInput'
import CMidHeaderWithIcons from '../common/CMidHeaderWithIcons'
import IconWrap from '../common/IconWrap'

export default function TSettingsModal({
  children,
  visibility,
  setVisibility,
  navigation,
  onDelete = null,
  onApprove = null,
  onExport = null,
  onGroupBy = null,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [activeGroupBy,setActiveGroupBy] = useState('member')
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CMidHeaderWithIcons
            onPress={closeModal}
            title="Settings"
            labelStyle={s.headerLabel}
            containerStyle={s.headerContainerStyle}
          />
          {onApprove && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onApprove) onApprove()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Approve</Text>
              <IconWrap outputRange={iconWrapColors}>
                <ApproveIcon />
              </IconWrap>
            </TouchableOpacity>
          )}

          {onExport && (
            <TouchableOpacity
              style={[s.settingsItemContainer]}
              onPress={() => {
                if (onExport) onExport()
                closeModal()
              }}
            >
              <Text style={s.settingsItemText}>Export</Text>
              <IconWrap outputRange={iconWrapColors}>
                <ExportIcon />
              </IconWrap>
            </TouchableOpacity>
          )}

          {onGroupBy && (
            <View style={[s.borderBottomStyle,{paddingBottom:8}]}>
              <View
                style={[s.settingsItemContainer,{borderBottomWidth:0}]}
                //   onPress={() => {
                //     if (onGroupBy) onGroupBy()
                //     closeModal()
                //   }}
              >
                <Text style={[s.settingsItemText,{borderBottomWidth:0}]}>Group by: </Text>
                <IconWrap style={{ paddingTop: 8 }} outputRange={iconWrapColors}>
                  <GroupByIcon />
                </IconWrap>
              </View>
              <View style={{paddingHorizontal:8}}>
                <TouchableOpacity style={[s.radioItemContainer]} onPress={()=> setActiveGroupBy('day')}>
                  <Text style={s.settingsItemText}>Day</Text>
                  { activeGroupBy === "day" ? <SmallGrayRadioFilledIcon /> : <SmallGrayRadioOutlineIcon/>}
                </TouchableOpacity>
                <TouchableOpacity style={[s.radioItemContainer]} onPress={()=> setActiveGroupBy('member')}>
                  <Text style={s.settingsItemText}>Member</Text>
                  { activeGroupBy === "member" ? <SmallGrayRadioFilledIcon /> : <SmallGrayRadioOutlineIcon/>}
                </TouchableOpacity>
                <TouchableOpacity style={[s.radioItemContainer]} onPress={()=> setActiveGroupBy('project')}>
                  <Text style={s.settingsItemText}>Project</Text>
                  { activeGroupBy === "project" ? <SmallGrayRadioFilledIcon /> : <SmallGrayRadioOutlineIcon/>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[s.settingsItemContainer,{borderBottomWidth:0}]}
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

          <CButtonInput label="Apply" onPress={() => closeModal()} style={{ marginTop: 24 }} />
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
    paddingVertical: 10,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  radioItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  borderBottomStyle:{
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  }
})
