import { useIsFocused } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList as RNFlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { CalendarList, LocaleConfig } from 'react-native-calendars'
import { PanGestureHandler } from 'react-native-gesture-handler'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import { stateAndNavigationDestination } from '../../assets/constants/calendar-filters'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import { default as ArrowDownIcon, default as DownIcon } from '../../assets/svg/arrow-down.svg'
import { default as ArrowUpIcon, default as UpIcon } from '../../assets/svg/arrow-up.svg'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import LocationIcon from '../../assets/svg/location.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SearchIcon from '../../assets/svg/search-small.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import ListingCompletion from '../../components/Completion/ListingCompletion'
import CCalendarTopTab from '../../components/common/CCalendarTopTab'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import CalendarFilterModal from '../../components/modals/CalendarFilterModal'
import CalendarMenuModal from '../../components/modals/CalendarMenuModal'
import HomeMultiMenuModal from '../../components/modals/HomeMultiMenuModal'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import useFilters from '../../hooks/useFilters'
import {
  setCurrentEvent,
  setCurrentIssue,
  setCurrentMilestone,
  setCurrentProject,
  setCurrentTask,
  setNavigationFrom,
} from '../../store/slices/navigation'
import { getAllShoowTypesArray, getShowTypesArray } from '../../utils/Array'
import { padWithZero } from '../../utils/Strings'
import {
  dateFormatter,
  generateInitialRange,
  generateNewRange,
  generateNewRangeBackwards,
  getDateRangeArrayFromRange,
  getDateTime,
  getDateWithZeros,
  getDayOnly,
  getSingleMonth,
  getWeekDates,
  getYearMonthDayDateFromDateObj,
  jsCoreDateCreator,
} from '../../utils/Timer'

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DayView = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  // const [monthName, setMonthName] = useState('')
  const [monthName, setMonthName] = useState(getYearMonthDayDateFromDateObj(new Date()))
  const { search, setSearch, delayedSearch } = useDelayedSearch('')
  const [showMultiMenu, setShowMultiMenu] = useState(false)
  const [current, setCurrent] = useState(
    route?.params?.date ? route?.params?.date : getSingleMonth(new Date())
  )
  const [collapsedWeekDates, setCollapsedWeekDates] = useState(
    getWeekDates(route?.params?.date ? new Date(route?.params?.date) : new Date())
  )
  const [collapseCalendar, setCollapseCalendar] = useState(false)
  let today = getDateTime(new Date())
  today = today.split(' ')[0]
  const [selected, setSelected] = useState(route?.params?.date ? route?.params?.date : today)
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [data, setData] = useState([])
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const [groupBy, setGroupBy] = useState(false)
  const [allCollapsed, setAllCollapsed] = useState(true)
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const ty = useSharedValue(0)
  const flatListRef = useRef(null)
  const dragBeginOffset = useRef(null)
  const dispatch = useDispatch()
  const currentDateInView = useRef(selected)
  const isFocused = useIsFocused()
  const dayListRef = useRef()
  const [activeIndex, setActiveIndex] = useState(0)
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { waitForInteraction: true, viewAreaCoveragePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }) => {
        if (viewableItems.length > 0) {
          let item = viewableItems[0]
          currentDateInView.current = item.key
          setActiveIndex(item.index)
          dayListRef.current?.scrollToIndex({
            animated: true,
            index: item.index,
            viewPosition: 0.5,
          })
        }
      },
    },
  ])
  const dayListViewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { waitForInteraction: true, viewAreaCoveragePercentThreshold: 100 },
      onViewableItemsChanged: ({ viewableItems }) => {
        if (viewableItems.length > 0) {
          let item = viewableItems[0]
          dayListRef.current?.scrollToIndex({
            animated: true,
            index: item.index,
            viewPosition: 0.5,
          })
        }
      },
    },
  ])

  const {
    showFilters,
    setShowFilters,
    expandFilters,
    setExpandFilters,
    selectedMembers,
    setSelectedMembers,
    selectedProject,
    setSelectedProject,
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

  const [range, setRange] = useState()
  const forwardRange = useRef('')
  const backwardRange = useRef('')
  const [loading, setLoading] = useState(false)
  const [types, setTypes] = useState(['All'])

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
    dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    today: 'Today',
  }
  LocaleConfig.defaultLocale = 'fr'

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }

  const handleConfirm = (date) => {
    setMonthName(getYearMonthDayDateFromDateObj(date))
    setCurrent(getSingleMonth(date))
    setSelected(getSingleMonth(date))
    hideDatePicker()
  }

  const navigateTabs = (tab) => {
    if (tab === 'Year') {
      navigation.replace('YearView')
    } else if (tab === 'Month') {
      navigation.replace('MonthView')
    } else if (tab === 'Day') {
      setCollapseCalendar(false)
    } else if (tab == 'Week') {
      navigation.replace('WeekView')
    }
  }

  const navigateTo = (type) => {
    setShowMultiMenu(false)
    dispatch(setNavigationFrom('day'))
    let params = {}
    if (currentDateInView.current) {
      params['start_date'] = currentDateInView.current
      params['end_date'] = currentDateInView.current
    }

    navigation.navigate(type, params)
  }

  const navigateToDetails = (item) => {
    let state = item?.state
    if (!state && item?.repeat) {
      state = 'Event'
    }
    console.log(state)

    switch (state) {
      case 'Project':
        dispatch(setCurrentProject(item))
      case 'Task':
        dispatch(setCurrentTask(item))
      case 'Issue':
        dispatch(setCurrentIssue(item))
      case 'Milestone':
        dispatch(setCurrentMilestone(item))
      case 'Event':
        dispatch(setCurrentEvent(item))
      //console.log({ item })
    }

    const navigationDestination = stateAndNavigationDestination[state]

    if (navigationDestination) {
      dispatch(setNavigationFrom('day'))
      navigation.navigate(navigationDestination, { id: item.id })
    }
  }

  useEffect(() => {
    // //console.log({ types })

    if (!refresh) {
      const { range: initialRange, startDate, endDate } = generateInitialRange(selected)

      const yearMonth = initialRange.split(',')[0]
      const range = `${yearMonth}-${startDate},${yearMonth}-${endDate}`
      setLoading(true)
      // console.log("Getting calander", range);

      // setRange(initialRange)
      let body = {
        type: 'week',
        value: range,
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
      //console.log({ body })
      api.calendar
        .getCalendar(body)
        .then((res) => {
          let dateArr = getDateRangeArrayFromRange(startDate, endDate, initialRange)
          forwardRange.current = initialRange
          backwardRange.current = initialRange
          let data = res.data
          for (let i = 0; i < dateArr.length; i++) {
            dateArr[i] = data[dateArr[i]]
              ? { [dateArr[i]]: data[dateArr[i]] }
              : { [dateArr[i]]: [] }
          }
          setData(dateArr)
        })
        .catch((err) => {
          //console.log(err)
        })
        .finally(() => {
          setLoading(false)
          setRefresh(true)
        })
    }
  }, [selected, groupBy, delayedSearch, filteredBody, refresh, isFocused, types])

  useEffect(() => {
    setRefresh(false)
  }, [isFocused, types, filteredBody])
  const formatFebruaryDateForLeapYear = (date) => {
    const year = date.split('-')[0]
    if (year % 4 === 0) {
      return date.replace('-2,22-28', '-2,22-29')
    }
    return date
  }
  const handleFetchAgain = (type = 'forwards') => {
    let fetchMoreFunc = type == 'forwards' ? generateNewRange : generateNewRangeBackwards
    let range =
      type == 'forwards'
        ? formatFebruaryDateForLeapYear(forwardRange.current)
        : formatFebruaryDateForLeapYear(backwardRange.current)

    let { newRange, startDate, endDate } = fetchMoreFunc(range)
    const yearMonth = newRange.split(',')[0]
    const latestRange = `${yearMonth}-${startDate},${yearMonth}-${endDate}`
    let body = {
      type: 'week',
      value: latestRange,
    }

    if (types.includes('All')) {
      const showTypes = getAllShoowTypesArray()
      body = { ...body, ...showTypes }
    } else {
      const showTypes = getShowTypesArray(types)
      body = { ...body, ...showTypes }
    }

    // const { newRange, startDate, endDate } = generateNewRange(range)
    // let body = {
    //   type: 'week',
    //   value: newRange,
    // }
    if (delayedSearch) {
      body['search'] = delayedSearch
    }
    body = { ...body, ...filteredBody }
    return api.calendar
      .getCalendar(body)
      .then((res) => {
        let dateArr = getDateRangeArrayFromRange(startDate, endDate, newRange)
        if (type == 'forwards') {
          forwardRange.current = newRange
        } else {
          backwardRange.current = newRange
        }
        let resData = res.data
        for (let i = 0; i < dateArr.length; i++) {
          dateArr[i] = resData[dateArr[i]]
            ? { [dateArr[i]]: resData[dateArr[i]] }
            : { [dateArr[i]]: [] }
        }
        let sortedData = []
        if (type == 'forwards') {
          sortedData = [...data, ...dateArr]
        } else if (type == 'backwards') {
          sortedData = [...dateArr, ...data]
        }

        setData(sortedData)
      })
      .catch((err) => {
        //console.log(err)
      })
  }
  // console.log(data);
  const goToDayListView = useCallback((idx) => {
    if (idx != undefined) {
      flatListRef.current?.scrollToIndex({
        animated: true,
        viewPosition: 0.5,
        index: idx,
      })
    } else {
      //console.log('no Indexc')
    }
  }, [])

  const ElementCardsContainer = ({ item, index }) => {
    for (let key in item) {
      const formatedDate = dateFormatter(jsCoreDateCreator(key))
      let dateText = formatedDate

      const day = formatedDate.split(' ')[1]

      const today = parseInt(dateFormatter(new Date()).split(' ')[1])
      const todayFormatted = dateFormatter(new Date())
      if (dateText == todayFormatted) {
        dateText = 'Today'
      } else {
        dateText =
          getDayOnly(jsCoreDateCreator(key)) +
          ', ' +
          getYearMonthDayDateFromDateObj(jsCoreDateCreator(key), true, false)
      }
      return (
        <View
          key={key}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout
          }}
        >
          <View
            style={[
              s.dateHourContainer,
              { backgroundColor: dateText == 'Today' ? '#246BFD' : '#D6E2FF' },
            ]}
          >
            <Text style={{ color: dateText == 'Today' ? colors.WHITE : colors.BLACK }}>
              {dateText}
            </Text>
          </View>

          {item[key].length == 0 ? (
            <BlankElement item={item} key={index} />
          ) : (
            item[key].map((item, index) => {
              return groupBy ? (
                <ProjectCard project={item} key={item.id} />
              ) : (
                <ElementCard item={item} key={index} />
              )
            })
          )}
        </View>
      )
    }
  }

  const DayCardContainer = ({ item, index }) => {
    for (let key in item) {
      const formatedDate = jsCoreDateCreator(key)
      let weekDay = weekdays[formatedDate.getDay()]
      return (
        <View key={key + '11'} style={s.dayCardContainer}>
          <Text style={s.weekdaysStyle}>{weekDay}</Text>
          <TouchableOpacity onPress={() => goToDayListView(index)}>
            <Text style={[s.dateStyle, index == activeIndex && s.selectedDateStyle]}>
              {padWithZero(formatedDate.getDate())}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }
  const ProjectCard = ({ project }) => {
    const [collapse, setCollapse] = useState(false)

    useEffect(() => {
      setCollapse(allCollapsed)
    }, [allCollapsed])
    return (
      <>
        <View style={s.projectCard}>
          <Text style={s.projectName}>{project.name}</Text>
          <IconWrap onPress={() => setCollapse((prev) => !prev)}>
            {collapse ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </IconWrap>
        </View>
        {!collapse &&
          project?.tasks?.map((task) => {
            return <ElementCard item={task} key={task.id} />
          })}
      </>
    )
  }

  //Element Cards

  const ElementCard = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[s.cards, { backgroundColor: item?.repeat ? item?.calendar?.color : colors.WHITE }]}
        key={index}
        onPress={() => navigateToDetails(item)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '500' }}>{item.name}</Text>
          <LocationIcon fill={colors.NORMAL} />
        </View>
        <Text>
          {item?.start_date?.split('T')[1]?.slice(0, 5)} -{' '}
          {item?.end_date?.split('T')[1]?.slice(0, 5)}
        </Text>
        {!item?.repeat && (
          <ListingCompletion
            style={{ height: 6 }}
            status={item?.stage}
            progressData={{ completion: item?.progress?.completion, is_can_completion: false }}
            type={'issue'}
            id={1}
          />
        )}
      </TouchableOpacity>
    )
  }
  //Element Cards end

  // Blank Element
  const BlankElement = ({ item, index }) => {
    return (
      <View
        key={index}
        style={[
          s.cards,
          {
            backgroundColor: colors.PRIM_BG,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: colors.GREY }}>No Task</Text>
      </View>
    )
  }

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (event) => {},
    onEnd: (event) => {
      if (event.translationY < -5) {
        runOnJS(setCollapseCalendar)(true)
      }
      if (event.translationY > 5) {
        runOnJS(setCollapseCalendar)(false)
      }
      ty.value = 0
    },
    onActive: (event) => {
      let y = event.translationY
      let value = Math.min(10, Math.max(-10, y))
      ty.value = value
    },
  })

  const barStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: ty.value,
        },
      ],
    }
  })

  const handleFilterModalOpen = () => {
    setOpenSettingsModal(false)
    setOpenFilterModal(true)
  }

  return (
    <SafeAreaView style={[g.safeAreaStyleWithPrimBG]}>
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode={'date'}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

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
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        setShowParentFilters={setShowFilters}
      />

      <View style={{ flex: 1 }}>
        {/* Header with icon */}
        <View style={s.headerContainer}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Home')
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>

            <CText style={[g.title3, s.textColor]}>{monthName.split(',')[0]}</CText>
          </View>
          <View style={s.buttonGroup}>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                setRefresh(false)
                setCollapseCalendar(false)
                setCurrent(getSingleMonth(new Date()))
                setMonthName(getYearMonthDayDateFromDateObj(new Date()))
                setCollapsedWeekDates(getWeekDates(jsCoreDateCreator(today)))
                setSelected(today)
                // flatListRef.current?.scrollToOffset({
                //   offset: 2,
                //   animated: true,
                // })
              }}
            >
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

        {/* Tabs */}

        <View style={{ paddingHorizontal: 20, marginTop: 10, zIndex: 1 }}>
          <CCalendarTopTab active={'Day'} onPress={navigateTabs} />
          {/* <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            filterIcon={true}
            style={{ marginBottom: 0 }}
            onPress={() => setOpenFilterModal(true)}
          /> */}
        </View>

        {/* Filters view */}
        {showFilters && (
          <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}
            >
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

        {!showFilters && (
          <View style={{}}>
            {!collapseCalendar ? (
              <CalendarList
                // Customize the appearance of the calendar
                style={[
                  {
                    // borderWidth: 1,
                    // borderColor: 'gray',
                    height: 300,
                    // fontSize: 10,
                    marginTop: -40,
                    width: '100%',
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 20,
                  },
                ]}
                onVisibleMonthsChange={(e) => {
                  let changingDate = new Date(e[0].dateString)
                  let v = getDateWithZeros(changingDate)
                  setCurrent(getSingleMonth(changingDate))
                  setMonthName(getYearMonthDayDateFromDateObj(changingDate))
                  setSelected(v)
                  setRefresh(false)
                  setActiveIndex(0)
                }}
                theme={{
                  backgroundColor: colors.PRIM_BG,
                  calendarBackground: colors.PRIM_BG,
                  monthTextColor: colors.PRIM_BG,
                  'stylesheet.calendar.header': {
                    dayTextAtIndex0: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex1: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex2: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex3: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex4: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex5: {
                      color: '#246BFD',
                    },
                    dayTextAtIndex6: {
                      color: '#246BFD',
                    },
                  },
                }}
                horizontal={true}
                // Specify the current date
                current={current}
                key={current}
                // hideArrows={true}
                // hideExtraDays={true}
                // showScrollIndicator={true}
                // hideDayNames={true}
                // Callback that gets called when the user selects a day
                onDayPress={(day) => {}}
                dayComponent={({ date, state }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCollapseCalendar(true)
                        setCollapsedWeekDates(getWeekDates(jsCoreDateCreator(date.dateString)))

                        setMonthName(
                          getYearMonthDayDateFromDateObj(jsCoreDateCreator(date.dateString))
                        )

                        setCurrent(date.dateString)
                        setSelected(date.dateString)
                        flatListRef.current?.scrollToOffset({ animated: true, offset: 1 })
                        setRefresh(false)
                        setActiveIndex(0)
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 16,
                          color:
                            selected == date.dateString
                              ? 'white'
                              : state == 'disabled'
                              ? 'black'
                              : 'black',
                          backgroundColor: selected == date.dateString ? '#246BFD' : colors.PRIM_BG,
                          borderRadius: selected == date.dateString ? 12 : 0,
                          overflow: 'hidden',
                          paddingHorizontal: selected == date.dateString ? 5 : 0,
                          paddingVertical: selected == date.dateString ? 3 : 0,
                        }}
                      >
                        {date.day}
                      </Text>
                    </TouchableOpacity>
                  )
                }}
                pagingEnabled
              />
            ) : (
              // <View style={{ marginVertical: 15 }}>
              //   <View style={s.collapseCalendarContainer}>
              //     {weekdays.map((item, index) => (
              //       <Text key={index} style={s.weekdaysStyle}>
              //         {item}
              //       </Text>
              //     ))}
              //   </View>

              //   <View style={s.collapseCalendarContainer}>
              //     {collapsedWeekDates?.map((item, index) => (
              //       <TouchableOpacity
              //         style={s.dateConatinerStyle}
              //         onPress={() => {
              //           setSelected(item.toISOString().split('T')[0])
              //           flatListRef.current?.scrollToOffset({ animated: true, offset: 1 })
              //         }}
              //         key={index}
              //       >
              //         <Text
              //           key={index}
              //           style={[
              //             s.dateStyle,
              //             selected.split('-')[2] == getDateOnly(item) && s.selectedDateStyle,
              //           ]}
              //         >
              //           {getDateOnly(item)}
              //         </Text>
              //       </TouchableOpacity>
              //     ))}
              //   </View>
              // </View>
              <View>
                <RNFlatList
                  data={data}
                  renderItem={DayCardContainer}
                  keyExtractor={(item) => {
                    for (let key in item) return key
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={32}
                  onScrollEndDrag={(e) => {}}
                  onScroll={(event) => {
                    // let y = event.nativeEvent.contentOffset.y
                    // if (collapseCalendar) {
                    //   if (y <= 0) {
                    //     setCollapseCalendar(false)
                    //   }
                    // }
                  }}
                  ref={dayListRef}
                  // show={show}
                  // onScroll={scrollHandler}
                  contentContainerStyle={s.dayListContainer}
                  onScrollToIndexFailed={(error) => {
                    //console.log(error)
                  }}
                />
              </View>
            )}

            <PanGestureHandler onGestureEvent={panGestureEvent}>
              <Animated.View
                style={[s.calendarBottomBar, barStyle]}
                onClick={() => setCollapseCalendar((prev) => !prev)}
              >
                <Animated.View style={[s.bottombar]}></Animated.View>
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}

        <View style={{ paddingBottom: 90, flex: 1, height: 100 }}>
          {loading && (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.NORMAL} />
          )}
          {types.length > 0 && (
            <View
              style={{
                marginTop: 10,
                marginBottom: 20,
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
          {refresh && (
            <FlatList
              data={data}
              renderItem={ElementCardsContainer}
              keyExtractor={(item) => {
                for (let key in item) return key
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, zIndex: 100 }}
              onScrollBeginDrag={(e) => {
                dragBeginOffset.current = e.nativeEvent.contentOffset.y
              }}
              onScrollEndDrag={(e) => {
                let dragEndOffset = e.nativeEvent.contentOffset.y
                let differenceBetweenDrags = dragEndOffset - dragBeginOffset.current
                if (differenceBetweenDrags >= 10) {
                  if (!collapseCalendar) {
                    setCollapseCalendar(true)
                  }
                }
              }}
              viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
              ref={flatListRef}
              onScrollToIndexFailed={(error) => {
                //console.log(error)
              }}
              onEndReachedThreshold={1}
              onStartReachedThreshold={1}
              onEndReached={() => handleFetchAgain('forwards')}
              onStartReached={() => handleFetchAgain('backwards')}
              // show={show}
              // onScroll={scrollHandler}
              bounces={false}
            />
          )}
        </View>

        <View>
          <HomeMultiMenuModal
            openModal={showMultiMenu}
            setOpenModal={setShowMultiMenu}
            action={navigateTo}
            menutype={'Calendar'}
          />
        </View>
        <CFloatingPlusIcon onPress={() => setShowMultiMenu(true)} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    paddingHorizontal: 23,

    // height: 80,

    // marginHorizontal: 20
    zIndex: 100,
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
  dayListContainer: {
    paddingHorizontal: 24,
  },
  dayCardContainer: {
    margin: 16,
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
    marginBottom: 10,
  },

  projectCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.SECONDARY,
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
  },
  projectName: {
    fontSize: 16,
    color: colors.NORMAL,
  },
  calendarBottomBar: {
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    marginVertical: 8,
    backgroundColor: colors.PRIM_BG,
  },

  bottombar: {
    height: 10,
    width: 200,
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 10,
    // marginBottom: 5
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    // padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    color: '#888',
    fontSize: 16,
  },
  collapseCalendarContainer: {
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdaysStyle: {
    color: '#246BFD',
    // borderWidth: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  dateConatinerStyle: {
    width: '13%',
    // // borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  dateStyle: {
    // color: 'black',
    // width: '13%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
    alignSelf: 'center',
  },
  selectedDateStyle: {
    color: 'white',
    backgroundColor: '#246BFD',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  hiddenCalendar: {
    // height: 0,
    position: 'absolute',
    top: -1000,
  },

  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  dateHourContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 1
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
  // filter view styles end
})

export default DayView
