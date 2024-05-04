import React, { memo, useEffect, useState } from 'react'
import { Alert, LogBox, StyleSheet, Text, View } from 'react-native'
import Slider from 'react-native-slider'
import api from '../../api/api'
import { FilterColors } from '../../assets/constants/filters'

const DetailsCompletion = ({ from, status, progressData, type, id, style = null,updateIssueWorking,updateTaskWorking,setRefresh }) => {
  let completion = progressData?.completion ? +progressData.completion : 0
  let canComplete = progressData?.is_can_completion

  // //console.log(completion,canComplete,'...completion... cancomplete...')

  // //console.log(canComplete,completion,'is can complete, completion')
  const [sliderValue, setSliderValue] = useState(completion)
  const [canCompletion, setCanCompletion] = useState(canComplete)

  useEffect(() => {
    setSliderValue(completion)
    setCanCompletion(canComplete)
  }, [completion, canComplete])

  useEffect(() => {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`'])
  }, [])

  // Animated.spring(0, {toValue: sliderValue}).start();
  const updateCompletionValue = (value) => {
    setSliderValue(value)
    //console.log(value,sliderValue,'value...slider value...')
    let body = {
      completion: value,
    }
    if (type === 'issue') {
      api.completion
        .updateIssueCompletion(body, id)
        .then((res) => {
          setRefresh(pre=> !pre)
          Alert.alert(res.message)
        })
        .catch((err) => {
          //console.log(err, 'error..............')
        })
        if (value > 0) {
          updateIssueWorking('In Progress')
        }
        
        
    } else if (type === 'task') {
      if (value > 0) {
        updateTaskWorking('In Progress')
      }
      api.completion
        .updateTaskCompletion(body, id)
        .then((res) => {
          setRefresh(pre=> !pre)
          //console.log(res,'res......................')
          Alert.alert(res.message)
        })
        .catch((err) => {
          //console.log(err, 'error..............')
        })
      
    }
  }

  return (
    <View style={[s.cardRowBetween, style]}>
      <View style={s.sliderContainer}>
        <Slider
          value={sliderValue}
          onValueChange={(value) => setSliderValue(value)}
          thumbTintColor={canCompletion ? 'white' : ''}
          thumbTintSize={canCompletion ? 18 : 0}
          maximumTrackTintColor={
            sliderValue === 100 ? status && FilterColors[status].color : '#D6E2FF'
          }
          minimumTrackTintColor={sliderValue > 0 ? status && FilterColors[status].color : '#D6E2FF'}
          disabled={from === 'listing' ? true : canCompletion ? false : true}
          trackStyle={{ height: 6, borderRadius: 10 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onSlidingComplete={(value) => updateCompletionValue(value)}
          animateTransitions={true}
          animationType={'spring'}
          style={style}
        />
      </View>
      <Text style={s.cardProgressText}>{`${Math.floor(sliderValue)}%`}</Text>
    </View>
  )
}

export default memo(DetailsCompletion)

const s = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // backgroundColor:"yellow"
  },
  cardProgressText: {
    width:40,
    textAlign:'right'
  },
})
