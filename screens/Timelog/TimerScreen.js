import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import GreenClock from '../../assets/svg/green-clock.svg'
import MoreIcon from '../../assets/svg/more.svg'
import PauseIcon from '../../assets/svg/pause-solid.svg'
import PlayIcon from '../../assets/svg/play-solid.svg'
import PlusIcon from '../../assets/svg/plus-blue-fill.svg'
import RedClock from '../../assets/svg/red-clock.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import StopIcon from '../../assets/svg/stop-solid.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import { getErrorMessage } from '../../utils/Errors'
import { extractDateFormatDots, secondtoHm, secondtoHms } from '../../utils/Timer'

const TimerScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const detailsInfo = route.params ? route.params.detailsInfo : null
  const setShowTiming = route.params ? route.params.setShowTiming : null
  const type = route.params ? route.params.type : null

  // //console.log(setShowTiming,'setShowTiming...')
  const [detailsInformation, setDetailsInformation] = useState(detailsInfo)
  const [refersh, setRefresh] = useState(false)
  const [timer, setTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const pauseTimeTracking = async () => {
    //console.log(type, '.........type.........')
    let body = {
      type: type,
    }
    api.timeTracking
      .timeTrackingPause(body, detailsInfo?.id)
      .then((res) => {
        if (res.success) {
          setRefresh((prev) => !prev)
          if (type === 'task') {
            navigation.navigate('TaskDetails', { refetch: Math.random() })
          } else if (type === 'issue') {
            navigation.navigate('IssueDetails', { refetch: Math.random() })
          } else if (type === 'project') {
            navigation.navigate('ProjectDetails', { refetch: Math.random() })
          }else if (type === 'milestone') {
            navigation.navigate('MilestoneDetails', { refetch: Math.random() })
          }
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

  const stopTimeTracking = async (value) => {
    let body = {
      type: type,
    }

    value === 'Submitted' ? setLoading(true) : setSaveLoading(true)

    api.timeTracking
      .timeTrackingStop(body, detailsInfo?.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, 'response..............')
          // //console.log('----------',res?.time_tracking, '----------')
          // // //console.log(secondtoHm(timer), '0000000000000')

          //  //console.log("((((((((((((((", res?.time_tracking?.start_time, res?.time_tracking?.end_time,"-----------")

          //  let startDate = new Date(res?.time_tracking?.start_time)
          //  let endDate = new Date(res?.time_tracking?.end_time)
          //   //console.log(startDate, 'start date',endDate,"end Date")
          let tbody = {
            start_date: res?.time_tracking?.start_time,
            end_date: res?.time_tracking?.end_time,
            number_of_hour: secondtoHm(timer),
            stage: value,
          }
          if (type === 'project') {
            tbody['project_id'] = detailsInformation?.id
          }
          if (type === 'milestone') {
            tbody['milestone_id'] = detailsInformation?.id
          }
          if (detailsInformation?.project) {
            tbody['project_id'] = detailsInformation?.project?.id
          }
          if (detailsInformation?.milestone) {
            tbody['milestone_id'] = detailsInformation?.milestone?.id
          }
          if (detailsInformation && type === 'task') {
            tbody['task_id'] = detailsInformation?.id
          }
          if (detailsInformation && type === 'issue') {
            if (detailsInformation?.task) {
              tbody['task_id'] = detailsInformation?.task?.id
            }
            tbody['issue_id'] = detailsInformation?.id
          }

          //console.log('t body', tbody)

          api.timelog
            .createTimelog(tbody)
            .then((res) => {
              //console.log('Response', res)
              if (type === 'task') {
                navigation.navigate('TaskDetails', { refetch: Math.random() })
              } else if (type === 'issue') {
                navigation.navigate('IssueDetails', { refetch: Math.random() })
              } else if (type === 'project') {
                navigation.navigate('ProjectDetails', { refetch: Math.random() })
              } else if (type === 'milestone') {
                navigation.navigate('MilestoneDetails', { refetch: Math.random() })
              }

              // setRefresh((prev) => !prev)
            })
            .catch((err) => {
              //console.log('Error', err?.response?.data)
              let errMsg = ''
              try {
                errMsg = getErrorMessage(err)
              } catch (err) {
                errMsg = 'An error occurred. Please try again later'
              }
              Alert.alert(errMsg)
            })
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
        setLoading(false)
        setSaveLoading(false)
      })
  }

  const resumeTimeTracking = async () => {
    let body = {
      type: type,
    }

    api.timeTracking
      .timeTrackingStart(body, detailsInfo?.id)
      .then((res) => {
        if (res.success) {
          //console.log(res, 'resume time....')
          setRefresh((prev) => !prev)
        }
      })
      .catch((err) => {
        // //console.log(err, 'error...........')
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

  useEffect(() => {
    const getDetails = async () => {
      if (!detailsInformation?.id) return
      // setLoading(true)
      if (type === 'task') {
        api.task
          .getTask(detailsInformation?.id)
          .then((res) => {
            if (res.success) {
              //console.log(res.task, 'details information....')
              setDetailsInformation(res.task)
              setTimer(res?.task?.time_tracking?.total_time)
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
            let errorMsg = ''
            try {
              errorMsg = getErrorMessage(err)
            } catch (err) {
              errorMsg = 'An error occured. Please try again later.'
            }
            Alert.alert(errorMsg)
          })
          .finally(() => {})
      } else if (type === 'issue') {
        api.issue
          .getIssue(detailsInformation?.id)
          .then((res) => {
            if (res.success) {
              //console.log(res.issue, 'details information....')
              setDetailsInformation(res.issue)
              setTimer(res?.issue?.time_tracking?.total_time)
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
            let errorMsg = ''
            try {
              errorMsg = getErrorMessage(err)
            } catch (err) {
              errorMsg = 'An error occured. Please try again later.'
            }
            Alert.alert(errorMsg)
          })
          .finally(() => {})
      } else if (type === 'project') {
        api.project
          .getProject(detailsInformation?.id)
          .then((res) => {
            if (res.success) {
              //console.log(res.project, 'details information....')
              setDetailsInformation(res.project)
              setTimer(res?.project?.time_tracking?.total_time)
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
            let errorMsg = ''
            try {
              errorMsg = getErrorMessage(err)
            } catch (err) {
              errorMsg = 'An error occured. Please try again later.'
            }
            Alert.alert(errorMsg)
          })
          .finally(() => {})
      } else if (type === 'milestone') {
        api.milestone
          .getMilestone(detailsInformation?.id)
          .then((res) => {
            if (res.success) {
              //console.log(res.milestone, 'details information....')
              setDetailsInformation(res.milestone)
              setTimer(res?.milestone?.time_tracking?.total_time)
            }
          })
          .catch((err) => {
            //console.log(err.response.data)
            let errorMsg = ''
            try {
              errorMsg = getErrorMessage(err)
            } catch (err) {
              errorMsg = 'An error occured. Please try again later.'
            }
            Alert.alert(errorMsg)
          })
          .finally(() => {})
      }
    }
    if (detailsInformation?.id) getDetails()
  }, [detailsInformation?.id, refersh])

  useEffect(() => {
    let interval
    if (detailsInformation?.time_tracking?.stage === 'work_start') {
      interval = setInterval(() => setTimer((pre) => pre + 1), 1000)
    }
    return () => {
      clearInterval(interval)
    }
  }, [detailsInformation?.time_tracking?.stage])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.PRIM_BG, marginBottom: 50 }}>
      <View style={{ flex: 5, paddingHorizontal: 16 }}>
        {/* Heading with icons */}
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              setShowTiming(true)
              if (type === 'task') {
                navigation.navigate('TaskDetails', { refetch: Math.random() })
              } else if (type === 'issue') {
                navigation.navigate('IssueDetails', { refetch: Math.random() })
              } else if (type === 'project') {
                navigation.navigate('ProjectDetails', { refetch: Math.random() })
              } else if (type === 'milestone') {
                navigation.navigate('MilestoneDetails', { refetch: Math.random() })
              }
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.title3, s.textColor]}>Timer</CText>
          <View style={s.buttonGroup}>
            <TouchableOpacity onPress={() => {}} style={s.buttonGroupBtn}>
              <MoreIcon fill={colors.NORMAL} />
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => {
                navigation.navigate('TimelogEdit', { id: route.params.id })
              }}
              style={s.buttonGroupBtn}
            >
              <EditIcon fill={colors.NORMAL} />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={s.clockContainer}>
          {detailsInformation?.time_tracking?.stage === 'work_start' ? (
            <RedClock />
          ) : (
            <GreenClock />
          )}
        </View>
        <View style={{ paddingVertical: 16 }}>
          <CText style={[g.titleTextTitle, { color: colors.HEADING }]}>{secondtoHms(timer)}</CText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16 }}>
          <IconWrap onPress={() => {}} outputRange={iconWrapColors}>
            <CalendarIcon fill={colors.NORMAL} />
          </IconWrap>
          <CText style={s.normalText}>{extractDateFormatDots(new Date())}</CText>
        </View>

        <CText style={[s.body1, { color: colors.HEADING }]}>
          {type === 'task'
            ? `${detailsInfo?.project?.name} / ${
                detailsInfo?.milestone ? detailsInfo?.milestone?.name + ' / ' : ''
              }${detailsInfo?.name} `
            : type === 'issue'
            ? `${detailsInfo?.project?.name + ' / '}${
                detailsInfo?.milestone ? detailsInfo?.milestone?.name + ' / ' : ''
              }${detailsInfo?.task ? detailsInfo?.task?.name + ' / ' : ''}${detailsInfo?.name} `
            : type === 'project'
            ? `${detailsInfo?.name}`
            : type === 'milestone'
            ? `${detailsInfo?.project?.name} / ${detailsInfo?.name} `
            : ''}
        </CText>

        <View
          style={[{ flex: 1, flexDirection: 'row', alignSelf: 'flex-end', paddingVertical: 16 }]}
        >
          <PlusIcon />
          <CText style={[s.body1, { color: colors.HEADING, marginLeft: 8 }]}>Note</CText>
        </View>

        {/* Heading with icons */}
      </View>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 16,
          marginBottom: 16,
          justifyContent: 'flex-end',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Pressable
            disabled={loading || saveLoading}
            onPress={() => stopTimeTracking('Submitted')}
            style={[
              s.button,
              detailsInformation?.time_tracking?.stage === 'work_start'
                ? { backgroundColor: colors.RED_NORMAL }
                : { backgroundColor: colors.SECONDARY },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={'white'} />
            ) : (
              <>
                {detailsInformation?.time_tracking?.stage === 'work_start' && <StopIcon />}
                <CText style={[g.button2, { color: colors.WHITE, marginLeft: 8 }]}>Submit</CText>
              </>
            )}
          </Pressable>
          <Pressable
            disabled={loading || saveLoading}
            onPress={() => stopTimeTracking('Draft')}
            style={[
              s.button,
              detailsInformation?.time_tracking?.stage === 'work_start'
                ? { backgroundColor: colors.RED_NORMAL }
                : { backgroundColor: colors.SECONDARY },
            ]}
          >
            {saveLoading ? (
              <ActivityIndicator size="small" color={'white'} />
            ) : (
              <>
                {detailsInformation?.time_tracking?.stage === 'work_start' && <StopIcon />}
                <CText style={[g.button2, { color: colors.WHITE, marginLeft: 8 }]}>Save</CText>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              if (detailsInformation?.time_tracking?.stage === 'work_start') {
                pauseTimeTracking()
              } else if (detailsInformation?.time_tracking?.stage === 'work_pause') {
                resumeTimeTracking()
              }
            }}
            style={[s.buttonSnd, { backgroundColor: colors.GREEN_NORMAL }]}
          >
            {detailsInformation?.time_tracking?.stage === 'work_start' ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  // Header with icons
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    marginTop: 30,
  },
  textColor: {
    color: colors.HEADING,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
    width: 40,
    height: 40,
  },
  clockContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  normalText: {
    color: '#001D52',
    marginLeft: 8,
    flex: 1,
  },

  button: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 140,
    height: 48,
    flexDirection: 'row',
  },

  buttonSnd: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 48,
    flexDirection: 'row',
  },
  // Header with icons

  dateText: {
    color: colors.PRIM_BODY,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#D6E2FF',
    paddingVertical: 5,
    borderRadius: 10,
  },

  projectMilestoneContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // marginBottom: 24,
    // /,
    // borderTopColor: colors.WHITE,
    // borderBottomColor: colors.WHITE,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // paddingHorizontal: 20,
    // paddingVertical: 10,
  },

  projectMilestoneTextContainer: {
    borderTopColor: colors.WHITE,
    borderTopWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 15,
  },

  authorInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
})

export default TimerScreen
