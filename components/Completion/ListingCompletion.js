import React, { memo, useEffect, useState } from 'react'
import { LogBox, StyleSheet, Text, View } from 'react-native'
import Slider from 'react-native-slider'
import { FilterColors } from '../../assets/constants/filters'


const ListingCompletion = ({ from, status, progressData, type, id, style = null }) => {
  // //console.log(from)
  let completion = progressData?.completion ? +progressData.completion : 0
  let canComplete = progressData?.is_can_completion;
  const [sliderValue, setSliderValue] = useState(completion)
  // const [canCompletion, setCanCompletion] = useState(canComplete)

  // useEffect(() => {
  //   setSliderValue(completion)
  //   setCanCompletion(canComplete)
  //   //  setFromData(from)
  // }, [completion, canComplete])

  useEffect(() => {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
  }, [])

  // Animated.spring(0, {toValue: sliderValue}).start();
  // const updateCompletionValue = (value) => {
  //   setSliderValue(value)
  //   let body = {
  //     completion: value
  //   }
  //   if (type === "issue") {
  //     api.completion.updateIssueCompletion(body, id)
  //       .then((res) => {
  //         // //console.log(res,'res..................')
  //         Alert.alert(res.message)
  //       }).catch((err) => {
  //         //console.log(err, 'error..............')
  //       })
  //   } else if (type === "task") {
  //     api.completion.updateTaskCompletion(body, id)
  //       .then((res) => {
  //         // //console.log(res,'res..................')
  //         Alert.alert(res.message)
  //       }).catch((err) => {
  //         //console.log(err, 'error..............')
  //       })
  //   }
  // }
  /* useEffect(() => {
    let body = {type:type}
    const getCompletionProgress = async () => {
      api.completion
        .getCompletionPercentage(body,id)
        .then((res) => {
          if (res.success) {
            //console.log(res,"=======================")
            setCanCompletion(res.data.is_can_completion)
            setSliderValue(res.data.completion)
          }
        })
        .catch((err) => {
            // //console.log(err.response,'err...................')
        })
    }
    if(type && id){
        getCompletionProgress()
    }
  }, [refetch]) */

  return (
    <View style={[s.cardRowBetween, from === 'listing' && { paddingLeft: 10 }]}>
      <View style={s.sliderContainer}>
        <Slider
          value={sliderValue}
          // onValueChange={(value) => {
          //   if(from !== 'listing'){
          //     setSliderValue(value)
          //   }
          // }}
          thumbTintColor={ ""}
          thumbTintSize={0}
          maximumTrackTintColor={sliderValue === 100 ? (status && FilterColors[status].color) : "#D6E2FF"}
          minimumTrackTintColor={sliderValue > 0 ? (status && FilterColors[status].color) : "#D6E2FF"}
          disabled={true}
          trackStyle={{ height: 6, borderRadius: 10 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          // onSlidingComplete={(value) => updateCompletionValue(value)}
          animateTransitions={true}
          animationType={"spring"}
          style={style}
        />
      </View>
      <Text style={s.cardProgressText}>{`${Math.floor(sliderValue)}%`}</Text>
    </View>
  )
}

export default memo(ListingCompletion)

const s = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
    // backgroundColor: '#D6E2FF',

  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // backgroundColor:"yellow"
  },
  cardProgressText: {
    marginLeft: 10,
  },
})
