import { Pressable, StyleSheet, Platform } from 'react-native'
const CCard = ({ children, style, onPress }) => {
  return (
    <Pressable onPress={onPress} style={[s.container, style]}>
      {children}
    </Pressable>
  )
}

const s = StyleSheet.create({
  container: {
    borderRadius: 10,
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#727896',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 4,
  },
})

export default CCard
