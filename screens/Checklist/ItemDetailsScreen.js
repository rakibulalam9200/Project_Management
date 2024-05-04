import React, { useEffect, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import MoreIcon from '../../assets/svg/more.svg'
import PlusIcon from '../../assets/svg/plus-expand.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import RightArrowIcon from '../../assets/svg/right-arrow.svg'
import CButton from '../../components/common/CButton'
import CText from '../../components/common/CText'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import CheckListItemModal from '../../components/modals/ChecklistItemModal'

const ItemDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const [listItemDetails, setListItemDetails] = useState({})
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [showChecklistSettingModal, setShowChecklistSettingModal] = useState(false)
  
  
  const openChecklistItemModal = () => {
    setShowChecklistModal(true)
  }
  const openChecklistSettingModal = () => {
    setShowChecklistSettingModal(true)
  }

  useEffect(() => {
    const showItemDetails = async () => {
      if (!id) return
      //console.log(id, 'id.......................')
      api.checklist
        .getItemDetails(id)
        .then((res) => {
          if (res.success) {
            //console.log(res.list_item, 'res.................')
            setListItemDetails(res.list_item)
          }
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
    }
    showItemDetails()
  }, [refetch])
  return (
    <SafeAreaView style={[{flex:1}]}>
      <CheckListItemModal
        visibility={showChecklistModal}
        setVisibility={setShowChecklistModal}
        editItem={listItemDetails}
      />
      <CDetailsSettingModal
        visibility={showChecklistSettingModal}
        setVisibility={setShowChecklistSettingModal}
        onEdit={() => navigation.navigate('ItemEdit', { itemId: id })}
        // onDelete={() => setShowDeleteModal(true)}
        // // onReOrder={() => setDraggable((prev) => !prev)}
        // onClone={attemptClone}
      />
      <View style={[s.outerContainer]}>
        <View style={s.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <CText style={[g.body1, s.textColor]}>Details</CText>
          <View style={s.buttonGroup}>
            <TouchableOpacity
              style={s.buttonGroupBtn}
              onPress={() => {
                setShowChecklistSettingModal(true)
              }}
            >
              <MoreIcon fill={colors.NORMAL} />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <CText style={s.descriptionText}>{listItemDetails?.description?.value}</CText>
          <View style={[s.cardRowLeft, s.dFlex]}>
            <Text style={g.gCardStatus}>{'Opened'}</Text>
            {/* <Text style={s.priorityStatus}>{issueDetails.priority}</Text> */}
          </View>
        </View>
        <View style={s.listItemContainer}>
          <View style={s.listItemTitle}>
            <CText style={[g.title1, s.listItemTitleText]}>
              Chat <CText style={s.listItemSubTitle}>(8)</CText>
            </CText>
            <RightArrowIcon fill={colors.NORMAL} />
          </View>
          <PlusIcon fill={colors.NORMAL} />
        </View>
        <View style={s.listItemContainer}>
          <View style={s.listItemTitle}>
            <CText style={[g.title1, s.listItemTitleText]}>
              Files <CText style={s.listItemSubTitle}>(8)</CText>
            </CText>
            <RightArrowIcon fill={colors.NORMAL} />
          </View>
          <PlusIcon fill={colors.NORMAL} />
        </View>
        <View style={s.divider}>
          <CButton style={[s.margin1x, { backgroundColor: '#246BFD' }]}>
            <CText style={g.title3}>Complete</CText>
          </CButton>
        </View>
        <View style={s.divider}></View>
      </View>
    </SafeAreaView>
  )
}

export default ItemDetailsScreen

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 24,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  titleText: {
    fontSize: 30,
    color: 'black',
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon2: {
    position: 'relative',
    left: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  calendarText: {
    color: 'black',
    marginLeft: 5,
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
  },
  descriptionContainer: {
    flex: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 10,
    width: '100%',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1DAF2B',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 32,
  },
  priorityStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 20,
    backgroundColor: 'white',
    color: '#1DAF2B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 10,
    marginLeft: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  listItemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  listItemTitleText: {
    fontSize: 20,
    color: 'black',
  },
  listItemIcon: {
    marginLeft: 10,
  },
  listItemSubTitle: {
    color: 'gray',
  },
  divider: {
    marginTop: 40,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  margin1x: {
    marginVertical: 10,
  },
  holdButton: {
    backgroundColor: 'red',
  },
  timeWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeContent: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#D6E2FF',
    padding: 6,
    borderRadius: 6,
  },
  marginL: {
    marginLeft: 12,
  },
  marginT: {
    marginTop: 8,
  },
  marginB: {
    marginBottom: 8,
  },
  dFlex: {
    display: 'flex',
    flexDirection: 'row',
    marginRight: 5,
  },
  marginTopNull: {
    marginTop: 0,
  },
  marginBottomNull: {
    marginBottom: 0,
  },
  ownerContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  textColor: {
    color: colors.NORMAL,
  },
})
