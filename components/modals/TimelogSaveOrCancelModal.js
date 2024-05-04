import React from 'react'
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import colors from '../../assets/constants/colors'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'


const SaveOptions = [
  {
    id: 1,
    name: 'Save and submit',
    value: 'Submitted'
  },
  {
    id: 2,
    name: 'Save draft',
    value: 'Draft'
  },
  {
    id: 3,
    name: 'Save and create new',
    value: 'New'
  },
  {
    id: 4,
    name: 'Cancel',
    value: 'Cancel'
  },
]

const TimelogSaveOrCancelModal = ({
  openModal,
  setOpenModal,
  saveOrCancel,
}) => {
  const tabbarHeight = useBottomTabBarHeight()

  const closeModal = () => {
    setOpenModal(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Modal
        visible={openModal}
        animationType={'slide'}
        transparent={true}
        onRequestClose={closeModal}
      >

        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={[styles.modal]}>

            <View style={[styles.modalContent, Platform.OS === "ios" ? { bottom: tabbarHeight } : { bottom: 50 }]}>
              {
                SaveOptions.map((item, index) => (
                  <View key={index} style={{ marginVertical: index > 0 ? 10 : 0 }}>
                    <TouchableOpacity onPress={() => saveOrCancel(item)}>
                      <Text style={[styles.texts, index > 0 && styles.border]}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </View>
          </View>
        </TouchableWithoutFeedback>

      </Modal>
    </View>
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
    // height: 500,
    flex: 1,
    backgroundColor: '#010714B8',
    // backgroundColor: 'red',
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 27,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    bottom: 50,

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
})

export default TimelogSaveOrCancelModal
