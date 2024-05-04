import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native'
import { FlatList } from 'react-native'
import CText from '../../components/common/CText'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import colors from '../../assets/constants/colors'
import MoreIcon from '../../assets/svg/more.svg'
import SearchIcon from '../../assets/svg/search-small.svg'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import g from '../../assets/styles/global'
import {
  getAllMonthsOfYear,
  getDateTime,
  getMonth,
  getMonthAllDays,
  getThreeYears,
  jsCoreDateCreator,
} from '../../utils/Timer'
import CSearchInput from '../../components/common/CSearchInput'
import CCalendarTopTab from '../../components/common/CCalendarTopTab'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures'

const weekDays = [
  {
    name: 'Sunday',
    short: 'S',
    number: 0,
  },
  {
    name: 'Monday',
    short: 'M',
    number: 1,
  },
  {
    name: 'Tuesday',
    short: 'T',
    number: 2,
  },
  {
    name: 'Wednesday',
    short: 'W',
    number: 3,
  },
  {
    name: 'Thursday',
    short: 'T',
    number: 4,
  },
  {
    name: 'Friday',
    short: 'F',
    number: 5,
  },
  {
    name: 'Saturday',
    short: 'S',
    number: 6,
  },
]

const TODAY = new Date()
const CURRENT_MONTH = getMonth(TODAY)
const CURRENT_YEAR = TODAY.getFullYear()
const CURRENT_DAY = TODAY.getDate()

const YearView = ({ navigation }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [year, setYear] = useState(new Date().getFullYear())
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  // const months = getAllMonths()
  const [months, setMonths] = useState(getAllMonthsOfYear(new Date()))
  let today = getDateTime(new Date())
  today = today.split(' ')[0]
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [years, setYears] = useState(getThreeYears(new Date()))
  const [refreshing, setRefreshing] = useState(false)
  const FlatListHeight = useRef(0)
  const FlatListWidth = useRef(0)
  const flatListRef = useRef(null)

  const navigateTabs = (tab) => {
    if (tab === 'Year') {
    } else if (tab === 'Month') {
      navigation.navigate('MonthView')
    } else if (tab === 'Day') {
      navigation.navigate('DayView')
    } else if (tab == 'Week') {
      navigation.navigate('WeekView')
    }
  }

  // MonthRender component
  const MonthRender = ({ item }) => {
    const date = jsCoreDateCreator(item)
    const month = getMonth(date)
    const yearName = date.getFullYear()
    let monthDays = getMonthAllDays(date, item)
    let runningMonth = month == CURRENT_MONTH && yearName == CURRENT_YEAR

    return (
      <View style={s.monthContainer}>
        <TouchableOpacity
          onPress={() => {
            const monthINDEX = date.getMonth()
            navigation.navigate('MonthView', { year: yearName, month: monthINDEX + 1 })
          }}
        >
          <Text style={s.monthTitle}>
            {month}
          </Text>
          <View style={s.weekDaysContainer}>
            {weekDays.map((day, index) => {
              return (
                <View
                  key={index}
                  style={{
                    marginBottom: 10,
                    alignItems: 'center',
                    borderColor: 'red',
                    width: '14%',
                  }}
                >
                  <Text style={s.weekDaysText}>{day.short}</Text>
                </View>
              )
            })}
          </View>
          <View style={s.monthDaysContainer}>
            {monthDays.map((day, index) => {
              let runningDay = runningMonth && day == CURRENT_DAY
              return (
                <View
                  key={index}
                  style={{
                    width: '14%',
                    marginBottom: 2,
                    borderColor: 'green',
                    alignItems: 'center',
                  }}
                >
                  <Text style={[s.dayStyle, runningDay && s.dayActiveStyle]}>{day}</Text>
                </View>
              )
            })}
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  const MemoRender = React.memo(MonthRender)
  //Year Render
  const YearRender = ({ item }) => {
    const allMonthsOfYear = getAllMonthsOfYear(null, parseInt(item))

    return (
      <View>
        {/* <Text style={{ color: colors.SECONDARY, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>{year}</Text> */}
        <FlatList
          data={allMonthsOfYear}
          renderItem={(props) => <MemoRender {...props} />}
          keyExtractor={(item, index) => item}
          numColumns={3}
          initialNumToRender={12}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => <Text style={{ color: colors.SECONDARY, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>{year}</Text>}
          contentContainerStyle={{ backgroundColor: colors.PRIM_BG }}
          onEndReachedThreshold={0.5}
        />
      </View>
    )
  }
  return (
    <>
      <SafeAreaView style={[g.safeAreaStyleWithPrimBG]}>
        {/* Header with icon */}
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Home')
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          {/* <CText style={[g.title3, s.textColor]}>{year}</CText> */}

          <View style={s.buttonGroup}>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                setYear(new Date().getFullYear())
              }}
            >
              <CalendarIcon fill={colors.ICON_BG} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CalendarSearch', { type: 'year', year: year })} style={{ marginTop: 3 }}>
              <SearchIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Header with icon */}

        {/* Tabs */}
        <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
          <CCalendarTopTab active={'Year'} onPress={navigateTabs} />

          {/* <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            filterIcon={false}
          /> */}
        </View>

        <View style={s.yearContainer}>
          <Swipeable
            containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
            onSwipeableWillOpen={(direction) => {
              if (direction == 'left') {
                setYear(year - 1)
              } else {
                setYear(year + 1)
              }
            }}
            leftThreshold={10}
            rightThreshold={10}
            friction={1}
            renderLeftActions={() => <View style={{ width: 1 }}></View>}
            renderRightActions={() => <View style={{ width: 1 }}></View>}
          >
            <YearRender item={year} />
          </Swipeable>
        </View>
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  textColor: {
    color: 'black',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  yearContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 56,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 16
  },

  monthContainer: {
    width: '33.3%',
    height: 144,
    marginBottom: 2,
    marginRight: 2,
    padding: 2,
    // backgroundColor: colors.WHITE,
    borderRadius: 5,
  },

  month: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    backgroundColor: '#ffffff',
  },
  monthTitle: {
    // textAlign: 'center',
    color: colors.BLACK,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '700'
  },

  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDaysContainer: { flexDirection: 'row', borderColor: 'blue' },
  weekContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDaysText: { color: colors.BLACK, fontSize: 10, fontWeight: '600' },
  dateText: {
    fontSize: 16,
    padding: 10,
    textAlign: 'center',
    color: colors.BLACK,
    // fontWeight: '700'
  },
  selectedDateText: {
    backgroundColor: 'blue',
    color: 'white',
  },

  monthDaysContainer: { flexDirection: 'row', borderColor: 'purple', flexWrap: 'wrap' },
  dayStyle: { fontSize: 9, fontWeight: '600' },
  dayActiveStyle: {
    padding: 1,
    backgroundColor: colors.ICON_BG,
    color: colors.WHITE,
    borderRadius: 10,
    fontWeight: 'bold',
  },
})

export default YearView
