import React from 'react';
import { View } from 'react-native';
import Project from "../../assets/svg/project-tabbar.svg";

export default function ProjectIcon({color = '#fff'}) {
  return (
    <View>
      <Project fill={color} />
    </View>
  )
}