import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import Slider from 'react-native-slider'
import api from '../../api/api'
import { FilterColors } from '../../assets/constants/filters'


const Completion = ({type,id,status,refetch}) => {
  const [sliderValue, setSliderValue] = useState(0)
  const [canCompletion,setCanCompletion] = useState(false)
  useEffect(() => {
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
  }, [refetch])

  const updateCompletionValue = (value) =>{
    setSliderValue(value)
    let body = {
      completion:value
    }
    if(type === "issue"){
      api.completion.updateIssueCompletion(body,id)
      .then((res)=>{
        Alert.alert(res.message)
        //console.log(res,'res..................')
      }).catch((err)=>{
        //console.log(err,'error..............')
      })
    }else if(type === "task"){
      //console.log("hit here...........")
      api.completion.updateTaskCompletion(body,id)
      .then((res)=>{
        //console.log(res,'res..................')
        Alert.alert(res.message)
      }).catch((err)=>{
        //console.log(err,'error..............')
      })
    }
}

  return (
    <View style={s.cardRowBetween}>
      <View style={s.sliderContainer}>
        <Slider
          value={sliderValue}
          onValueChange={(value) => setSliderValue(value)}
          thumbTintColor={canCompletion ? "white" :""}
          thumbTintSize={16}
          maximumTrackTintColor={sliderValue === 100 ? (status && FilterColors[status].color) :"#D6E2FF"}
          minimumTrackTintColor={sliderValue > 0 ? (status && FilterColors[status].color) : "#D6E2FF"}
          disabled={!canCompletion}
          trackStyle={{height:6,borderRadius:10}}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onSlidingComplete={(value)=>updateCompletionValue(value)}
        />
      </View>
      <Text style={s.cardProgressText}>{`${Math.floor(sliderValue)}%`}</Text>
    </View>
  )
}

export default Completion

const s = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
  },
  cardProgressText: {
    marginLeft: 10,
  },
})
