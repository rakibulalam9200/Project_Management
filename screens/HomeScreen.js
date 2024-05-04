import AsyncStorage from '@react-native-async-storage/async-storage'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import DraggableGrid from 'react-native-draggable-grid'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import DragAndDrop from 'volkeno-react-native-drag-drop'
import api from '../api/api'
import colors from '../assets/constants/colors'
import { FilterColors } from '../assets/constants/filters'
import getIconbyKey from '../assets/constants/getIconbyKey'
import getSmallIconByKey from '../assets/constants/getSmallIconByKey'
import { directoryMenu, homeMenu } from '../assets/constants/homescreendata'
import g from '../assets/styles/global'
import ArrowDownIcon from '../assets/svg/arrow-down.svg'
import CollapseIcon from '../assets/svg/collapse-icon.svg'
import DollarIcon from '../assets/svg/dollar.svg'
import ExpandIcon from '../assets/svg/expand.svg'
import ListViewIcon from '../assets/svg/fill-list-view.svg'
import FilledPlusIcon from '../assets/svg/filled-plus.svg'
import GridViewIcon from '../assets/svg/grid-fill.svg'
import GripIcon from '../assets/svg/grip.svg'
import LocationIcon from '../assets/svg/location.svg'
import MinusFillIcon from '../assets/svg/minus.svg'
import MoreIcon from '../assets/svg/more.svg'
import PlusFillIcon from '../assets/svg/plus-blue-fill.svg'
import RemoveIcon from '../assets/svg/remove-icon.svg'
import ArrowLeftIcon from '../assets/svg/righ-bold-arrow.svg'
import ListingCompletion from '../components/Completion/ListingCompletion'
import CButton from '../components/common/CButton'
import CFloatingPlusIcon from '../components/common/CFloatingPlusIcon'
import CSelectedUsersWithoutEdit from '../components/common/CSelectedUsersWithoutEdit'
import CText from '../components/common/CText'
import IconWrap from '../components/common/IconWrap'
import ChangeCompanyModal from '../components/modals/ChangeCompanyModal'
import CheckLayoutModal from '../components/modals/CheckLayoutModal'
import HSettingsModal from '../components/modals/HSettingModal'
import HomeMultiMenuModal from '../components/modals/HomeMultiMenuModal'
import { loadPermissions } from '../store/slices/auth'
import {
  setCurrentClientGroupId,
  setCurrentIssue,
  setCurrentMilestone,
  setCurrentProject,
  setCurrentTask,
  setNavigationFrom,
  setStage
} from '../store/slices/navigation'
import { setNormal, setTabbarHeight } from '../store/slices/tab'
import { getErrorMessage } from '../utils/Errors'
import { extractDateFormat } from '../utils/Timer'

const dashboardActiveWidgets = [
  {
    id: 100,
    text: 'Horizontal layout',
    items: [
      {
        id: 201,
        name: 'Issues',
        active: true,
        list: 'issues',
        isHorizental: true,
        navigationLink: 'Issues',
      },
    ],
  },
  {
    id: 101,
    text: 'Vertical layout',
    items: [
      {
        id: 202,
        name: 'Tasks',
        active: true,
        list: 'tasks',
        isHorizental: false,
        navigationLink: 'Tasks',
      },
    ],
  },
]
// const dashboardVerticalActiveWidgets = [
//   {
//     name: 'Task Due Soon',
//     active: true,
//     list: 'tasks',
//     isHorizental: false,
//     navigationLink: 'Tasks',
//   },
// ]
const dashboardWidgets = [
  {
    id: 50,
    text: 'Add more widgets',
    items: [
      {
        id: 1,
        name: 'Projects',
        active: false,
        list: 'projects',
        navigationLink: 'Projects',
      },
      {
        id: 2,
        name: 'Milestones',
        active: false,
        list: 'milestones',
        navigationLink: 'Milestones',
      },
      {
        id: 3,
        name: 'Expenses',
        active: false,
        navigationLink: '',
      },
      {
        id: 4,
        name: 'Budgets',
        active: false,
        navigationLink: '',
      },
      {
        id: 5,
        name: 'Notes',
        active: false,
        list: 'notes',
        navigationLink: 'ProjectNote',
      },
      {
        id: 6,
        name: 'Timelogs',
        active: false,
        list: 'Timelogs',
        navigationLink: '',
      },
    ],
  },
]

