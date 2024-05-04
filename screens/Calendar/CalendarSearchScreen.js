import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import { stateAndNavigationDestination } from '../../assets/constants/calendar-filters'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import FilterIcon from '../../assets/svg/filter.svg'
import LocationIcon from '../../assets/svg/location.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import ListingCompletion from '../../components/Completion/ListingCompletion'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import HideKeyboard from '../../components/common/HideKeyboard'
import CalendarFilterModal from '../../components/modals/CalendarFilterModal'
import useDelayedSearch from '../../hooks/useDelayedSearch'
import useFilters from '../../hooks/useFilters'
import { setCurrentIssue, setCurrentMilestone, setCurrentProject, setCurrentTask, setNavigationFrom } from '../../store/slices/navigation'
import { getAllShoowTypesArray } from '../../utils/Array'
import { objectToArray } from '../../utils/Strings'
import { dateFormatter, generateInitialRange, generateNewRange, generateNewRangeBackwards, getDateTime, getDayOnly, getYearMonthDayDateFromDateObj, jsCoreDateCreator } from '../../utils/Timer'


const CalendarSearchScreen = ({ navigation, route }) => {
  const type = route?.params?.type
  const year = route?.params?.year
  const { search, setSearch, delayedSearch } = useDelayedSearch()
  let today = getDateTime(new Date())
  today = today.split(' ')[0]
  const [selected, setSelected] = useState(route?.params?.date ? route?.params?.date : today)
  const flatListRef = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const forwardRange = useRef('')
  const backwardRange = useRef('')
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

  useEffect(() => {
    const { range: initialRange, startDate, endDate } = generateInitialRange(selected)
    const yearMonth = initialRange.split(',')[0]
    const range = `${yearMonth}-${startDate},${yearMonth}-${endDate}`

    let body = {
      type: 'week',
      value: range,
    }
    const showTypes = getAllShoowTypesArray()

    if (delayedSearch) {
      body['search'] = delayedSearch
    }
    body = { ...body, ...showTypes, ...filteredBody }

    setLoading(true)
    api.calendar
      .getCalendar(body)
      .then((res) => {
        let result = res.data
        forwardRange.current = initialRange
        const dateArr = objectToArray(result)
        setData(dateArr)
      })
      .catch((err) => {
        //console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [delayedSearch, filteredBody])

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


    const showTypes = getAllShoowTypesArray()
    body = { ...body, ...showTypes }

    if (delayedSearch) {
      body['search'] = delayedSearch
    }
    body = { ...body, ...filteredBody }

    return api.calendar
      .getCalendar(body)
      .then((res) => {
        if (type == 'forwards') {
          forwardRange.current = newRange
        } else {
          backwardRange.current = newRange
        }
        let result = res.data
        const dateArr = objectToArray(result)
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


  const ElementCardsContainer = ({ item, index }) => {
    //console.log({ item })
    for (let key in item) {
      const formatedDate = dateFormatter(
        jsCoreDateCreator(key)
      )
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
          getYearMonthDayDateFromDateObj(
            jsCoreDateCreator(key),
            true,
            false
          )
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

          {item[key].length > 0 ? (
            (
              item[key].map((item, index) => {
                return <ElementCard item={item} key={index} />

              })
            )

          ) :
            <BlankElement item={item} key={index} />
          }
        </View>
      )
    }
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
      dispatch(setNavigationFrom('CalendarSearch'))
      navigation.navigate(navigationDestination, { id: item.id })

    }
  }

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
          {item?.start_date?.split('T')[1]?.slice(0, 5)} - {item?.end_date?.split('T')[1]?.slice(0, 5)}
        </Text>
        {!item?.repeat && <ListingCompletion
          style={{ height: 6 }}
          status={item?.stage}
          progressData={{ completion: item?.progress?.completion, is_can_completion: false }}
          type={'issue'}
          id={1}
        />}
      </TouchableOpacity>
    )
  }

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


  return (
    <HideKeyboard>
      <SafeAreaView style={[g.safeAreaStyleWithPrimBG]}>

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
          setSearch={setSearch}
          search={search}
        />

        {/* Header with icon */}
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.title3, s.textColor]}>Calendar Search</CText>

          <View style={s.buttonGroup}>

            <TouchableOpacity onPress={() => setOpenFilterModal(true)} style={{ marginTop: 3 }}>
              <FilterIcon fill={colors.ICON_BG} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Header with icon */}

        {/* Tabs */}
        <View style={{ marginTop: 10, paddingHorizontal: 16 }}>

          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            filterIcon={false}
            searchIcon={true}
            isGSearch={true}
            onPress={() => setSearch('')}
            style={{ marginTop: 0 }}
          />
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

        <View style={[s.yearContainer]}>
          {
            loading ? <ActivityIndicator size="large" color={colors.PRIMARY} /> :
              data.length > 0 ?
                <FlatList
                  data={data}
                  renderItem={ElementCardsContainer}
                  keyExtractor={(item) => {
                    for (let key in item) return key
                  }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ zIndex: 100 }}
                  ref={flatListRef}
                  onScrollToIndexFailed={(error) => {
                    //console.log(error)
                  }}
                  // onEndReachedThreshold={1}
                  // onStartReachedThreshold={1}
                  onEndReached={() => handleFetchAgain('forwards')}
                  // onStartReached={() => handleFetchAgain('backwards')}
                  // show={show}
                  // onScroll={scrollHandler}
                  bounces={false}
                  style={{ zIndex: 100, width: '100%' }}
                />
                :
                <Text>No Data Found!</Text>
          }
        </View>
      </SafeAreaView>
    </HideKeyboard>
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

  yearContainer: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    marginBottom: 56,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 16,
    width: '100%'
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

  cards: {
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
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

export default CalendarSearchScreen
