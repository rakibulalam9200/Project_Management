import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  SafeAreaView,
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
import RadioEmptyIcon from '../../assets/svg/radio-empty-normal.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled-normal.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import AutoCompletePLace from '../../components/common/AutoCompletePLace'
import CAttachments from '../../components/common/CAttachments'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CDateTime from '../../components/common/CDateTime'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import CSelectedUsers from '../../components/common/CSelectedUsers'
import HideKeyboard from '../../components/common/HideKeyboard'
import MultipleDocumentPicker from '../../components/common/MultipleDocumentPicker'
import MemberPickerModal from '../../components/modals/MemberPickerModal'
import { setNormal } from '../../store/slices/tab'
import {
  getAttachmentsIdsFromDeleteIndexArrays,
  getMultipleAttachmentsFromDocuments,
} from '../../utils/Attachmets'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getErrorMessage, hasInvalidDateErrors, hasProjectNameErrors } from '../../utils/Errors'
import CalendarPickerModal from '../../components/modals/CalendarPickerModal'
import CustomStatusBar from '../../components/common/CustomStatusBar'
import { getMembersObjFromSelectedUsers } from '../../utils/User'
import { getDateTime } from '../../utils/Timer'
import TimeZoneModal from '../../components/modals/TimeZoneModal'
import { refreshCalendarList } from '../../store/slices/user'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'

const methods = [
  { id: 1, name: 'Import', value: 'Import' },
  { id: 2, name: 'From URL', value: 'Url' },
]

const { height, width } = Dimensions.get('window')

