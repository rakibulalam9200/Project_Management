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
import LocationIcon from '../../assets/svg/location-blue.svg'
import MoreIcon from '../../assets/svg/more.svg'
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
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'

import { extractDateTimeFormatNew, getDateTime, getYearMonthDayDateFromDateObj, jsCoreDateCreator, secondtoHms } from '../../utils/Timer'
import MoveModal from '../../components/modals/MoveModal'
import { getOnlyErrorMessage } from '../../utils/Errors'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import CloneConfirmationModal from '../../components/modals/CloneConfirmationModal'
import { Image } from 'react-native'
import { getFileExtenstionFromUri } from '../../utils/Attachmets'

const EventDetailsScreen = ({ navigation, route }) => {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  let id = route.params ? route.params.id : null
  let refetch = route.params ? route.params?.refetch : null
  const [eventDetails, setEventDetails] = useState({})
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [readMore, setReadMore] = useState(false)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const { navigationFrom, currentIssue, searchNavigationFrom } = useSelector(
    (state) => state.navigation
  )


  const [refresh, setRefresh] = useState(false)
  const user = useSelector((state) => state.user)

  const openDeclineModal = () => {
    // setShowDeclineModal(true)
  }


  useEffect(() => {
    const getEventDetails = async () => {
      setLoading(true)
      try {
        let res = await api.calendar.getEventDetails(id)
        if (res.success) {
          //console.log(res.data, 'event details')
          setEventDetails(res.data)
          // setStartDate(getYearMonthDayDateFromDateObj(
          //   res.data.created_at,
          //   true,
          //   false
          // ))
          const createdAt = res.data.created_at.split('T')[0]
          const date = jsCoreDateCreator(createdAt)
          const formatedDate = getYearMonthDayDateFromDateObj(date, true, false)
          setStartDate(formatedDate)
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

    id && getEventDetails()
  }, [refresh, refetch])




  let dateRange =
    `From ${extractDateTimeFormatNew(eventDetails.start_date) + ' To ' + extractDateTimeFormatNew(eventDetails.end_date)}`



  const AddressComponent = ({ address, each }) => {
    return address ? (
      address !== 'null' && (
        <TouchableOpacity
          key={each && each?.id}
          onPress={() => {
            address
              ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
              : console.log('No address')
          }}
          style={[s.cardRowBetweenForAdressComponent, { flex: 1 }]}
        >
          {/* <View style={{backgroundColor:'yellow'}}> */}
          <IconWrap
            onPress={() => {
              address
                ? Linking.openURL(`http://maps.google.com/?q=${address.replace(' ', '+')}`)
                : console.log('No address')
            }}
            outputRange={iconWrapColors}
          >
            <LocationIcon />
          </IconWrap>
          {/* <Text style={[{ marginRight: 4, }, s.normalText]}>{address}</Text> */}
          <CText style={s.normalText}>{address}</CText>
          {/* </View> */}
        </TouchableOpacity>
      )
    ) : (
      <></>
    )
  }

  // Files component
  const FilesCard = ({ item }) => {
    const { name, url, created_at } = item
    const extension = getFileExtenstionFromUri(url).toLowerCase()

    return (
      <TouchableWithoutFeedback>
        <View style={g.containerBetween}>
          <View style={{ flex: 1, marginVertical: 8 }}>
            <View style={[s.contentContainer]}>
              <View style={[s.listContainer]}>
                <View>
                  {extension === '.jpg' || extension === '.jpeg' || extension === '.png' ? (
                    <TouchableOpacity onPress={() => { }}>
                      <Image style={s.image} source={{ uri: url }} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[s.pdfContainer]}>
                      <Text style={{ fontWeight: '500' }}>{extension.slice(1).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={[s.itemTitle]}>
                  <TouchableOpacity
                    onPress={async () => {
                      //   if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
                      //     setImagePreviewUrl(url)
                      //     setShowImagePreviewModal(true)
                      //   } else if (extension === '.pdf') {
                      //     setPdfDetails({ url, name })
                      //     setShowPdfModal(true)
                      //   }
                    }}

                  >
                    <Text style={{ marginBottom: 8, fontSize: 16, fontWeight: '500' }}>{name}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#9CA2AB', fontWeight: '400' }}>{created_at}</Text>
                </View>
              </View>

            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('AddEvent', eventDetails)}
        onMove={() => setShowMoveModal(true)}
        onDelete={() => setShowDeleteModal(true)}
        onClone={() => setShowCloneModal(true)}
      />
      {/* <MoveModal
        visibility={showMoveModal}
        setVisibility={setShowMoveModal}
        state={'issue'}
        onMove={attemptMove}
      />
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateDateRange}
      />
      <MemberPickerModal
        visibility={showMemberPickerModal}
        setVisibility={setShowMemberPickerModal}
        selected={selectedMembers}
        setSelected={setSelectedMembers}
        modelId={eventDetails?.id}
        from={'issue'}
      // alreadySelected={alreadySelectedMemebers}
      />
      <DeclineModal
        visibility={showDeclineModal}
        setVisibility={setShowDeclineModal}
        taskId={eventDetails.id}
        moduleName={'issue'}
        // setRefresh={setRefresh}
        navigation={navigation}
        navigationName={'Issues'}
      />
      <CompleteModal
        visibility={showCompleteModal}
        setVisibility={setShowCompleteModal}
        taskId={eventDetails.id}
        moduleName={'issue'}
        navigation={navigation}
        navigationName={'Issues'}
        setRefresh={setRefresh}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to delete this Issue? The Issue will be clone with same state with its childs"
      />
      <CloneConfirmationModal
        visibility={showCloneModal}
        setVisibility={setShowCloneModal}
        onClone={attemptClone}
        btnLoader={btnLoader}
        confirmationMessage="Do you want to Clone this Issue? The issue will be clone with same state with its childs"
      /> */}
      <View style={[s.outerContainer]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
            style={{ flexDirection: 'row', gap: 5, alignItems: 'center', }}
          >
            <BackArrow fill={colors.NORMAL} />
            <Text style={[g.body1]}>{startDate}</Text>
          </TouchableOpacity>

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
            <View style={{ marginBottom: 24 }}>
              <CText style={[g.title2, s.titleText]}>{eventDetails.name}</CText>
            </View>

            <View style={{ flex: 1 }}>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View>

                  <TouchableOpacity
                    style={s.containerLeft}
                    onPress={() => setDatePickerVisible((prev) => !prev)}
                  >
                    <IconWrap
                      onPress={() => setDatePickerVisible((prev) => !prev)}
                      outputRange={iconWrapColors}
                    >
                      <CalendarIcon fill={colors.NORMAL} />
                    </IconWrap>
                    <View>

                      <CText style={[s.normalText, { width: '60%' }]}>{dateRange}</CText>
                      <CText style={[s.normalText, { width: '60%' }]}>{eventDetails.repeat}</CText>
                    </View>
                  </TouchableOpacity>

                  {eventDetails?.address && <AddressComponent address={eventDetails?.address} />}

                </View>

                <View style={[s.memberCardContainer]}>
                  <View style={s.memberCard}>
                    <Text style={{ marginBottom: 5 }}>Organizer</Text>
                    <Image source={require('../../assets/img/newperson.png')} style={{ alignSelf: 'flex-start' }} />
                  </View>

                  <View style={s.memberCard}>
                    <Text style={{ marginBottom: 5 }}>Invites</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Image source={require('../../assets/img/newperson.png')} style={{ alignSelf: 'flex-start' }} />
                      <Image source={require('../../assets/img/newperson.png')} style={{ alignSelf: 'flex-start' }} />
                      <View style={{ width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.PRIM_BG, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors.ICON_BG, fontWeight: '600' }}>+5</Text>
                      </View>
                    </View>
                  </View>

                </View>

                {eventDetails?.description && <View style={{ marginBottom: 16, marginTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderColor: colors.SEC_BG }}>
                  <Text style={{ marginBottom: 10, fontWeight: '600' }}>Notes:</Text>
                  {!readMore && eventDetails?.description?.value.length > 100 ? (
                    <CText style={s.descriptionText}>
                      {eventDetails?.description?.value?.slice(0, 100) + '...'}
                      <Text style={{ color: '#246BFD' }} onPress={() => setReadMore(true)}>
                        {' '}
                        Read More
                      </Text>
                    </CText>
                  ) : (
                    <CText style={s.descriptionText}>{eventDetails?.description?.value}</CText>
                  )}
                </View>}

                <View style={{ paddingVertical: 10 }}>
                  {
                    eventDetails?.attachments?.map((each, index) => <FilesCard item={each} key={index} />)
                  }
                </View>
              </ScrollView>

            </View>

            <View style={{ flexDirection: 'row' }}>
              <CButton
                style={[
                  s.margin1x,
                  { backgroundColor: colors.PRIM_CAPTION, width: '50%', marginRight: 8 },
                ]}
                onPress={openDeclineModal}
              >
                <CText style={g.title3}>Decline</CText>
              </CButton>
              <CButton
                style={[s.margin1x, { backgroundColor: '#246BFD', width: '50%' }]}
                loading={loading}
              >
                <CText style={g.title3}>Accept</CText>
              </CButton>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  )
}


export default EventDetailsScreen

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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
})
