import React from 'react'
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DragDropIcon from '../../assets/svg/drag-drop.svg'
import ReOrderIcon from '../../assets/svg/re-oderIcon.svg'
const CustomizationOptionModal = ({
  openCustomizationModal,
  setOpenCustomizationModal,
  dragable,
  setDragable
   }) => {
  const closeCustomizationModal = () => {
    setOpenCustomizationModal(false)
  }
  return (
    <SafeAreaView>
      <Modal
        visible={openCustomizationModal}
        // animationType={'slide'}
        transparent={true}
        onRequestClose={closeCustomizationModal}
      >
        <TouchableWithoutFeedback onPress={closeCustomizationModal}>
          <View style={[styles.modal]} >
            <View style={[styles.modalContent]}>
              <View style={styles.topbar}></View>
              <TouchableOpacity style={styles.reOrderContainer} onPress={() => {
                closeCustomizationModal()
                // setShowEditTabbarModal(true)
              }}>
                {/* <Text style={[g.body1]}>Reorder</Text> */}
                {/* <Text style={[g.body1]}></Text> */}
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection:'row',marginBottom:8}} onPress={()=>{
                setDragable('reorder')
                closeCustomizationModal()
              }}>
                  <ReOrderIcon/>
                  <Text style={[g.body1,{marginLeft:8}]}>Reorder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flexDirection:'row',marginTop:8,marginBottom:24}} onPress={()=>{
                setDragable('drag')
                closeCustomizationModal()
              }}>
                  <DragDropIcon/>
                  <Text style={[g.body1,{marginLeft:8}]}>Drag & Drop</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    height: '100%',
    flex: 1,
    backgroundColor: '#010714B8',
    // backgroundColor: 'red',
    marginBottom: 56,
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
  },

  texts: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  border: {
    borderColor: '#FFFFFF',
    borderTopWidth: 1,
  },
  modal2: {
    width: '100%',
    justifyContent: 'flex-end',
    height: '100%',

    flex: 1,
    backgroundColor: '#010714B8',
  },
  modalContent2: {
    backgroundColor: colors.WHITE,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    bottom: 56,
  },
  reOrderContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  topbar: {
    borderTopColor: colors.LIGHT_GRAY,
    borderTopWidth: 5,
    width: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 1,
  },
})

export default CustomizationOptionModal
