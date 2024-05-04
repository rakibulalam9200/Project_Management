import React from 'react'
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'
import colors from '../../assets/constants/colors'

const financeMenu = [
  {
    title: 'Add New Budget',
    action: 'BudgetAdd',
  },
  {
    title: 'Add New Expense',
    action: '',
  },
  {
    title: 'Add New Card',
    action: '',
  },
]

const reportsMenu = [
  {
    title: 'Add New Timelog',
    action: 'TimelogAdd',
  },
  {
    title: 'Add New Productivity',
    action: '',
  },
  {
    title: 'Add New Expense',
    action: '',
  },
  {
    title: 'Add New Grant',
    action: '',
  },
]

const directoryMenu = [
  {
    title: 'Add New User',
    action: 'UserAdd',
  },
  {
    title: 'Add New Team',
    action: '',
  },
  {
    title: 'Add New Customer',
    action: '',
  },
  {
    title: 'Add New Vendor',
    action: '',
  },
  {
    title: 'Add New Group',
    action: 'GroupAdd',
  },
]

const generalMenu = [
  {
    title: 'Add New Project',
    action: 'ProjectAdd',
  },
  {
    title: 'Add New Milestone',
    action: 'MilestoneAdd',
  },
  {
    title: 'Add New Task',
    action: 'TaskAdd',
  },
  {
    title: 'Add New Issue',
    action: 'IssueAdd',
  },
  {
    title: 'Add New Timelog',
    action: 'TimelogAdd',
  },
]

const HomeMultiMenuModal = ({ openModal, setOpenModal, action, menutype }) => {
  const { tabbarHeight } = useSelector((state) => state.tab)

  const menu = () => {
    switch (menutype) {
      case 'Finance':
        return financeMenu
      case 'Reports':
        return reportsMenu
      case 'Directory':
        return directoryMenu
      case 'General':
        return generalMenu
      case 'Calendar':
        const calendarMenu = [...generalMenu]
        calendarMenu.pop()
        calendarMenu.push({
          title: 'Add New Event',
          action: 'AddEvent',
        })
        return calendarMenu
      default:
        return generalMenu
    }
  }

  const closeModal = () => {
    setOpenModal(false)
  }
  // //console.log('menutype', menutype)
  return (
    <View style={{ flex: 1 }}>
      <Modal
        visible={openModal}
        animationType={'slide'}
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={[styles.modal]}>
            <View style={[styles.modalContent, Platform.OS === "ios" ? { bottom: tabbarHeight } : { bottom: 50 }]}>
              {menu().map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.action == '') return Alert.alert('Under Construction')
                      action(item.action)
                    }}
                  >
                    <Text style={[styles.texts, index != 0 && styles.border]}>{item.title}</Text>
                  </TouchableOpacity>
                </View>
              ))
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    // width: '100%',
    justifyContent: 'flex-end',
    // alignItems: 'flex-end',
    // height: 500,
    flex: 1,
    backgroundColor: '#010714B8',
    // backgroundColor: 'red',
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 27,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    // bottom: tabbarHeight
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
})

export default HomeMultiMenuModal
