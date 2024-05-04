import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScaleDecorator } from 'react-native-draggable-flatlist'
import * as Progress from 'react-native-progress'
import BellIcon from '../../assets/svg/bell.svg'
import DollarIcon from '../../assets/svg/dollar-circle.svg'
import LocationIcon from '../../assets/svg/location.svg'

export default function ProjectCard({ item, drag, isActive }) {
  return (
    <ScaleDecorator>
      <TouchableOpacity style={s.cardContainer} onPressIn={drag}>
        <View style={s.cardRowBetween}>
          <Text style={s.cardTitle}>Project 1</Text>
          <BellIcon fill={colors.NORMAL} />
        </View>
        <View style={s.cardRowLeft}>
          <Text style={g.gCardStatus}>In progress</Text>
        </View>
        <View style={s.cardRowLeft}>
          <LocationIcon fill={colors.NORMAL} />
          <Text>144-38 Melbourne Avenue</Text>
        </View>
        <View style={s.cardRowLeft}>
          <DollarIcon fill={colors.NORMAL} />
          <Text>Planned: $20000 | Actual: $18232</Text>
        </View>
        <View style={s.cardRowBetween}>
          <Progress.Bar progress={0.3} width={null} color={'#1DAF2B'} style={{ flex: 1 }} />
          <Text style={s.cardProgressText}>30%</Text>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  )
}

const s = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardStatus: {
    fontSize: 12,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
  },
  cardProgressText: {
    marginLeft: 10,
  },
})
