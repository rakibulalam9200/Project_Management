import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import g from '../../assets/styles/global'

import { useIsFocused } from '@react-navigation/native'
import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import DotIcon from '../../assets/svg/dots-black.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty-normal.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled-normal.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import HideKeyboard from '../../components/common/HideKeyboard'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import CalendarPickerModal from '../../components/modals/CalendarPickerModal'
import EventRepeatSettingsModal from '../../components/modals/EventRepeatSettingsModal'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import { setNavigationFrom } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import { getDaysObjFromSelectedDaysForWeekView } from '../../utils/Array'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getErrorMessage, hasInvalidDateErrors } from '../../utils/Errors'
import { getDate, getDateTime, getHourMinutes, jsCoreDateCreator } from '../../utils/Timer'
import { getMembersObjFromSelectedUsers } from '../../utils/User'

const repeatOptions = [
  {
    name: 'Do not repeat',
    value: 'One-time event',
    id: 0,
  },
  {
    name: 'Daily',
    value: 'Daily',
    id: 1,
  },
  {
    name: 'Weekly',
    value: 'Weekly',
    id: 2,
  },
  {
    name: 'Monthly',
    value: 'Monthly',
    id: 3,
  },
  {
    name: 'Yearly',
    value: 'Yearly',
    id: 4,
  },
]

const { height, width } = Dimensions.get('window')

