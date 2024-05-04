import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'

import CalendarIcon from '../../assets/svg/calendar2.svg'
import DollarIcon from '../../assets/svg/dollar.svg'
import ClockIcon from '../../assets/svg/clock.svg'
import LocationIcon from '../../assets/svg/location-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
import RightAngularBrace from '../../assets/svg/right_arrow_2.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useRef, useState } from 'react'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CButton from '../../components/common/CButton'
import { jsCoreDateCreator } from '../../utils/Timer'
import { getOnlyErrorMessage } from '../../utils/Errors'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { Image } from 'react-native'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'
import { findTimeDifference } from '../../utils/Timer'
import { TimelogColor } from '../../assets/constants/filters'
import TimelogCommentModal from '../../components/modals/TimelogCommentModal'
import { useIsFocused } from '@react-navigation/native'
import TimelogMenuModal from '../../components/modals/TimelogMenuModal'

const TimelogDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const [timelogDetails, setTimelogDetails] = useState({})
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState({
    decline: false,
    approve: false,
    delete: false,
    move: false,
    clone: false,
    draft: false,
  })
  const [readMore, setReadMore] = useState(false)
  const [timeRange, setTimeRange] = useState('')

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { navigationFrom, currentIssue, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )
  const [refresh, setRefresh] = useState(false)
  const isFocused = useIsFocused()
  const user = useSelector((state) => state.user)

  const openDeclineModal = () => {
    setShowDeclineModal(true)
  }


  useEffect(() => {
    const getTimelogDetails = async () => {
      setLoading(true)
      try {
        let res = await api.timelog.getTimelogDetails(id)
        if (res.success) {
          const data = res.timelog
          //console.log(data, 'timelog details')
          setTimelogDetails(data)
          let range = ''
          if (data?.start_date && data?.end_date) {
            range = findTimeDifference(jsCoreDateCreator(data?.start_date), jsCoreDateCreator(data?.end_date), true)
          } else {
            range = data.number_of_hour.split(':')[0] + 'h:' + data.number_of_hour.split(':')[1] + 'm'
          }
          setTimeRange(range)
        }
      } catch (err) {
        //console.log(err.response)
        let errorMsg = ''
        try {
          errorMsg = getOnlyErrorMessage(err)
        } catch (err) {
          //console.log(err)
          errorMsg = 'An error occured. Please try again later.'
        }
        Alert.alert(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    id && getTimelogDetails()
  }, [refresh, refetch, isFocused])



  const handleApprove = async () => {
    const params = {
      timelog_ids: [id],
    }

    setBtnLoading({ ...btnLoading, approve: true })
    try {
      let res = await api.timelog.approveTimelog(params)
      if (res.success) {
        Alert.alert('Timelog approved successfully')
        setRefresh((prev) => !prev)
      }
    } catch (err) {
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoading({ ...btnLoading, approve: false })
    }
  }


  const handleBackToDraft = async () => {
    const params = {
      id,
      stage: 'Draft',
    }

    setBtnLoading({ ...btnLoading, draft: true })

    try {
      let res = await api.timelog.timelogStatusChange(id, params)
      if (res.success) {
        Alert.alert('Timelog status changed successfully')
        setRefresh((prev) => !prev)
      }
    } catch (err) {
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoading({ ...btnLoading, draft: false })
    }

  }

  const handleDelete = async () => {
    const params = {
      timelog_ids: [id],
    }
    setBtnLoading({ ...btnLoading, delete: true })
    try {
      let res = await api.timelog.deleteMultipleTimelogs(params)
      if (res.success) {
        Alert.alert('Timelog deleted successfully')
        navigation.goBack()
      }
    } catch (err) {
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoading({ ...btnLoading, delete: false })
    }


  }

  let title = timelogDetails?.issue ? timelogDetails?.issue?.name : timelogDetails.task ? timelogDetails?.task?.name : timelogDetails?.milestone ? timelogDetails?.milestone?.name : timelogDetails?.project?.name








  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <TimelogMenuModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('TimelogEdit', { id, refetch })}
        onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />
      <TimelogCommentModal
        visibility={showDeclineModal}
        setVisibility={setShowDeclineModal}
      />

      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        confirmationMessage="Do you want to delete this timelog? This cannot be undone."
        onDelete={handleDelete}
        btnLoader={btnLoading.delete}
      />

      <View style={[s.outerContainer]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
            style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>
          <Text style={[g.body1]}>Details</Text>

          <TouchableOpacity
            style={s.buttonGroup}
            onPress={() => {
              setShowSettingsModal(true)
            }}
          >
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={g.loaderContainer}>
            <ActivityIndicator size="small" color={'blue'} />
          </View>
        )}
        {!loading && (
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ marginLeft: 8, marginVertical: 4, color: colors.NORMAL, fontWeight: '600', fontSize: 16 }}>
                {title}
              </Text>
              <IconWrap outputRange={iconWrapColors}>
                <RightAngularBrace fill={colors.NORMAL} />
              </IconWrap>
            </View>

            <View style={{ flex: 1 }}>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={s.timeContainer}>
                  < Image style={s.personAvatar} source={{ uri: timelogDetails?.user_owner?.image }} />
                  <Text style={{ fontSize: 22, fontWeight: '700' }}>{timeRange}</Text>
                </View>

                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.WHITE, paddingVertical: 16, marginTop: 10, }}>
                  <View style={s.dateTimeContainer}>

                    <View
                      style={s.containerLeft}
                    >
                      <IconWrap
                        outputRange={iconWrapColors}
                      >
                        <CalendarIcon fill={colors.NORMAL} />
                      </IconWrap>
                      <Text style={{ fontWeight: '700', fontSize: 18 }}>
                        {timelogDetails?.start_date?.split('T')[0]}
                      </Text>
                    </View>

                    <View
                      style={s.containerLeft}
                      onPress={() => setDatePickerVisible((prev) => !prev)}
                    >
                      <IconWrap
                        outputRange={iconWrapColors}
                      >
                        <ClockIcon />
                      </IconWrap>
                      <Text style={{ fontWeight: '700', fontSize: 18 }}>
                        {timelogDetails?.start_date?.split('T')[1].slice(0, 5) + '-' + timelogDetails?.end_date?.split('T')[1].slice(0, 5)}
                      </Text>
                    </View>

                  </View>

                  <View style={s.dateTimeContainer}>

                    <View
                      style={s.containerLeft}
                    >
                      <IconWrap
                        outputRange={iconWrapColors}
                      >
                        <DollarIcon fill={colors.NORMAL} />
                      </IconWrap>
                      <Text style={{ fontWeight: '700', fontSize: 18 }}>
                        ${timelogDetails.labor}
                      </Text>
                    </View>

                    <View
                      style={{ width: '50%' }}
                      onPress={() => setDatePickerVisible((prev) => !prev)}
                    >
                      <Text style={{ color: colors.LIGHT_GRAY }}>Status:</Text>
                      <Text
                        style={[
                          g.gCardStatus,
                          // { marginLeft: 7},
                          { backgroundColor: TimelogColor[timelogDetails.stage]?.color, alignSelf: 'flex-start', marginTop: 5 },
                        ]}
                      >
                        {timelogDetails?.stage}
                      </Text>
                    </View>

                  </View>
                </View>

                {timelogDetails?.description && <View style={{ marginBottom: 16, marginTop: 8, paddingBottom: 10 }}>
                  {!readMore && timelogDetails?.description?.value.length > 100 ? (
                    <CText style={s.descriptionText}>
                      {timelogDetails?.description?.value?.slice(0, 100) + '...'}
                      <Text style={{ color: '#246BFD' }} onPress={() => setReadMore(true)}>
                        {' '}
                        Read More
                      </Text>
                    </CText>
                  ) : (
                    <CText style={s.descriptionText}>{timelogDetails?.description?.value}</CText>
                  )}
                </View>}

              </ScrollView>

            </View>

            {
              timelogDetails?.stage === 'Approved' ?
                <View style={{ flexDirection: 'row' }}>
                  <CButton
                    style={[s.margin1x, { backgroundColor: '#246BFD', }]}
                    loading={btnLoading.draft}
                    onPress={handleBackToDraft}
                    loadingColor={colors.WHITE}
                  >
                    <CText style={g.title3}>Back to draft</CText>
                  </CButton>
                </View>

                :
                <View style={{ flexDirection: 'row' }}>
                  <CButton
                    style={[
                      s.margin1x,
                      { backgroundColor: colors.RED_NORMAL, width: '50%', marginRight: 8 },
                    ]}
                    onPress={openDeclineModal}
                  >
                    <CText style={g.title3}>Decline</CText>
                  </CButton>
                  <CButton
                    style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                    loading={btnLoading.approve}
                    loadingColor={colors.WHITE}
                    onPress={handleApprove}
                  >
                    <CText style={g.title3}>Approve</CText>
                  </CButton>
                </View>
            }


          </View>
        )
        }

      </View >
    </SafeAreaView >
  )
}


