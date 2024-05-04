import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CalendarIcon from '../icons/CalendarIcon'
import DirectoryIcon from '../icons/DirectoryIcon'
import DocumentIcon from '../icons/DocumentIcon'
import FileIcon from '../icons/FileIcon'
import GlobalSearchIcon from '../icons/GlobalSearchIcon'
import HomeIcon from '../icons/HomeIcon'
import ListIcon from '../icons/ListIcon'
import MessageIcon from '../icons/MessageIcon'
import MilestoneIcon from '../icons/MilestoneIcon'
import NoteIcon from '../icons/NoteIcons'
import NotificationIcon from '../icons/NotificationIcon'
import ProjectIcon from '../icons/ProjectIcons'
import TimeLogIcon from '../icons/TimelogIcon'
import TimerIcon from '../icons/TimerIcon'

import { useDispatch, useSelector } from 'react-redux'
import {
  setCurrentIssue,
  setCurrentMilestone,
  setCurrentProject,
  setCurrentTask,
  setSearchNavigationFrom,
} from '../../store/slices/navigation'
import IssueIcon from '../icons/IssueIcon'
const MoreTabMenuModal = ({
  openModal,
  setOpenModal,
  moreTabBarData,
  setMoreTabBarData,
  setShowEditTabbarModal,
}) => {
  const { tabbarHeight } = useSelector((state) => state.tab)
  const { currentRoute } = useSelector((state) => state.navigation)
  // //console.log(currentRoute,'999999999999')
  const dispatch = useDispatch()

  // //console.log('tabbarHeight in the modal', tabbarHeight)
  const closeModal = () => {
    setOpenModal(false)
  }
  const navigation = useNavigation()
  const route = useRoute()
  const renderIcon = (iconName) => {
    if (iconName === 'NoteIcon') {
      return <NoteIcon color={colors.NORMAL} />
    } else if (iconName === 'ListIcon') {
      return <ListIcon color={colors.NORMAL} />
    } else if (iconName === 'TimeLogIcon') {
      return <TimeLogIcon color={colors.NORMAL} />
    } else if (iconName === 'TimerIcon') {
      return <TimerIcon color={colors.NORMAL} />
    } else if (iconName === 'ProjectIcon') {
      return <ProjectIcon color={colors.NORMAL} />
    } else if (iconName === 'MilestoneIcon') {
      return <MilestoneIcon color={colors.NORMAL} />
    } else if (iconName === 'FileIcon') {
      return <FileIcon color={colors.NORMAL} />
    } else if (iconName === 'MessageIcon') {
      return <MessageIcon color={colors.NORMAL} />
    } else if (iconName === 'HomeIcon') {
      return <HomeIcon color={colors.NORMAL} />
    } else if (iconName === 'DocumentIcon') {
      return <DocumentIcon color={colors.NORMAL} />
    } else if (iconName === 'CalendarIcon') {
      return <CalendarIcon color={colors.NORMAL} />
    } else if (iconName === 'NotificationIcon') {
      return <NotificationIcon color={colors.NORMAL} />
    } else if (iconName === 'SearchIcon') {
      return <GlobalSearchIcon color={colors.NORMAL} />
    } else if (iconName === 'DirectoryIcon') {
      return <DirectoryIcon color={colors.NORMAL} />
    } else if (iconName === 'IssueIcon') {
      return <IssueIcon color={colors.NORMAL} />
    }
  }

  const renderScreen = (name) => {
    if (name == 'Home') {
      return 'Home'
    } else if (name == 'Tasks') {
      dispatch(setCurrentProject(null))
      dispatch(setCurrentMilestone(null))
      return 'Tasks'
    } else if (name == 'Calendar') {
      return 'Calendar'
    } else if (name == 'Notifications') {
      return 'Home'
    } else if (name == 'Notes') {
      dispatch(setCurrentProject(null))
      dispatch(setCurrentMilestone(null))
      dispatch(setCurrentTask(null))
      dispatch(setCurrentIssue(null))
      return 'Notes'
    } else if (name == 'Lists') {
      dispatch(setCurrentProject(null))
      dispatch(setCurrentMilestone(null))
      dispatch(setCurrentTask(null))
      dispatch(setCurrentIssue(null))
      return 'Checklist'
    } else if (name == 'Time log') {
      return 'Timelogs'
    } else if (name == 'Timer') {
      return 'Home'
    } else if (name == 'Projects') {
      return 'Projects'
    } else if (name == 'Milestones') {
      dispatch(setCurrentProject(null))
      return 'Milestones'
    } else if (name == 'Files') {
      return 'ProjectFolders'
    } else if (name == 'Chat') {
      return 'ChatListScreen'
    } else if (name === 'Search') {
      return 'Search'
    } else if (name === 'Directory') {
      return 'Home'
    } else if (name === 'Issues') {
      dispatch(setCurrentProject(null))
      dispatch(setCurrentMilestone(null))
      dispatch(setCurrentTask(null))
      return 'Issues'
    }
  }

  const [moreUpdatedData, setMoreUpdatedata] = useState(moreTabBarData)
  useEffect(() => {
    setMoreUpdatedata(moreTabBarData)
  }, [openModal])
  return (
    <Modal
      visible={openModal}
      // animationType={'slide'}
      transparent={true}
      onRequestClose={closeModal}
      fullScreen={false}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View
          style={[
            styles.modal,
            Platform.OS === 'ios' ? { marginBottom: tabbarHeight } : { marginBottom: 56 },
          ]}
        >
          <View style={[styles.modalContent]}>
            <View style={styles.topbar}></View>
            <TouchableOpacity
              style={styles.reOrderContainer}
              onPress={() => {
                closeModal()
                setShowEditTabbarModal(true)
              }}
            >
              {/* <Text style={[g.body1]}>Reorder</Text> */}
              <Text style={[g.body1]}>Customization</Text>
            </TouchableOpacity>
            <View style={{ width: '100%' }}>
              {
                <FlatList
                  key={'grid'}
                  data={moreUpdatedData.filter((data) => data.name !== 'More')}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ alignItems: 'center', padding: 10, minWidth: 90 }}
                      onPress={() => {
                        if (item.name === 'Directory') {
                          navigation.push('Home', {
                            menuType: 'Directory',
                          })
                        } else if (item.name === 'Search') {
                          dispatch(setSearchNavigationFrom('moreTab'))
                          navigation.navigate('Search')
                        } else {
                          navigation.navigate(renderScreen(item.name))
                        }
                        closeModal()
                      }}
                    >
                      {renderIcon(item.iconName)}
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  contentContainerStyle={{
                    marginBottom: 24,
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                />
              }
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    height: '100%',
    flex: 1,
    backgroundColor: '#010714B8',
    // backgroundColor: 'red',
    // marginBottom: 56,
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
  },

  texts: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 18,
  },
  border: {
    borderColor: '#FFFFFF',
    borderTopWidth: 1,
  },
  modal2: {
    width: '100%',
    justifyContent: 'flex-end',
    height: '100%',

    flex: 1,
    backgroundColor: '#010714B8',
  },
  modalContent2: {
    backgroundColor: colors.WHITE,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    bottom: 56,
  },
  reOrderContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  topbar: {
    borderTopColor: colors.LIGHT_GRAY,
    borderTopWidth: 5,
    width: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 1,
  },
})

export default MoreTabMenuModal
