import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import BluePlusIcon from '../../assets/svg/plus-light-blue.svg'
import CText from './CText'
import PlusIconWrap from './PlusIconWrap'

export default function CSelectedUserForDetails({
  selectedUsers,
  setSelectedUsers,
  userSelection,
  onEditPress = null,
  label = 'Members',
  iconWrapColors = [colors.SEC_BG, colors.MID_BG, colors.END_BG],
  size = 'default',
  style,
}) {
  // console.log('selected users ', label, selectedUsers)
  return (
    <View style={[s.container, style]}>
      <Text style={[g.caption1, { color: colors.NORMAL }]}>{label}</Text>
      <View style={[{ marginTop: 4, flex: 1, flexDirection: 'row' }]}>
        {label === 'Owner' && (
          <Image style={s.personAvatar} source={{ uri: selectedUsers[0]?.image }} />
        )}
        {label !== 'Owner' && (
          <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
            {selectedUsers.length >= 1 && (
              <Image style={s.personAvatar} source={{ uri: selectedUsers[0]?.image }} />
            )}
            {selectedUsers.length >= 2 && (
              <Image style={s.personAvatar} source={{ uri: selectedUsers[1]?.image }} />
            )}
            {selectedUsers.length > 2 && (
              <PlusIconWrap
                onPressIn={userSelection}
                outputRange={iconWrapColors}
                style={s.iconWrapperBtn}
                borderRadius={24}
              >
                <CText style={s.avatarText}>+{selectedUsers.length - 2}</CText>
              </PlusIconWrap>
            )}
            {selectedUsers.length <= 2 && (
              <PlusIconWrap
                onPressIn={userSelection}
                outputRange={iconWrapColors}
                style={s.iconWrapperBtn}
                borderRadius={24}
              >
                <BluePlusIcon />
              </PlusIconWrap>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  iconWrapperBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
  },
  iconWrapperBtnSmall: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  personAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon2: {
    position: 'relative',
    left: -48,
  },
  container: {
    backgroundColor: colors.WHITE,
    padding: 8,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
    flex: 1,
  },
  avatarText: {
    color: colors.ICON_BG,
  },
})
