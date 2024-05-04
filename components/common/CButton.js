import { useEffect, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet } from 'react-native'
import colors from '../../assets/constants/colors'
import useAnimateBackground from '../../hooks/useAnimateBackground'
const CButton = ({
  children,
  type,
  style,
  onPressIn,
  onPressOut,
  onLongPress,
  onPress,
  loading,
  loadingColor,
  isClickedOne = false
}) => {
  let outputRange = [colors.NORMAL, colors.HOVER, colors.PUSHED]
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])
  if (type === 'white') {
    outputRange = [colors.START_BG, colors.MID_BG, colors.END_BG]
  } else if (type === 'gray') {
    outputRange = [colors.GREY, colors.MID_BG, colors.END_BG]
  }
  const { onAnimatedPressIn, onAnimatedLongPress, onAnimatedPressOut, backgroundColor } =
    useAnimateBackground({
      outputRange,
      isMounted,
    })

  const lPressIn = () => {
    onAnimatedPressIn()
    onPressIn && onPressIn()
  }

  const lPressOut = () => {
    onAnimatedPressOut()
    onPressOut && onPressOut()
  }

  const lLongPress = () => {
    onAnimatedLongPress()
    onLongPress && onLongPress()
  }

  const buttonStyles = [s.button, s.default, style]

  if (type === 'white') {
    buttonStyles.push(s.white)
  } else if (type === 'empty') {
    buttonStyles.push(s.empty)
  }

  // buttonStyles.push({ backgroundColor })

  return (
    <Animated.View style={[buttonStyles]}>
      <Pressable
        disabled={loading || isClickedOne}
        style={[s.pressable]}
        onPressIn={!loading ? lPressIn : null}
        onPress={!loading ? onPress : null}
        onPressOut={!loading ? lPressOut : null}
        onLongPress={!loading ? lLongPress : null}
      >
        {loading ? <ActivityIndicator size={'small'} color={loadingColor} /> : children}
      </Pressable>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    // height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pressable: {
    width: '100%',
    height: 50,
    // height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  default: {
    backgroundColor: colors.NORMAL,
  },
  white: {
    backgroundColor: colors.SIGN_IN_BTN_BG,
  },
  empty: {
    borderWidth: 2,
    borderColor: colors.PRIM_BG,
    backgroundColor: colors.NORMAL,
  },
})

export default CButton
