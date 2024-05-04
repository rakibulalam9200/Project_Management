import { Audio } from 'expo-av'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import colors from '../../assets/constants/colors'
import PauseIcon from '../../assets/svg/pause-icon2.svg'
import PlayIcon from '../../assets/svg/play-icon.svg'
const AudioCard = ({ attach }) => {
  // const msg = item.message
  const { user } = useSelector((state) => state.user)
  const soundObject = useRef(new Audio.Sound())
  const [soundLoaded, setSoundLoaded] = useState(false)
  const [soundLoading, setSoundLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [isVoice, setIsVoice] = useState(false)
  const [playBackCounter, setPlayBackCounter] = useState(0)
  const [remainingSecs, setRemainingSecs] = useState(0)

  const loadAudio = async (uri) => {
    setSoundLoading(true)
    const checkLoading = await soundObject.current.getStatusAsync()
    //console.log(checkLoading, 'checkLoading')
    if (checkLoading.isLoaded == false) {
      try {
        const result = await soundObject.current.loadAsync({ uri: uri })
        if (result.isLoaded == true) {
          setSoundLoading(false)
          setSoundLoaded(true)
          playAudio()
        } else {
          setSoundLoading(false)
          //console.log('not loaded')
        }
      } catch (error) {
        console.error(error, 'error on load')
      }
    }
  }

  const finishedAudio = async (duration) => {
    if (!playing) {
      const timeout = setTimeout(async () => {
        setPlaying(false)
        setSoundLoaded(false)
        setPlayBackCounter(0)
        setRemainingSecs(0)
        //console.log('unloaded')
        await soundObject.current.unloadAsync()
      }, duration)
    }
  }

  useEffect(() => {
    setRemainingSecs(getDurationFormatted(playBackCounter))
  }, [playBackCounter])

  useEffect(() => {
    let myInterval

    if (playing) {
      myInterval = setInterval(() => {
        setPlayBackCounter((prev) => prev - 1000)
      }, 1000)
    } else {
      //console.log('clear')
      clearInterval(myInterval)
    }

    return () => {
      clearInterval(myInterval)
    }
  }, [playing])

  const playAudio = async () => {
    try {
      // await soundObject.loadAsync({ uri: uri });
      const result = await soundObject.current.getStatusAsync({})
      //console.log(result, 'result play')
      if (result.isPlaying == false) {
        setPlaying(true)
        setPlayBackCounter(result.durationMillis - result.positionMillis)
        await soundObject.current.playAsync()
        //console.log('playing')
        finishedAudio(result.durationMillis)
      }
      if (result.isPlaying == true) {
        setPlaying(false)
        await soundObject.current.pauseAsync()
      }

      // Your sound is playing!
    } catch (error) {
      // An error occurred!
      console.error(error)
    }
  }
  const getDurationFormatted = (milliseconds) => {
    const minutes = milliseconds / 1000 / 60
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60)
    return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
  }
  
  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.playPauseIcon}
        onPress={() => {
          !soundLoaded ? loadAudio(attach.url) : playAudio()
        }}
      >
        {soundLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : playing ? (
          <PauseIcon />
        ) : (
          <PlayIcon fill={colors.NORMAL} />
        )}
      </TouchableOpacity>
      <Text style={s.fill}>
        {attach.name.includes('-') ? attach.name.split('-')[1] : attach.name}
      </Text>
      <Text style={s.fill}>
        {playBackCounter
          ? remainingSecs
          : attach.name.includes('-') && getDurationFormatted(Number(attach.name.split('-')[0]))}
        {/* {playBackCounter} */}
      </Text>
    </View>
  )
}
export default AudioCard

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 0,
    marginVertical: 4,
  },
  fill: {},
  container: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
    // paddingTop: Platform.OS === 'android' ? 26 : 0,
  },
  outerPadding: {
    flex: 1,
    paddingBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // borderWidth: 1
  },

  chatHeader: {
    color: colors.BLACK,
    fontSize: 16,
    // lineHeight: 24,
    fontFamily: 'inter-semibold',
    // textAlignVertical: 'center',
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
    color: colors.BLACK,
    padding: 2,
    fontSize: 16,
    fontWeight: '500',
  },
  chatContainer: {
    minWidth: '30%',
    maxWidth: '100%',
    backgroundColor: '#D6E2FF',
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    display: 'flex',
    padding: 8,
    marginRight: 8,
    flex: 1,
  },

  voiceChatContainer: {
    minWidth: '50%',
    maxWidth: '100%',
    backgroundColor: '#D6E2FF',
    marginBottom: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    display: 'flex',
    padding: 8,
    marginRight: 8,
    flex: 1,
  },

  sideView: {
    position: 'absolute',
    content: '',
    width: 0,
    height: 0,
    borderBottomColor: '#d6e2ff',
    borderBottomWidth: 18,
    top: 0,
    right: 0,
    borderLeftColor: ' rgba(0,0,0,0)',
    borderRightColor: ' rgba(0,0,0,0)',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    transform: [{ rotate: '180deg' }],
  },

  senderSideView: {
    position: 'absolute',
    content: '',
    width: 0,
    height: 0,
    borderBottomColor: 'white',
    borderBottomWidth: 18,
    top: 0,
    left: -8,
    borderLeftColor: ' rgba(0,0,0,0)',
    borderRightColor: ' rgba(0,0,0,0)',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    transform: [{ rotate: '180deg' }],
  },

  senderChatContainer: {
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '40%',
    maxWidth: '100%',
  },
  SendMessageCotainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  SendMessageOutter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // backgroundColor: 'yellow',
  },
  docContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  mTime: {
    paddingLeft: 8,
    fontSize: 10,
    color: '#9CA2AB',
    alignSelf: 'flex-end',
  },
  mSenderTime: {
    paddingLeft: 16,
    fontSize: 10,
    color: '#9CA2AB',
    alignSelf: 'flex-end',
  },
  senderMsg: {
    fontSize: 16,
    textAlign: 'justify',
  },
  senderImgStyle: {
    borderRadius: 16,
    marginRight: 8,
  },
  senderContent: {
    minWidth: '30%',
    maxWidth: '100%',
    paddingHorizontal: 8,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    display: 'flex',
  },
  senderTextContainer: {
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  senderName: {
    fontSize: 12,
    color: '#246BFD',
    textAlign: 'justify',
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'column',
  },

  playPauseIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.HOVER,
    borderRadius: 15,
  },
})
