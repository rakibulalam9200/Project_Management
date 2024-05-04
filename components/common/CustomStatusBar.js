import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import TimerIcon from '../../assets/svg/status-timer.svg'
import { getErrorMessage } from '../../utils/Errors'
import { statusBarSecondtoHms } from '../../utils/Timer'

const STATUSBAR_HEIGHT = StatusBar.currentHeight
const { height, width } = Dimensions.get('window')

  console.log('height',height)


const CustomStatusBar = ({ backgroundColor, ...props }) => {
  const [selectedTask,setSelectedTask] = useState(null)
  const [timer, setTimer] = useState(0)
  const [showTiming, setShowTiming] = useState(false)

  useEffect(() => {
    const fetchCurrentTimeTrakcing = () => {
      api.timeTracking
        .getCurrentTimeTracking()
        .then((res) => {
          if (res.success) {
            if(res.data){
              console.log('res.............',res)
              setSelectedTask(res?.data?.working_hourable)
              setTimer(res?.data?.total_time)
              setShowTiming(true)
            }
          }
        })
        .catch((err) => {
          let errorMsg = ''
          try {
            errorMsg = getErrorMessage(err)
          } catch (err) {
            errorMsg = 'An error occured. Please try again later.'
          }
          Alert.alert(errorMsg)
        })
        .finally(() => {})
    }

    fetchCurrentTimeTrakcing()
  }, [])


  useEffect(() => {
    let interval
    if (selectedTask && showTiming) {
      interval = setInterval(() => setTimer((pre) => pre + 1), 1000)
    }
    return () => {
      clearInterval(interval)
    }
  }, [selectedTask, showTiming])

  
  return (
    <View style={[showTiming ? s.timelogStausBar : s.statusBar, { backgroundColor }]}>
      <SafeAreaView style={[{ flex: 1 }, showTiming ?   {backgroundColor: '#1DAF2B'} : {backgroundColor: colors.CONTAINER_BG}]}>
        <StatusBar translucent backgroundColor={showTiming? '#1DAF2B' :backgroundColor} {...props} />  
        {showTiming && <View style={{flex:1,flexDirection:'row',justifyContent:'space-between',alignItems:"center",paddingHorizontal:16}}>
          <Text style={[g.caption1,{color:colors.WHITE}]}>{selectedTask?.name}</Text>
          <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',gap:3}}>
            <Text style={[g.caption1,{color:colors.WHITE}]}>{statusBarSecondtoHms(timer)}</Text>
            <TimerIcon/>
          </View>
        </View>}
      </SafeAreaView>
      
    </View>
  )
}

export default CustomStatusBar

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: Platform.OS ==="ios" ? STATUSBAR_HEIGHT : 0,
    zIndex: 10001,
    // backgroundColor: 'yellow',
  },
  timelogStausBar:{
    height: Platform.OS ==="ios" ? height > 670  ? STATUSBAR_HEIGHT + 80 : STATUSBAR_HEIGHT + 50 : 0,
    zIndex: 10001,
  },
  appBar: {
    backgroundColor: '#79B45D',
    // height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
})
