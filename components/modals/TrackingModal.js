import React from 'react'
import { Alert, Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import MoreIcon from '../../assets/svg/more.svg'
import PauseIcon from '../../assets/svg/pause-icon.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import StopIcon from '../../assets/svg/stop.svg'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'
// import api from '../../api/api'

export default function TrackingModal({
  visibility,
  setVisibility,
  id,
  type,
  setRefresh,
  timeTracker,
  setTimeTracker,
  detailsInfo,
  navigation,
}) {
  const closeModal = () => {
    setVisibility(false)
  }
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  const pauseTimeTracking = async () => {
    let body = {
      type: type,
    }
    api.timeTracking
      .timeTrackingPause(body, id)
      .then((res) => {
        if (res.success) {
          closeModal()
          setRefresh((prev) => !prev)
        }
      })
      .catch((err) => {
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
    let body = {
      type: type,
    }

    api.timeTracking
      .timeTrackingStop(body, id)
      .then((res) => {
        if (res.success) {
          // //console.log(res,'---0000000-------------')
          navigation.navigate('TimelogAdd', {
            timeTracking: res.time_tracking,
            detailsInfo: { detailsInfo },
          })
          closeModal()
          setRefresh((prev) => !prev)
        }
      })
      .catch((err) => {
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

  return (
    <SafeAreaView>
      <Modal
        transparent={true}
        visible={visibility}
        animationType={'fade'}
        onRequestClose={closeModal}
      >
        <View style={[s.modal]}>
          <View style={[s.modalContent]}>
            <View style={[s.headerContainer, { paddingHorizontal: 16 }]}>
              <TouchableOpacity
                onPress={
                  () => {}
                  // () => setVisibility(false)
                  // navigation.goBack()
                }
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>Timer</CText>
              <View style={s.buttonGroup}>
                <TouchableOpacity onPress={() => {}} style={s.buttonGroupBtn}>
                  <MoreIcon fill={colors.NORMAL} />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <CText style={[g.title3, s.textColor]}>Time Tracking</CText>
              {timeTracker?.stage === 'work_start' && (
                <TouchableOpacity style={[s.buttonItemContainer]} onPress={pauseTimeTracking}>
                  <TouchableOpacity>
                    <PauseIcon />
                  </TouchableOpacity>
                  <CText style={[g.body1, s.textColor]}>Pause</CText>
                </TouchableOpacity>
              )}
              {timeTracker?.stage === 'work_pause' && (
                <TouchableOpacity style={[s.buttonItemContainer]} onPress={() => {}}>
                  <IconWrap outputRange={iconWrapColors}>
                    <ClockIcon />
                  </IconWrap>
                  <CText style={[g.body1, s.textColor]}>Resume</CText>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.buttonItemContainer]} onPress={stopTimeTracking}>
                <IconWrap outputRange={iconWrapColors}>
                  <StopIcon />
                </IconWrap>
                <CText style={[g.body1, s.textColor]}>Stop</CText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* <TouchableOpacity style={[s.modalOuterContainer]} onPress={closeModal}>
        <View style={s.modalContainer}>
          <CText style={[g.title3, s.textColor]}>Time Tracking</CText>
          {timeTracker?.stage === 'work_start' && (
            <TouchableOpacity style={[s.buttonItemContainer]} onPress={pauseTimeTracking}>
              <TouchableOpacity>
                <PauseIcon />
              </TouchableOpacity>
              <CText style={[g.body1, s.textColor]}>Pause</CText>
            </TouchableOpacity>
          )}
          {timeTracker?.stage === 'work_pause' && (
            <TouchableOpacity style={[s.buttonItemContainer]} onPress={() => {}}>
              <IconWrap outputRange={iconWrapColors}>
                <ClockIcon />
              </IconWrap>
              <CText style={[g.body1, s.textColor]}>Resume</CText>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.buttonItemContainer]} onPress={stopTimeTracking}>
            <IconWrap outputRange={iconWrapColors}>
              <StopIcon />
            </IconWrap>
            <CText style={[g.body1, s.textColor]}>Stop</CText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity> */}
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0, 0.5)',
  },
  // modalContainer: {
  //   width: '80%',
  //   alignItems: 'stretch',
  //   backgroundColor: colors.CONTAINER_BG,
  //   borderRadius: 20,
  //   padding: 16,
  // },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // height:'500'
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: '#white',
    // backgroundColor: 'red',
    marginBottom: 56,
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    // paddingHorizontal: 20,
    paddingTop: 8,
    flex: 1,
    position: 'relative',
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsItemText: {
    fontFamily: 'inter-regular',
    color: colors.HOME_TEXT,
    fontSize: 18,
  },
  textColor: {
    color: '#000E29',
    textAlign: 'center',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonItemContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'yellow',
  },
})
