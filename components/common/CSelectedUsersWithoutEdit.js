import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import colors from '../../assets/constants/colors'
import CText from './CText'
import IconWrap from './IconWrap'

export default function CSelectedUsersWithoutEdit({
  selectedUsers,
  setSelectedUsers,
  onEditPress = null,
  label = 'Members',
  iconWrapColors = [colors.SEC_BG, colors.MID_BG, colors.END_BG],
  size = 'default',
  style
}) {
  return (
    <View style={[s.container,style,selectedUsers.length == 2 && {left:24}, selectedUsers.length > 2  && {left: 48}]}>
      {selectedUsers.length == 0 && (
        <IconWrap
          outputRange={iconWrapColors}
          style={[size == 'default' ? s.iconWrapperBtn : s.iconWrapperBtnSmall]}
        >
          <CText style={s.avatarText}>0</CText>
        </IconWrap>
      )}

      {selectedUsers.length >= 1 && (
        <IconWrap
          outputRange={iconWrapColors}
          style={[size == 'default' ? s.iconWrapperBtn : s.iconWrapperBtnSmall]}
        >
          <Image
            style={size == 'default' ? s.personAvatar : s.personAvatarSmall}
            source={{ uri: selectedUsers[0].image }}
          />
        </IconWrap>
      )}

      {selectedUsers.length >= 2 && (
        <IconWrap
          outputRange={iconWrapColors}
          style={[size == 'default' ? s.iconWrapperBtn : s.iconWrapperBtnSmall, s.overLapIcon]}
        >
          <Image style={s.personAvatar} source={{ uri: selectedUsers[1].image }} />
        </IconWrap>
      )}
      {selectedUsers.length > 2 && (
        <IconWrap
          outputRange={iconWrapColors}
          style={[size == 'default' ? s.iconWrapperBtn : s.iconWrapperBtnSmall, s.overLapIcon2]}
        >
          <CText style={s.avatarText}>+{selectedUsers.length - 2}</CText>
        </IconWrap>
      )}
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
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.ICON_BG,
  },
})
