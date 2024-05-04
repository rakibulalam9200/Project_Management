import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import { stateAndNavigationDestination } from '../../assets/constants/calendar-filters'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CalendarIcon from '../../assets/svg/calendar2.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DisabledLeftArrow from '../../assets/svg/disabled-left-arrow.svg'
import DisabledRightArrow from '../../assets/svg/disabled-right-arrow.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrow from '../../assets/svg/right-arrow3.svg'
import SearchIcon from '../../assets/svg/search-small.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import CCalendarTopTab from '../../components/common/CCalendarTopTab'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import CalendarFilterModal from '../../components/modals/CalendarFilterModal'
import CalendarMenuModal from '../../components/modals/CalendarMenuModal'
import HomeMultiMenuModal from '../../components/modals/HomeMultiMenuModal'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import useFilters from '../../hooks/useFilters'
import { setCurrentIssue, setCurrentMilestone, setCurrentProject, setCurrentTask, setNavigationFrom } from '../../store/slices/navigation'
import { getAllShoowTypesArray, getShowTypesArray } from '../../utils/Array'
import {
  generateInitialRange,
  generateNewRange,
  generateNewRangeBackwards,
  getDateRangeArrayFromRange,
  getDateTime,
  getDateWithZeros,
  getDayOnly,
  getYearMonthDateRangeFromDateObj,
  getYearMonthDayDateFromDateObj,
  jsCoreDateCreator
} from '../../utils/Timer'

