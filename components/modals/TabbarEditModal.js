import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import DragAndDrop from 'volkeno-react-native-drag-drop'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import GripIcon from '../../assets/svg/grip.svg'
import MoreIcon from '../../assets/svg/more-vertical.svg'
import ReOrderIcon from '../../assets/svg/re-oderIcon.svg'
import CButton from '../common/CButton'
import CText from '../common/CText'
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
import NoteIcon from '../icons/NoteIcons'
import NotificationIcon from '../icons/NotificationIcon'
import ProjectIcon from '../icons/ProjectIcons'
import TimeLogIcon from '../icons/TimelogIcon'
import TimerIcon from '../icons/TimerIcon'
import CustomizationOptionModal from './CustomizationOptionModal'

const setItem = async (key, arr) => {
  await AsyncStorage.setItem(key, JSON.stringify(arr))
}

const TabbarEditModal = ({
  openModal,
  setOpenModal,
  moreTabBarData,
  setMoreTabBarData,
  currentTabBarData,
  setCurrentTabBarData,
}) => {
  const { tabbarHeight } = useSelector((state) => state.tab)
  const [dragable, setDragable] = useState('')
  const [optionModal, setOptionModal] = useState(false)
  const [hovering, setHovering] = useState(false)
  const closeModal = () => {
    setOpenModal(false)
  }
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
    } else if (iconName === 'DirectoryIcon') {
      return <DirectoryIcon color={colors.NORMAL} />
    } else if (iconName === 'SearchIcon') {
      return <GlobalSearchIcon color={colors.NORMAL} />
    } else if (iconName === 'IssueIcon') {
      return <IssueIcon color={colors.NORMAL} />
    }
  }

  const Card = ({ item, drag }) => {
    return (
      <>
        {item.name !== 'More' && (
          <TouchableOpacity
            style={styles.cardContainer}
            onPressIn={() => {
              if (dragable === 'reorder') {
                drag()
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View>{renderIcon(item.iconName)}</View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.name}</Text>
              </View>
            </View>
            {dragable === 'reorder' && (
              <View>
                <ReOrderIcon />
              </View>
            )}
          </TouchableOpacity>
        )}
      </>
    )
  }
  const home = { iconName: 'HomeIcon', name: 'Home' }
  return (
    <View>
      <Modal
        visible={openModal}
        animationType={'slide'}
        transparent={true}
        // onRequestClose={closeModal}
      >
        <CustomizationOptionModal
          openCustomizationModal={optionModal}
          setOpenCustomizationModal={setOptionModal}
          dragable={dragable}
          setDragable={setDragable}
        />

        <View
          style={[
            styles.modal,
            Platform.OS === 'ios' ? { marginBottom: tabbarHeight } : { marginBottom: 56 },
          ]}
        >
          <View style={[styles.modalContent]}>
            <View></View>
            <View style={styles.headerContainer}>
              <Text style={[g.body3, { marginVertical: 6 }]}>Edit</Text>
              <TouchableOpacity
                style={{ paddingHorizontal: 4 }}
                onPress={() => {
                  //console.log('Hit here...')
                  setOptionModal(true)
                }}
              >
                <MoreIcon color={colors.NORMAL} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.cardContainer]}
              onLongPress={() => Alert.alert('Home is not Moveable!')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>{renderIcon('HomeIcon')}</View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 18, lineHeight: 21 }}>{'Home'}</Text>
                </View>
              </View>
            </TouchableOpacity>
            {dragable === 'drag' && (
              <DragAndDrop
                style={{ backgroundColor: 'none' }}
                contentContainerStyle={{
                  backgroundColor: 'none',
                  flexDirection: 'column-reverse',
                  // flex:1,
                }}
                maxItemsPerZone={5}
                itemKeyExtractor={(item) => item.id}
                zoneKeyExtractor={(zone) => zone.id}
                zones={currentTabBarData}
                items={moreTabBarData}
                itemsContainerStyle={{ paddingTop: 16 }}
                // zonesContainerStyle={{ order: 2 }}
                onMaj={(currentTabBarData, moreTabBarData) => {
                  //console.log(moreTabBarData, '-------------')
                  //console.log(currentTabBarData, '###########')
                  //console.log(currentTabBarData[0].items.length, moreTabBarData.length, hovering)
                  if (currentTabBarData[0].items.length == 5 && hovering == true) {
                    Alert.alert('Maximum 6 items can have TabBar')
                  }
                  setCurrentTabBarData(currentTabBarData)
                  setMoreTabBarData(moreTabBarData)
                }}
                itemsInZoneStyle={{ width: '100%' }}
                renderZone={(zone, children, hover) => {
                  //console.log(children?.props?.items?.length)
                  setHovering(hover)
                  return (
                    <View style={{ marginBottom: 0 }}>
                      {children}
                      <View
                        style={[
                          {
                            borderBottomWidth: 1,
                            borderBottomColor: '#D6E2FF',
                          },
                          !children?.props?.items?.length
                            ? { paddingVertical: 16 }
                            : { paddingTop: 8 },
                        ]}
                      ></View>
                      {/* <Text style={[g.body2, { marginTop: 6, marginBottom: 0 }]}>More</Text> */}
                    </View>
                  )
                }}
                renderItem={(item) => {
                  // //console.log(item,'item.....')
                  return (
                    <View>
                      {item?.name !== 'More' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginVertical: 4,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity>{renderIcon(item.iconName)}</TouchableOpacity>
                            <View style={{ marginLeft: 10 }}>
                              <Text style={{ fontSize: 18, lineHeight: 21 }}>{item?.name}</Text>
                            </View>
                          </View>

                          <View>
                            <GripIcon />
                          </View>
                        </View>
                      ) : (
                        <View>
                          <Text style={[g.body2, { color: ' #001D52' }]}>More</Text>
                        </View>
                      )}
                    </View>
                  )
                }}
              />
            )}
            {(dragable === '' || dragable === 'reorder') && (
              <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <DraggableFlatList
                    data={currentTabBarData[0].items}
                    renderItem={(props) => <Card {...props} />}
                    keyExtractor={(item, index) => item.id}
                    onDragBegin={() => {}}
                    onDragEnd={({ data }) => {
                      // setDragable(false)
                      const copy = [...currentTabBarData]
                      copy[0].items = data
                      setCurrentTabBarData(copy)
                    }}
                    containerStyle={{
                      flex: 2,
                    }}
                  />
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#D6E2FF',
                      marginVertical: 8,
                    }}
                  ></View>
                  <Text style={[g.body2, { marginVertical: 6 }]}>More</Text>
                  <DraggableFlatList
                    data={moreTabBarData}
                    renderItem={Card}
                    keyExtractor={(item, index) => item.id}
                    onDragBegin={() => {}}
                    onDragEnd={({ data }) => {
                      // setDragable(false)
                      setMoreTabBarData(data)
                    }}
                    containerStyle={{
                      flex: 3,
                    }}
                  />
                </View>
              </GestureHandlerRootView>
            )}
            <View style={[styles.listItemContainer, { width: '100%', marginVertical: 10 }]}>
              <CButton
                type="gray"
                style={[styles.holdButton]}
                onPress={() => {
                  // setDragable(false)
                  closeModal()
                  setDragable('')
                }}
              >
                <CText style={g.title3}>Cancel</CText>
              </CButton>
              <CButton
                style={[styles.closeButton]}
                onPress={() => {
                  closeModal()
                  setDragable('')
                  setItem('moreData', moreTabBarData)
                  setItem('tabbarData', currentTabBarData)
                }}
              >
                <CText style={g.title3}>Save</CText>
              </CButton>
            </View>
            {/* </ScrollView> */}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // height:'500'
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: '#white',
    // backgroundColor: 'red',
    // marginBottom: 56,
    paddingTop: 8,
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    flex: 1,
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
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
    alignSelf: 'flex-start',
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
  cardContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    justifyContent: 'space-between',
    width: '100%',
    // flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  margin1x: {
    marginBottom: 8,
  },
  margin2x: {
    marginVertical: 10,
  },
  holdButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '48%',
  },
  closeButton: {
    backgroundColor: colors.SECONDARY,
    width: '48%',
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
})

export default TabbarEditModal