export default function AddOrEditEvent({ navigation, route }) {
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [eventName, setEventName] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventAddress, setEventAddress] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showCalendarPicker, setShowCalendarPicker] = useState(false)
  const [errorMessages, setSErrorMessages] = useState({
    name: '',
    date: '',
  })
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [projectAttachments, setProjectAttachments] = useState([])
  const [isAllDay, setIsAllDay] = useState(false)
  const [showRepeatOptions, setShowRepeatOptions] = useState(false)
  const [selectedReapeatOption, setSelectedReapeatOption] = useState({ id: -1, value: '' })
  const [selectedCalendar, setSelectedCalendar] = useState({ id: -1 })
  const [showRepeatSettingsModal, setShowRepeatSettingsModal] = useState(false)
  const [eventRepeat, setEventRepeat] = useState({})
  const [eventEvery,setEventEvery] = useState(0)
  const { user } = useSelector((state) => state.user)
  const { navigationFrom } = useSelector((state) => state.navigation)

  const [loading, setLoading] = useState(false)
  const { calendarList } = useSelector((state) => state.user)
  const scrollViewRef = useRef(null)
  const {
    id,
    name,
    description,
    address,
    start_date,
    end_date,
    start_time,
    end_time,
    is_all_day,
    user_invitees,
    attachments,
    is_private,
    event_repeat = {},
    repeat_type,
    repeat_end_date,
    repeat_end_time,
    calendar_id,
    user_organizer,
    repeat,
  } = route.params || {}
  useEffect(() => {
    setEventEvery(event_repeat?.every)
    console.log(event_repeat,"++++++++++++++")
    name && setEventName(name)
    description && setEventDescription(description.value)
    address && setEventAddress(address)
    if (start_date) {
      const date = new Date(start_date)
      setStartDate(date)
      setStartTime(date)
    }
    if (end_date) {
      const date = new Date(end_date)
      setEndDate(date)
      setEndTime(date)
    }
    setIsAllDay(is_all_day)
    if (calendar_id) {
      const id = calendarList.findIndex((item) => item.id == calendar_id)
      setSelectedCalendar(calendarList[id])
    }
    // if (event_repeat) {
    //   delete event_repeat.updated_at
    //   delete event_repeat.created_at
    //   delete event_repeat.id
    //   delete event_repeat.event_id
    //   setEventRepeat(event_repeat)
    // }
    user_invitees && setSelectedUsers(user_invitees || [])
    attachments && setProjectAttachments(attachments || [])
  }, [route.params])
  const goBack = () => {
    if (navigationFrom == 'day') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('DayView')
    } else if (navigationFrom === 'week') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('WeekView')
    } else if (navigationFrom === 'month') {
      dispatch(setNavigationFrom(''))
      navigation.navigate('MonthView')
    } else {
      navigation.goBack()
    }
  }
  // console.log(eventRepeat, 'eventRepeat')
  const addOrUpdateEvent = () => {
    if (eventName === '' || eventName.trim() === '') {
      setSErrorMessages({
        ...errorMessages,
        name: 'Please enter event name',
      })
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }
    if (hasInvalidDateErrors(startDate, endDate, setSErrorMessages)) {
      return
    }
    if (selectedCalendar.id == -1) {
      Alert.alert('Please select calendar')
      return
    }

    let attachments = getMultipleAttachmentsFromDocuments(documents)
    let attachmentIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)
    let invitees = getMembersObjFromSelectedUsers(selectedUsers)

    let body = {
      name: eventName,
      calendar_id: selectedCalendar.id,
      is_all_day: isAllDay || false,
      repeat: selectedReapeatOption.value,
      description: eventDescription,
      address: eventAddress,
    }

    if (startDate && startTime) {
      let start_date = getDate(startDate) + ' ' + getHourMinutes(startTime)
      body.start_date = getDateTime(jsCoreDateCreator(start_date))
    }
    if (endDate && endTime) {
      let end_date = getDate(endDate) + ' ' + getHourMinutes(endTime)
      body.end_date = getDateTime(jsCoreDateCreator(end_date))
    }

    selectedReapeatOption.id === -1 && delete body.repeat

    if (selectedReapeatOption.id != 0 && selectedReapeatOption.id != -1) {
      if (Object.keys(eventRepeat).length == 0) {
        setShowRepeatSettingsModal(true)
        return
      }
      // let event_repeat = { ...eventRepeat }
      // body.event_repeat =  eventRepeat
      // // console.log(event_repeat, 'event_repeat')
    }
    // console.log(selectedReapeatOption?.value,"###########-------------")
    if (selectedReapeatOption?.value === 'Weekly') {
      const repeatedData = getDaysObjFromSelectedDaysForWeekView(eventRepeat?.repeat_on)
      if (eventRepeat?.repeat_on) {
        delete eventRepeat?.repeat_on
      }
      body.event_repeat = eventRepeat
      body = { ...body, ...repeatedData }
    } else {
      body.event_repeat = eventRepeat
    }

    body = { ...body, ...attachments, ...attachmentIds, ...invitees }

    console.log(body,'body...........')

     setLoading(true)
    if (id) {
      body['_method'] = 'PUT'
      if (selectedReapeatOption?.value !== 'One-time event') {
        body['series_type'] = 'only_this_event'
      }
      api.calendar
        .updateEvent(body, id)
        .then((res) => {
          console.log(res, 'res')
          if (res.success) {
            Alert.alert(res.message || 'Failed to update Event')
            navigation.goBack()
          }
        })
        .catch((err) => {
          console.log(err, 'err')
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            console.log(err)
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg || "Couldn't update Event")
        })
        .finally(() => {
          setLoading(false)
        })
      return
    }
    api.calendar
      .createEvent(body)
      .then((res) => {
        // //console.log(res, 'res')
        if (res.success) {
          Alert.alert(res.message || 'Failed to create Event')
          navigation.goBack()
          //console.log(res, 'response')
        }
      })
      .catch((err) => {
        console.log(err, 'err')
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (selectedReapeatOption?.id != 0 && selectedReapeatOption?.id != -1) {
      // setShowRepeatSettingsModal(true)
    }
  }, [selectedReapeatOption])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const checkIfSelected = (id) => {
    return selectedReapeatOption?.id == id
  }
  useEffect(() => {
    if (!repeat) return
    const findRepeatOption = repeatOptions.find((item) => item.value == repeat)
    findRepeatOption && setSelectedReapeatOption(findRepeatOption)
  }, [repeat])
  const renderRepeatOptions = () => {
    return (
      <View style={s.repeatOptionsContainer}>
        {repeatOptions.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedReapeatOption(item)
                if (item.id !== 0 && item.id !== -1) {
                  setShowRepeatSettingsModal(true)
                }
              }}
              style={s.repeatOptionItem}
            >
              {checkIfSelected(item.id) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              <Text style={[g.body1, { color: colors.NORMAL }]}>{item.name}</Text>
            </TouchableOpacity>
          )
        })}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={[g.body1, { color: colors.NORMAL, paddingVertical: 10 }]}>Other</Text>
          <DotIcon />
        </View>
      </View>
    )
  }

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.WHITE },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <CustomStatusBar backgroundColor={colors.WHITE} barStyle="dark-content" />

      <CalendarPickerModal
        visibility={showCalendarPicker}
        setVisibility={setShowCalendarPicker}
        selected={selectedCalendar}
        setSelected={setSelectedCalendar}
      />

      <EventRepeatSettingsModal
        visibility={showRepeatSettingsModal}
        setVisibility={setShowRepeatSettingsModal}
        repeatOptions={repeatOptions}
        setEventRepeat={setEventRepeat}
        selectedReapeatOption={selectedReapeatOption}
        setSelectedReapeatOptionInParent={setSelectedReapeatOption}
        eventRepeat={event_repeat}
        eventEvery={eventEvery}
      />

      <View style={[{ flex: 1, marginBottom: height > 670 ? 80 : 50 }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <TouchableOpacity disabled={loading} onPress={goBack}>
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <View style={{ width: '100%', flex: 1 }}>
            <Text style={[g.body1, { textAlign: 'center' }]}>
              {id ? 'Update Event' : 'Add New Event'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={[g.listingOuterContainer, { backgroundColor: colors.WHITE }]}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          horizontal={false}
        >
          <HideKeyboard>
            <View style={[g.innerContentContainer, { backgroundColor: colors.WHITE }]}>
              <MemberPickerModal
                visibility={showUserPickerModal}
                setVisibility={setShowUserPickerModal}
                selected={selectedUsers}
                setSelected={setSelectedUsers}
                navigationFrom={'Add'}
              />

              <View>
                <CInputWithLabel
                  // style={{backgroundColor:"green"}}
                  value={eventName}
                  setValue={setEventName}
                  placeholder="Name"
                  label="Event Name*"
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                />

                <View style={s.rangeDateTimeCOntainer}>
                  <CDateTime
                    pickedDate={startDate}
                    setPickedDate={setStartDate}
                    label="Start Date"
                    showLabel
                    dateFormate
                    // containerStyle={s.dateInput}
                  />
                  <CDateTime
                    pickedDate={startTime}
                    setPickedDate={setStartTime}
                    label="Time"
                    showLabel
                    type="time"
                  />
                </View>

                <View style={s.rangeDateTimeCOntainer}>
                  <CDateTime
                    pickedDate={endDate}
                    setPickedDate={setEndDate}
                    label="End Date"
                    showLabel
                    dateFormate
                  />
                  <CDateTime
                    pickedDate={endTime}
                    setPickedDate={setEndTime}
                    label="Time"
                    showLabel
                    type="time"
                  />
                </View>

                <View style={{ alignSelf: 'flex-start' }}>
                  <CCheckbox checked={isAllDay} setChecked={setIsAllDay} label={'All Day'} />
                </View>

                <CSelectWithLabel
                  label="Repeat"
                  onPress={() =>
                    showRepeatOptions ? setShowRepeatOptions(false) : setShowRepeatOptions(true)
                  }
                  selectText={
                    selectedReapeatOption && selectedReapeatOption?.id != -1
                      ? capitalizeFirstLetter(selectedReapeatOption?.name)
                      : 'Select'
                  }
                  errorMessage={errorMessages.priority}
                  showErrorMessage={errorMessages.priority !== ''}
                  required
                  containerStyle={{ marginVertical: 0, marginTop: 10 }}
                />
                {showRepeatOptions && renderRepeatOptions()}
                <TextInput
                  style={s.inputStyle}
                  spaces={false}
                  maxLength={2000}
                  placeholder="Event Description"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.HEADER_TEXT}
                  value={eventDescription}
                  onChangeText={setEventDescription}
                  height={164}
                />

                {selectedUsers.length == 0 && (
                  <CSelectWithLabel label="Invites" onPress={() => setShowUserPickerModal(true)} />
                )}
                {selectedUsers.length > 0 && (
                  <CSelectedUsers
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    onEditPress={() => setShowUserPickerModal(true)}
                  />
                )}

                <CSelectWithLabel
                  label="Calendar"
                  selectText={selectedCalendar.id != -1 ? selectedCalendar.name : 'Select Calendar'}
                  onPress={() => setShowCalendarPicker(true)}
                  required
                />

                <ScrollView
                  horizontal={true}
                  style={{ width: '100%', flex: 1, flexDirection: 'column', marginVertical: 8 }}
                  keyboardShouldPersistTaps="always"
                >
                  <View style={{ flex: 1, width: '100%' }}>
                    <Text style={s.labelStyle}>Location</Text>
                    <AutoCompletePLace
                      setValue={setEventAddress}
                      value={eventAddress}
                      placeholder={'Address'}
                      type=""
                    />
                  </View>
                </ScrollView>
                <CAttachments
                  attachments={projectAttachments}
                  setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                  attachmentDeleteIndexes={attachmentDeleteIndexes}
                />
                {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
                <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
              </View>
            </View>
          </HideKeyboard>
        </ScrollView>
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <CButtonInput
            label={id ? 'Update Event' : 'Create Event'}
            onPress={addOrUpdateEvent}
            loading={loading}
          />
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  background: {
    backgroundColor: colors.WHITE,
    marginBottom: 50,
    // backgroundColor: 'green',
  },
  repeatOptionsContainer: {
    backgroundColor: colors.PRIM_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 10,
  },
  repeatOptionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
    flexDirection: 'row',
    gap: 16,
  },
  container: {
    marginTop: 24,
  },
  headerTitle: {
    marginLeft: 24,
  },
  inputHeader: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
  },
  gapVertical: {
    marginVertical: 10,
  },
  rangeDateTimeCOntainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    // marginTop: 16,
    justifyContent: 'space-between',
    paddingBottom: 10,
    // marginBottom: 10,
    borderBottomColor: colors.SEC_BG,
    // borderBottomWidth: 1,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.BLACK,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    overflow: 'hidden',
  },
  labelStyle: {
    fontSize: 12,
    color: colors.HEADER_TEXT,
    marginRight: 12,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
})
