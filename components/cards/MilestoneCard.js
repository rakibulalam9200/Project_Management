import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import * as Progress from 'react-native-progress'

import FilterIcon from '../../assets/svg/filter.svg'
import BackArrow from '../../assets/svg/arrow-left.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import SortIcon from '../../assets/svg/sort.svg'
import SearchIcon from '../../assets/svg/search.svg'
import BellIcon from '../../assets/svg/bell.svg'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import LocationIcon from '../../assets/svg/location.svg'
import DollarIcon from '../../assets/svg/dollar-circle.svg'
import CText from '../common/CText'

import IconWrap from '../common/IconWrap'

import colors from '../../assets/constants/colors'

import g from '../../assets/styles/global'
import CCheckbox from '../common/CCheckbox'

export default function MilestoneCard({ title = 'Milestone 1', onPress, dueDate = '26.11.22' }) {
  const [checked, setChecked] = useState(true)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <View style={s.cardContainer}>
      <View style={g.containerBetween}>
        <View style={g.containerLeft}>
          <LocationIcon />
          <Text style={s.cardTitle}>{title}</Text>
        </View>
        <View style={s.spaceRight}>
          <CCheckbox showLabel={false} checked={checked} setChecked={setChecked} />
        </View>
      </View>
      <View style={s.containerLeft}>
        <IconWrap onPress={() => {}} outputRange={iconWrapColors} style={s.buttonGroupBtn}>
          <Image style={s.personAvatar} source={require('../../assets/img/person.png')} />
        </IconWrap>
        <IconWrap onPress={() => {}} outputRange={iconWrapColors} style={s.overLapIcon}>
          <Image style={s.personAvatar} source={require('../../assets/img/person.png')} />
        </IconWrap>
        <IconWrap onPress={() => {}} outputRange={iconWrapColors} style={s.overLapIcon2}>
          <Image style={s.personAvatar} source={require('../../assets/img/person.png')} />
        </IconWrap>
      </View>
      <View style={g.containerLeft}>
        <Text style={s.dueText}>Due Date: </Text>
        <Text style={s.dueDate}>{dueDate}</Text>
      </View>
      <View style={[g.containerBetween, g.padding1x]}>
        <Progress.Bar progress={0.3} width={null} color={'#1DAF2B'} style={{ flex: 1 }} />
        <Text style={s.cardProgressText}>30%</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardStatus: {
    fontSize: 12,
    letterSpacing: 1.1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  spaceRight: {
    position: 'relative',
    right: 20,
  },
  dueText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  dueDate: {
    color: colors.PRIM_BODY,
  },
  containerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
})
