import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import React from 'react'
import CHeaderWithBack from '../common/CHeaderWithBack'
import colors from '../../assets/constants/colors'

import CButtonInput from '../common/CButtonInput'

export default function SubscriptionConfirmationModal({
  visibility,
  setVisibility,
  firstMessage = 'Your subscription has been changed!',
  message,
  onPressOk,
  proceeding,
  clickHere
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <View style={s.modalContainer}>
          <CHeaderWithBack
            onPress={closeModal}

            labelStyle={s.headerLabel}
            iconWrapColors={iconWrapColors}
            containerStyle={s.headerContainerStyle}
          />

          <View>

            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>

              <Text style={[s.headingText]}>
                {firstMessage}
              </Text>
            </View>

            <View>

              <View style={{}}>
                <Text style={[s.subHeadingText]}>
                  {message.message}
                </Text>
                <Text style={[s.subHeadingText, { marginTop: 5 }]}>
                  If you like to change your default payment method
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    clickHere()
                    //console.log('clicked')
                  }}
                >
                  <Text style={{ color: colors.SECONDARY, textAlign: 'center', textDecorationLine: 'underline', marginBottom: 10, fontWeight: 'bold', }}>Click here.</Text>
                </TouchableOpacity>
              </View>

            </View>

          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
            <CButtonInput label='Cancel' style={{ width: '48%', paddingHorizontal: 0, backgroundColor: colors.LIGHT_GRAY }} textStyle={{ color: colors.WHITE }} onPress={() => closeModal()} />

            <CButtonInput label={`${proceeding ? 'Wait..' : 'Ok'}`} style={{ width: '48%', paddingHorizontal: 0, }} onPress={onPressOk} loading={proceeding} />
          </View>

        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
  },
  headerContainerStyle: {
    marginTop: 16,
  },
  headingText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    width: '70%',

  },
  subHeadingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    marginTop: 16,
  },

})
