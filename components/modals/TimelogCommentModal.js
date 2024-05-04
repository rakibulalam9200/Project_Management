import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, StyleSheet, Text, TextInput, View } from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { getErrorMessage } from '../../utils/Errors'
import CButton from '../common/CButton'
import CText from '../common/CText'

export default function TimelogCommentModal({
  children,
  visibility,
  setVisibility,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)



  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <KeyboardAvoidingView behavior="position" enabled style={{ marginHorizontal: 16 }}>
          <View style={s.modalContainer}>
            <Text
              style={[{ textAlign: 'center', color: '#000E29', paddingVertical: 8 }, g.titleText2]}
            >
              Decline
            </Text>
            <Text style={{ color: colors.LIGHT_GRAY }}>Reason</Text>
            <TextInput
              style={s.inputStyle}
              spaces={false}
              maxLength={2000}
              placeholder=""
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.HEADER_TEXT}
              value={comment}
              onChangeText={setComment}
              height={70}
            />
            {/* <CInputWithLabel
              value={comment}
              setValue={setComment}
              placeholder=""
              label="Add comment"
              style={{ backgroundColor: 'white', height: 60 }}
            /> */}
            <View style={[s.listItemContainer, { width: '100%', marginVertical: 10 }]}>
              <CButton
                type="gray"
                style={[s.margin1x, s.grayButton]}
                onPress={() => {
                  setComment('')
                  closeModal()
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[s.margin1x, s.blueButton]}
                onPress={{}}
                // onPress={declineModule}
                loading={loading}
                loadingColor={colors.WHITE}
              >
                <CText style={g.title3}>Send</CText>
              </CButton>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  headerContainerStyle: {
    marginVertical: 16,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: 'normal',
    marginLeft: 8,
  },
  settingsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
    paddingVertical: 8,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  margin1x: {
    marginVertical: 10,
  },
  margin2x: {
    marginVertical: 10,
  },
  grayButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  blueButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
  inputStyle: {
    backgroundColor: colors.WHITE,
    color: colors.NORMAL,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    padding: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
})
