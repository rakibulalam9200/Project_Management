import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DeletIcon from '../../assets/svg/delete_2.svg'
import PauseIcon from '../../assets/svg/pause-log.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import TimerCount from '../../components/Timelogs/TimerCount'
import CButtonInput from '../../components/common/CButtonInput'
import CDateTime from '../../components/common/CDateTime'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CText from '../../components/common/CText'
import PlayLogIcon from '../../components/icons/PlayLogIcon'
import AddLogWorkPickerModal from '../../components/modals/AddLogWorkPickerModal'
import StopTimerModal from '../../components/modals/StopTimerModal'
import TimelogSaveOrCancelModal from '../../components/modals/TimelogSaveOrCancelModal'
import { getErrorMessage } from '../../utils/Errors'
import {
  findTimeDifference,
  getDate,
  getDateTime,
  getHourMinutes,
  getTimelogHourMinutesSecond,
  jsCoreDateCreator,
} from '../../utils/Timer'

const TimelogAdd = ({ navigation }) => {
  const scrollViewRef = useRef(null)
  const [openTaskPicker, setOpenTaskPicker] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [tabScreen, setTabScreen] = useState('timer')
  const [rangeDate, setRangeDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [comments, setComments] = useState('')
  const [hoursDate, setHoursDate] = useState(null)
  const [hoursNumberOfHours, setHoursNumberOfHours] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [stopTimerModal, setStopTimerModal] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showTiming, setShowTiming] = useState(false)
  const [stopTimer, setStopTimer] = useState(false)
  const stopTimerRef = useRef(false)
  const [errorMessages, setErrorMessages] = useState({
    work: '',
  })

  const toggleModal = () => {
    // stopTimerRef.current = !stopTimerRef.current;
    // Force update to reflect changes in ref
    // setStopTimer((prev) => !prev);
  }

  const resetInputs = () => {
    setSelectedTask(null)
    setRangeDate(null)
    setStartTime(null)
    setEndTime(null)
    setComments('')
    setHoursDate(null)
    setHoursNumberOfHours(null)
  }

  const handleAddTimelog = (option) => {
    const params = {
      description: comments,
      stage: option.value,
    }

    option.id == 3 && delete params.stage

    if (!selectedTask) {
      setErrorMessages({
        ...errorMessages,
        work: 'Please select work',
      })
      return
    }

    if (selectedTask.state == 'Project') {
      params.project_id = selectedTask.id
    } else {
      params.project_id = selectedTask?.project_id
      params['parent_id'] = selectedTask.id
    }

    if (tabScreen == 'range') {
      let start_date = getDate(rangeDate) + ' ' + getHourMinutes(startTime)
      let end_date = getDate(rangeDate) + ' ' + getHourMinutes(endTime)
      params.start_date = getDateTime(jsCoreDateCreator(start_date))
      params.end_date = getDateTime(jsCoreDateCreator(end_date))
      params.number_of_hour = findTimeDifference(startTime, endTime)
    }

    if (tabScreen == 'hours') {
      params.start_date = getDateTime(hoursDate)
      params.number_of_hour = getTimelogHourMinutesSecond(hoursNumberOfHours)
    }

    console.log(params, 'body');
    // return
    api.timelog
      .createTimelog(params)
      .then((res) => {
        console.log(res,"------res--------");
        if (res.success) {
          Alert.alert('Timelog added successfully')
          if (option.id == 3) {
            resetInputs()
          } else {
            navigation.goBack()
          }
        }
      })
      .catch((err) => {
        console.log(err),"errror.....";
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'Something went wrong'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setShowSaveModal(false)
        setErrorMessages({ work: '' })
        // navigation.goBack()
      })
  }

  const timelogSaveOrCancel = (option) => {
    if (option.id !== 4) {
      handleAddTimelog(option)
    } else {
      navigation.goBack()
    }
  }

  useEffect(() => {
    const fetchCurrentTimeTrakcing = () => {
      api.timeTracking
        .getCurrentTimeTracking()
        .then((res) => {
          if (res.success) {
            if(res.data){
              setSelectedTask(res?.data?.working_hourable)
              setTimer(res?.data?.total_time)
              setShowTiming(true)
            }
            // console.log(res, 'res current time tracking')
            // setShowTiming(true)
            // setRefresh((prev) => !prev)
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
        .finally(() => {})
    }

    fetchCurrentTimeTrakcing()
  }, [])

  useEffect(() => {
    let interval
    if (selectedTask && showTiming) {
      interval = setInterval(() => setTimer((pre) => pre + 1), 1000)
    }
    return () => {
      clearInterval(interval)
    }
  }, [selectedTask, showTiming])

  const startTimeTracking = async () => {
    //  console.log('start time tracking....', selectedTask?.id)
    if (!selectedTask) {
      return
    }

    let body = {
      type: selectedTask?.state.toLowerCase(),
    }

    api.timeTracking
      .timeTrackingStart(body, selectedTask?.id)
      .then((res) => {
        if (res.success) {
          console.log('Time tracking started.......')
          setShowTiming(true)
          // setRefresh((prev) => !prev)
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
      .finally(() => {})
  }

  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <AddLogWorkPickerModal
        visiblility={openTaskPicker}
        setVisiblility={setOpenTaskPicker}
        selected={selectedTask}
        setSelected={setSelectedTask}
      />

      <StopTimerModal
        visibility={stopTimerModal}
        setVisibility={setStopTimerModal}
        selectedTask={selectedTask}
        timer={timer}
      />

      <StatusBar animated={true} backgroundColor={colors.WHITE} />
      <ScrollView contentContainerStyle={[s.background]} ref={scrollViewRef}>
        <View style={[{ flex: 1, paddingHorizontal: 16 }]}>
          <View style={{ flex: 1 }}>
            <View style={s.headerContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>Add Log</CText>
              <View style={s.buttonGroup}>
                <TouchableOpacity style={[s.buttonGroupBtn]}>
                  <DeletIcon fill={colors.NORMAL} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.gapVertical}>
              <CSelectWithLabel
                label="What are you working on?"
                selectText={selectedTask ? selectedTask.name : 'Select'}
                onPress={() => {
                  if(showTiming && selectedTask &&  tabScreen === 'timer'){   
                  }else{
                    setOpenTaskPicker(true)
                  }
                }}
                errorMessage={errorMessages.work}
                showErrorMessage={errorMessages.work ? true : false}
              />

              <View style={s.timeRangeView}>
                <View style={[s.tabContainer]}>
                  <TouchableOpacity
                    style={[
                      s.tabButton,
                      tabScreen == 'timer' ? s.tabActiveButton : s.inActiveButton,
                    ]}
                    onPress={() => {
                      setTabScreen('timer')
                    }}
                  >
                    <Text
                      style={[s.tabButtonText, tabScreen == 'timer' ? s.tabButtonTextActive : null]}
                    >
                      Timer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      s.tabButton,
                      tabScreen == 'range' ? s.tabActiveButton : s.inActiveButton,
                    ]}
                    onPress={() => {
                      setTabScreen('range')
                    }}
                  >
                    <Text
                      style={[s.tabButtonText, tabScreen == 'range' ? s.tabButtonTextActive : null]}
                    >
                      Range
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      s.tabButton,
                      tabScreen == 'hours' ? s.tabActiveButton : s.inActiveButton,
                    ]}
                    onPress={() => {
                      setTabScreen('hours')
                    }}
                  >
                    <Text
                      style={[s.tabButtonText, tabScreen == 'hours' ? s.tabButtonTextActive : null]}
                    >
                      Hours
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  {tabScreen == 'timer' && (
                    <View style={s.timerCard}>
                      <View style={s.playIcon}>
                        {/* <TimerEnabledIcon /> */}
                        <TouchableOpacity
                          onPress={() => {
                            if (selectedTask) {
                              if (!showTiming) {
                                startTimeTracking()
                              } else {
                                setStopTimerModal(true)
                              }
                              // setShowTiming(true)
                              // setTimer(false)
                              // if (!showTiming) {
                              //   startTimeTracking()
                              // } else {
                              //   setStopTimerModal(true)
                              // }
                            }
                          }}
                          style={[
                            s.btnCircle,
                            selectedTask
                              ? showTiming
                                ? { borderColor: '#E9203B' }
                                : { borderColor: '#246BFD' }
                              : { borderColor: '#EBEBEB' },
                          ]}
                        >
                          {showTiming ? (
                            <PauseIcon />
                          ) : (
                            <PlayLogIcon size={24} color={selectedTask ? '#246BFD' : '#EBEBEB'} />
                          )}
                        </TouchableOpacity>
                        {/* <Text style={s.timerText}>{secondtoHms(timer)}</Text>
                         */}
                        <TimerCount timer={timer} />
                      </View>
                      <Text style={{ marginTop: 5, marginLeft: 15 }}>
                        {showTiming ? 'Stop' : 'Start'}
                      </Text>
                    </View>
                  )}

                  {tabScreen == 'range' && (
                    <View style={{ flex: 1 }}>
                      <CDateTime
                        pickedDate={rangeDate}
                        setPickedDate={setRangeDate}
                        style={{ width: '50%' }}
                        label="Date"
                        showLabel
                        dateFormate
                        containerStyle={s.dateInput}
                        flex={{}}
                      />
                      <View style={s.rangeDateTimeCOntainer}>
                        <CDateTime
                          pickedDate={startTime}
                          setPickedDate={setStartTime}
                          label="Start"
                          showLabel
                          type="time"
                        />
                        <CDateTime
                          pickedDate={endTime}
                          setPickedDate={setEndTime}
                          label="End"
                          showLabel
                          type="time"
                        />
                      </View>

                      <TextInput
                        style={[s.input]}
                        value={comments}
                        onChangeText={setComments}
                        placeholder="Comments"
                      />
                    </View>
                  )}

                  {tabScreen == 'hours' && (
                    <View style={{ flex: 1 }}>
                      <View style={s.rangeDateTimeCOntainer}>
                        <CDateTime
                          pickedDate={hoursDate}
                          setPickedDate={setHoursDate}
                          label="Date"
                          showLabel
                          dateFormate
                          // containerStyle={s.dateInput}
                        />
                        <CDateTime
                          pickedDate={hoursNumberOfHours}
                          setPickedDate={setHoursNumberOfHours}
                          label="Number of Hours"
                          showLabel
                          type="time"
                        />
                      </View>

                      <TextInput
                        style={s.input}
                        value={comments}
                        onChangeText={setComments}
                        placeholder="Comments"
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View>
            <TimelogSaveOrCancelModal
              openModal={showSaveModal}
              setOpenModal={setShowSaveModal}
              saveOrCancel={timelogSaveOrCancel}
            />
          </View>
          {tabScreen !== 'timer' && (
            <CButtonInput
              label="Save"
              onPress={() => setShowSaveModal(true)}
              style={[!selectedTask && { backgroundColor: '#EBEBEB' }]}
              disable={!selectedTask}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    paddingBottom: 70,
    flex: 1,
  },
  gapVertical: {
    marginVertical: 8,
    flex: 1,
  },
  textColor: {
    color: 'black',
  },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 8,
    marginRight: 8,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    zIndex: 10,
    backgroundColor: colors.WHITE,
    marginBottom: 8,
  },

  contentContainer: {
    // display: 'flex',
    // borderWidth: 1,
  },

  timeRangeView: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.SEC_BG,
    paddingVertical: 16,
    flex: 1,
  },

  tabContainer: {
    marginBottom: 20,
    // marginTop: 10,
    borderRadius: 20,
    // backgroundColor: colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    width: '30%',
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  tabActiveButton: {
    backgroundColor: colors.ICON_BG,
  },
  inActiveButton: {
    backgroundColor: colors.SEC_BG,
  },
  tabButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: colors.WHITE,
    // fontWeight: 'bold',
  },
  timerCard: {
    width: '100%',
    borderRadius: 15,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.SEC_BG,
    padding: 16,
    justifyContent: 'center',
  },

  playIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },

  rangeDateTimeCOntainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    marginTop: 16,
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
  },
  input: {
    maxHeight: 64,
    color: colors.BLACK,
    backgroundColor: colors.START_BG,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 64,
    marginBottom: 16,
    // borderWidth: 1,
  },

  btnCircle: {
    height: 66,
    width: 66,
    overflow: 'hidden',
    borderRadius: 33,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default TimelogAdd
