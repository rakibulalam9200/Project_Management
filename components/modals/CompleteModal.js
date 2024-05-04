import React, { useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { getErrorMessage } from '../../utils/Errors'
import CButton from '../common/CButton'
import CInputWithLabel from '../common/CInputWithLabel'
import CText from '../common/CText'

const windowHeight = Dimensions.get('window').height
//console.log(windowHeight, 'window height...')

export default function CompleteModal({
  children,
  visibility,
  setVisibility,
  taskId,
  moduleName,
  navigation,
  navigationName,
  setRefresh,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const completeModule = async () => {
    // if(workingHours?.length) return

    setLoading(true)
    let body = {
      type: moduleName,
      remarks: note,
    }

    api.workingHour
      .completeHour(body, taskId)
      .then((res) => {
        if (res.success) {
          //console.log(res, '#########################')
          closeModal()
          setRefresh((prev) => !prev)
          setNote('')
          // navigation.navigate(navigationName, { refetch: Math.random() })
          // setStatus(status)
          // Alert.alert(res.message)
        }
      })
      .catch((err) => {
        //console.log(err, 'error...........')
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Modal
      transparent
      visible={visibility}
      animationType="fade"
      onRequestClose={closeModal}
      avoidKeyboard
    >
      <View style={[s.modalOuterContainer]}>
        <KeyboardAvoidingView
          behavior="position"
          enabled
          // style={[renderKeyboardAvoidingViewStyle()]}
        >
          <View style={s.modalContainer}>
            <Text
              style={[{ textAlign: 'center', color: '#000E29', paddingVertical: 8 }, g.titleText2]}
            >
              Complete
            </Text>
            <Text style={[s.inputHeader]}>{'Note'}</Text>
            <TextInput
              style={s.inputStyle}
              spaces={false}
              maxLength={2000}
              placeholder=""
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.HEADER_TEXT}
              value={note}
              onChangeText={setNote}
              height={100}
            />
            <View style={[s.listItemContainer, { width: '100%', marginVertical: 8 }]}>
              <CButton
                type="gray"
                style={[s.margin1x, s.grayButton]}
                onPress={() => {
                  closeModal()
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[s.margin1x, s.blueButton]}
                onPress={completeModule}
                loading={loading}
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalContainer: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    // marginHorizontal: 16,
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
  inputHeader: {
    fontSize: 14,
    color: colors.HEADER_TEXT,
    marginRight: 2,
    marginBottom: 4,
  },
})