export default function AddOrEditCalendar({ navigation, route }) {
  let id = route.params ? route.params?.id : null
  //console.log(id, 'iddsd')
  const isFocused = useIsFocused()
  const dispatch = useDispatch()
  const [calendarName, setCalendarName] = useState('')
  const [calendarURL, setCalendarURL] = useState('')
  const [description, setDescription] = useState('')
  const [documents, setDocuments] = useState([])
  const [errorMessages, setSErrorMessages] = useState({
    name: '',
    date: '',
    timezone: '',
    method: '',
    url: '',
  })
  const [attachmentDeleteIndexes, setAttachmentDeleteIndexes] = useState([])
  const [projectAttachments, setProjectAttachments] = useState([])
  const [showMethods, setShowMethods] = useState(false)
  const [selectedTimexone, setSelectedTimexone] = useState({ index: -1, item: '' })
  const [timeZone, setTimeZone] = useState('')
  const [showTimeXonePickerModal, setShowTimeXonePickerModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState({ id: -1, name: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)

  const { user } = useSelector((state) => state.user)

  const [loading, setLoading] = useState(false)

  const scrollViewRef = useRef(null)

  const goBack = () => {
    navigation.goBack()
  }

  const addCalendar = () => {
    if (calendarName === '' || calendarName.trim() === '') {
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
    if (selectedTimexone.index == -1) {
      setSErrorMessages({
        ...errorMessages,
        timezone: 'Please select timezone',
      })
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    }

    if (selectedMethod.value == 'Import') {
      if (documents.length == 0) {
        Alert.alert('Please select a document')
        return
      }
    } else if (selectedMethod.value == 'Url') {
      if (calendarURL == '') {
        setSErrorMessages({
          ...errorMessages,
          url: 'Please enter URL',
        })
        return
      }
    }

    let file = getMultipleAttachmentsFromDocuments(documents)
    let fileIds = getAttachmentsIdsFromDeleteIndexArrays(attachmentDeleteIndexes)

    let body = {
      name: calendarName,
      time_zone: selectedTimexone?.item?.value.slice(0, 10),
      input_method: selectedMethod?.value,
      description: description,
      is_default: 0,
    }

    if (selectedMethod.id == -1) {
      delete body.input_method
    }

    if (selectedMethod.value == 'Url') {
      body = { ...body, url: calendarURL }
    }

    if (selectedMethod.value == 'Import') {
      body = { ...body, ...file, ...fileIds }
      // body = { ...body, file: file }
    }

    // //console.log(body, 'body')
    // return

    setLoading(true)

    api.calendar
      .createCalendar(body)
      .then((res) => {
        // //console.log(res, 'res')
        if (res.success) {
          Alert.alert('Calendar created successfully')
          navigation.goBack()
          // //console.log(res, 'response')
          dispatch(refreshCalendarList())
        }
      })
      .catch((err) => {
        //console.log('error calendar create--->', err)
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

  const updateCalendar = () => {
    if (calendarName === '' || calendarName.trim() === '') {
      setSErrorMessages({
        ...errorMessages,
        name: 'Please enter event name',
      })
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    } else {
      setSErrorMessages({
        ...errorMessages,
        name: '',
      })
    }

    if (selectedTimexone.index == -1 && timeZone == '') {
      //console.log('here')
      setSErrorMessages({
        ...errorMessages,
        timezone: 'Please select timezone',
      })
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      })
      return
    } else {
      setSErrorMessages({
        ...errorMessages,
        timezone: '',
      })
    }

    let body = {
      _method: 'PUT',
      id: id,
      name: calendarName,
      time_zone: selectedTimexone.index == -1 ? timeZone : selectedTimexone?.item?.value.slice(0, 10),
      description: description,
      is_default: 0,
    }

    //console.log(body, 'body')
    setLoading(true)
    api.calendar
      .editCalendar(id, body)
      .then((res) => {
        //console.log(res, 'res update calendar')
        if (res.success) {
          Alert.alert('Calendar updated successfully')
          navigation.goBack()
          // //console.log(res, 'response')
          dispatch(refreshCalendarList())
        }
      })
      .catch((err) => {
        //console.log('error calendar update--->', err)
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

  const destroyCalendar = () => {
    setBtnLoader(true)
    api.calendar
      .destroyCalendar(id)
      .then((res) => {
        if (res.success) {
          Alert.alert('Calendar deleted successfully')
          navigation.goBack()
          // //console.log(res, 'response')
          dispatch(refreshCalendarList())
        }
      })
      .catch((err) => {
        //console.log('error calendar delete--->', err)
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
      .finally(() => {
        setBtnLoader(false)
      })
  }

  useEffect(() => {
    const getCalendarDetails = () => {
      api.calendar
        .getCalendarDetails(id)
        .then((res) => {
          if (res.success) {
            //console.log(res, 'res')
            let data = res.data
            setCalendarName(data.name)
            setTimeZone(data.time_zone)
            setDescription(data?.description?.plain_text_value)
          }
        })
        .catch((err) => {
          //console.log('error calendar details--->', err)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
    if (id) {
      getCalendarDetails()
    }
  }, [id])

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  const checkIfSelected = (id) => {
    return selectedMethod.id == id
  }

  const renderMethods = () => {
    return (
      <View style={s.repeatOptionsContainer}>
        {methods.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedMethod(item)
                setShowMethods(false)
              }}
              style={[
                s.repeatOptionItem,
                { borderBottomWidth: index == methods.length - 1 ? 0 : 1 },
              ]}
            >
              {checkIfSelected(item.id) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              <Text style={[g.body1, { color: colors.NORMAL }]}>{item.name}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  return (
    <HideKeyboard>
      <View
        style={[
          { flex: 1, backgroundColor: colors.WHITE },
          { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}
      >
        <CustomStatusBar backgroundColor={colors.WHITE} barStyle="dark-content" />

        <View style={[{ flex: 1, marginBottom: height > 670 ? 80 : 50 }]}>
          <TimeZoneModal
            visibility={showTimeXonePickerModal}
            setVisibility={setShowTimeXonePickerModal}
            selectedIndex={selectedTimexone}
            setSelectedIndex={setSelectedTimexone}
          />

          <DeleteConfirmationModal
            visibility={showDeleteModal}
            setVisibility={setShowDeleteModal}
            onDelete={destroyCalendar}
            btnLoader={btnLoader}
            confirmationMessage="Are you sure you want to delete this calendar?"
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            <TouchableOpacity
              disabled={loading}
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <View style={{ width: '100%', flex: 1 }}>
              <Text style={[g.body1, { textAlign: 'center' }]}>
                {id ? 'Edit Calendar' : 'Add New Calendar'}
              </Text>
            </View>
            {id && (
              <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
                <DeleteIcon />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={[g.listingOuterContainer, { backgroundColor: colors.WHITE }]}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
            horizontal={false}
          >
            <View style={[g.innerContentContainer, { backgroundColor: colors.WHITE }]}>
              <View>
                <CInputWithLabel
                  // style={{backgroundColor:"green"}}
                  value={calendarName}
                  setValue={setCalendarName}
                  placeholder="Name"
                  label="Calendar Name*"
                  required
                  showErrorMessage={errorMessages.name !== ''}
                  errorMessage={errorMessages.name}
                />

                <CSelectWithLabel
                  label="Timezone"
                  onPress={() => setShowTimeXonePickerModal(true)}
                  selectText={
                    selectedTimexone.index != -1
                      ? capitalizeFirstLetter(selectedTimexone.item.value)
                      : timeZone == ''
                        ? 'Select'
                        : timeZone
                  }
                  errorMessage={errorMessages.timezone}
                  showErrorMessage={errorMessages.timezone !== ''}
                  required
                  containerStyle={{ marginVertical: 0, marginTop: 10 }}
                />

                {!id && (
                  <>
                    <CSelectWithLabel
                      label="Select Method"
                      onPress={() => (showMethods ? setShowMethods(false) : setShowMethods(true))}
                      selectText={
                        selectedMethod.id != -1
                          ? capitalizeFirstLetter(selectedMethod.name)
                          : 'Select'
                      }
                      errorMessage={errorMessages.method}
                      showErrorMessage={errorMessages.method !== ''}
                      required
                      containerStyle={{ marginVertical: 10 }}
                    />

                    {showMethods && renderMethods()}

                    {selectedMethod.value == 'Import' && (
                      <>
                        <CAttachments
                          attachments={projectAttachments}
                          setAttachmentDeleteIndexes={setAttachmentDeleteIndexes}
                          attachmentDeleteIndexes={attachmentDeleteIndexes}
                        />
                        {/* <CDocumentPicker documents={documents} setDocuments={setDocuments} /> */}
                        <MultipleDocumentPicker documents={documents} setDocuments={setDocuments} />
                        <Text style={{ marginTop: 5 }}>
                          You can import event information in iCal or VCS (MS Outlook) format.
                        </Text>
                      </>
                    )}

                    {selectedMethod.value == 'Url' && (
                      <CInputWithLabel
                        // style={{backgroundColor:"green"}}
                        value={calendarURL}
                        setValue={setCalendarURL}
                        placeholder="URL"
                        label="URL of Calendar*"
                        required
                        showErrorMessage={errorMessages.url !== ''}
                        errorMessage={errorMessages.url}
                      />
                    )}
                  </>
                )}

                <TextInput
                  style={[s.inputStyle, { marginTop: 16 }]}
                  spaces={false}
                  maxLength={2000}
                  placeholder="Calendar Description"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.HEADER_TEXT}
                  value={description}
                  onChangeText={setDescription}
                  height={164}
                />
              </View>
            </View>
          </ScrollView>

          {id ? (
            <View
              style={{
                paddingHorizontal: 16,
                marginBottom: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <CButtonInput
                label="Cancel"
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: colors.PRIM_CAPTION, width: '48%' }}
              />
              <CButtonInput
                label="Save"
                onPress={updateCalendar}
                loading={loading}
                style={{ width: '48%' }}
              />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <CButtonInput label="Create Calendar" onPress={addCalendar} loading={loading} />
            </View>
          )}
        </View>
      </View>
    </HideKeyboard>
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

  errorMessage: {
    fontSize: 12,
    color: colors.RED_NORMAL,
    marginTop: 4,
  },
})
