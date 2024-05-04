import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CText from '../common/CText'
import SettingsIcon from '../../assets/svg/settings.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import FilterIcon from '../../assets/svg/filter.svg'
import IconWrap from '../common/IconWrap'
import CheckEmptyIcon from '../../assets/svg/unchecked-normal.svg'
import CheckedIcon from '../../assets/svg/checked-normal.svg'
import { useDispatch, useSelector } from 'react-redux'
import { refreshCalendarList } from '../../store/slices/user'
import CFloatingPlusIcon from '../common/CFloatingPlusIcon'
import DotsIcon from '../../assets/svg/dots-black.svg'
import { showTypes } from '../../assets/constants/calendar-filters'
import api from '../../api/api'
import { getErrorMessage } from '../../utils/Errors'
const CalendarMenuModal = ({ visibility, setVisibility, onPressFilter, navigation, setTypes }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [checkedShowTypes, setCheckedShowTypes] = useState([...showTypes])
  const [checkedCalendars, setCheckedCalendars] = useState([])
  const [calendars, setCalendars] = useState([])
  const { calendarList } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const isFocused = navigation.isFocused()

  const closeModal = () => {
    const foundAll = checkedShowTypes.find((i) => i.value == 'All')
    if (foundAll) {
      setTypes(['All'])
    } else {
      setTypes(checkedShowTypes.map((i) => i.value))
    }
    setVisibility(false)
  }

  const checkShowTypeIsSelectedOrNot = (item) => {
    const found = checkedShowTypes.find((i) => i.value == item.value)
    return found ? true : false
  }

  const toggleShowType = (item) => {
    if (checkShowTypeIsSelectedOrNot(item)) {
      let checkeds = [...checkedShowTypes]
      const found = checkeds.find((i) => i.value == 'All')
      if (found) {
        checkeds = checkeds.filter((i) => i.value != 'All')
      }
      setCheckedShowTypes(checkeds.filter((i) => i.value != item.value))
    } else {
      if (item.value == 'All') {
        setCheckedShowTypes(showTypes)
      } else {
        setCheckedShowTypes([...checkedShowTypes, item])
      }
    }
  }

  const checkCalendarIsSelectedOrNot = (item) => {
    return checkedCalendars.includes(item.id)
  }

  const toggleSelctCalendar = (item) => {
    makeDefaultCalendar(item.id)
    if (checkCalendarIsSelectedOrNot(item)) {
      setCheckedCalendars(checkedCalendars.filter((i) => i != item.id))
    } else {
      setCheckedCalendars([...checkedCalendars, item.id])
    }
  }


  const makeDefaultCalendar = (id) => {
    //console.log(id, 'Calendar id')
    api.calendar.makeDefaultCalendar(id)
      .then((res) => {
        //console.log(res, 'Calendar make default response')
        dispatch(refreshCalendarList())
      })
      .catch((err) => {
        //console.log(err, 'Calendar mkae default error')
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later.'
        }
        Alert.alert(errMsg)
      })
  }

  useEffect(() => {
    if (calendarList.length > 0) {
      setCalendars(calendarList)
      setCheckedCalendars(calendarList.filter((i) => i.is_default).map((i) => i.id))
    } else {
      dispatch(refreshCalendarList())
    }
  }, [isFocused, calendarList])

  const naviagateToAddScreen = () => {
    closeModal()
    navigation.navigate('AddOrEditCalendar')
  }

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView
        style={[g.safeAreaStyleWithPrimBG, { marginTop: 0, paddingTop: 0 }]}
      >
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  closeModal()
                }}
              >
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[styles.textColor]}>Menu</CText>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={() => { }} style={styles.buttonGroupBtn}>
                <SettingsIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1 }}>
              <View style={styles.filter}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Filter</Text>
                <IconWrap outputRange={iconWrapColors} onPress={onPressFilter}>
                  <FilterIcon />
                </IconWrap>
              </View>

              <View
                style={{
                  paddingVertical: 16,
                  borderBottomColor: colors.SEC_BG,
                  borderBottomWidth: 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Show just:</Text>
                <View
                  style={{
                    marginTop: 10,
                    borderRadius: 8,
                    backgroundColor: colors.WHITE,
                    padding: 16,
                  }}
                >
                  {showTypes.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.showTypesItems,
                        { borderBottomWidth: index == showTypes.length - 1 ? 0 : 1 },
                      ]}
                      onPress={() => toggleShowType(item)}
                    >
                      {checkShowTypeIsSelectedOrNot(item) ? <CheckedIcon /> : <CheckEmptyIcon />}
                      <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ paddingVertical: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Calendars:</Text>
                <View
                  style={{
                    marginTop: 10,
                    borderRadius: 8,
                    backgroundColor: colors.WHITE,
                    padding: 16,
                  }}
                >
                  {calendars.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.calendarItems,
                        { borderBottomWidth: index == calendars.length - 1 ? 0 : 1 },
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                        onPress={() => toggleSelctCalendar(item)}
                      >
                        {checkCalendarIsSelectedOrNot(item) ? <CheckedIcon /> : <CheckEmptyIcon />}
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          closeModal()
                          navigation.navigate('AddOrEditCalendar', { id: item.id })
                        }}
                      >
                        <DotsIcon />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <CFloatingPlusIcon onPress={naviagateToAddScreen} style={{ bottom: -10 }} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    // marginTop: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  textColor: {
    color: 'black',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
  },

  filter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
  },

  showTypesItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomColor: colors.SEC_BG,
  },

  calendarItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: colors.SEC_BG,
  },
})

export default CalendarMenuModal
