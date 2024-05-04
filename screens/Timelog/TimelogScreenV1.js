import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image, SafeAreaView, StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import TimelogFilterModal from '../../components/modals/TimelogFilterModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage } from '../../utils/Errors'
import { objectToArray } from '../../utils/Strings'
import { dateFormatter, jsCoreDateCreator } from '../../utils/Timer'

import DownIcon from '../../assets/svg/arrow-down.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'

const TimelogsScreen = ({ navigation, route }) => {
  const { refresh } = route.params || { refresh: false }

  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  const [timelogs, setTimelogs] = useState([])
  const [filteredTimelogs, setFilteredTimelogs] = useState([])
  const [searchedTimelogs, setSearchedTimelogs] = useState([])
  const [loading, setLoading] = useState(false)

  const multipleSelect = useRef({})
  const [selectable, setSelectable] = useState(false)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)

  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [selectedProject, setSelectedProject] = useState({ id: -1, name: '' })

  const [selectedMilestone, setSelectedMilestone] = useState({ id: -1, name: '' })
  const [selectedTask, setSelectedTask] = useState({ id: -1, name: '' })
  const [selectedDate, setSelectedDate] = useState(null)

  const [showFilters, setShowFilters] = useState(false)
  const [hideFilters, setHideFilters] = useState(false)
  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlus())
      // dispatch(setPlusDestination('TimelogAdd'))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  // Fetch timelogs
  useEffect(() => {
    // //console.log(new Date().getDate())
    const body = {
      sort_by: 'start_date',
    }

    if (query != '') {
      body['search'] = query
      selectedProject.id != -1 && (body['project_id'] = selectedProject.id)
      selectedTask.id != -1 && (body['task_id'] = selectedTask.id)
      selectedAuthors.length > 0 && (body['user_ids'] = selectedAuthors[0].id)
      selectedDate != null && (body['start_date'] = selectedDate)
      setLoading(true)
      api.timelog
        .getTimelog(body)
        .then((res) => {
          // //console.log('Timelogs loaded searching ->>>>', res.data)
          setSearchedTimelogs(res.data)
        })
        .catch((err) => {})
        .finally(() => setLoading(false))
    } else {
      body['groupByDate'] = true
      setLoading(true)
      api.timelog
        .getTimelog(body)
        .then((res) => {
          //console.log('Timelogs loaded', res.data)
          setTimelogs(objectToArray(res.data))
          // //console.log('Timelogs loaded', objectToArray(res.data))
          setLoading(false)
        })
        .catch((err) => {
          setLoading(false)
          //console.log(err.response.data)
          let errMsg = ''
          try {
            errMsg = getErrorMessage(err)
          } catch (err) {
            errMsg = 'An error occurred. Please try again later'
          }
          Alert.alert(errMsg)
        })
    }
  }, [
    isFocused,
    query,
    refetch,
    showFilters,
    selectedAuthors,
    selectedProject,
    selectedTask,
    selectedDate,
  ])

  // Filter Timelogs
  useEffect(() => {
    const body = {
      sort_by: 'start_date',
    }
    selectedProject.id != -1 && (body['project_id'] = selectedProject.id)
    selectedTask.id != -1 && (body['task_id'] = selectedTask.id)
    selectedAuthors.length > 0 && (body['user_ids'] = selectedAuthors[0].id)
    selectedDate != null && (body['start_date'] = selectedDate)
    // selectedDate != null && (body['end_date'] = selectedDate)

    if (
      selectedAuthors.length > 0 ||
      selectedProject.id != -1 ||
      selectedTask.id != -1 ||
      selectedDate != null
    ) {
      setLoading(true)
      api.timelog
        .getTimelog(body)
        .then((res) => {
          // //console.log('Timelogs loaded by filtering', res.data)
          setFilteredTimelogs(res.data)
        })
        .catch((err) => {})
        .finally(() => setLoading(false))
    }
  }, [showFilters, selectedAuthors, selectedProject, selectedTask, selectedDate])

  // Reset Filters
  const resetUsers = () => {
    setSelectedAuthors([])
  }

  const resetProject = () => {
    setSelectedProject({ id: -1, name: '' })
  }

  const resetMilestone = () => {
    setSelectedMilestone({ id: -1, name: '' })
  }

  const resetTask = () => {
    setSelectedMilestone({ id: -1, name: '' })
    setSelectedTask({ id: -1, name: '' })
  }

  const resetDate = () => {
    setSelectedDate(null)
  }

  useEffect(() => {
    // //console.log('Selected Authors', selectedAuthors.length, selectedProject.id, selectedMilestone.id, selectedTask.id)
    if (
      selectedAuthors.length == 0 &&
      selectedProject.id == -1 &&
      selectedTask.id == -1 &&
      selectedDate == null
    ) {
      setShowFilters(false)
      multipleSelect.current = {}
    } else {
      setShowFilters(true)
    }
  }, [selectedAuthors, selectedProject, selectedMilestone, selectedTask, selectedDate])

  // Timelog to show by default grouped
  const GroupedTimelog = ({ item, drag }) => {
    for (let key in item) {
      const date = key.split(' ')[0].toString().split('-').reverse().join('.')
      const formatedDate = dateFormatter(jsCoreDateCreator(key))
      let dateText = formatedDate

      const day = formatedDate.split(' ')[1]
      const today = parseInt(dateFormatter(new Date()).split(' ')[1])

      if (day == today) {
        dateText = 'Today'
      } else if (day == today - 1) {
        dateText = 'Yesterday'
      }

      // const totalHours = item[key].reduce((acc, curr) => {
      //   return acc + parseFloat(curr.number_of_hour.replace(':', '.') * 1)
      // }, 0)

      return (
        <View key={key}>
          <View style={[s.dateHourContainer]}>
            <Text style={{ color: colors.SECONDARY }}>{dateText}</Text>
            {/* <Text style={{ fontWeight: '600' }}>{totalHours.toFixed(2)} Hrs</Text> */}
          </View>
          {/* {item[key].map((item, index) => (
            <TimelogCard item={item} key={index} />
          ))} */}
        </View>
      )
    }
  }

  // Timelog card
  const TimelogCard = ({ item, drag }) => {
    const date = item?.start_date.split(' ')[0].toString().split('-').reverse().join('.')

    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item?.id]) {
        return true
      } else {
        return false
      }
    })

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item?.id] = multipleSelect.current[item?.id] ? undefined : true
    }

    return (
      <TouchableWithoutFeedback
        onLongPress={() => {
          setSelectable((prev) => !prev)
        }}
        onPress={() => {
          navigation.navigate('TimelogDetail', { id: item?.id })
        }}
      // key={index}
      >
        <View style={[s.timelogCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
            <View>
              <Image source={{ uri: item?.user_members[0]?.image }} style={[s.avatar]} />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={[s.stageText]}>{item?.stage}</Text>
              <Text style={{ fontWeight: '500', marginBottom: 4 }}>{item?.project?.name}</Text>
              <Text style={{ fontWeight: '400', marginBottom: 4 }}>{item?.task?.name}</Text>
              <Text style={{ color: colors.PRIM_CAPTION }}>{date}</Text>
            </View>
          </View>
          <View style={{ marginEnd: 15, justifyContent: 'space-between' }}>
            <View style={{ alignSelf: 'flex-end' }}>
              {selectable && (
                <CCheckbox
                  showLabel={false}
                  checked={checked}
                  setChecked={setChecked}
                  onChecked={toggleDeleteMultiple}
                />
              )}
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{item?.number_of_hour}</Text>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.SECONDARY }}>
                $20.00
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.PRIM_BG }}>
      <View style={s.container}>
        <TimelogFilterModal
          showFilterModal={showFiltersModal}
          setShowFilterModal={setShowFiltersModal}
          selectedUsers={selectedAuthors}
          setSelectedUsers={setSelectedAuthors}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          setShowParentFilters={setShowFilters}
          selectedMilestone={selectedMilestone}
          setSelectedMilestone={setSelectedMilestone}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Heading with icons */}
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          // outputRange={TouchableOpacityColors}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.title3, s.textColor]}>Timelogs</CText>
          <View style={s.buttonGroup}>
            <TouchableOpacity onPress={() => { }} style={s.buttonGroupBtn}>
              <SortIcon fill={colors.NORMAL} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowFiltersModal(true)
              }}
              // outputRange={TouchableOpacityColors}
              style={s.buttonGroupBtn}
            >
              <MoreIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Heading with icons */}

        <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
        {selectable && (
          <TouchableOpacity
            onPress={() => {
              setSelectable(false)
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
        )}

        {showFilters && (
          <View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}
            >
              <Text style={s.filterText}>Filters</Text>
              {!hideFilters ? (
                <TouchableOpacity
                  onPress={() => {
                    setHideFilters(true)
                  }}
                >
                  <UpIcon />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setHideFilters(false)
                  }}
                >
                  <DownIcon />
                </TouchableOpacity>
              )}
            </View>

            {!hideFilters && (
              <View style={[s.filterBoxesContainer]}>
                <View style={s.filterContainer}>
                  {selectedAuthors.length > 0 &&
                    selectedAuthors.map((user, id) => {
                      return (
                        <View style={[s.userItemContainer]} key={id}>
                          <Text style={s.userItemTextDark}>
                            {user?.name ? user?.name : user?.email.split('@')[0]}
                          </Text>
                        </View>
                      )
                    })}
                  {selectedAuthors.length > 0 && (
                    <TouchableOpacity onPress={resetUsers}>
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={s.filterContainer}>
                  {selectedProject.id !== -1 && (
                    <View style={[s.userItemContainer]}>
                      <Text style={s.userItemTextDark}>{selectedProject?.name}</Text>
                    </View>
                  )}
                  {selectedProject.id !== -1 && (
                    <TouchableOpacity onPress={resetProject}>
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={s.filterContainer}>
                  {selectedTask.id !== -1 && (
                    <View style={[s.userItemContainer]}>
                      <Text style={s.userItemTextDark}>{selectedTask?.name}</Text>
                    </View>
                  )}
                  {selectedTask.id !== -1 && (
                    <TouchableOpacity onPress={resetTask}>
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={s.filterContainer}>
                  {selectedDate && (
                    <View style={[s.userItemContainer]}>
                      <Text style={s.userItemTextDark}>{dateFormatter(selectedDate)}</Text>
                    </View>
                  )}
                  {selectedDate && (
                    <TouchableOpacity onPress={resetDate}>
                      <CrossIcon />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={[s.listContainer]}>
          {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
          {!loading && !showFilters && !query != '' && (
            <DraggableFlatList
              showsVerticalScrollIndicator={false}
              // data={timelogs}
              onDragBegin={() => { }}
              onDragEnd={({ data }) => {
                setTimelogs(data)
              }}
              keyExtractor={(item) => item?.id}
              renderItem={GroupedTimelog}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                // paddingHorizontal: 10,
                marginBottom: 80,
              }}
            />
          )}
          {!loading && showFilters && !query && (
            <DraggableFlatList
              showsVerticalScrollIndicator={false}
              // data={filteredTimelogs}
              onDragBegin={() => { }}
              onDragEnd={({ data }) => {
                setFilteredTimelogs(data)
              }}
              keyExtractor={(item) => item.id}
              renderItem={TimelogCard}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                // paddingHorizontal: 10,
                marginBottom: 80,
              }}
            />
          )}
          {!loading && query != '' && (
            <DraggableFlatList
              showsVerticalScrollIndicator={false}
              // data={searchedTimelogs}
              onDragBegin={() => { }}
              onDragEnd={({ data }) => {
                setSearchedTimelogs(data)
              }}
              keyExtractor={(item) => item.id}
              renderItem={TimelogCard}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                // paddingHorizontal: 10,
                marginBottom: 80,
              }}
            />
          )}
        </View>

        {!loading && <CFloatingPlusIcon onPress={() => navigation.navigate('TimelogAdd')} />}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, flex: 1, backgroundColor: colors.PRIM_BG },
  // Header with icons
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    // backgroundColor:"green"
    // marginBottom: 16,
    // marginTop: 24,
  },
  textColor: {
    color: 'black',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },

  // Header with icons

  listContainer: {
    flex: 1,
  },
  outerPadding: {
    paddingHorizontal: 16,
    width: '100%',
  },
  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
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
  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  dateHourContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D6E2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  timelogCard: {
    flexDirection: 'row',
    borderWidth: 1,
    backgroundColor: colors.WHITE,
    borderColor: colors.MID_BG,
    borderRadius: 10,
    paddingVertical: 15,
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  stageText: {
    color: colors.WHITE,
    backgroundColor: colors.PRIM_CAPTION,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
})

export default TimelogsScreen
