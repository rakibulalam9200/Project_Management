import React from 'react';
import { View } from 'react-native';
import Note from "../../assets/svg/note-tabbar.svg";

export default function NoteIcon({color = '#fff'}) {
  return (
    <View>
      <Note fill={color} />
    </View>
  )
}