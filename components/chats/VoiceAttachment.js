import React, { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import CloseIcon from '../../assets/svg/Close_Icon.svg'
import PlayIcon from '../../assets/svg/play-icon.svg'
import PauseIcon from '../../assets/svg/pause-icon2.svg'

const VoiceAttachment = ({ allRecordings, closeVoicePreview, setAllRecordings }) => {
  const [sound, setSound] = useState()
  const [soundLoading, setIsLoading] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handleDelete = (index) => {
    setAllRecordings((prev) => {
      const copy = prev
      let newDocs = copy.filter((c, i) => i !== index)
      return [...newDocs]
    })
    if (allRecordings?.length === 1) {
      closeVoicePreview()
    }
  }
  const getDurationFormatted = (milliseconds) => {
    const minutes = milliseconds / 1000 / 60
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60)
    return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
  }
  const handlePlay = async (recording) => {
    recording.sound.replayAsync()
  }
  return (
    <View style={[s.container]}>
      {allRecordings.map((recording, index) => {
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <View key={index} style={s.row}>
              {/* <TouchableOpacity
                style={s.playPauseIcon}
                onPress={() => handlePlay(recording)}
                title="Play"
              >
                {playing ? <PauseIcon /> : <PlayIcon fill={colors.NORMAL} />}
              </TouchableOpacity> */}

              <Text style={s.fill}>
                Recording #{index + 1} | {getDurationFormatted(recording.duration)}
              </Text>
            </View>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => handleDelete(index)}>
              <CloseIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        )
      })}
    </View>
  )
}

export default VoiceAttachment

const s = StyleSheet.create({
  playPauseIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.HOVER,
    borderRadius: 15,
  },
  container: {
    height: 'auto',
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    marginBottom: '1%',
    borderRadius: 8,
  },
  documentContainer: {
    // marginTop: -8,
    display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  attachmentItemText: {
    color: colors.HOME_TEXT,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  fill: {},
})
