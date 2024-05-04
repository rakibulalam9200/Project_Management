import { Animated, Pressable, View, StyleSheet, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import colors from '../../assets/constants/colors'
import useAnimateBackground from '../../hooks/useAnimateBackground'
import g from '../../assets/styles/global'
const IconWrap = ({
  children,
  onPressIn,
  onPressOut,
  onLongPress,
  onPress,
  outputRange = [colors.START_BG, colors.MID_BG, colors.END_BG],
  borderRadius = 28,
  style,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return setIsMounted(false)
  }, [])
  const { onAnimatedPressIn, onAnimatedLongPress, onAnimatedPressOut, backgroundColor } =
    useAnimateBackground({
      outputRange,
      isMounted,
    })

  const lPressIn = () => {
    onPressIn && onPressIn()
    onAnimatedPressIn()
  }

  const lPressOut = () => {
    onPressOut && onPressOut()
    onAnimatedPressOut()
  }

  const lLongPress = () => {
    onLongPress && onLongPress()

    onAnimatedLongPress()
  }

  return (
    <Animated.View style={[s.container, { backgroundColor, borderRadius }, style]}>
      <TouchableOpacity
        style={g.container}
        onPressIn={lPressIn}
        onPress={onPress}
        onPressOut={lPressOut}
        onLongPress={lLongPress}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    // backgroundColor: 'green',
  },
})

export default IconWrap
