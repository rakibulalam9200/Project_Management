import { useNavigation } from '@react-navigation/native'
import React, { memo, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import { getErrorMessage } from '../../utils/Errors'
import TimerCount from '../Timelogs/TimerCount'
import CButton from '../common/CButton'
import CText from '../common/CText'

const StopTimerModal = ({
  children,
  stopTimer,
  selectedTask,
  visibility,
  setVisibility,
  timer,
}) => {
  const navigation = useNavigation()
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
  const [initialTiming, setInitialTiming] = useState(0)
  let stage

  // console.log('stop timer modal rendered check', selectedTask, 'selected task')

  useEffect(() => {
    fetchTimeTracking
  }, [])

  const fetchTimeTracking = async () => {
    // console.log('stop time tracking....', selectedTask?.id)
    if (!selectedTask) {
      return
    }

    api.timeTracking.getCurrentTimeTracking
      .then((res) => {
        if (res.success) {
          console.log(res, 'res...............')
          // stopTimer.current = false;
          // setStopTimer(false)
          // setShowTiming(false)
        }
      })
      .catch((err) => {
        // console.log(err,'----------------')
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        // setLoading(false)
      })
  }

  const stopTimeTracking = async () => {
    // console.log('time trakcing modal............... ', selectedTask)
    if (!selectedTask) {
      return
    }
    let body = {
      type: selectedTask?.state.toLowerCase(),
    }

    body['description'] = comment
    body['stage'] = stage

    if (stage === 'Submitted') {
      setBtnLoading(true)
    } else if (stage === 'Draft') {
      setDraftLoading(true)
    }

    api.timeTracking
      .timeTrackingStop(body, selectedTask?.id)
      .then((res) => {
        if (res.success) {
          console.log(res, 'res...............')
          navigation.navigate('Timelogs', { refetch: Math.random() })
        }
      })
      .catch((err) => {
        console.log(err, 'error.........')
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setBtnLoading(false)
        setDraftLoading(false)
      })
  }

  const closeModal = () => {
    setVisibility(false)
  }

  return (
    <Modal transparent visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <View style={[s.modalOuterContainer]}>
        <KeyboardAvoidingView behavior="position" enabled style={{ marginHorizontal: 16 }}>
          <View style={s.modalContainer}>
            <View style={[s.headerContainer]}>
              <TouchableOpacity onPress={closeModal}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <Text style={[s.stopTimerText]}>Stop Timer</Text>
            </View>
            <View>
              <TimerCount timer={timer} />
              {/* <Text style={[g.titleTextTitle]}>00h:00m:00s</Text> */}
              <Text
                style={[g.body4, { marginVertical: 16, textAlign: 'center', color: '#246BFD' }]}
              >
                {selectedTask?.name}
              </Text>
              <Text style={[g.body1, { width: 340, textAlign: 'center', marginVertical: 8 }]}>
                You are about to stop the timer. Please, select one of the following actions:
              </Text>
            </View>

            <Text style={[g.caption1, { color: '#9CA2AB', marginTop: 8 }]}>Add comment:</Text>
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
              height={100}
            />

            <View style={[s.listItemContainer, { width: '100%', marginVertical: 10 }]}>
              <CButton
                style={[s.margin1x, s.blueButton]}
                onPress={() => {
                  stage = 'Submitted'
                  stopTimeTracking()
                }}
                isClickedOne={draftLoading}
                // onPress={declineModule}
                loading={btnLoading}
                loadingColor={colors.WHITE}
              >
                <CText style={g.title3}>Submit</CText>
              </CButton>
              <CButton
                isClickedOne={btnLoading}
                loading={draftLoading}
                type="gray"
                style={[s.margin1x, s.grayButton]}
                onPress={() => {
                  //   setComment('')
                  stage = 'Draft'
                  stopTimeTracking()
                }}
              >
                <CText style={g.title3}>Save draft</CText>
              </CButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

export default memo(StopTimerModal)

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  modalContainer: {
    alignItems: 'stretch',
    backgroundColor: colors.CONTAINER_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: '92%',
    marginLeft: 16,
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
    marginLeft: 10,
  },
  blueButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
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
  stopTimerText: {
    textAlign: 'center',
    color: '#000E29',
    paddingVertical: 8,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'inter',
    width: '90%',
    // backgroundColor:'green',
  },
  headerContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 8,
  },
})
