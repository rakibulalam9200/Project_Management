import React from 'react';
import { View } from 'react-native';
import Milestone from "../../assets/svg/milestone-tabbar.svg";

export default function MilestoneIcon({color = '#fff'}) {
  return (
    <View>
      <Milestone fill={color} />
    </View>
  )
}
