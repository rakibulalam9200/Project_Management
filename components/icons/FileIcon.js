import React from 'react';
import { View } from 'react-native';
import File from "../../assets/svg/files-tabbar.svg";

export default function FileIcon({color = '#fff'}) {
  return (
    <View>
      <File fill={color} />
    </View>
  )
}
