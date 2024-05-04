import { StyleSheet, Modal, TouchableOpacity, Pressable, KeyboardAvoidingView, Keyboard } from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

const CModal = ({
  children,
  visibility,
  setVisibility,
  onRequestClose,
  bgStyle,
  wrapStyle,
  onLayout,
  keyboardAvoid,
}) => {
  return (
    <KeyboardAvoidingView>
      <Modal
        onRequestClose={onRequestClose}
        animationType="fade"
        statusBarTranslucent={true}
        transparent={true}
        visible={visibility}>
        <TouchableOpacity
          style={[g.container, s.modalBG, bgStyle]}
          activeOpacity={1}
          onPress={() => setVisibility(false)}>
          {keyboardAvoid
            ? <KeyboardAvoidingView behavior="position" >
              <Pressable onLayout={onLayout} onPress={Keyboard.dismiss} style={[s.modalWrap, wrapStyle]}>
                {children}
              </Pressable>
            </KeyboardAvoidingView>
            : <Pressable onLayout={onLayout} onPress={Keyboard.dismiss} style={[s.modalWrap, wrapStyle]}>
              {children}
            </Pressable>
          }
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  )
}

export default CModal

const s = StyleSheet.create({
  modalBG: {
    backgroundColor: '#010714B8',
    pointerEvents: 'none',
  },
  modalWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
