import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView, StatusBar } from 'react-native';
import colors from '../../assets/constants/colors';
import CSelectWithLabel from '../../components/common/CSelectWithLabel';
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import DeletIcon from '../../assets/svg/delete_2.svg'
import g from '../../assets/styles/global'
import { TouchableOpacity } from 'react-native';
import CText from '../../components/common/CText';
import TimerEnabledIcon from '../../assets/svg/timericonblue.svg'
import CDateTime from '../../components/common/CDateTime';
import { TextInput } from 'react-native';
import CButtonInput from '../../components/common/CButtonInput';
import AddLogWorkPickerModal from '../../components/modals/AddLogWorkPickerModal';
import { findTimeDifference, getDate, getDateTime, getHourMinutes, jsCoreDateCreator } from '../../utils/Timer';
import api from '../../api/api';
import { getErrorMessage } from '../../utils/Errors';
import TimelogSaveOrCancelModal from '../../components/modals/TimelogSaveOrCancelModal';

const TimelogEdit = ({ navigation, route }) => {
  const id = route.params?.id ?? null
  const scrollViewRef = useRef(null)
  const [openTaskPicker, setOpenTaskPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tabScreen, setTabScreen] = useState('range');
  const [rangeDate, setRangeDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [comments, setComments] = useState('')
  const [hoursDate, setHoursDate] = useState(null)
  const [hoursNumberOfHours, setHoursNumberOfHours] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState({
    work: '',
  })


  const handleEditTimelog = (option) => {
    const params = {
      _method: 'PUT',
      id,
      description: comments,
    }

    option.id == 3 && delete params.stage

    if (!selectedTask) {
      setErrorMessages({
        ...errorMessages,
        work: 'Please select work'
      })
      return
    }

    if (selectedTask.state == 'Project') {
      params.project_id = selectedTask.id
    } else {
      params.project_id = selectedTask?.project_id
      params[selectedTask.state.toLowerCase() + '_id'] = selectedTask.id
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
      params.number_of_hour = getHourMinutes(hoursNumberOfHours)
    }

    //console.log(params, 'body');
    // return
    setLoading(true)
    api.timelog.updateTimelog(id, params)
      .then(res => {
        //console.log(res);
        if (res.success) {
          Alert.alert('Timelog updated successfully')
          navigation.goBack()
        }
      })
      .catch(err => {
        //console.log(err);
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        }
        catch (err) {
          errMsg = 'Something went wrong'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setErrorMessages({ work: '' })
        setLoading(false)
      })

  }

  useEffect(() => {
    if (id) {
      api.timelog.getTimelogDetails(id)
        .then(res => {
          //console.log(res);
          if (res.success) {
            let data = res.timelog
            let task = data?.issue ?? data?.task ?? data?.milestone ?? data?.project
            //console.log({ task });
            setSelectedTask(task)
            setComments(data?.description?.value)
            if (data?.end_date) {
              setTabScreen('range')
              setRangeDate(new Date(data?.start_date))
              setStartTime(new Date(data?.start_date))
              setEndTime(new Date(data?.end_date))
            } else {
              setTabScreen('hours')
              setHoursDate(new Date(data?.start_date))
              // setHoursNumberOfHours(new Date(data?.start_date))
            }
            // setRangeDate(new Date(res.data.start_date))
            // setStartTime(new Date(res.data.start_date))
            // setEndTime(new Date(res.data.end_date))
          }
        })
        .catch(err => {
          //console.log(err);
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          }
          catch (err) {
            errMsg = 'Something went wrong'
          }
          Alert.alert(errMsg)
        })
    }
  }, [])


  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <AddLogWorkPickerModal
        visiblility={openTaskPicker}
        setVisiblility={setOpenTaskPicker}
        selected={selectedTask}
        setSelected={setSelectedTask}
      />

      <StatusBar animated={true} backgroundColor={colors.WHITE} />
      <ScrollView contentContainerStyle={[s.background]} ref={scrollViewRef}>
        <View style={[{ flex: 1, paddingHorizontal: 16, }]}>
          <View style={{ flex: 1 }}>
            <View style={s.headerContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor]}>Edit Time Log</CText>
              <View style={s.buttonGroup}>

                <TouchableOpacity
                  style={[s.buttonGroupBtn]}
                >
                  <DeletIcon fill={colors.NORMAL} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.gapVertical}>

              <CSelectWithLabel
                label="What are you working on?"
                selectText={selectedTask ? selectedTask.name : 'Select'}
                onPress={() => setOpenTaskPicker(true)}
                errorMessage={errorMessages.work}
                showErrorMessage={errorMessages.work ? true : false}
              />

              <View style={s.timeRangeView}>
                <View style={[g.containerBetween, s.detailsPickerContainer]}>
                  <TouchableOpacity
                    style={[
                      s.detailsPickerButton,
                      tabScreen === 'range' ? s.detailsPickerButtonActive : null,
                    ]}
                    onPress={() => {
                      setTabScreen('range')
                    }}
                  >
                    <Text
                      style={[
                        s.detailsPickerButtonText,
                        tabScreen === 'range' ? s.detailsPickerButtonTextActive : null,
                      ]}
                    >
                      Range
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.detailsPickerButton,
                      tabScreen === 'hours' ? s.detailsPickerButtonActive : null,
                    ]}
                    onPress={() => {
                      setTabScreen('hours')
                    }}
                  >
                    <Text
                      style={[
                        s.detailsPickerButtonText,
                        tabScreen === 'hours' ? s.detailsPickerButtonTextActive : null,
                      ]}
                    >
                      Hours
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  {
                    tabScreen == 'timer' &&
                    <View style={s.timerCard}>
                      <View style={s.playIcon}>
                        <TimerEnabledIcon />
                        <Text style={s.timerText}>00h:00m:00s</Text>
                      </View>
                      <Text style={{ marginTop: 5, marginLeft: 15 }}>Start</Text>
                    </View>
                  }

                  {
                    tabScreen == 'range' &&
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
                          type='time'
                        />
                        <CDateTime
                          pickedDate={endTime}
                          setPickedDate={setEndTime}

                          label="End"
                          showLabel
                          type='time'
                        />
                      </View>

                      <TextInput style={s.input} value={comments} onChangeText={setComments} placeholder='Comments' />

                    </View>
                  }

                  {
                    tabScreen == 'hours' &&
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
                          type='time'
                        />
                      </View>

                      <TextInput style={s.input} value={comments} onChangeText={setComments} placeholder='Comments' />

                    </View>
                  }



                </View>
              </View>


            </View>
          </View>

          <CButtonInput label="Save" onPress={handleEditTimelog} style={{}} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};
const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    paddingBottom: 70,
    flex: 1,
  },
  gapVertical: {
    marginVertical: 8,
    flex: 1
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


  detailsPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.SEC_BG,
    marginVertical: 8,
  },

  detailsPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.SEC_BG,
    paddingVertical: 8,
  },
  detailsPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  detailsPickerButtonText: {
    color: colors.BLACK,
    // fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  detailsPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },

});

export default TimelogEdit;