// import { createTabNavigator } from '../navigators/TabNavigator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import colors from '../../assets/constants/colors'
import ChecklistScreen from '../../screens/Checklist/ChecklistScreen'
import ProjectFolders from '../../screens/Files/ProjectFolders'
import IssueScreen from '../../screens/Issue/Issue'
import MilestoneScreen from '../../screens/Milestone/MilestoneScreen'
import MoreScreen from '../../screens/MoreScreen'
import ProjectNoteScreen from '../../screens/Note/ProjectNote'
import NotificationScreen from '../../screens/Notification/NotificationScreen'
import ProjectScreen from '../../screens/Project/ProjectScreen'
import SearchScreen from '../../screens/Search/Search'
import TaskScreen from '../../screens/Task/Task'
import TimelogsScreen from '../../screens/Timelog/TimelogsScreen'
import UnderConstructionScreen from '../../screens/UnderConstructionScreen'
import {
  setCurrentIssue,
  setCurrentMilestone,
  setCurrentProject,
  setCurrentRoute,
  setCurrentTask,
} from '../../store/slices/navigation'
import CalendarIcon from '../icons/CalendarIcon'
import DirectoryIcon from '../icons/DirectoryIcon'
import DocumentIcon from '../icons/DocumentIcon'
import FileIcon from '../icons/FileIcon'
import GlobalSearchIcon from '../icons/GlobalSearchIcon'
import HomeIcon from '../icons/HomeIcon'
import IssueIcon from '../icons/IssueIcon'
import ListIcon from '../icons/ListIcon'
import MessageIcon from '../icons/MessageIcon'
import MilestoneIcon from '../icons/MilestoneIcon'
import MoreIcon from '../icons/MoreIcon'
import NoteIcon from '../icons/NoteIcons'
import NotificationIcon from '../icons/NotificationIcon'
import ProjectIcon from '../icons/ProjectIcons'
import TimeLogIcon from '../icons/TimelogIcon'
import TimerIcon from '../icons/TimerIcon'
import MoreTabMenuModal from '../modals/MoreTabMenuModal'
import TabbarEditModal from '../modals/TabbarEditModal'
// import CalendarStack from './CalendarStack'
import ChatListScreen from '../../screens/Chat/ChatListScreen'
import CalendarStack from './CalendarStack'
import HomeStack from './HomeStack'

const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) {}
}

const Tab = createBottomTabNavigator()
const currentTabBar = [
  {
    id: 1,
    text: 'More',
    items: [
      // {
      //   id: 1,
      //   name: 'Home',
      //   iconName: 'HomeIcon',
      //   componentName:'Home'
      // },
      {
        id: 2,
        name: 'Tasks',
        iconName: 'DocumentIcon',
        componentName: 'Tasks',
      },
      {
        id: 3,
        name: 'Calendar',
        iconName: 'CalendarIcon',
        componentName: 'Calendar',
      },
      {
        id: 4,
        name: 'Notifications',
        iconName: 'NotificationIcon',
        componentName: 'Notifications',
      },
    ],
  },
]

const moreTabData = [
  {
    id: 20,
    name: 'More',
    iconName: '',
    componentName: '',
  },
  {
    id: 5,
    name: 'Notes',
    iconName: 'NoteIcon',
    componentName: 'Notes',
  },
  {
    id: 6,
    name: 'Lists',
    iconName: 'ListIcon',
    componentName: 'Lists',
  },
  {
    id: 7,
    name: 'Time log',
    iconName: 'TimeLogIcon',
    componentName: 'TimeLogs',
  },
  // {
  //   id: 8,
  //   name: 'Timer',
  //   iconName: 'TimerIcon',
  //   componentName: 'Timer',
  // },
  {
    id: 9,
    name: 'Projects',
    iconName: 'ProjectIcon',
    componentName: 'Projects',
  },
  {
    id: 10,
    name: 'Milestones',
    iconName: 'MilestoneIcon',
    componentName: 'Milestones',
  },
  {
    id: 11,
    name: 'Issues',
    iconName: 'IssueIcon',
    componentName: 'Issues',
  },
  {
    id: 13,
    name: 'Files',
    iconName: 'FileIcon',
    componentName: 'Files',
  },
  {
    id: 14,
    name: 'Chat',
    iconName: 'MessageIcon',
    componentName: 'Message',
  },
  {
    id: 15,
    name: 'Directory',
    iconName: 'DirectoryIcon',
    componentName: 'Directory',
  },
  {
    id: 16,
    name: 'Search',
    iconName: 'SearchIcon',
    componentName: 'Search',
  },
]

