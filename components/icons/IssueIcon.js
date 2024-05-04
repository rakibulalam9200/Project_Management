import React from 'react';
import { View } from 'react-native';
import Issue from "../../assets/svg/issue.svg";

export default function IssueIcon({color = '#fff'}) {
  return (
    <View>
      <Issue fill={color} />
    </View>
  )
}