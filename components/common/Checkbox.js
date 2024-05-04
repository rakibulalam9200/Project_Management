import { View, Pressable, StyleSheet } from 'react-native'
import colors from '../../assets/constants/colors'

const Checkbox = ({ children, disabled, value, setValue, activeColor, label = '', style }) => {
  const toggleValue = () => {
    if (!disabled) setValue(pV => !pV)
  }
  return (
    <Pressable onPress={toggleValue} style={[s.container, style]}>
      <View style={s.dotAreaContainer}>
        <View style={[s.dotArea, { borderColor: disabled ? colors.PRIM_CAPTION : activeColor }]}>
          <View
            style={[
              s.dot,
              { opacity: +value },
              { backgroundColor: disabled ? colors.PRIM_CAPTION : activeColor },
            ]}
          />
        </View>
      </View>

      {children}
    </Pressable>
  )
}
const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotArea: {
    borderRadius: 50,
    borderWidth: 2,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.NORMAL,
  },
  dotAreaContainer: { padding: 2 },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: colors.NORMAL,
    borderRadius: 50,
  },
})
export default Checkbox
