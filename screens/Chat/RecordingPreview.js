import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Path, Svg } from 'react-native-svg'

export default function RecordingPreview({ recording, cancleRecording }) {
  const [recordingDuration, setRecordingDuration] = useState({
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const RightActions = () => {
    return (
      <TouchableOpacity style={{ width: '100%', display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
        <Text style={{ textAlign: "right" }}>
          <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
              fill="#246BFD"
            />
          </Svg>
        </Text>
      </TouchableOpacity>
    )
  }
  useEffect(() => {
    if (recording) {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev.seconds === 59) {
            return {
              minutes: prev.minutes + 1,
              seconds: 0,
              milliseconds: 0,
            }
          } else if (prev.milliseconds === 9) {
            return {
              ...prev,
              seconds: prev.seconds + 1,
              milliseconds: 0,
            }
          } else {
            return {
              ...prev,
              milliseconds: prev.milliseconds + 1,
            }
          }
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [recording])
  return (
    <Swipeable onSwipeableOpen={cancleRecording} renderRightActions={RightActions} containerStyle={{width: "100%"}}>
      <View
        style={{
          
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M12 15C13.0609 15 14.0783 14.5786 14.8284 13.8284C15.5786 13.0783 16 12.0609 16 11V5C16 3.93913 15.5786 2.92172 14.8284 2.17157C14.0783 1.42143 13.0609 1 12 1C10.9391 1 9.92172 1.42143 9.17157 2.17157C8.42143 2.92172 8 3.93913 8 5V11C8 12.0609 8.42143 13.0783 9.17157 13.8284C9.92172 14.5786 10.9391 15 12 15ZM10 5C10 4.46957 10.2107 3.96086 10.5858 3.58579C10.9609 3.21071 11.4696 3 12 3C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5V11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11V5ZM20 11C20 10.7348 19.8946 10.4804 19.7071 10.2929C19.5196 10.1054 19.2652 10 19 10C18.7348 10 18.4804 10.1054 18.2929 10.2929C18.1054 10.4804 18 10.7348 18 11C18 12.5913 17.3679 14.1174 16.2426 15.2426C15.1174 16.3679 13.5913 17 12 17C10.4087 17 8.88258 16.3679 7.75736 15.2426C6.63214 14.1174 6 12.5913 6 11C6 10.7348 5.89464 10.4804 5.70711 10.2929C5.51957 10.1054 5.26522 10 5 10C4.73478 10 4.48043 10.1054 4.29289 10.2929C4.10536 10.4804 4 10.7348 4 11C4.00177 12.9473 4.71372 14.8271 6.0024 16.287C7.29107 17.7469 9.06798 18.6866 11 18.93V21H9C8.73478 21 8.48043 21.1054 8.29289 21.2929C8.10536 21.4804 8 21.7348 8 22C8 22.2652 8.10536 22.5196 8.29289 22.7071C8.48043 22.8946 8.73478 23 9 23H15C15.2652 23 15.5196 22.8946 15.7071 22.7071C15.8946 22.5196 16 22.2652 16 22C16 21.7348 15.8946 21.4804 15.7071 21.2929C15.5196 21.1054 15.2652 21 15 21H13V18.93C14.932 18.6866 16.7089 17.7469 17.9976 16.287C19.2863 14.8271 19.9982 12.9473 20 11Z"
              fill="#E9203B"
            />
          </Svg>
          <Text style={{ fontSize: 16, fontWeight: '400', marginLeft: 8 }}>
            {recordingDuration.minutes > 0 && recordingDuration.minutes + ':'}
            {recordingDuration.seconds}:{recordingDuration.milliseconds}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <Text
            style={{
              marginRight: 2,
            }}
          >
            Slide to cancle
          </Text>
          <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M18.9997 10.5001H10.2067L12.6457 8.06113C12.9271 7.77986 13.0852 7.39834 13.0853 7.00048C13.0854 6.60262 12.9275 6.22102 12.6462 5.93963C12.365 5.65823 11.9834 5.50009 11.5856 5.5C11.1877 5.49991 10.8061 5.65786 10.5247 5.93913L6.93871 9.52513C6.28348 10.1822 5.91553 11.0722 5.91553 12.0001C5.91553 12.928 6.28348 13.8181 6.93871 14.4751L10.5247 18.0611C10.8061 18.3424 11.1877 18.5003 11.5856 18.5003C11.9834 18.5002 12.365 18.342 12.6462 18.0606C12.9275 17.7792 13.0854 17.3976 13.0853 16.9998C13.0852 16.6019 12.9271 16.2204 12.6457 15.9391L10.2067 13.5001H18.9997C19.3975 13.5001 19.7791 13.3421 20.0604 13.0608C20.3417 12.7795 20.4997 12.398 20.4997 12.0001C20.4997 11.6023 20.3417 11.2208 20.0604 10.9395C19.7791 10.6582 19.3975 10.5001 18.9997 10.5001Z"
              fill="#9CA2AB"
            />
          </Svg>
        </View>

        {/* <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      /> */}
      </View>
    </Swipeable>
  )
}
