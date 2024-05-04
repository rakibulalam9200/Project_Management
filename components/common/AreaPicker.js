import { View, Pressable, StyleSheet } from 'react-native'
import colors from '../../assets/constants/colors'
const AreaPicker = ({ children, value = 0, setValue, disabled, style }) => {
  const toggleValue = () => {
    if (!disabled) setValue()
  }
  return (
    <View style={[s.container, style]}>
      {children}
      <Pressable
        onPress={toggleValue}
        style={[s.dotArea, disabled ? { borderColor: colors.PRIM_CAPTION } : {}]}>
        <View
          style={[
            s.dot,
            { opacity: +value },
            disabled ? { backgroundColor: colors.PRIM_CAPTION } : {},
          ]}
        />
      </Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.PRIM_BG,
    borderRadius: 10,
  },
  dotArea: {
    marginLeft: 20,
    borderRadius: 50,
    borderWidth: 2.5,
    width: 27,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.NORMAL,
  },
  dot: {
    width: 13.5,
    height: 13.5,
    backgroundColor: colors.NORMAL,
    borderRadius: 50,
  },
})

export default AreaPicker