export default function HomeScreen({ navigation, route }) {
  const tabbarHeight = useBottomTabBarHeight()
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let menusType = route.params ? (route.params ? route.params.menuType : null) : null
  let refetch = route.params?.refetch ? route.params.refetch : null

  let isEditDashboard = route.params?.isEditDashboard ? route.params.isEditDashboard : false
  const { user, domain } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const insets = useSafeAreaInsets()

  const [gridView, setGridView] = useState(true)
  const [dashboardScreen, setDashboardScreen] = useState('home')
  const [showCompanyChangeModal, setShowCompanyChangeModal] = useState(false)
  const [layoutCheckModal, setLayoutCheckModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [layoutSelected, setLayoutSelected] = useState({ id: 1, name: 'horizental' })
  const [showRemoveIcon, setShowRemoveIcon] = useState(false)
  const [isScrollable, setIsScrollable] = useState(true)
  const [gridData, setGridData] = useState([])
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [milestones, setMilestones] = useState([])
  const [notes, setNotes] = useState([])
  const [timelogs, setTimelogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDashbaordEdit, setIsDashbaordEdit] = useState(false)
  const isCarousel = useRef(null)
  const SLIDER_WIDTH = Dimensions.get('window').width + 80
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7)
  const [widgets, setWidgets] = useState(dashboardWidgets[0].items)
  const [activeWidgets, setActiveWidgets] = useState([])
  const [activeHorizentalWidgets, setActiveHorizentalWidgets] = useState([])
  const [activeVerticalWidgets, setActiveVerticalWidgets] = useState([])
  const [showMultiMenu, setShowMultiMenu] = useState(false)
  const [isList, setIsList] = useState(false)
  const [allCollapsable, setAllCollapsable] = useState(true)
  const [listViewData, setListViewData] = useState({})
  const [directoryListViewData, setDirectoryListViewData] = useState({})

  // issue pagination
  const [issuePage, setIssuePage] = useState(1)
  const [issueCurrentPage, setIssueCurrentPage] = useState(1)
  const [issueLastPage, setIssueLastPage] = useState(1)

  // task pagination
  const [taskPage, setTaskPage] = useState(1)
  const [taskCurrentPage, setTaskCurrentPage] = useState(1)
  const [taskLastPage, setTaskLastPage] = useState(1)

  useEffect(() => {
    if (isEditDashboard) {
      setDashboardScreen('dashboard')
      setIsDashbaordEdit(true)
    }
  }, [isEditDashboard])

  useEffect(() => {
    // //console.log(refetch, 'refetch')
  }, [refetch])

  const ListFooterComponent = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: 100 }}>
      <ActivityIndicator size="small" color={colors.NORMAL} />
    </View>
  )

  // Multimenu actions
  const navigateTo = (item) => {
    setShowMultiMenu(false)
    navigation.navigate(item)
  }

  const setMenu = async (key, arr) => {
    await AsyncStorage.setItem(key, JSON.stringify(arr))
    // //console.log(JSON.stringify(arr), 'value.....')
  }
  const getMenu = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (e) {}
  }

  const getMenuTitle = () => {
    if (!menusType) return 'Home'
    switch (menusType) {
      case 'Directory':
        return 'Directory'
    }
    return 'Default'
  }

  useEffect(() => {
    api.dashboardListView
      .getDashbarodListViewData()
      .then((res) => {
        setListViewData(res.data)
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
        // setLoading(false)
      })
  }, [gridView])

  useEffect(() => {
    if (menusType === 'Directory') {
      api.dashboardListView
        .getDirectoryDashboard()
        .then((res) => {
          setDirectoryListViewData(res.data)
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
          // setLoading(false)
        })
    }
  }, [menusType])

  const getListbyName = (listName) => {
    if (listName === 'issues') {
      // if (issues.length > 3) {
      //   return issues.slice(0, 3)
      // } else {
      return issues
      // }
    } else if (listName === 'tasks') {
      // if (tasks.length > 3) {
      //   return tasks.slice(0, 3)
      // } else {
      return tasks
      // }
    } else if (listName === 'projects') {
      // if (projects.length > 3) {
      //   return projects.slice(0, 3)
      // } else {
      return projects
      // }
    } else if (listName === 'milestones') {
      // if (milestones.length > 3) {
      //   // //console.log(milestones.length,'milestone length==========')
      //   return milestones.slice(0, 3)
      // } else {
      return milestones
      // }
    } else if (listName === 'notes') {
      // if (notes.length > 3) {
      //   return notes.slice(0, 3)
      // } else {
      return notes
      // }
    }
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setCurrentProject(null))
      dispatch(setCurrentTask(null))
      dispatch(setCurrentIssue(null))
      dispatch(setCurrentMilestone(null))
    }
  }, [isFocused])

  useEffect(() => {
    getMenu('widgets').then((res) => {
      //console.log(res, 'widgets')
      if (res) {
        setWidgets(res)
      } else {
        setWidgets(dashboardWidgets[0].items)
      }
    })
    getMenu('activeWidgets').then((res) => {
      //console.log(res, 'active widgets')
      if (res) {
        setActiveWidgets(res)
      } else {
        setActiveWidgets(dashboardActiveWidgets)
      }
    })
  }, [])

  useEffect(() => {
    if (!menusType) {
      getMenu('home').then((res) => {
        if (res) {
          setGridData(res)
        } else {
          setGridData(homeMenu)
        }
      })
    }
    switch (menusType) {
      // case 'Finance':
      //   getMenu('finance').then((res) => {
      //     if (res) {
      //       setGridData(res)
      //     } else {
      //       setGridData(financeMenu)
      //     }
      //   })
      //   break
      case 'Directory':
        let employeesId = -1
        let clientsId = -1
        api.group
          .getGroups()
          .then((res) => {
            let groups = res.data
            groups.forEach((group) => {
              // //console.log(group)
              if (group.name == 'Users' || group.name.includes('Employee')) {
                employeesId = group.id
              }
              if (group.name == 'Customers' || group.name.includes('Client')) {
                dispatch(setCurrentClientGroupId(group?.id))
                clientsId = group.id
              }
            })
            // //console.log(clientsId, employeesId)
            getMenu('directory').then((res) => {
              if (res) {
                let updatedDirectoryMenu = res.map((menuItem) => {
                  menuItem = { ...menuItem }
                  if (menuItem.label == 'Employees') {
                    menuItem.navigateDestinationParams = { id: employeesId }
                  }
                  if (menuItem.label == 'Clients') {
                    
                    menuItem.navigateDestinationParams = { id: clientsId }
                  }
                  return menuItem
                })
                setGridData(updatedDirectoryMenu)
              } else {
                let updatedDirectoryMenu = directoryMenu.map((menuItem) => {
                  menuItem = { ...menuItem }
                  if (menuItem.label == 'Employees') {
                    menuItem.navigateDestinationParams = { id: employeesId }
                  }
                  if (menuItem.label == 'Clients') {
                    menuItem.navigateDestinationParams = { id: clientsId }
                  }
                  return menuItem
                })
                setGridData(updatedDirectoryMenu)
              }
            })
          })
          .catch((err) => {
            //console.log(err.response.data)
          })

        break
      // case 'Reports':
      //   getMenu('reports').then((res) => {
      //     if (res) {
      //       setGridData(res)
      //     } else {
      //       setGridData(reportMenu)
      //     }
      //   })
      //   break
    }
  }, [menusType])

  // tasks on the homescreen
  useEffect(() => {
    if (dashboardScreen == 'dashboard') {
      const body = {
        pagination: 10,
        sort_by: 'last_updated',
        page: 1,
        selectData: 1,
      }

      setLoading(true)
      // project api call
      api.project
        .getAllProjects(body)
        .then((res) => {
          setProjects(res.data)
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

      // task api call
      api.task
        .getAllTasks(body)
        .then((res) => {
          setTasks(res.data)
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

      // issue api call
      api.issue
        .getAllIssues(body)
        .then((res) => {
          setIssues(res.data)
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
      // milestone api call
      api.milestone
        .getAllMilestones(body)
        .then((res) => {
          setMilestones(res.data)
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
      // note api call
      api.note
        .getAllNotes(body)
        .then((res) => {
          // //console.log(res, 'notes...................')
          setNotes(res.data)
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

      // setLoading(false)
      // timelogs api call
      //   api.timelog
      //     .getTimelog(body)
      //     .then((res) => {
      //       setTimelogs(res)
      //     })
      //     .catch((err) => {
      //       let errorMsg = ''
      //       try {
      //         errorMsg = getErrorMessage(err)
      //       } catch (err) {
      //         errorMsg = 'An error occured. Please try again later.'
      //       }
      //       Alert.alert(errorMsg)
      //     })
      //     .finally(() => {
      //       setLoading(false)
      //     })
    }
  }, [dashboardScreen, refetch])

  useEffect(() => {
    dispatch(setTabbarHeight(tabbarHeight))
  }, [])

  // task component for the home screen
  const Card = ({ item, isHorizental }) => {
    const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
      <View style={[g.containerBetween, isHorizental && { marginRight: 16 }]}>
        <View style={[s.cardContainer, g.containerBetween]}>
          {item.state !== 'Note' && (
            <View style={[{ flex: 1, paddingVertical: 16 }, isHorizental && { width: 250 }]}>
              <TouchableOpacity
                style={[s.cardRowBetween, { alignItems: 'flex-start' }]}
                onPress={() => {
                  // //console.log(item.state, '-------state------------')
                  if (item.state === 'Project') {
                    dispatch(setCurrentProject(item))
                    dispatch(setStage('project'))
                    dispatch(setNavigationFrom('dashboard'))
                    navigation.navigate('ProjectDetails', {
                      id: item?.id,
                    })
                  } else if (item.state === 'Task') {
                    // //console.log('task hitted.............')
                    dispatch(setStage('task'))
                    dispatch(setCurrentTask(item))
                    dispatch(setNavigationFrom('dashboard'))
                    navigation.navigate('TaskDetails', {
                      id: item.id,
                    })
                  } else if (item.state === 'Milestone') {
                    dispatch(setCurrentMilestone(item))
                    dispatch(setNavigationFrom('dashboard'))
                    navigation.navigate('MilestoneDetails', { id: item?.id })
                  } else if (item.state === 'Issue') {
                    dispatch(setStage('issue'))
                    dispatch(setCurrentIssue(item))
                    dispatch(setNavigationFrom('dashboard'))
                    navigation.navigate('IssueDetails', {
                      id: item.id,
                    })
                  }
                }}
              >
                <TouchableOpacity
                  style={{ padding: 8 }}
                  onPress={() => setIsCollapsed(!isCollapsed)}
                >
                  {allCollapsable ? (
                    isCollapsed ? (
                      <CollapseIcon />
                    ) : (
                      <ExpandIcon />
                    )
                  ) : isCollapsed ? (
                    <ExpandIcon />
                  ) : (
                    <CollapseIcon />
                  )}
                </TouchableOpacity>
                <Text style={s.cardTitle}>{item?.name}</Text>
                {/* <CheckEmptyIcon/> */}
              </TouchableOpacity>
              <View style={s.cardRowBetween}>
                <View style={s.cardRowLeft}>
                  <Text
                    style={[
                      g.gCardStatus,
                      { backgroundColor: item?.stage && FilterColors[item.stage].color },
                    ]}
                  >
                    {item.stage}
                  </Text>
                  <Text style={s.cardLevel}>{item?.priority}</Text>
                </View>
                {!allCollapsable ? (
                  <>
                    {!isCollapsed ? (
                      <>
                        <View
                          style={[s.pushRight, { left: item['user_members'].length * 14 - 14 }]}
                        >
                          <CSelectedUsersWithoutEdit
                            selectedUsers={item['user_members'] ? item['user_members'] : []}
                          />
                        </View>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <>
                    {!isCollapsed ? (
                      <></>
                    ) : (
                      <View style={[s.pushRight, { left: item['user_members'].length * 14 - 14 }]}>
                        <CSelectedUsersWithoutEdit
                          selectedUsers={item['user_members'] ? item['user_members'] : []}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
              <>
                {!allCollapsable ? (
                  <>
                    {!isCollapsed ? (
                      item.state !== 'Project' ? (
                        <>
                          <View style={s.cardRowLeft}>
                            <Text style={s.project}>Project:</Text>
                            <Text style={s.projectTitle}>{item?.project?.name}</Text>
                          </View>
                          <ListingCompletion
                            key={item.id}
                            from={'listing'}
                            status={item.stage}
                            progressData={{
                              completion: item?.progress?.completion,
                              is_can_completion: item?.progress?.is_can_completion,
                            }}
                            type={'project'}
                            id={item.id}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              item.address
                                ? Linking.openURL(
                                    `http://maps.google.com/?q=${item.address.replace(' ', '+')}`
                                  )
                                : console.log('No address')
                            }}
                            style={[
                              {
                                paddingLeft: 10,
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'space-between',
                              },
                            ]}
                          >
                            <Text style={{ marginRight: 5 }}>
                              {item.address
                                ? item.address
                                : isHorizental
                                ? '144-38 Melbourne Ave, Q...'
                                : '144-38 Melbourne Ave, Queens, NY'}
                            </Text>
                            <LocationIcon fill={colors.NORMAL} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              item.address
                                ? Linking.openURL(
                                    `http://maps.google.com/?q=${item.address.replace(' ', '+')}`
                                  )
                                : console.log('No address')
                            }}
                            style={[
                              {
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'space-between',
                                padding: 10,
                              },
                            ]}
                          >
                            <Text style={{ marginRight: 5 }}>
                              {item.address
                                ? item.address
                                : isHorizental
                                ? '144-38 Melbourne Ave, Q...'
                                : '144-38 Melbourne Ave, Queens, NY'}
                            </Text>
                            <LocationIcon fill={colors.NORMAL} />
                          </TouchableOpacity>
                          <View style={s.cardRowLeft}>
                            <DollarIcon fill={colors.NORMAL} />
                            <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                          </View>
                          <ListingCompletion
                            key={item.id}
                            from={'listing'}
                            status={item.stage}
                            progressData={{
                              completion: item?.progress?.completion,
                              is_can_completion: item?.progress?.is_can_completion,
                            }}
                            type={'project'}
                            id={item.id}
                          />
                        </>
                      )
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <>
                    {!isCollapsed ? (
                      <></>
                    ) : item.state !== 'Project' ? (
                      <>
                        <View style={s.cardRowLeft}>
                          <Text style={s.project}>Project:</Text>
                          <Text style={s.projectTitle}>{item?.project?.name}</Text>
                        </View>
                        <ListingCompletion
                          key={item.id}
                          from={'listing'}
                          status={item.stage}
                          progressData={{
                            completion: item?.progress?.completion,
                            is_can_completion: item?.progress?.is_can_completion,
                          }}
                          type={'project'}
                          id={item.id}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            item.address
                              ? Linking.openURL(
                                  `http://maps.google.com/?q=${item.address.replace(' ', '+')}`
                                )
                              : console.log('No address')
                          }}
                          style={[
                            {
                              paddingLeft: 10,
                              flexDirection: 'row',
                              flex: 1,
                              justifyContent: 'space-between',
                            },
                          ]}
                        >
                          <Text style={{ marginRight: 5 }}>
                            {item.address
                              ? item.address
                              : isHorizental
                              ? '144-38 Melbourne Ave, Q...'
                              : '144-38 Melbourne Ave, Queens, NY'}
                          </Text>
                          <LocationIcon fill={colors.NORMAL} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            item.address
                              ? Linking.openURL(
                                  `http://maps.google.com/?q=${item.address.replace(' ', '+')}`
                                )
                              : console.log('No address')
                          }}
                          style={[
                            {
                              flexDirection: 'row',
                              flex: 1,
                              justifyContent: 'space-between',
                              padding: 10,
                            },
                          ]}
                        >
                          <Text style={{ marginRight: 5 }}>
                            {item.address
                              ? item.address
                              : isHorizental
                              ? '144-38 Melbourne Ave, Q...'
                              : '144-38 Melbourne Ave, Queens, NY'}
                          </Text>
                          <LocationIcon fill={colors.NORMAL} />
                        </TouchableOpacity>
                        <View style={s.cardRowLeft}>
                          <DollarIcon fill={colors.NORMAL} />
                          <Text style={{ marginLeft: 8 }}>Planned: $20000 | Actual: $18232</Text>
                        </View>
                        <ListingCompletion
                          key={item.id}
                          from={'listing'}
                          status={item.stage}
                          progressData={{
                            completion: item?.progress?.completion,
                            is_can_completion: item?.progress?.is_can_completion,
                          }}
                          type={'project'}
                          id={item.id}
                        />
                      </>
                    )}
                  </>
                )}
              </>
            </View>
          )}
          {item.state === 'Note' && (
            <View style={{ flex: 1, width: 200, paddingVertical: 16 }}>
              <Text style={[g.body2, { color: colors.NORMAL }]}>
                {item?.description?.plain_text_value.length > 45
                  ? item?.description?.plain_text_value.slice(0, 45) + '...'
                  : item?.description?.plain_text_value}
              </Text>
              <View style={s.cardRowLeft}>
                <Text style={s.project}>By: </Text>
                <Text style={[g.body2, { color: colors.NORMAL }]}>
                  {item?.user_owner?.first_name}
                </Text>
              </View>
              <View style={s.cardRowBetween}>
                <Text style={s.project}>{extractDateFormat(item.created_at)}</Text>
                <Text style={s.project}>{'00 attachments'}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }

  const DashboardCard = ({ item, drag }) => {
    return (
      <TouchableOpacity style={s.dashboardCardContainer}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity>{item?.active ? <MinusFillIcon /> : <PlusFillIcon />}</TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPressIn={drag}>
          <GripIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  const goBack = () => {
    if (menusType) {
      navigation.navigate('Home')
    } else {
      navigation.goBack()
    }
  }

  const savedMenuDataToLocalStorage = (menuData) => {
    if (!menusType) {
      setMenu('home', menuData)
    }
    switch (menusType) {
      // case 'Finance':
      //   setMenu('finance', menuData)
      //   break
      case 'Directory':
        setMenu('directory', menuData)
        break
      // case 'Reports':
      //   setMenu('reports', menuData)
      //   break
    }
    setShowRemoveIcon(false)
  }

  const handleGridViewToggle = () => {
    setGridView((prev) => !prev)
  }
  const openCompanyChangeModal = () => {
    setShowCompanyChangeModal(true)
  }
  const openLayoutCheckModal = () => {
    setLayoutCheckModal(true)
  }

  useEffect(() => {
    if (isFocused) dispatch(setNormal())
    dispatch(setCurrentProject(null))
    dispatch(setCurrentMilestone(null))
    dispatch(setCurrentTask(null))
  }, [isFocused])

  useEffect(() => {
    dispatch(loadPermissions())
      .then((res) => {
        // //console.log('Permissions loaded')
      })
      .catch((err) => {
        // //console.log(err.resonse.data)
      })
  }, [])

  const renderItem = (item) => {
    let itemProps
    !showRemoveIcon ? (itemProps = item.item) : (itemProps = item)
    let { id, key, label, navigateDestination, menuType, deletedMenu, navigateDestinationParams } =
      itemProps

    // //console.log(menuType)
    const toggleMenu = (id) => {
      let filteredMenu = gridData.filter((menu) => menu.id !== id)
      let selectedMenu = gridData.find((menu) => menu.id === id)
      let copy = { ...selectedMenu }
      copy.deletedMenu = !copy.deletedMenu
      filteredMenu.push(copy)
      setGridData(filteredMenu)
    }
    let onPress = () => {
      if (menuType) {
        navigation.navigate('Home', { menuType })
        return
      }
      if (navigateDestination) {
        if (navigateDestinationParams)
          navigation.navigate(navigateDestination, navigateDestinationParams)
        else navigation.navigate(navigateDestination)
      } else {
        Alert.alert('Screen is under construction')
      }
    }
    if (gridView) {
      return (
        <View style={s.mainItemContainer}>
          {showRemoveIcon ? (
            <View style={[{ alignItems: 'center', justifyContent: 'center' }]}>
              <View style={s.iconWrapperBig}>{getIconbyKey[label]}</View>
              <TouchableOpacity style={[s.removeIconContainer]} onPress={() => toggleMenu(id)}>
                {!deletedMenu ? <RemoveIcon /> : <FilledPlusIcon />}
              </TouchableOpacity>
              <Text style={s.mainItemText}>{label}</Text>
            </View>
          ) : (
            !deletedMenu && (
              <TouchableOpacity
                onPress={onPress}
                onLongPress={() => setShowRemoveIcon(!showRemoveIcon)}
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={s.iconWrapperBig}>{getIconbyKey[label]}</View>
                <Text style={s.mainItemText}>{label}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )
    } else {
      //console.log(label, 'menu type')
      return (
        <TouchableOpacity onPress={onPress} style={[s.mainItemContainerList]}>
          <View style={s.mainItemContainerListLeft}>
            <View style={s.iconWrapperSmall}>{getSmallIconByKey[label]}</View>
            <Text style={[s.mainItemListText]}>{label}</Text>
          </View>
          <Text style={[s.mainItemListText, { marginRight: 16 }]}>
            {menusType ? directoryListViewData[label] : listViewData[label]}
          </Text>
        </TouchableOpacity>
      )
    }
  }
  return (
    <SafeAreaView style={[s.containerBG]}>
      <View style={[g.homeListingOuterContainer]}>
        <ChangeCompanyModal
          visibility={showCompanyChangeModal}
          setVisibility={setShowCompanyChangeModal}
        />
        <CheckLayoutModal
          visibility={layoutCheckModal}
          setVisibility={setLayoutCheckModal}
          selected={layoutSelected}
          setSelected={setLayoutSelected}
        />
        <HSettingsModal
          visibility={showSettingsModal}
          setVisibility={setShowSettingsModal}
          onCustomiztion={() => setIsDashbaordEdit(true)}
          onAllCollapse={() => setAllCollapsable(!allCollapsable)}
        />
        {!showRemoveIcon ? (
          !isDashbaordEdit && (
            <View style={[g.containerBetween, s.container]}>
              <View style={[s.headerContainer]}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Image source={{ uri: user?.image }} style={s.headerImage} />
                </TouchableOpacity>
                <View style={s.headerTitleContainer}>
                  <Text style={s.headerProfileText}>
                    {user?.name ? user?.name : `${user?.email && user?.email?.split('@')[0]}`}
                  </Text>
                  <View style={g.containerLeft}>
                    <Text style={s.subHeaderText}>Company: </Text>
                    <TouchableOpacity
                      style={[g.containerLeft, s.companySelectorContainer]}
                      onPress={openCompanyChangeModal}
                    >
                      <Text style={s.subHeaderCompanyText}>
                        {domain.length > 15 ? domain.slice(0, 15) + '...' : domain}
                      </Text>
                      <ArrowDownIcon />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View>
                <IconWrap
                  onPress={() => {
                    if (dashboardScreen !== 'dashboard') {
                      navigation.navigate('Settings')
                    } else {
                      setShowSettingsModal(true)
                      // setIsDashbaordEdit(true)
                    }
                  }}
                  outputRange={iconWrapColors}
                >
                  <MoreIcon fill={colors.SECONDARY} />
                </IconWrap>
              </View>
            </View>
          )
        ) : (
          <></>
        )}

        {!showRemoveIcon ? (
          !isDashbaordEdit && (
            <View style={[g.containerBetween, s.dashboardPickerContainer]}>
              <TouchableOpacity
                style={[
                  s.dashboardPickerButton,
                  dashboardScreen == 'dashboard' ? s.dashboardPickerButtonActive : null,
                ]}
                onPress={() => {
                  setDashboardScreen('dashboard')
                }}
              >
                <Text
                  style={[
                    g.filterButtonText,
                    dashboardScreen == 'dashboard' ? g.filterButtonTextActive : null,
                  ]}
                >
                  Dashboard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.dashboardPickerButton,
                  dashboardScreen == 'home' ? s.dashboardPickerButtonActive : null,
                ]}
                onPress={() => {
                  setDashboardScreen('home')
                }}
              >
                <Text
                  style={[
                    g.filterButtonText,
                    dashboardScreen == 'home' ? g.filterButtonTextActive : null,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <></>
        )}

        {showRemoveIcon && (
          <View style={{ marginHorizontal: 16 }}>
            <CText style={s.subTitleText}>Re-arrange or remove icons.</CText>
          </View>
        )}

        {dashboardScreen == 'home' && (
          <View style={[{ flex: 1 }]}>
            <View
              style={[
                g.containerBetween,
                { marginHorizontal: 16, alignItems: 'center' },
                gridView && { marginBottom: 10 },
              ]}
            >
              <View style={[g.containerLeft]}>
                {menusType && (
                  <IconWrap onPress={goBack}>
                    <ArrowLeftIcon />
                  </IconWrap>
                )}
                <Text style={[s.subHeaderTitle, menusType && { marginLeft: 0 }]}>
                  {getMenuTitle()}
                </Text>
              </View>
              {!showRemoveIcon && (
                <IconWrap onPress={handleGridViewToggle} outputRange={iconWrapColors}>
                  {gridView ? <ListViewIcon /> : <GridViewIcon />}
                </IconWrap>
              )}
            </View>
            {!showRemoveIcon ? (
              <FlatList
                key={gridView ? 'grid' : 'list'}
                contentContainerStyle={[{ paddingBottom: 55 }]}
                data={gridData}
                renderItem={renderItem}
                keyExtractor={(item) => item.key}
                numColumns={gridView ? 3 : 1}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <ScrollView scrollEnabled={isScrollable} showsVerticalScrollIndicator={false}>
                <DraggableGrid
                  style={{ flex: 1, marginTop: 24, marginBottom: 8 }}
                  numColumns={3}
                  renderItem={renderItem}
                  data={gridData}
                  onDragRelease={(data) => {
                    setGridData(data)
                    setIsScrollable(true)
                    setShowRemoveIcon(false)
                  }}
                  onDragStart={() => {
                    setIsScrollable(false)
                  }}
                  scrollAreaSize={1000}
                  scrollStep={2}
                  scrollInterval={1000}
                  contentOffset={(0, 0)}
                />
              </ScrollView>
            )}
          </View>
        )}
        {dashboardScreen == 'dashboard' &&
          (!isDashbaordEdit ? (
            <ScrollView
              style={{ flex: 1, marginBottom: 55 }}
              horizontal={false}
              showsVerticalScrollIndicator={false}
            >
              {activeWidgets[0]?.items?.map((widget) => (
                <View key={widget.name}>
                  <View style={[g.containerBetween, s.menuContainer]}>
                    <View style={g.containerLeft}>
                      <Text style={s.menuTitle}>{widget.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (widget.navigationLink) {
                          navigation.navigate(widget.navigationLink)
                        }
                      }}
                    >
                      <Text style={{ color: '#246BFD' }}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginLeft: 16 }}>
                    <FlatList
                      horizontal
                      data={getListbyName(widget.list)}
                      renderItem={(props) => <Card {...props} isHorizental={true} />}
                      keyExtractor={(item) => item?.state + item?.id}
                    />
                  </View>
                </View>
              ))}
              {activeWidgets[1]?.items?.map((widget) => (
                <View key={widget.name}>
                  <View style={[g.containerBetween, s.menuContainer]}>
                    <View style={g.containerLeft}>
                      <Text style={s.menuTitle}>{widget.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (widget.navigationLink) {
                          navigation.navigate(widget.navigationLink)
                        }
                      }}
                    >
                      <Text style={{ color: '#246BFD' }}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginHorizontal: 16 }}>
                    <ScrollView horizontal={true} contentContainerStyle={{ width: '100%' }}>
                      <FlatList
                        data={getListbyName(widget.list)}
                        renderItem={(props) => <Card {...props} horizontal={false} />}
                        keyExtractor={(item) => item.id}
                        onEndReachedThreshold={0.1}
                        onEndReached={() => {
                          if (widget?.name === 'Issues') {
                            issueCurrentPage < issueLastPage && setIssuePage(issuePage + 1)
                          }
                        }}
                      />
                    </ScrollView>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View
              style={{ marginHorizontal: 16, backgroundColor: '#F2F6FF', flex: 1 }}
              horizontal={false}
            >
              <View style={{ flex: 1 }}>
                <CText style={s.titleText}>
                  Customize your home screen by adding or removing widgets.
                </CText>
                <Text style={{ marginVertical: 16, color: colors.LIGHT_GRAY }}>
                  Drag the element you want to the horizontal or vertical layout.
                </Text>
                {!isList && (
                  <DragAndDrop
                    style={{ backgroundColor: 'none' }}
                    contentContainerStyle={{
                      backgroundColor: 'none',
                      // flex: 1,
                      flexDirection: 'column-reverse',
                    }}
                    itemKeyExtractor={(item) => item.id}
                    zoneKeyExtractor={(zone) => zone.id}
                    zones={activeWidgets}
                    items={widgets}
                    // footerComponent={<Text style={s.titleTex}>{"Add More Widgets"}</Text>}
                    itemsContainerStyle={{ paddingTop: 16 }}
                    zonesContainerStyle={{ order: 2 }}
                    onMaj={(activeWidgets, widgets) => {
                      setWidgets(widgets)
                      setActiveWidgets(activeWidgets)
                    }}
                    itemsInZoneStyle={s.itemsInZoneStyle}
                    renderZone={(zone, children, hover) => {
                      //  //console.log(children,'zone items.............')
                      let copy = zone.items.map((item) => {
                        if (!item.active) {
                          item.active = true
                        }
                      })
                      widgets.map((item) => {
                        if (item.active) {
                          item.active = false
                        }
                      })
                      // //console.log(widgets,'items#######')
                      return (
                        <View>
                          <CText
                            style={[
                              s.titleText,
                              { marginVertical: 10, fontWeight: '700', fontSize: 16 },
                            ]}
                          >
                            {zone.text}
                          </CText>
                          {children}
                          <View
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: '#D6E2FF',
                              marginTop: 10,
                            }}
                          ></View>
                          {zone.text === 'Vertical layout' && (
                            <CText
                              style={[
                                s.titleText,
                                { marginTop: 10, fontWeight: '700', fontSize: 16 },
                              ]}
                            >
                              {'Add More Widgets'}
                            </CText>
                          )}
                        </View>
                      )
                    }}
                    renderItem={(item) => {
                      return (
                        <View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              marginVertical: 8,
                            }}
                          >
                            <View style={{ flexDirection: 'row' }}>
                              <TouchableOpacity>
                                {item.active ? <MinusFillIcon /> : <PlusFillIcon />}
                              </TouchableOpacity>
                              <View style={{ marginLeft: 10 }}>
                                <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.name}</Text>
                              </View>
                            </View>

                            <TouchableOpacity onLongPress={() => setIsList(true)}>
                              <GripIcon />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    }}
                  />
                )}
                {isList && (
                  <>
                    <View>
                      <CText style={[s.titleText, { marginTop: 10 }]}>Horizental Layout:</CText>
                      <ScrollView
                        contentContainerStyle={{ marginVertical: 8, width: '100%', flex: 1 }}
                        horizontal={true}
                      >
                        <DraggableFlatList
                          data={activeWidgets[0].items}
                          renderItem={DashboardCard}
                          keyExtractor={(item, index) => index}
                          onDragEnd={({ data }) => {
                            setIsList(false)
                            const copy = [...activeWidgets]
                            copy[0].items = data
                            setActiveWidgets(copy)
                          }}
                        />
                      </ScrollView>
                      <View style={{ borderBottomWidth: 1, borderBottomColor: '#D6E2FF' }}></View>
                    </View>
                    <View>
                      <CText style={[s.titleText, { marginTop: 10 }]}>Vertical Layout:</CText>
                      <ScrollView
                        contentContainerStyle={{ marginVertical: 8, width: '100%', flex: 1 }}
                        horizontal={true}
                      >
                        <DraggableFlatList
                          data={activeWidgets[1].items}
                          renderItem={DashboardCard}
                          keyExtractor={(item, index) => index}
                          onDragEnd={({ data }) => {
                            setIsList(false)
                            const copy = [...activeWidgets]
                            copy[1].items = data
                            setActiveWidgets(copy)
                          }}
                        />
                      </ScrollView>
                      <View style={{ borderBottomWidth: 1, borderBottomColor: '#D6E2FF' }}></View>
                    </View>
                    <View style={{ marginTop: 16, width: '100%', flex: 1 }}>
                      <CText style={s.titleText}>Add more widgets</CText>
                      <ScrollView
                        contentContainerStyle={{ marginVertical: 8, width: '100%', flex: 1 }}
                        horizontal={true}
                      >
                        <DraggableFlatList
                          data={widgets}
                          renderItem={DashboardCard}
                          keyExtractor={(item, index) => index}
                          // showsVerticalScrollIndicator={false}
                          onDragBegin={() => {}}
                          onDragEnd={({ data }) => {
                            setWidgets(data)
                            setIsList(false)
                          }}
                        />
                      </ScrollView>
                    </View>
                  </>
                )}
              </View>
              <View style={[s.listItemContainer, { width: '100%', marginBottom: tabbarHeight }]}>
                <CButton
                  type="gray"
                  style={[s.margin1x, s.closeButton]}
                  onPress={() => {
                    setShowRemoveIcon(false)
                    setIsDashbaordEdit(false)
                  }}
                >
                  <CText style={g.title3}>Cancel</CText>
                </CButton>
                <CButton
                  style={[s.margin1x, s.holdButton]}
                  onPress={async () => {
                    setShowRemoveIcon(false)
                    setIsDashbaordEdit(false)
                    setMenu('widgets', widgets)
                    setMenu('activeWidgets', activeWidgets)
                    // setMenu('activeHorizentalWidgets', activeHorizentalWidgets)
                    // setMenu('activeVerticalWidgets', activeVerticalWidgets)
                  }}
                >
                  <CText style={g.title3}>Save</CText>
                </CButton>
              </View>
            </View>
          ))}

        {showRemoveIcon && (
          <View style={{ marginHorizontal: 16, marginBottom: 55 }}>
            <View style={[s.listItemContainer, { width: '100%' }]}>
              <CButton
                style={[s.margin1x, s.closeButton]}
                onPress={() => {
                  setShowRemoveIcon(false)
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[s.margin1x, s.holdButton]}
                onPress={() => savedMenuDataToLocalStorage(gridData)}
              >
                <CText style={g.title3}>Save</CText>
              </CButton>
            </View>
          </View>
        )}

        <View>
          <HomeMultiMenuModal
            openModal={showMultiMenu}
            setOpenModal={setShowMultiMenu}
            action={navigateTo}
            menutype={menusType}
          />
        </View>

        {!showRemoveIcon ? (
          isDashbaordEdit ? (
            <></>
          ) : (
            !menusType && <CFloatingPlusIcon onPress={() => setShowMultiMenu(true)} />
          )
        ) : (
          <></>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  containerBG: {
    flex: 1,
    backgroundColor: colors.CONTAINER_BG,
    paddingTop: 16,
    // backgroundColor: 'gray',
    // width:'100%'
  },
  dashboardPickerContainer: {
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
  },
  dashboardPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  dashboardPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  dashboardPickerButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  dashboardPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // paddingHorizontal: 16,
  },
  headerTitleContainer: {
    paddingHorizontal: 10,
  },
  headerGreeting: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerProfileText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'inter-regular',
  },
  subHeaderText: {
    color: colors.PRIM_CAPTION,
    fontFamily: 'inter-regular',
    fontWeight: '500',
    marginTop: 4,
  },
  companySelectorContainer: {
    marginTop: 4,
    borderBottomColor: colors.NORMAL,
    borderBottomWidth: 1,
    fontWeight: 'bold',
  },
  subHeaderCompanyText: {
    color: colors.NORMAL,
    fontFamily: 'inter-regular',
    fontWeight: '500',
  },
  headerImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  subHeaderContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    // backgroundColor:"yellow"
  },
  subHeaderTitle: {
    // marginLeft: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.HEADING,
  },
  menuContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  menuTitle: {
    // marginLeft: 10,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
    alignContent: 'space-around',
    marginBottom: 60,
  },
  mainItemContainer: {
    // backgroundColor:"yellow",
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33.33%',
    marginBottom: 48,
    paddingTop: 10,
    width: '100%',
  },
  iconWrapperBig: {
    backgroundColor: colors.WHITE,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20.0,
    elevation: 24,
  },

  mainItemText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    paddingTop: 16,
    color: colors.HOME_TEXT,
    fontWeight: 'bold',
  },
  mainContainerListView: {
    marginBottom: 60,
  },
  mainItemContainerList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E2FF',
  },
  mainItemContainerListLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconWrapperSmall: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
  mainItemListText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    color: colors.HOME_TEXT,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'inter-semibold',
  },
  removeIconContainer: {
    position: 'absolute',
    top: -20,
    right: 5,
    backgroundColor: '#D6E2FF',
    padding: 2,
    borderRadius: 20,
  },
  item: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item_text: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  button: {
    width: 150,
    height: 100,
    backgroundColor: 'blue',
  },
  wrapper: {
    paddingTop: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  margin1x: {
    marginVertical: 10,
  },
  margin2x: {
    marginVertical: 10,
  },
  holdButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 2,
  },
  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 10,
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
  noteDes: {
    fontSize: 14,
    marginRight: 5,
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
  titleText: {
    color: '#001D52',
    fontFamily: 'inter-medium',
    fontSize: 14,
  },
  dashboardCardContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  itemsInZoneStyle: {
    width: '100%',
  },
  contentContainerStyle: {
    padding: 20,
    paddingTop: 40,
  },
  itemsContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zonesContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dragItemStyle: {
    borderColor: '#F39200',
    borderWidth: 1,
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  dragItemTextStyle: {
    color: '#011F3B',
    fontWeight: '700',
    textAlign: 'center',
  },
  dragZoneStyle: {
    borderColor: '#F39200',
    borderWidth: 1,
    width: '47%',
    padding: 15,
    minHeight: 130,
    marginVertical: 15,
  },
  dragZoneTextStyle: {
    position: 'absolute',
    opacity: 0.2,
    zIndex: 0,
    alignSelf: 'center',
    top: '50%',
  },
  plusButton: {
    position: 'absolute',
    bottom: 40,
    right: 0,
  },
  subTitleText: {
    color: colors.NORMAL,
    fontFamily: 'inter-medium',
    fontSize: 14,
    marginBottom: 32,
  },
})
