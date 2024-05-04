import { Text, StyleSheet } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
const CText = ({ children, button, style, numberOfLines }) => {
  let textStyles = [s.default, s.defaultText]

  if (button) { textStyles.push(g.button) }

  return <Text numberOfLines={numberOfLines} style={[textStyles, style]}>{children}</Text>
}

const s = StyleSheet.create({
  default: {
    fontFamily: 'inter-medium',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultText: {
    color: colors.PRIM_BG,
  },
  blueText: {
    color: colors.NORMAL,
  },
})

export default CText
