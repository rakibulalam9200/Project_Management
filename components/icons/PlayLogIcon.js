import React from 'react';
import { View } from 'react-native';
import PlayLog from "../../assets/svg/play-log.svg";

export default function PlayLogIcon({color = '#EBEBEB'}) {
  return (
    <View>
      <PlayLog fill={color} />
    </View>
  )
}