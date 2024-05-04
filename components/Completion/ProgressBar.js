import React, { useEffect, useState } from 'react'
import { LogBox, StyleSheet, Text, View } from 'react-native'
import Slider from 'react-native-slider'
import { FilterColors } from '../../assets/constants/filters'


const ProgressBar = ({title,status,progressData,type,id,sliderText,style}) => {
  let completion = progressData?.completion ? +progressData.completion : 0
  let canComplete = progressData?.is_can_completion;
  const [sliderValue, setSliderValue] = useState(completion)
  const [canCompletion,setCanCompletion] = useState(canComplete)

  useEffect(() => {
   setSliderValue(completion)
   setCanCompletion(canComplete)
  }, [completion,canComplete])

  useEffect(() => {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
  }, [])

  

  return (
    <View style={[style]}>
      <View style={s.cardRowBetween}>
        <Text style={[s.titleStyle, title == 'Progress:' ? {marginRight:8} : {marginRight:32} ]}>{title}</Text>
        <View style={s.sliderContainer}>
        <Slider
          value={sliderValue}
          onValueChange={(value) => setSliderValue(value)}
          thumbTintColor={canCompletion ? "white" :""}
          thumbTintSize={0}
          maximumTrackTintColor={sliderValue === 100 ? (status && FilterColors[status].color) :"#D6E2FF"}
          minimumTrackTintColor={sliderValue > 0 ? (status && FilterColors[status].color) : "#D6E2FF"}
          disabled={!canCompletion}
          trackStyle={{height:6,borderRadius:10}}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onSlidingComplete={(value)=>updateCompletionValue(value)}
          animateTransitions={true}
          animationType={"spring"}
        />
      </View>
      <Text style={s.cardProgressText}>{`${Math.floor(sliderValue)}%`}</Text>
    </View>
    <Text style={s.smallText}>{sliderText}</Text>
    </View>
   
  )
}

export default ProgressBar

const s = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    marginLeft: 5,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
    // backgroundColor:"yellow"
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    flex:1,
    // backgroundColor:"green"
  },
  cardProgressText: {
    // marginLeft: 10,
    width:40,
    textAlign:'right'
  },
  titleStyle:{
    // marginRight:10,
    fontWeight:'500',
    fontSize:14,
    // lineHeight:17,
  },
  smallText:{
    position:'absolute',
    bottom:-1,
    left:'20%',
    fontSize:12,
    color:'#000E29',
    lineHeight:14,
    fontWeight:'400',

  }
})
