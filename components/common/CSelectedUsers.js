import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import EditIcon from '../../assets/svg/edit.svg'
import CText from './CText'
import IconWrap from './IconWrap'

export default function CSelectedUsers({
  // alreadySelectedUser,
  selectedUsers,
  setSelectedUsers,
  onEditPress = null,
  label = 'Members',
  iconWrapColors = [colors.SEC_BG, colors.MID_BG, colors.END_BG],
}) {
  // if(alreadySelectedUser){
  //   //console.log("insert her....")
  //   let copy = selectedUsers.filter(function (user1) {
  //     return alreadySelectedUser.some(function (user2) {
  //         return user1.id !== user2.id; // return the ones with equal id
  //     });
  //   });
  //   setSelectedUsers(copy)
  // }
  
  
  return (
    <View style={{flex:1}}>
      <Text style={s.inputHeader}>{label}</Text>
      <View style={g.containerBetween}>
        <View style={s.container}>
          {selectedUsers.length >= 1 && (
            <IconWrap outputRange={iconWrapColors} style={s.iconWrapperBtn}>
              <Image style={s.personAvatar} source={{ uri: selectedUsers[0].image }} />
            </IconWrap>
          )}

          {selectedUsers.length >= 2 && (
            <IconWrap outputRange={iconWrapColors} style={[s.iconWrapperBtn, s.overLapIcon]}>
              <Image style={s.personAvatar} source={{ uri: selectedUsers[1].image }} />
            </IconWrap>
          )}
          {selectedUsers.length > 2 && (
            <IconWrap
              onPress={() => {}}
              outputRange={iconWrapColors}
              style={[s.iconWrapperBtn, s.overLapIcon2]}
            >
              <CText style={s.avatarText}>+{selectedUsers.length - 2}</CText>
            </IconWrap>
          )}
        </View>
        <IconWrap onPress={onEditPress} outputRange={iconWrapColors}>
          <EditIcon />
        </IconWrap>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginHorizontal:16,
  },
  iconWrapperBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: colors.WHITE,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon2: {
    position: 'relative',
    left: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatarText: {
    color: colors.ICON_BG,
  },
})
