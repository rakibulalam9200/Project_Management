import React, { useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { createNativeWrapper } from 'react-native-gesture-handler'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'

import CrossIcon from '../../assets/svg/cross.svg'
import FileIcon from '../../assets/svg/File.svg'
import GripIcon from '../../assets/svg/grip.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CSearchInput from '../../components/common/CSearchInput'
import CSettingsModal from '../../components/modals/CSettingModal'
import NotesFilterModal from '../../components/modals/NotesFilterModal'
import { setCurrentProject } from '../../store/slices/navigation'
import { setNormal } from '../../store/slices/tab'
import CustomStatusBar from '../../components/common/CustomStatusBar'

export default function ProjectNoteScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const refreshControlRef = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [projects, setProjects] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)
  let refetch = route.params ? route.params.refetch : null

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const ProjectNoteCard = ({ item, drag, isActive, index }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [checked, setChecked] = useState(false)
    return (
      <View style={g.containerBetween}>
        {draggable && (
          <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
            <GripIcon />
          </TouchableOpacity>
        )}
        <View style={[s.cardContainer, g.containerBetween]}>
          <View style={[{ flex: 1 }]}>
            <TouchableOpacity
              style={s.cardRowBetween}
              onPress={() => {
                dispatch(setCurrentProject(item))
                navigation.navigate('Notes', {
                  id: item.id,
                  name: item.name,
                })
              }}
            >
              <IconWrap onPress={() => {}} outputRange={iconWrapColors}>
                <FileIcon />
              </IconWrap>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // backgroundColor:"yellow"
                }}
              >
                <Text style={[s.cardTitle, { flex: 6 }]}>{item?.name}</Text>
                <Text style={[s.cardTitle, { textAlign: 'right', paddingRight: 16 }]}>
                  {item?.notes_count}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  const AndroidRefreshControl = createNativeWrapper(RefreshControl, {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  })

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetFilters = () => {
    setSelected([])
  }

  const resetUsers = () => {
    setUsers([])
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      allData: true,
      withCount: ['notes'],
    }
    if (query != '') {
      body['search'] = query
    }
    api.project
      .getAllProjects(body)
      .then((res) => {
        //console.log(res, '------------------')
        setProjects(res)
      })
      .catch((err) => {
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, refetch, query])

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
     <CustomStatusBar barStyle="dark-content" backgroundColor={colors.CONTAINER_BG} />
      <CSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        // onFilter={() => }
        // onReOrder={() => setDraggable((prev) => !prev)}
      />
      <NotesFilterModal showFilterModal={showFilterModal} setShowFilterModal={setShowFilterModal} />
      <View style={[g.listingOuterContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>Notes</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity onPress={() => {}} style={[s.buttonGroupBtn, { marginRight: 10 }]}>
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // setShowSettingsModal(true)
                }}
                style={s.buttonGroupBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>

          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            searchIcon={true}
            isGSearch={true}
            onPress={() => {
              setSearch('')
            }}
          />

          {/* <TouchableOpacity style={[g.containerBetween, s.filters]} onPress={toggleFilters}>
            <Text style={s.filterText}>Filters</Text>
            {showFilters ? <DownIcon /> : <UpIcon />}
          </TouchableOpacity> */}
          {/* {showFilters && (
            <View>
              <View style={s.filterContainer}>
                {users.map((user) => {
                  return (
                    <View style={[s.userItemContainer]}>
                      <Text style={s.userItemTextDark}>{user.name}</Text>
                    </View>
                  )
                })}
                {users.length > 0 && (
                  <TouchableOpacity onPress={resetUsers}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.filterContainer}>
                {selected.map((filter) => {
                  return (
                    <View style={[s.userItemContainer, { backgroundColor: filter.color }]}>
                      <Text style={s.userItemText}>{filter.label}</Text>
                    </View>
                  )
                })}
                {selected.length > 0 && (
                  <TouchableOpacity onPress={resetFilters}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )} */}
        </View>
        {!loading && projects.length == 0 && (
          <Text style={{ paddingHorizontal: 16, textAlign: 'center' }}>No Projects to show.</Text>
        )}
        {/* {loading && <ActivityIndicator size="large" color={colors.NORMAL} />} */}
        {loading && (
          <View
            style={{
              flex: 1,
              zIndex: 200,
              height: '100%',
              width: '100%',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color={colors.HOVER} />
          </View>
        )}
        {!loading && (
          <DraggableFlatList
            showsVerticalScrollIndicator={false}
            data={projects}
            onDragBegin={() => {}}
            onDragEnd={({ data }) => {
              setProjects(data)
            }}
            keyExtractor={(item, index) => index}
            renderItem={(props) => <ProjectNoteCard {...props} />}
            // style={{ paddingBottom: 100 }}
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              paddingBottom: 60,
            }}
          />
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    // backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
  },
  outerPadding: {
    paddingHorizontal: 16,

    width: '100%',
  },
  filters: {
    width: '100%',
    padding: 10,
  },
  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
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
  userItemText: {
    color: colors.WHITE,
  },
  userItemTextDark: {
    color: colors.HOME_TEXT,
  },
  textColor: {
    color: colors.NORMAL,
  },
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
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 20,
    borderRadius: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  searchIcon: {
    padding: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  containerGrip: {
    padding: 10,
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E2FF',
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 20,
    padding: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // paddingHorizontal:8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#001D52',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardLevel: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#F2F6FF',
    color: '#E9203B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  containerRight: {
    position: 'relative',
    // left: 42,
    flexDirection: 'row',
  },
  containerRightDrag: {
    position: 'relative',
    left: 2,
    flexDirection: 'row',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon3: {
    position: 'relative',
    left: -48,
  },
  overLapIcon2: {
    position: 'relative',
    left: -72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  project: {
    fontSize: 14,
    color: '#9CA2AB',
    marginRight: 5,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 14,
    color: '#001D52',
    marginRight: 5,
    fontWeight: '500',
  },
})
