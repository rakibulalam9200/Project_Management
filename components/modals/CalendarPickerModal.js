import React, { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'

import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'

import api from '../../api/api'
import CheckedIcon from '../../assets/svg/cbchecked.svg'
import CheckedEmptyIcon from '../../assets/svg/cbempty.svg'
import RadioEmptyIcon from '../../assets/svg/radio-empty.svg'
import RadioFilledIcon from '../../assets/svg/radio-filled.svg'
import CHeaderWithBack from '../../components/common/CHeaderWithBack'
import CSearchInput from '../../components/common/CSearchInput'
import { useDispatch, useSelector } from 'react-redux'
import { refreshCalendarList } from '../../store/slices/user'
// import { SafeAreaView } from 'react-native-safe-area-context'

export default function CalendarPickerModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selected,
  setSelected,
  isMultiplePicker,
}) {
  const [calendars, setCalendars] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const { calendarList } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const checkIfSelected = (calendar) => {
    if (isMultiplePicker) {
      const found = selected.find((singleCalendar) => singleCalendar.id == calendar.id)
      return found
    } else {
      return selected?.id == calendar?.id
    }
  }

  const toggleSelected = (calendar) => {
    if (isMultiplePicker) {
      if (checkIfSelected(calendar)) {
        setSelected((prev) => {
          const copy = [...prev]
          return copy.filter((singleCalendar) => calendar.id != singleCalendar.id)
        })
      } else {
        setSelected((prev) => [...prev, calendar])
      }
    } else {
      if (calendar.id == selected.id) setSelected({ id: -1 })
      else {
        setSelected(calendar)
        closeModal()
      }
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }


  useEffect(() => {
    if (calendarList.length > 0) {
      setCalendars(calendarList)
    } else {
      dispatch(refreshCalendarList())
    }

  }, [calendarList])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.outerContainer}>
          <CHeaderWithBack
            onPress={closeModal}
            title="Select Project"
            labelStyle={{ color: colors.HOME_TEXT, fontSize: 16 }}
            iconWrapColors={[colors.WHITE, colors.MID_BG, colors.END_BG]}
            containerStyle={{ marginTop: 0 }}
          />
          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <ScrollView style={[s.modalOuterContainer]} showsVerticalScrollIndicator={false}>
            {calendars.map((calendar, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={[g.containerBetween, s.modalInnerContainer]}
                  onPress={() => toggleSelected(calendar)}
                >
                  <Text>
                    {calendar.name.length > 30 ? calendar.name.slice(0, 30) + '...' : calendar.name}
                  </Text>

                  {isMultiplePicker ? (
                    checkIfSelected(calendar) ? (
                      <CheckedIcon />
                    ) : (
                      <CheckedEmptyIcon />
                    )
                  ) : checkIfSelected(calendar) ? (
                    <RadioFilledIcon />
                  ) : (
                    <RadioEmptyIcon />
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
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
    backgroundColor: colors.CONTAINER_BG,
  },
})