const WeekView = ({ navigation }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const { search, setSearch, delayedSearch } = useDelayedSearch('')
  const [refresh, setRefresh] = useState(false)
  const [showMultiMenu, setShowMultiMenu] = useState(false)
  const [openSettingsModal, setOpenSettingsModal] = useState(false)
  const [types, setTypes] = useState(['All'])
  const isFocused = useIsFocused()
  let today = getDateTime(new Date())
  today = today.split(' ')[0]
  const [monthName, setMonthName] = useState(getYearMonthDateRangeFromDateObj(new Date())[0])

  const [weekData, setWeekData] = useState([])
  const todayIndex = useRef()

  const flatListRef = useRef()
  //Filter states
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const dispatch = useDispatch()
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

  const forwardRange = useRef('')
  const backwardRange = useRef('')
  const [loading, setLoading] = useState(false)
  // Filter states end

  const navigateTabs = (tab) => {
    if (tab === 'Year') {
      navigation.replace('YearView')
    } else if (tab === 'Month') {
      navigation.replace('MonthView')
    } else if (tab === 'Day') {
      navigation.replace('DayView')
    } else if (tab == 'Week') {
    }
  }

  const navigateTo = (type) => {
    setShowMultiMenu(false)
    dispatch(setNavigationFrom('week'))
    navigation.navigate(type, {
      start_date: today,
      end_date: today,
    })
  }

  const navigateToDetails = (item) => {
    let state = item?.state
    if (!state && item?.repeat) {
      state = 'Event'
    }

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
        // dispatch(setCurrentEvent(item))
        //console.log({ item })
    }

    const navigationDestination = stateAndNavigationDestination[state]

    if (navigationDestination) {
      dispatch(setNavigationFrom('week'))
      navigation.navigate(navigationDestination, { id: item.id })

    }
  }

  const calculateTodayIndex = (data) => {
    todayIndex.current = data.findIndex((item) => {
      for (let key in item) {
        return key == today
      }
    })
  }

  const WeekCard = ({ item }) => {
    let [page, setPage] = useState(0)

    for (let key in item) {
      return (
        <View key={key} style={s.cardContainer}>
          <View style={[s.cardHeader, key == today && { backgroundColor: colors.ICON_BG }]}>
            <View>
              <Text style={{ color: key == today ? colors.WHITE : colors.BLACK }}>{getDayOnly(jsCoreDateCreator(key))}</Text>
              <Text style={{ color: key == today ? colors.WHITE : colors.BLACK }}>
                {getYearMonthDayDateFromDateObj(
                  jsCoreDateCreator(key),
                  true
                )}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconWrap
                onPress={() => {
                  if (page > 0) {
                    setPage(page - 1)
                  }
                }}
                outputRange={iconWrapColors}
                style={{ height: 25, width: 25, marginRight: 5 }}
              >
                {page == 0 ? (
                  <DisabledLeftArrow fill={colors.NORMAL} />
                ) : (
                  <BackArrow fill={colors.NORMAL} />
                )}
              </IconWrap>
              <IconWrap
                onPress={() => {
                  if (page < Math.floor(item[key].length / 5)) {
                    setPage(page + 1)
                  }
                }}
                outputRange={iconWrapColors}
                style={{ height: 25, width: 25 }}
              >
                {page >= Math.floor(item[key].length / 5) ? (
                  <DisabledRightArrow fill={colors.NORMAL} />
                ) : (
                  <RightArrow fill={colors.NORMAL} />
                )}
              </IconWrap>
            </View>
          </View>

          <ScrollView style={{ paddingHorizontal: 10, paddingVertical: 5, height: 150 }}>
            {item[key].length == 0 ? (
              <Text style={{ textAlign: 'center' }}>No Data!</Text>
            ) : (
              item[key]
                ?.slice(page * 5, Math.min(item[key].length, page * 5 + 5))
                .map((item, index) => (
                  <TouchableOpacity
                    onPress={() => navigateToDetails(item)}
                    key={index}
                    style={{ flexDirection: 'row', marginVertical: 5 }}
                  >
                    <Text style={{ width: '30%' }}>{item?.start_date?.split('T')[1]?.slice(0, 5)}</Text>
                    <Text style={{ color: colors.GREEN_NORMAL, width: '65%', textAlign: 'left', }}>
                      {' '}
                      {item?.name}
                    </Text>
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>
      )
    }
  }

  const hideDatePicker = () => {
    setDatePickerVisible(false)
  }



  useEffect(() => {
    // //console.log({ types })
    if (!refresh) {
      // //console.log('refreshing')

      const {
        range: initialRange,
        startDate,
        endDate,
      } = generateInitialRange(getDateWithZeros(new Date()))
      // //console.log({ startDate, endDate, initialRange })
      const yearMonth = initialRange.split(',')[0]
      const range = `${yearMonth}-${startDate},${yearMonth}-${endDate}`
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


      // //console.log({ initialRange })
      if (delayedSearch) {
        body['search'] = delayedSearch
      }
      body = { ...body, ...filteredBody }
      //console.log({ body })
      // return
      setLoading(true)
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
          //console.log(data, 'Week data')
          setWeekData(dateArr)
        })
        .catch((err) => {
          //console.log(err?.response)
        })
        .finally(() => {
          setLoading(false)
          setRefresh(true)
        })
    }
  }, [delayedSearch, filteredBody, refresh, isFocused, types])

  useEffect(() => {
    setRefresh(false)
  }, [isFocused, types, filteredBody])

  const handleFetchAgain = (type = 'forwards') => {
    let fetchMoreFunc = type == 'forwards' ? generateNewRange : generateNewRangeBackwards
    let range = type == 'forwards' ? forwardRange.current : backwardRange.current
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
        let data = res.data
        for (let i = 0; i < dateArr.length; i++) {
          dateArr[i] = data[dateArr[i]] ? { [dateArr[i]]: data[dateArr[i]] } : { [dateArr[i]]: [] }
        }
        let sortedData = []
        if (type == 'forwards') {
          sortedData = [...weekData, ...dateArr]
        } else if (type == 'backwards') {
          sortedData = [...dateArr, ...weekData]
        }
        //console.log(type)
        setWeekData(sortedData)
      })
      .catch((err) => {
        //console.log(err)
      })
      .finally(() => {
        if (type == 'backwards') {
          //console.log('scrolling to index')
          flatListRef.current?.scrollToIndex({
            index: 1,
            animated: true,
            viewOffset: 1,
          })
        }
      })
  }

  // Reset Filters end


  const handleFilterModalOpen = () => {
    setOpenSettingsModal(false)
    setOpenFilterModal(true)
  }

  return (
    <SafeAreaView style={[g.safeAreaStyleWithPrimBG]}>

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Home')
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <CText style={[g.title3, s.textColor]}>{monthName.split(' ')[0]}</CText>
        </View>
        <View style={s.buttonGroup}>
          <TouchableOpacity
            style={{}}
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 2,
                animated: true,
              })
              setRefresh(false)
            }}
          >
            <CalendarIcon fill={colors.ICON_BG} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('CalendarSearch')} style={{ marginTop: 3 }}>
            <SearchIcon fill={colors.NORMAL} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOpenSettingsModal(true)}>
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Header with icon */}

      {/* Tabs */}

      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <CCalendarTopTab active={'Week'} onPress={navigateTabs} />
        {/* <CSearchInput
          placeholder="Search"
          value={search}
          setValue={setSearch}
          filterIcon={true}
          style={{ marginBottom: 0 }}
          onPress={() => setOpenFilterModal(true)}
        /> */}
      </View>


      {
        types.length > 0 &&
        <View style={{ marginTop: 10, paddingHorizontal: 16, flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {
            types.map((item, index) => {
              return (
                <View key={index} style={{ padding: 5, paddingHorizontal: 10, borderRadius: 16, backgroundColor: colors.WHITE }}>
                  <Text style={{ color: colors.BLACK }}>{item == 'All' ? item : item + 's'}</Text>
                </View>
              )
            })
          }
        </View>
      }

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

      <View style={{ paddingHorizontal: 15, marginTop: 20, flex: 1 }}>
        {/* {weekData.length === 0 && <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <CText style={[g.text2, { color: colors.NORMAL }]}>No Task Found!</CText>
                </View>} */}
        {loading && (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.NORMAL} />
        )}
        {refresh && (
          <FlatList
            data={weekData}
            ref={flatListRef}
            renderItem={(props) => <WeekCard {...props} />}
            keyExtractor={(item, idx) => {
              return idx
            }}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            onStartReachedThreshold={0.1}
            onEndReached={() => handleFetchAgain('forwards')}
            onStartReached={() => {
              //console.log('start reached')
              return handleFetchAgain('backwards')
            }}
          // style={{ marginRight: 10 }}
          />
        )}
      </View>

      <View style={{ paddingBottom: 100 }}>
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

export default WeekView

const s = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 24,
    paddingHorizontal: 16,
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
  calendarBottomBar: {
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  bottombar: {
    height: 5,
    width: 100,
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 10,
    marginBottom: 15,
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

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D6E2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '49%',
    marginRight: 10,
    marginBottom: 10,
    paddingBottom: 5,
    alignSelf: 'flex-start',
    maxHeight: 250,
    // paddingHorizontal: 10,
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
