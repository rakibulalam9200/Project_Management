import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import colors from '../../assets/constants/colors'
import TeamUserPickerModal from './TeamUserPickerModal'

const TeamAssignModal = ({
  openModal,
  setOpenModal,
  onAddNewMember = null,
  onAssignMember = null,
  onCancel = null,
  teamDetails,
  setRefresh,
}) => {
  const closeModal = () => {
    setOpenModal(false)
  }
  const [showMembersPicker, setShowMembersPicker] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState(teamDetails?.user_members)
  const [teamLead, setTeamLead] = useState(teamDetails?.user_lead ? teamDetails?.user_lead : {})

  useEffect(() => {
    setSelectedMembers(teamDetails?.user_members)
  }, [teamDetails?.user_members])

  useEffect(() => {
    setTeamLead(teamDetails?.user_lead)
  }, [teamDetails?.user_lead])

  return (
    <Modal
      visible={openModal}
      animationType={'fade'}
      transparent={true}
      onRequestClose={closeModal}
    >
      <TeamUserPickerModal
        visUserPickerModal
        visibility={showMembersPicker}
        setVisibility={setShowMembersPicker}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        isMultiplePicker={true}
        closeParentModal={closeModal}
        teamLead={teamLead}
        navigationFrom={'teamAssign'}
        setRefresh={setRefresh}
        id={teamDetails?.id}
        label={'teamAdd'}
      />
      <TouchableOpacity style={[styles.modal]} onPress={closeModal}>
        <View style={[styles.modalContent]}>
          {/* <View>
            <TouchableOpacity
              onPress={() => {
                setShowMembersPicker(true)
                // closeModal()
              }}
            >
              <Text style={[styles.texts]}>Add New Member</Text>
            </TouchableOpacity>
          </View> */}
          <View style={{ marginVertical: 8 }}>
            <TouchableOpacity
              onPress={() => {
                if (onAssignMember) {
                  onAssignMember()
                }
                closeModal()
              }}
            >
              <Text style={[styles.texts, styles.border]}>Assign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
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
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
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

export default TeamAssignModal
