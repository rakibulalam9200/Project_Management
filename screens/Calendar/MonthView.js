import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CalendarList, LocaleConfig } from 'react-native-calendars'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import { FilterColors } from '../../assets/constants/calendar-filters'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SearchIcon from '../../assets/svg/search-small.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import TaskCompletion from '../../components/Completion/TaskCompletion'
import CCalendarTopTab from '../../components/common/CCalendarTopTab'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CalendarFilterModal from '../../components/modals/CalendarFilterModal'
import CalendarMenuModal from '../../components/modals/CalendarMenuModal'
import HomeMultiMenuModal from '../../components/modals/HomeMultiMenuModal'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import useFilters from '../../hooks/useFilters'
import { setNavigationFrom } from '../../store/slices/navigation'
import { getAllShoowTypesArray, getShowTypesArray } from '../../utils/Array'
import { padWithZero } from '../../utils/Strings'
import { getAllMonths, getDateTime } from '../../utils/Timer'

const RANGE = 24
const { height, width } = Dimensions.get('window')

const MonthView = ({ navigation, route }) => {
  const flatListRef = useRef(null)
  let paramYearMonth = route.params?.year
    ? route.params.year + '-' + padWithZero(route.params.month)
    : undefined
  let paramDate = paramYearMonth ? paramYearMonth + '-01' : undefined
  const { search, setSearch, delayedSearch } = useDelayedSearch('')
  const [showMultiMenu, setShowMultiMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCalendarList, setShowCalendarList] = useState(false)
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const [types, setTypes] = useState(['All'])
  const dispatch = useDispatch()

  let today = getDateTime(new Date())
  today = today.split(' ')[0]

  const [currentMonth, setCurrentMonth] = useState(
    route?.params
      ? getAllMonths(null, route.params.year)[route.params.month]
      : getAllMonths(new Date())[today.split('-')[1] - 1]
  )
  const [currentMonthArray, setCurrentMonthArray] = useState([
    route?.params
      ? getAllMonths(null, route.params.year)[route.params.month]
      : getAllMonths(new Date())[today.split('-')[1] - 1],
  ])

  const [currentMonthYear, setCurrentMonthYear] = useState(
    paramYearMonth ? paramYearMonth : today.slice(0, today.lastIndexOf('-'))
  )
  const [currentDate, setCurrentDate] = useState(paramDate ? paramDate : today)
  const [tasks, setTasks] = useState({})
  const isFocused = useIsFocused()

  const [openFilterModal, setOpenFilterModal] = useState(false)

  const {
    showFilters,
    setShowFilters,
    expandFilters,
    setExpandFilters,
    selectedMembers,
    setSelectedMembers,
    selectedProject,
    setSelectedProject,
    // selectedMilestone,
    // setSelectedMilestone,
    selectedDate,
    setSelectedDate,
    selectedStatuses,
    setSelectedStatuses,
    selectedPriorities,
    setSelectedPriorities,
    resetDate,
    resetMilestone,
    resetUsers,
    resetAllUsers,
    resetProjects,
    resetAllProjects,
    resetAllStatuses,
    resetStatuses,
    resetAllPriorities,
    resetPriorities,
    filteredBody,
    filterCount,
  } = useFilters()

  LocaleConfig.locales['fr'] = {
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthNamesShort: [
      'Jan.',
      'Feb.',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul.',
      'Aug',
      'Sept.',
      'Oct.',
      'Nov.',
      'Dec.',
    ],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today',
  }
  LocaleConfig.defaultLocale = 'fr'

  const navigateTabs = (tab) => {
    if (tab === 'Year') {
      navigation.replace('YearView')
    } else if (tab === 'Month') {
    } else if (tab === 'Day') {
      navigation.replace('DayView')
    } else if (tab == 'Week') {
      navigation.replace('WeekView')
    }
  }

  const navigateTo = (type) => {
    setShowMultiMenu(false)
    dispatch(setNavigationFrom('month'))
    navigation.navigate(type, { start_date: today, end_date: today })
  }
  const handleConfirm = (date) => {
    setCurrentMonth(getAllMonths(date)[getDateTime(date).split('-')[1] - 1])
  }

  useEffect(() => {
    setLoading(true)
    let body = {
      type: 'month',
      value: currentMonthYear,
    }
    if (types.includes('All')) {
      const showTypes = getAllShoowTypesArray()
      body = { ...body, ...showTypes }
    } else {
      const showTypes = getShowTypesArray(types)
      body = { ...body, ...showTypes }
    }

    if (delayedSearch) {
      body['search'] = delayedSearch
    }
    body = { ...body, ...filteredBody }
    //console.log(body, 'body')

    api.calendar
      .getCalendar(body)
      .then((res) => {
        // const tasksArray = objectToArray(res.data)
        setTasks({ ...tasks, ...res.data })
      })
      .catch((err) => {
        //console.log(err.response.data, 'err')
      })
      .finally(() => {
        setLoading(false)
        if (!showCalendarList) {
          setShowCalendarList(true)
        }
      })
  }, [currentMonthYear, isFocused, delayedSearch, filteredBody, types])

  const resetCalendarList = () => {
    setCurrentDate(today)
    setShowCalendarList(false)
    setTimeout(() => {
      setShowCalendarList(true)
    }, 500)
  }

  // const CalendarRender = ({ item, index }) => {
  //   return (
  //     <Calendar
  //       // Customize the appearance of the calendar
  //       style={{
  //         width: '100%',
  //         borderBottomRightRadius: 20,
  //         borderBottomLeftRadius: 20,
  //       }}
  //       theme={{
  //         backgroundColor: '#e6edfc',
  //         calendarBackground: '#e6edfc',
  //         // monthTextColor: '#e6edfc',
  //         monthTextColor: colors.BLACK,
  //         'stylesheet.calendar.header': {
  //           dayTextAtIndex0: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex1: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex2: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex3: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex4: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex5: {
  //             color: colors.BLACK,
  //           },
  //           dayTextAtIndex6: {
  //             color: colors.BLACK,
  //           },
  //           week: {
  //             // marginTop: 5,
  //             marginBottom: 7,
  //             flexDirection: 'row',
  //             justifyContent: 'space-evenly',
  //             borderBottomWidth: 0.4,
  //             backgroundColor: '#D6E2FF',
  //             borderTopLeftRadius: 10,
  //             borderTopRightRadius: 10,
  //             borderColor: '#DADCE0',
  //           },
  //         },
  //       }}
  //       // Specify the current date
  //       current={item.current}
  //       key={item.current}
  //       // hideArrows={true}
  //       // hideExtraDays={true}

  //       // hideDayNames={true}
  //       // Callback that gets called when the user selects a day
  //       onDayPress={(day) => {
  //         //console.log('selected day', day)
  //       }}
  //       // dayComponent={({ date, state }) => {
  //       //   let month = date.month.toString().length == 1 ? `0${date.month}` : date.month
  //       //   let day = date.day.toString().length == 1 ? `0${date.day}` : date.day
  //       //   let dateString = date.year + '-' + month + '-' + day

  //       //   return (
  //       //     <TouchableOpacity
  //       //       onPress={() => {
  //       //         navigation.navigate('DayView', { date: dateString })
  //       //         // setSelected(date.dateString)
  //       //       }}
  //       //       style={{
  //       //         borderWidth: 0.4,
  //       //         borderColor: '#DADCE0',
  //       //         height: 134,
  //       //         width: '100%',
  //       //         marginTop: -15,
  //       //         backgroundColor: today == dateString ? colors.SEC_BG : colors.WHITE,
  //       //       }}
  //       //     >
  //       //       <Text
  //       //         style={{
  //       //           textAlign: 'center',
  //       //           marginTop: 5,
  //       //           fontSize: 16,
  //       //           color: today == dateString ? '#246BFD' : state == 'disabled' ? 'black' : 'black',
  //       //           fontWeight: today == dateString ? 'bold' : 'normal',
  //       //         }}
  //       //       >
  //       //         {date.day}
  //       //       </Text>
  //       //       {tasks.map((item, index) => {
  //       //         for (let key in item) {
  //       //           if (key == dateString) {
  //       //             return (
  //       //               <View key={index}>
  //       //                 {item[key]?.slice(0, 5).map((it, idx) => {
  //       //                   return (
  //       //                     <View key={idx} style={{ marginVertical: 4, marginHorizontal: 2 }}>
  //       //                       <TaskCompletion
  //       //                         progress={it?.progress?.completion}
  //       //                         sliderTrackColor={
  //       //                           today == dateString ? colors.WHITE : colors.SEC_BG
  //       //                         }
  //       //                         sliderColor={FilterColors[it?.stage].color}
  //       //                       />
  //       //                     </View>
  //       //                   )
  //       //                 })}
  //       //                 {item[key].length > 5 && (
  //       //                   <Text style={s.moreText}>+{item[key].length - 5} More</Text>
  //       //                 )}
  //       //               </View>
  //       //             )
  //       //             // })
  //       //           }
  //       //         }
  //       //       })}
  //       //     </TouchableOpacity>
  //       //   )
  //       // }}
  //       // Mark specific dates as marked
  //     />
  //   )
  // }

  // const onEndReachedAction = () => {
  //   let lastItem = currentMonthArray[currentMonthArray.length - 1].current
  //   let year = parseInt(lastItem.split('-')[0])
  //   let prevMonth = parseInt(lastItem.split('-')[1])
  //   let month = parseInt(lastItem.split('-')[1]) < 12 ? parseInt(lastItem.split('-')[1]) + 1 : 1
  //   year = month == 1 && prevMonth != 1 ? year + 1 : year

  //   let newItem = getAllMonths(null, year)[month - 1]

  //   setCurrentMonthArray([...currentMonthArray, newItem])
  //   //console.log(currentMonthArray, 'Current Month Array')
  //   //console.log(newItem, 'New Item---')
  // }

  const handleFilterModalOpen = () => {
    setOpenSettingsModal(false)
    setOpenFilterModal(true)
  }

  return (
    <SafeAreaView style={g.safeAreaStyleWithPrimBG}>
      <CalendarMenuModal
        visibility={openSettingsModal}
        setVisibility={setOpenSettingsModal}
        onPressFilter={handleFilterModalOpen}
        navigation={navigation}
        setTypes={setTypes}
      />

      <CalendarFilterModal
        showFilterModal={openFilterModal}
        setShowFilterModal={setOpenFilterModal}
        selectedUsers={selectedMembers}
        setSelectedUsers={setSelectedMembers}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        // selectedMilestone={selectedMilestone}
        // setSelectedMilestone={setSelectedMilestone}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        setShowParentFilters={setShowFilters}
      />

      {/* Header with icon */}
      <View style={s.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Home')
          }}
        >
          <BackArrow fill={colors.NORMAL} />
        </TouchableOpacity>

        {/* <CText style={[g.title3, s.textColor]}>
          {currentMonth.current.split('-')[0] + ' ' + currentMonth?.name}
        </CText> */}
        <View style={s.buttonGroup}>
          <TouchableOpacity style={{}} onPress={resetCalendarList}>
            <CalendarIcon fill={colors.ICON_BG} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CalendarSearch')}
            style={{ marginTop: 3 }}
          >
            <SearchIcon fill={colors.NORMAL} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOpenSettingsModal(true)}>
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Header with icon */}

      <View style={{ paddingHorizontal: 20, marginVertical: 10, zIndex: 1 }}>
        <CCalendarTopTab active={'Month'} onPress={navigateTabs} />
        {/* <CSearchInput
          placeholder="Search"
          value={search}
          setValue={setSearch}
          filterIcon={true}
          style={{ marginBottom: 0 }}
          onPress={() => setOpenFilterModal(true)}
        /> */}
      </View>

      {types.length > 0 && (
        <View
          style={{
            marginVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {types.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  padding: 5,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  backgroundColor: colors.WHITE,
                }}
              >
                <Text style={{ color: colors.BLACK }}>{item == 'All' ? item : item + 's'}</Text>
              </View>
            )
          })}
        </View>
      )}
      {/* Filters view */}
      {showFilters && (
        <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={s.filterText}>Filters ({filterCount})</Text>
            {!expandFilters ? (
              <TouchableOpacity
                onPress={() => {
                  setExpandFilters(true)
                }}
              >
                <UpIcon />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setExpandFilters(false)
                }}
              >
                <DownIcon />
              </TouchableOpacity>
            )}
          </View>

          {!expandFilters && (
            <View style={[s.filterBoxesContainer]}>
              <View style={s.filterContainer}>
                {selectedMembers.length > 0 &&
                  selectedMembers.map((user, id) => {
                    return (
                      <View
                        style={[
                          s.userItemContainer,
                          { flexDirection: 'row', alignItems: 'center' },
                        ]}
                        key={id}
                      >
                        <Text style={s.userItemTextDark}>
                          {user?.name.length > 30 ? user?.name.slice(0, 30) : user?.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => resetUsers(user)}
                          style={{ marginLeft: 4 }}
                        >
                          <SmallCrossIcon fill={colors.SECONDARY} />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                {selectedMembers.length > 0 && (
                  <TouchableOpacity onPress={resetAllUsers} style={{ marginLeft: 8 }}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.filterContainer}>
                {selectedProject.length > 0 &&
                  selectedProject.map((project, id) => {
                    return (
                      <View
                        style={[
                          s.userItemContainer,
                          { flexDirection: 'row', alignItems: 'center' },
                        ]}
                        key={id}
                      >
                        <Text style={s.userItemTextDark}>
                          {project?.name.length > 30 ? project?.name.slice(0, 30) : project?.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => resetProjects(project)}
                          style={{ marginLeft: 4 }}
                        >
                          <SmallCrossIcon fill={colors.SECONDARY} />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                {selectedProject.length > 0 && (
                  <TouchableOpacity onPress={resetAllProjects} style={{ marginLeft: 8 }}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.filterContainer}>
                {selectedStatuses?.length > 0 &&
                  selectedStatuses?.map((status, id) => {
                    return (
                      <View
                        style={[
                          s.statusItemContainer,
                          { flexDirection: 'row', alignItems: 'center' },
                          { backgroundColor: status.color },
                        ]}
                        key={id}
                      >
                        <Text style={{ color: colors.WHITE }}>{status?.label}</Text>
                        <TouchableOpacity
                          onPress={() => resetStatuses(status)}
                          style={{ marginLeft: 4 }}
                        >
                          <SmallCrossIcon fill={colors.WHITE} />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                {selectedStatuses?.length > 0 && (
                  <TouchableOpacity onPress={resetAllStatuses}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.filterContainer}>
                {selectedPriorities.length > 0 &&
                  selectedPriorities.map((priority, id) => {
                    return (
                      <View
                        style={[
                          s.statusItemContainer,
                          { flexDirection: 'row', alignItems: 'center' },
                          { backgroundColor: priority.color },
                        ]}
                        key={id}
                      >
                        <Text style={{ color: colors.WHITE }}>{priority?.value}</Text>
                        <TouchableOpacity
                          onPress={() => resetPriorities(priority)}
                          style={{ marginLeft: 4 }}
                        >
                          <SmallCrossIcon fill={colors.WHITE} />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                {selectedPriorities.length > 0 && (
                  <TouchableOpacity onPress={resetAllPriorities}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      )}
      {/* Filters view end */}

      <View style={{ flex: 1 }}>
        {/* <FlatList
          data={currentMonthArray}
          ref={flatListRef}
          renderItem={CalendarRender}
          keyExtractor={(item, index) => item.current}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 16, marginTop: 16 }}
          onEndReached={onEndReachedAction}
        /> */}
        {showCalendarList ? (
          <CalendarList
            current={currentDate}
            pastScrollRange={RANGE}
            futureScrollRange={RANGE}
            // showSixWeeks
            onDayPress={(date) => {
              //console.log(date)
            }}
            theme={{
              backgroundColor: colors.PRIM_BG,
              calendarBackground: colors.PRIM_BG,
              // monthTextColor: '#e6edfc',
              monthTextColor: colors.SECONDARY,
              textMonthFontSize: 20,
              textMonthFontWeight: '700',

              'stylesheet.calendar.header': {
                dayTextAtIndex0: {
                  color: colors.BLACK,
                },
                dayTextAtIndex1: {
                  color: colors.BLACK,
                },
                dayTextAtIndex2: {
                  color: colors.BLACK,
                },
                dayTextAtIndex3: {
                  color: colors.BLACK,
                },
                dayTextAtIndex4: {
                  color: colors.BLACK,
                },
                dayTextAtIndex5: {
                  color: colors.BLACK,
                },
                dayTextAtIndex6: {
                  color: colors.BLACK,
                },
                week: {
                  // marginTop: 5,
                  marginBottom: 7,
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  borderBottomWidth: 0.4,
                  backgroundColor: '#D6E2FF',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderColor: '#DADCE0',
                },
              },
            }}
            displayLoadingIndicator={loading}
            onVisibleMonthsChange={(months) => {
              if (months.length > 0) {
                let date = months[0]
                setCurrentMonthYear(date.year + '-' + padWithZero(date.month))
              }
            }}
            calendarHeight={5 * 134 + 30}
            dayComponent={({ date, state }) => {
              let month = date.month.toString().length == 1 ? `0${date.month}` : date.month
              let day = date.day.toString().length == 1 ? `0${date.day}` : date.day
              let dateString = date.year + '-' + month + '-' + day

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (state != 'disabled') navigation.navigate('DayView', { date: dateString })
                    // setSelected(date.dateString)
                  }}
                  style={{
                    borderWidth: 0.4,
                    borderColor: '#DADCE0',
                    height: 134,
                    width: '100%',
                    marginTop: -15,
                    backgroundColor:
                      today == dateString
                        ? colors.SEC_BG
                        : state != 'disabled'
                        ? colors.WHITE
                        : colors.MID_BG,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 5,
                      fontSize: 16,
                      color:
                        today == dateString ? '#246BFD' : state == 'disabled' ? 'black' : 'black',
                      fontWeight: today == dateString ? 'bold' : 'normal',
                    }}
                  >
                    {date.day}
                  </Text>

                  {tasks[dateString] && (
                    <View key={dateString}>
                      {tasks[dateString]?.slice(0, 5).map((it, idx) => {
                        return (
                          <View key={idx} style={{ marginVertical: 4, marginHorizontal: 2 }}>
                            <TaskCompletion
                              progress={it?.progress?.completion}
                              sliderTrackColor={today == dateString ? colors.WHITE : colors.SEC_BG}
                              sliderColor={FilterColors[it?.stage]?.color}
                            />
                          </View>
                        )
                      })}
                      {tasks[dateString].length > 5 && (
                        <Text style={s.moreText}>+{tasks[dateString].length - 5} More</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )
            }}
            enableSwipeMonths
            hideExtraDays={false}
          />
        ) : null}
      </View>
      <View>
        <HomeMultiMenuModal
          openModal={showMultiMenu}
          setOpenModal={setShowMultiMenu}
          action={navigateTo}
          menutype={'Calendar'}
        />
      </View>
      <CFloatingPlusIcon onPress={() => setShowMultiMenu(true)} style={s.plusButton} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  plusButton: {
    bottom: Platform.OS === 'ios' && height > 670 ? 73 : 40,
  },

  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    paddingHorizontal: 23,
    // marginHorizontal: 20
  },
  textColor: {
    color: 'black',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginRight: 40
    gap: 10,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },

  month: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    backgroundColor: '#ffffff',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cards: {
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  // Filters view styles
  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterBoxesContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
  },

  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  statusItemContainer: {
    // backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  moreText: {
    fontSize: 12,
    color: colors.BLACK,
    fontWeight: '600',
    textAlign: 'center',
  },
  // filter view styles end
})

export default MonthView
