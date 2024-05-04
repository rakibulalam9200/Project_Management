import React, { useState } from 'react'
import { View, StyleSheet, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native'
import colors from '../../assets/constants/colors'
import api from '../../api/api'
import { getErrorMessage } from '../../utils/Errors'
import CheckICon from '../../assets/svg/checkwhite.svg'

const MFAAcceptedModal = ({
  visibility,
  setVisibility,
  onPressOk,
  enabled = true
}) => {

  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  return (

    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[styles.modalOuterContainer]}>

        <View style={[styles.form]}>
          <View style={[styles.CheckICon]}>
            <CheckICon />
          </View>
          <Text style={[styles.heading]}>Accepted </Text>
          <Text style={[styles.subHeading]}>Multifactor authentication verification
            is now {enabled ? 'enabled' : 'disabled'} on your Account</Text>
          <TouchableOpacity
            onPress={onPressOk}
            style={[styles.button]}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.WHITE }}>OK</Text>
          </TouchableOpacity>

        </View>

      </View>
    </Modal>

  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(1, 7, 20, 0.72)',
    flex: 1,
    paddingVertical: 151,
  },

  form: {
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    paddingHorizontal: 30,
    paddingVertical: 40,
    borderRadius: 20,
  },
  CheckICon: {
    backgroundColor: '#1DAF2B',
    padding: 20,
    borderRadius: 100,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  subHeading: {

    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.SECONDARY,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '70%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headingText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  subHeadingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 16,
  },

})

export default MFAAcceptedModal
