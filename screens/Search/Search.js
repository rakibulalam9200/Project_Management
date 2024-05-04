import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import CText from '../../components/common/CText'

import ArrowRight from '../../assets/svg/arrow-rigt-circle.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'

import { useIsFocused } from '@react-navigation/native'

import { FlatList, SafeAreaView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CSearchInput from '../../components/common/CSearchInput'
import DirectoryIcon from '../../components/icons/DirectoryIcon'
import DocumentIcon from '../../components/icons/DocumentIcon'
import FileIcon from '../../components/icons/FileIcon'
import IssueIcon from '../../components/icons/IssueIcon'
import ListIcon from '../../components/icons/ListIcon'
import MessageIcon from '../../components/icons/MessageIcon'
import MilestoneIcon from '../../components/icons/MilestoneIcon'
import NoteIcon from '../../components/icons/NoteIcons'
import ProjectIcon from '../../components/icons/ProjectIcons'
import TimeLogIcon from '../../components/icons/TimelogIcon'
import {
  setCurrentIssue,
  setCurrentMilestone,
  setCurrentProject,
  setCurrentTask,
  setNavigationFrom,
  setStage,
} from '../../store/slices/navigation'

const widgets = [
  { label: 'All', value: 'All' },
  { label: 'Projects', value: 'Project' },
  { label: 'Tasks', value: 'Task' },
  { label: 'Issues', value: 'Issue' },
  { label: 'Milestones', value: 'Milestone' },
  { label: 'Users', value: 'User' },
  { label: 'Files', value: 'FileManagement' },
  { label: 'Chat', value: 'Message' },
  { label: 'Lists', value: 'Todolist' },
  { label: 'Clients', value: 'Client' },
  { label: 'Notes', value: 'Note' },
]

const render_icons = (moduleName) => {
  switch (moduleName) {
    case 'Project':
      return <ProjectIcon color={colors.SECONDARY} />
      break
    case 'Task':
      return <DocumentIcon color={colors.SECONDARY} />
      break
    case 'Issue':
      return <IssueIcon color={colors.SECONDARY} />
      break
    case 'Milestone':
      return <MilestoneIcon color={colors.SECONDARY} />
      break
    case 'User':
      return <DirectoryIcon color={colors.SECONDARY} />
      break
    case 'FileManagement':
      return <FileIcon color={colors.SECONDARY} />
      break
    case 'Attachment':
      return <FileIcon color={colors.SECONDARY} />
      break
    case 'Message':
      return <MessageIcon color={colors.SECONDARY} />
      break
    case 'Opportunity':
      return <DirectoryIcon color={colors.SECONDARY} />
      break
    case 'Lead':
      return <DirectoryIcon color={colors.SECONDARY} />
      break
    case 'Todolist':
      return <ListIcon color={colors.SECONDARY} />
      break
    case 'Note':
      return <NoteIcon color={colors.SECONDARY} />
      break
    case 'Timelog':
      return <TimeLogIcon color={colors.SECONDARY} />
      break

    default:
      break
  }
}

export default function SearchScreen({ navigation, route }) {
  let refetch = route.params ? route.params.refetch : null
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const { searchNavigationFrom } = useSelector((state) => state.navigation)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activeWidget, setActiveWidget] = useState({ label: 'All', value: 'All' })
  const [searchData, setSearchData] = useState(null)
  const [viewAll, setViewAll] = useState({
    Task: false,
    Project: false,
    Issue: false,
    Milestone: false,
    User: false,
    FileManagement: false,
    Chat: false,
    Todolist: false,
    Note: false,
    Client: false,
    Lead: false,
    Opportunity: false,
  })

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          // //console.log('item pressed', item)
          setActiveWidget({ label: item?.label, value: item?.value })
        }}
      >
        <Text style={[activeWidget.label === item.label ? s.widgetCardActive : s.widgetCard]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    )
  }

  const CardItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.key === 'Project') {
            dispatch(setCurrentProject(item))
            dispatch(setStage('project'))
            dispatch(setNavigationFrom('GlobalSearch'))
            navigation.navigate('ProjectDetails', {
              id: item?.id,
            })
          } else if (item.key === 'Milestone') {
            dispatch(setCurrentMilestone(item))
            dispatch(setNavigationFrom('GlobalSearch'))
            navigation.navigate('MilestoneDetails', { id: item?.id })
          } else if (item.key === 'Task') {
            dispatch(setStage('task'))
            dispatch(setCurrentTask(item))
            dispatch(setNavigationFrom('GlobalSearch'))
            navigation.navigate('TaskDetails', {
              id: item.id,
            })
          } else if (item.key === 'Issue') {
            dispatch(setStage('issue'))
            dispatch(setCurrentIssue(item))
            dispatch(setNavigationFrom('GlobalSearch'))
            navigation.navigate('IssueDetails', {
              id: item.id,
            })
          } else if (item.key === 'Todolist') {
            dispatch(setNavigationFrom('GlobalSearch'))
            navigation.navigate('ChecklistDetails', {
              id: item.id,
            })
          } else if (item.key === 'FileManagement') {
            navigation.push('ProjectFolders', { id: item?.id })
          }
        }}
      >
        <View style={s.itemContainer}>
          <CText style={[g.normalText2, { color: colors.NORMAL }]}>
            {item?.message
              ? item?.message.length > 25
                ? item?.message.slice(0, 25) + '...'
                : item?.message
              : item?.name?.length > 25
              ? item?.name.slice(0, 25) + '...'
              : item?.name}
          </CText>
          <ArrowRight />
        </View>
        {<View style={s.horizontalLineStyle}></View>}
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    if (query !== '') {
      setLoading(true)
      let body = {
        search: query,
      }
      api.globalsearch
        .getAllSearchData(body)
        .then((res) => {
          setSearchData(res.data)
          setViewAll({
            Task: false,
            Project: false,
            Issue: false,
            Milestone: false,
            User: false,
            FileManagement: false,
            Chat: false,
            Todolist: false,
            Note: false,
            Client: false,
            Lead: false,
            Opportunity: false,
          })
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
    }
  }, [query, refetch])

  useEffect(() => {
    setSearchData(searchData)
  }, [refresh])

  return (
    <SafeAreaView style={[g.safeAreaStyle, s.safeAreaLocalStyle]}>
      <View style={[s.outerPadding, { flex: 1 }]}>
        <View>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                if (searchNavigationFrom) {
                  navigation.navigate('Home')
                } else {
                  navigation.jumpTo('Home')
                }
              }}
              outputRange={iconWrapColors}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.title3, s.textColor, { marginLeft: '30%' }]}>Search</CText>
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

          <FlatList
            horizontal
            data={widgets}
            renderItem={renderItem}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{
              marginVertical: 8,
            }}
          />
        </View>
        {loading && (
          <View style={s.itemCenterStyle}>
            <ActivityIndicator size="large" color="blue" />
          </View>
        )}
        {query === '' && !loading && (
          <View style={s.itemCenterStyle}>
            <CText style={[g.normalText]}>Nothing Found</CText>
          </View>
        )}

        {query !== '' && !loading && (
          <ScrollView
            style={s.scrollViewStyle}
            nestedScrollEnabled={true}
            keyboardDismissMode="on-drag"
          >
            <CText style={[g.initailTitle, { color: colors.HEADING }]}>Result</CText>

            {searchData &&
              Object.keys(searchData)?.map((key) => {
                let updatedData = searchData[key]?.map((item) => {
                  return { ...item, key }
                })

                if (activeWidget.value !== 'All') {
                  if (key === activeWidget.value) {
                    return (
                      <View style={{ flex: 1, width: '100%' }} key={key}>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginVertical: 8,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {render_icons(key)}
                            <CText style={[{ color: colors.NORMAL, marginLeft: 8 }, g.title3]}>
                              {key === 'FileManagement'
                                ? 'Files'
                                : key === 'Todolist'
                                ? 'Lists'
                                : key === 'Message'
                                ? 'Chat'
                                : key.concat('s')}
                            </CText>
                          </View>
                          <View
                            style={{
                              backgroundColor: colors.SECONDARY,
                              width: 24,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 12,
                            }}
                          >
                            <CText style={[{ color: colors.WHITE }]}>
                              {searchData[key].length}
                            </CText>
                          </View>
                        </View>
                        <ScrollView
                          horizontal={true}
                          contentContainerStyle={{ width: '100%', flex: 1 }}
                        >
                          <FlatList
                            data={viewAll[key] ? updatedData : updatedData.slice(0, 3)}
                            renderItem={(item) => <CardItem {...item} key={key} />}
                            keyExtractor={(item, index) => item?.id}
                            contentContainerStyle={{
                              marginVertical: 8,
                              width: '100%',
                              flex: 1,
                            }}
                          />
                        </ScrollView>
                        {searchData[key].length > 3 && (
                          <TouchableOpacity
                            style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
                            onPress={() => {
                              if (!viewAll[key]) {
                                viewAll[key] = true
                              } else {
                                viewAll[key] = false
                              }
                              setViewAll(viewAll)
                              setRefresh((pre) => !pre)
                            }}
                          >
                            <CText
                              style={[g.body2, { color: colors.SECONDARY, marginVertical: 8 }]}
                            >
                              {viewAll[key] ? 'View Less' : 'View All'}
                            </CText>
                          </TouchableOpacity>
                        )}
                        {searchData[key].length === 0 && (
                          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <CText style={[g.normalText]}>Nothing Found</CText>
                          </View>
                        )}
                        <View
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: colors.SEC_BG,
                            marginVertical: 8,
                          }}
                        ></View>
                      </View>
                    )
                  } else {
                    return <></>
                  }
                } else {
                  return (
                    <View style={s.dataContainer} key={key}>
                      <View style={s.itemContainer}>
                        <View style={s.horizontalFlex}>
                          {render_icons(key)}
                          {/* <ProjectIcon color={colors.SECONDARY} /> */}
                          <CText style={[{ color: colors.NORMAL, marginLeft: 8 }, g.title3]}>
                            {key === 'FileManagement'
                              ? 'Files'
                              : key === 'Todolist'
                              ? 'Lists'
                              : key === 'Message'
                              ? 'Chat'
                              : key.concat('s')}
                          </CText>
                        </View>
                        <View style={s.dataLengthContainer}>
                          <CText style={[{ color: colors.WHITE }]}>{searchData[key].length}</CText>
                        </View>
                      </View>
                      <ScrollView
                        horizontal={true}
                        contentContainerStyle={s.scrollViewContainerStyle}
                      >
                        <FlatList
                          data={viewAll[key] ? updatedData : updatedData.slice(0, 3)}
                          renderItem={(item) => <CardItem {...item} key={key} />}
                          keyExtractor={(item, index) => item?.id}
                          contentContainerStyle={s.flatListContainerStyle}
                        />
                      </ScrollView>
                      {searchData[key].length > 3 && (
                        <TouchableOpacity
                          style={s.horizontalFlexEnd}
                          onPress={() => {
                            if (!viewAll[key]) {
                              viewAll[key] = true
                            } else {
                              viewAll[key] = false
                            }
                            setViewAll(viewAll)
                            setRefresh((pre) => !pre)
                          }}
                        >
                          <CText style={[g.body2, { color: colors.SECONDARY, marginVertical: 8 }]}>
                            {viewAll[key] ? 'View Less' : 'View All'}
                          </CText>
                        </TouchableOpacity>
                      )}
                      {searchData[key].length === 0 && (
                        <View style={s.horizontalFlex}>
                          <CText style={[g.normalText]}>Nothing Found</CText>
                        </View>
                      )}
                      <View style={s.bottomBorderStyle}></View>
                    </View>
                  )
                }
              })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 20,
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

  TeamItemText: {
    color: colors.WHITE,
  },
  TeamItemTextDark: {
    color: colors.HOME_TEXT,
  },
  textColor: {
    color: 'black',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    // justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonTeamBtn: {
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
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 10,
    marginVertical: 5,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.NORMAL,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.NORMAL,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
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
  buttonTeamBtn: {
    marginLeft: 10,
  },
  containerRight: {
    position: 'relative',
    left: 42,
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

  widgetCard: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-regular',
    textAlignVertical: 'center',
    color: colors.NORMAL,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.SEC_BG,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },

  widgetCardActive: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-regular',
    textAlignVertical: 'center',
    color: colors.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.SECONDARY,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },

  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  horizontalLineStyle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.WHITE,
  },
  safeAreaLocalStyle: {
    marginBottom: 64,
    backgroundColor: colors.START_BG,
  },
  itemCenterStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewStyle: {
    marginVertical: 16,
    flex: 1,
    width: '100%',
  },
  dataContainer: {
    flex: 1,
    width: '100%',
  },
  horizontalFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataLengthContainer: {
    backgroundColor: colors.SECONDARY,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  scrollViewContainerStyle: {
    width: '100%',
    flex: 1,
  },
  flatListContainerStyle: {
    marginVertical: 8,
    width: '100%',
    flex: 1,
  },
  bottomBorderStyle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.SEC_BG,
    marginVertical: 8,
  },
  horizontalFlexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})
