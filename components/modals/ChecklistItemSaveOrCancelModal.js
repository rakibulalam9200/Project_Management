import React from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import { useSelector } from 'react-redux'

const ChecklistItemSaveOrCancelModal = ({
  openModal,
  setOpenModal,
  onSave = null,
  onSaveAndCreateNew = null,
  onCancel = null,
  loading = false,
  setLoading,
}) => {
  const closeModal = () => {
    setOpenModal(false)
  }

  const { tabbarHeight } = useSelector((state) => state.tab)
  return (
    <>
      <Modal
        visible={openModal}
        animationType={'fade'}
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={[
            styles.modal,
            // Platform.OS === 'ios' ? { marginBottom: tabbarHeight } : { marginBottom: 56 },
          ]}
          onPress={closeModal}
        >
          <View style={[styles.modalContent]}>
            <View style={styles.containerBetween}>
              <Pressable onPress={onSave} disabled={loading}>
                <Text style={[styles.texts]}>Save</Text>
              </Pressable>
            </View>
            <View style={styles.containerBetween}>
              <Pressable onPress={onSaveAndCreateNew} disabled={loading}>
                <Text style={[styles.texts, styles.border]}>Save and create new</Text>
              </Pressable>
            </View>

            <View style={[styles.containerBetween, { borderBottomWidth: 0 }]}>
              <Pressable onPress={onCancel} disabled={loading}>
                <Text style={[styles.texts, styles.border]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: '#010714B8',
  },
  modalContent: {
    backgroundColor: colors.START_BG,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 32,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    // bottom: 50,
  },

  texts: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 1,
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
  containerBetween: {
    paddingVertical: 16,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  },
})

export default ChecklistItemSaveOrCancelModal
