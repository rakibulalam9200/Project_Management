import React, { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import RadioEmptyIcon from '../../assets/svg/radio-empty-normal.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled-normal.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { getDateTime } from '../../utils/Timer'
import CButtonInput from '../common/CButtonInput'
import CDateTime from '../common/CDateTime'
import CSelectWithLabel from '../common/CSelectWithLabel'
// import { SafeAreaView } from 'react-native-safe-area-context'

const weekDays = [
  { id: 1, name: 'Sun' },
  { id: 2, name: 'Mon' },
  { id: 3, name: 'Tue' },
  { id: 4, name: 'Wed' },
  { id: 5, name: 'Thu' },
  { id: 6, name: 'Fri' },
  { id: 7, name: 'Sat' },
]

const endOptions = [
  { id: 1, name: 'Never' },
  { id: 2, name: 'On' },
  { id: 3, name: 'After' },
]

export default function EventRepeatSettingsModal({
  children,
  visibility,
  setVisibility,
  repeatOptions,
  setEventRepeat,
  setSelectedReapeatOptionInParent,
  eventRepeat,
  selectedReapeatOption: selectedReapeatOptionInParent,
  eventEvery
}) {
  const [repeatEvery, setRepeatEvery] = useState(eventEvery)
  console.log(repeatEvery,eventEvery,"---------repeat-----------")
  const [showRepeatOptions, setShowRepeatOptions] = useState(false)
  const [selectedReapeatOption, setSelectedReapeatOption] = useState(repeatOptions[1])
  const [selectedWeekDays, setSelectedWeekDays] = useState([])
  const [selectedEndOption, setSelectedEndOption] = useState(endOptions[0])
  const [endsOnDate, setEndsOnDate] = useState(null)
  const [occurences, setOccurences] = useState(0)
  const { end_date, end_type, event_id, every, id, repeat_on, total_occurrence, type, updated_at } =
    eventRepeat || {}

  const [errorMessages, setErrorMessages] = useState({
    repeatEvery: '',
    priority: '',
    onDate: '',
    after: '',
  })
  useEffect(() => {
    selectedReapeatOptionInParent && setSelectedReapeatOption(selectedReapeatOptionInParent)
    // repeat_on && setSelectedWeekDays(repeat_on)
    // setRepeatEvery(eventEvery)
     
  }, [selectedReapeatOptionInParent])
  
  const closeModal = () => {
    setVisibility(false)
  }

  const checkIfSelected = (id) => {
    return selectedReapeatOption.id == id
  }

  const renderRepeatOptions = () => {
    return (
      <View style={s.repeatOptionsContainer}>
        {repeatOptions.slice(1).map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedReapeatOption(item)
                setSelectedReapeatOptionInParent(item)
                setShowRepeatOptions(false)
              }}
              style={[
                s.repeatOptionItem,
                { borderBottomWidth: index == repeatOptions.length - 2 ? 0 : 1 },
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

  const checkSelectedWeekDays = (id) => {
    const found = selectedWeekDays.find((item) => item.id == id)
    return found
  }

  const renderWeekDays = () => {
    return (
      <View style={s.weekDaysContainerParent}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Repeat On:</Text>
        <View style={s.weekDaysContainer}>
          {weekDays.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (checkSelectedWeekDays(item.id)) {
                    setSelectedWeekDays((prev) => {
                      const copy = [...prev]
                      return copy.filter((day) => item.id != day.id)
                    })
                  } else {
                    setSelectedWeekDays((prev) => [...prev, item])
                  }
                }}
                style={[
                  s.weekDaysItem,
                  {
                    backgroundColor: checkSelectedWeekDays(item.id)
                      ? colors.PRIM_BODY
                      : colors.SEC_BG,
                  },
                ]}
              >
                <Text
                  style={[
                    s.weekDayText,
                    {
                      color: checkSelectedWeekDays(item.id) ? colors.WHITE : colors.NORMAL,
                    },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  const checkSelectedEndOption = (id) => {
    return selectedEndOption.id == id
  }

  const renderEndOptions = () => {
    return (
      <View>
        {endOptions.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedEndOption(item)
              }}
              style={[
                s.repeatOptionItem,
                { borderBottomWidth: index == endOptions.length - 1 ? 0 : 1, paddingVertical: 16 },
              ]}
            >
              {checkSelectedEndOption(item.id) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', width: '100%' }}>
                <Text style={[g.body1, { color: colors.NORMAL }]}>{item.name}</Text>
                {item.id == 2 && (
                  <CDateTime
                    pickedDate={endsOnDate}
                    setPickedDate={setEndsOnDate}
                    type="datetime"
                    showLabel={false}
                    label={''}
                    containerStyle={{ width: '50%' }}
                    style={{ width: '50%' }}
                  />
                )}
                {item.id == 3 && (
                  <View
                    style={{ width: '100%', flexDirection: 'row', gap: 16, alignItems: 'center' }}
                  >
                    <TextInput
                      editable={true}
                      style={[s.inputStyle, { width: '30%' }]}
                      maxLength={255}
                      placeholder={'2'}
                      value={occurences}
                      onChangeText={setOccurences}
                      keyboardType={'numeric'}
                      required={checkIfSelected(3)}
                    />
                    <Text style={{ fontSize: 16, color: colors.NORMAL }}>occurences</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  const setValues = () => {
    if (repeatEvery == 0 || repeatEvery == '') {
      setErrorMessages((prev) => ({ ...prev, repeatEvery: 'Please enter a valid number' }))
      return
    } else {
      setErrorMessages((prev) => ({ ...prev, repeatEvery: '' }))
    }
    if (selectedReapeatOption.id == 2) {
      if (selectedWeekDays.length == 0) {
        Alert.alert('Please select at least one day')
        return
      }
    }

    if (selectedEndOption.id == 2) {
      if (endsOnDate == null) {
        Alert.alert('Please select a date')
        return
      }
    }

    if (selectedEndOption.id == 3) {
      if (occurences == 0 || occurences == '') {
        Alert.alert('Please enter a valid number of occurrences')
        return
      }
    }

    let repeat = {
      every: repeatEvery,
      type: selectedReapeatOption.value,
      end_type: selectedEndOption.name,
    }

    if (selectedReapeatOption.id == 2) {
      repeat['repeat_on'] = selectedWeekDays.map((item) => item.name)
    }

    if (selectedEndOption.id == 2) {
      repeat['end_date'] = getDateTime(endsOnDate)
    }

    if (selectedEndOption.id == 3) {
      repeat['total_occurrence'] = occurences
    }

    //console.log(repeat, 'repeat data............')
    setEventRepeat(repeat)
    closeModal()
  }

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Repeat Settings"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />

          <ScrollView style={[s.modalOuterContainer]} showsVerticalScrollIndicator={false}>
            <View style={{ width: '100%' }}>
              <View style={s.flexContainer}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Repeat Every:</Text>
                <View style={{ width: '70%' }}>
                  <TextInput
                    editable={true}
                    style={[s.inputStyle]}
                    maxLength={365}
                    defaultValue={repeatEvery}
                    placeholder={'2'}
                    // value={repeatEvery}
                    onChangeText={setRepeatEvery}
                    keyboardType={'numeric'}
                    required
                  />
                </View>
              </View>
              {errorMessages.repeatEvery !== '' && (
                <View style={s.flexContainer}>
                  <Text style={{ fontSize: 16, fontWeight: '600' }}></Text>
                  <Text style={{ fontSize: 12, color: colors.RED_NORMAL, width: '70%' }}>
                    {errorMessages.repeatEvery}
                  </Text>
                </View>
              )}
              <View style={s.flexContainer}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}></Text>
                <CSelectWithLabel
                  label=""
                  onPress={() =>
                    showRepeatOptions ? setShowRepeatOptions(false) : setShowRepeatOptions(true)
                  }
                  selectText={
                    selectedReapeatOption.id != -1
                      ? capitalizeFirstLetter(selectedReapeatOption.name)
                      : 'Select'
                  }
                  showLabel={false}
                  errorMessage={errorMessages.priority}
                  showErrorMessage={errorMessages.priority !== ''}
                  containerStyle={{ marginVertical: 0, marginTop: 10, width: '70%' }}
                />
              </View>
              {showRepeatOptions && renderRepeatOptions()}
              {selectedReapeatOption.id == 2 && renderWeekDays()}
              <View
                style={{
                  marginTop: 16,
                  paddingVertical: 16,
                  borderTopColor: colors.SEC_BG,
                  borderTopWidth: 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Ends:</Text>
                <View style={{ marginTop: 0 }}>{renderEndOptions()}</View>
              </View>
            </View>
          </ScrollView>
          <CButtonInput label="Save" onPress={setValues} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalOuterContainer: {
    flex: 1,
    // padding: 16,
    marginBottom: 24,
    paddingVertical: 16,
  },
  modalInnerContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },
  outerContainer: {
    flex: 1,
    // borderWidth: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
    paddingBottom: 16,
  },
  inputStyle: {
    backgroundColor: colors.START_BG,
    color: colors.HOME_TEXT,
    padding: 8,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '500',
    width: '100%',
    // backgroundColor:'red'
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },

  repeatOptionsContainer: {
    backgroundColor: colors.PRIM_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 10,
  },

  repeatOptionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 16,
  },

  weekDaysContainerParent: {
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.SEC_BG,
  },

  weekDaysItem: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.SEC_BG,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.NORMAL,
  },

  weekDayText: {
    color: colors.NORMAL,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    fontWeight: '600',
  },
})