export default TimelogDetailsScreen

const s = StyleSheet.create({
  pdfContainer: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: '#D6E2FF',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginRight: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
    marginRight: 16,
  },

  memberCardContainer: { marginVertical: 10, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.SEC_BG, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  memberCard: { width: '48%', backgroundColor: colors.WHITE, padding: 10, borderRadius: 10 },

  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  cardRowBetweenForAdressComponent: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    // padding: 10,
    // borderWidth: 1,
  },
  outerContainer: {
    // paddingTop: Platform.OS !== 'ios' ? StatusBar.currentHeight : StatusBar.currentHeight + 25,
    paddingHorizontal: 24,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 55,
    paddingTop: 10,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
    // backgroundColor: 'yellow',
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
    fontSize: 24,
    color: '#000E29',
    // marginBottom: 16,
    // fontFamily: 'inter-bold',
    fontWeight: '700',
  },
  smallText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
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
    gap: 10,
    marginVertical: 8,
    width: '50%',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  normalText: {
    color: '#001D52',
    marginLeft: 8,
  },
  descriptionText: {
    color: '#001D52',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    // fontFamily:'inter',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgb(45, 156, 219)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    // marginVertical: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
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
  },
  margin1x: {
    marginBottom: 10,
  },
  holdButton: {
    backgroundColor: colors.HEADER_TEXT,
    width: '50%',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: colors.SECONDARY,
    width: '50%',
  },
  reOpenButton: {
    backgroundColor: colors.SECONDARY,
    width: '100%',
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  detailsPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginBottom: 16,
  },
  detailsPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  detailsPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  detailsPickerButtonText: {
    color: colors.BLACK,
    // fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  detailsPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  dragItemWrapper: {
    backgroundColor: colors.CONTAINER_BG,
    width: '0.1%',
  },
  smallTitle: {
    color: '#9CA2AB',
    fontSize: 12,
    marginTop: 4,
  },

  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 4,
  },

  timeContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    marginVertical: 10,
  },

  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

})