const Tabs = () => {
  const {
    showPlus,
    plusDestination,
    plusDestinationParams,
    showFileUploadModal,
    showBottomTabBar,
    tabbarHeight,
  } = useSelector((state) => state.tab)
  const { calendarLoading } = useSelector((state) => state.navigation)
  const auth = useSelector((state) => state.auth)
  const [showMoreTabMenu, setShowMoreTabMenu] = useState(false)
  const [showEditTabbarModal, setShowEditTabbarModal] = useState(false)
  const [currentTabBarData, setCurrentTabBarData] = useState(currentTabBar)
  const [moreTabBarData, setMoreTabBarData] = useState(moreTabData)
  const dispatch = useDispatch()
  useEffect(async () => {
    getItem('tabbarData').then((res) => {
      if (res) {
        setCurrentTabBarData(res)
      } else {
        setCurrentTabBarData(currentTabBar)
      }
    })
    getItem('moreData').then((res) => {
      if (res) {
        setMoreTabBarData(res)
      } else {
        setMoreTabBarData(moreTabData)
      }
    })
  }, [])

  const rendertabIcon = (iconName, focused) => {
    if (iconName === 'HomeIcon') {
      return <HomeIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'DocumentIcon') {
      return <DocumentIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'CalendarIcon') {
      return <CalendarIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'NotificationIcon') {
      return <NotificationIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'NoteIcon') {
      return <NoteIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'ListIcon') {
      return <ListIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'TimeLogIcon') {
      return <TimeLogIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'TimerIcon') {
      return <TimerIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'ProjectIcon') {
      return <ProjectIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'MilestoneIcon') {
      return <MilestoneIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'FileIcon') {
      return <FileIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'MessageIcon') {
      return <MessageIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'SearchIcon') {
      return <GlobalSearchIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'DirectoryIcon') {
      return <DirectoryIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    } else if (iconName === 'IssueIcon') {
      return <IssueIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
    }
  }

  const renderStack = (componentName) => {
    if (componentName == 'Home') {
      return HomeStack
    } else if (componentName === 'Tasks') {
      return TaskScreen
    } else if (componentName === 'Calendar') {
      return CalendarStack
    } else if (componentName === 'Notifications') {
      return NotificationScreen
    } else if (componentName === 'Notes') {
      return ProjectNoteScreen
    } else if (componentName === 'Lists') {
      return ChecklistScreen
    } else if (componentName === 'TimeLogs') {
      return TimelogsScreen
    } else if (componentName === 'Timer') {
      return UnderConstructionScreen
    } else if (componentName === 'Projects') {
      return ProjectScreen
    } else if (componentName === 'Milestones') {
      return MilestoneScreen
    } else if (componentName === 'Files') {
      return ProjectFolders
    } else if (componentName === 'Message') {
      return ChatListScreen
    } else if (componentName === 'Search') {
      return SearchScreen
    } else if (componentName === 'Directory') {
      return HomeStack
    } else if (componentName === 'Issues') {
      return IssueScreen
    }
  }

  return (
    <View style={{ flex: 1 }} forceInset={{ top: 'never', bottom: 'never' }}>
      <MoreTabMenuModal
        openModal={showMoreTabMenu}
        setOpenModal={setShowMoreTabMenu}
        moreTabBarData={moreTabBarData}
        setMoreTabBarData={setMoreTabBarData}
        setShowEditTabbarModal={setShowEditTabbarModal}
      />
      <TabbarEditModal
        openModal={showEditTabbarModal}
        setOpenModal={setShowEditTabbarModal}
        currentTabBarData={currentTabBarData}
        setCurrentTabBarData={setCurrentTabBarData}
        moreTabBarData={moreTabBarData}
        setMoreTabBarData={setMoreTabBarData}
      />

      {
        <Tab.Navigator
          initialRouteName="HomeStack"
          screenOptions={({ navigation, route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: [
              styles.tabBarStyle,
              { backgroundColor: showPlus ? 'transparent' : colors.BOTTOM_BAR_BG },
            ],
          })}
        >
          <Tab.Screen
            name="Home"
            screenOption={{
              tabBarHideOnKeyboard: true,
            }}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={styles.icon}>
                  <HomeIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
                </View>
              ),
            }}
            component={HomeStack}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                //  e.preventDefault()
                // //console.log(route.name, 'route...')
                navigation.navigate('Home', {
                  screen: 'Home',
                })
                // navigation.reset({
                //   index: 0,
                //   routes: [{ name: 'Home' }],
                // })
              },
            })}
          />
          {currentTabBarData[0].items?.map((tabbar) => {
            return (
              <Tab.Screen
                key={tabbar.name}
                name={tabbar.name}
                screenOption={{
                  tabBarHideOnKeyboard: true,
                }}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <View style={styles.icon}>{rendertabIcon(tabbar.iconName, focused)}</View>
                  ),
                }}
                component={renderStack(tabbar.componentName)}
                listeners={({ navigation, route }) => ({
                  tabPress: (e) => {
                    // e.preventDefault()
                    //console.log(route, 'route...')
                    if (route.name === 'Tasks') {
                      dispatch(setCurrentProject(null))
                      dispatch(setCurrentMilestone(null))
                    } else if (route.name === 'Issues') {
                      dispatch(setCurrentProject(null))
                      dispatch(setCurrentMilestone(null))
                      dispatch(setCurrentTask(null))
                    } else if (route.name === 'Lists') {
                      dispatch(setCurrentProject(null))
                      dispatch(setCurrentMilestone(null))
                      dispatch(setCurrentTask(null))
                      dispatch(setCurrentIssue(null))
                    } else if (route.name === 'Notes') {
                      dispatch(setCurrentProject(null))
                      dispatch(setCurrentMilestone(null))
                      dispatch(setCurrentTask(null))
                      dispatch(setCurrentIssue(null))
                    } else if (route.name === 'Milestones') {
                      dispatch(setCurrentProject(null))
                    } else if (route.name === 'Calendar') {
                      dispatch(setCurrentRoute('Calendar'))
                    } else if (route.name === 'Directory') {
                      navigation.push('Home', {
                        menuType: 'Directory',
                      })
                    } else if (route.name === 'Home') {
                      //console.log('this is home...')
                    }
                  },
                })}
              />
            )
          })}

          {/*  <Tab.Screen
        name="ProjectScreen"
        screenOption={{
          tabBarHideOnKeyboard: true,
        }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.icon}>
              <DocumentIcon size={24} color={focused ? colors.Focused_TAB: colors.WHITE} />
            </View>
          ),
        }}
        component={UnderConstructionScreen}
        listeners={() => null}
      />
      
       <Tab.Screen
        name="ProjectDetailsScreen4"
        screenOption={{
          tabBarHideOnKeyboard: true,
        }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.icon}>
              <CalendarIcon size={24} color={focused ? colors.Focused_TAB: colors.WHITE} />
            </View>
          ),
        }}
        component={CalendarStack}
      />
      <Tab.Screen
        name="Notifications Screen"
        screenOption={{
          tabBarHideOnKeyboard: true,
        }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.icon}>
              <NotificationIcon size={24} color={focused ? colors.Focused_TAB: colors.WHITE} />
            </View>
          ),
        }}
        component={UnderConstructionScreen}
      /> */}
          <Tab.Screen
            name="MoreScreen"
            screenOption={{
              tabBarHideOnKeyboard: true,
              // presentation: "containedModal"
            }}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={styles.icon}>
                  <MoreIcon size={24} color={focused ? colors.Focused_TAB : colors.WHITE} />
                </View>
              ),
            }}
            component={MoreScreen}
            // options={{ presentation: "containedModal" }}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                e.preventDefault()
                setShowMoreTabMenu(true)
              },
            })}
          />
          {/* {showPlus && (
        <Tab.Screen
          name="ProjectDetailsScreen3"
          screenOption={{
            tabBarHideOnKeyboard: true,
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.middleIcon}>
                <View style={styles.iconCounterRotate}>
                  <PlusIcon size={24} color={focused ? colors.Focused_TAB: colors.WHITE} />
                </View>
              </View>
            ),
          }}
          component={UnderConstructionScreen}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault()
              // Do something with the `navigation` object
              if (plusDestinationParams) {
                navigation.navigate(plusDestination, plusDestinationParams)

              } else {
                navigation.navigate(plusDestination)
              }
            },
          })}
        />
      )} */}
        </Tab.Navigator>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    // backgroundColor: 'gray',
  },
  tabBarStyle: {
    position: 'absolute',
    width: '100%',
    hieght: 56,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // left: 0,
    // right: 0,
    // bottom: 0,
    // height: 56,
    // borderTopWidth: 0,
    // elevation: 0,
  },
  middleIcon: {
    position: 'relative',
    // bottom: 32,
    backgroundColor: 'dodgerblue',
    borderRadius: 10,
    borderColor: 'dodgerblue',
    transform: [{ rotate: '45deg' }],
    padding: 10,
  },
  iconCounterRotate: {
    transform: [{ rotate: '-45deg' }],
  },
})

export default Tabs
