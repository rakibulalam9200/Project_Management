import { useState, useRef } from 'react'
import { Animated, Easing } from 'react-native'

const useAnimateBackground = ({ outputRange, isMounted }) => {
  const [isActive, setIsActive] = useState(false)

  const animateState = {
    start: 0,
    middle: 50,
    end: 100,
  }

  const value = useRef(new Animated.Value(animateState.start)).current

  const onAnimatedPressIn = () => {
    Animated.timing(value, {
      toValue: animateState.end,
      useNativeDriver: false,
      duration: 120,
      easing: Easing.ease,
    }).start()
    if (isMounted) setIsActive(!isActive)
  }

  const onAnimatedPressOut = () => {
    Animated.timing(value, {
      toValue: animateState.start,
      useNativeDriver: false,
      duration: 120,
      easing: Easing.ease,
    }).start()
    if (isMounted) setIsActive(!isActive)
  }

  const onAnimatedLongPress = () => {
    Animated.timing(value, {
      toValue: animateState.middle,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.ease,
    }).start()
  }

  const inputRange = Object.values(animateState)
  const backgroundColor = value.interpolate({
    inputRange,
    outputRange,
  })

  return { backgroundColor, onAnimatedPressIn, onAnimatedLongPress, onAnimatedPressOut }
}

export default useAnimateBackground
