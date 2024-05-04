import React from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'
export default function EditChatModal({
  children,
  visibility,
  setVisibility,
  navigation,
  onReOrder,
  documents,
  setDocuments,
  pickDocument,
  editMessage,
  deleteChat,
  editChat
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <TouchableOpacity style={[s.modalOuterContainer]} onPress={closeModal}>
        <Pressable style={{ marginBottom: 8,backgroundColor:'#D6E2FF', marginRight: 20,borderRadius:8,paddingHorizontal:8,paddingVertical:16,marginBottom:16}} onPress={()=>{}}>
          <Text style={[g.initailText,s.textColor]}>{editMessage?.message}</Text>
        </Pressable>
        <View style={s.modalContainer}>
          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={editChat}
          >
            <Text style={s.settingsItemText}>Edit</Text>
            <EditIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.settingsItemContainer]}
            onPress={
              deleteChat
            }
          >
            <Text style={s.settingsItemText}>Delete</Text>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '40%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    marginRight: 20,
    marginTop:16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsItemText: {
    fontFamily: 'inter-medium',
    fontWeight: '500',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  textColor: {
    color: '#000E29',
    textAlign: 'center',
  },
  disabledTextColor:{
    color: 'red',
    textAlign: 'center',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
