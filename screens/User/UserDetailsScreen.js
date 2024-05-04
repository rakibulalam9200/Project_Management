import { useIsFocused } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Svg } from 'react-native-svg'
import { useSelector } from 'react-redux'
import ToggleSwitch from 'toggle-switch-react-native'
import { VictoryLabel, VictoryLegend, VictoryPie } from 'victory-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import EditIcon from '../../assets/svg/edit.svg'
import FloatingPlusButton from '../../assets/svg/plus-blue-fill.svg'
import EmailIcon from '../../assets/svg/user-email.svg'
import MessageIcon from '../../assets/svg/user-message.svg'
import SmsIcon from '../../assets/svg/user-sms.svg'
import CDateRangerPicker from '../../components/common/CDateRangePicker'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CHeaderWithTwoIcons from '../../components/common/CHeaderWithTwoIcons'
import DateRangePickerModal from '../../components/modals/DateRangePickerModal'
import { getDate, getMonthDayYear } from '../../utils/Timer'
import ActivityScreenDirectory from '../Activity/ActivityScreenDirectory'

export default function UserDetailsScreen({ navigation, route }) {
  const { userSettings } = useSelector((state) => state?.user)
  const userId = route.params ? route.params?.userId : null
  const groupId = route.params ? route.params?.groupId : null
  const isFocused = useIsFocused()
  const [userActive, setUserActive] = useState(false)
  const [stack, setStack] = useState('details')
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(false)
  const [workloading, setWorkloading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [commentModal, setCommentModal] = useState(false)
  const [piecCharts, setPieCharts] = useState([])
  const [rangeDate, setRangeDate] = useState(null)
  const [dateSelected, setDateSelected] = useState({})
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const { height, width } = Dimensions.get('window')
  const [globalStartDate, setGlobalStartDate] = useState(null)
  const [globalEndDate, setGlobalEndDate] = useState(null)

  const goBack = () => {
    navigation.goBack()
  }

  const updateTimePeriod = () => {
    if (!dateSelected.firstDate || !dateSelected.secondDate) return
    let startDate = moment(dateSelected.firstDate).utc(true).toDate()
    let endDate = moment(dateSelected.secondDate).utc(true).toDate()
    setRangeDate(`${getMonthDayYear(startDate)}-${getMonthDayYear(endDate)}`)
    setGlobalStartDate(getDate(startDate))
    setGlobalEndDate(getDate(endDate))
    // gEndDate = getDate(endDate)
    // console.log(body,userId)
    setRefresh((pre) => !pre)
    // console.log('ok............',getMonthDayYear(startDate),getMonthDayYear(endDate))
  }

  useEffect(() => {
    setLoading(true)
    api.group
      .getUser(userId)
      .then((res) => {
        if (res?.success) {
          console.log(res, '-----------------')
          setUser(res?.user)
          setUserActive(
            res?.user?.organization_user_role_setting?.user_status == 'active' ? true : false
          )
        }
      })
      .catch((err) => {
        //console.log(err.response.data)
      })
      .finally(() => setLoading(false))
  }, [isFocused])

  const fetchWorkloadData = () => {
    setWorkloading(true)
    let body = {}
    if (globalStartDate) {
      body['start_date'] = globalStartDate
    }
    if (globalEndDate) {
      body['end_date'] = globalEndDate
    }

    api.user
      .getUserWorkLoad(userId, body)
      .then((res) => {
        if (res?.success) {
          setPieCharts(res?.data)
        }
      })
      .catch((err) => {
        console.log(err.response.data)
      })
      .finally(() => {
        setWorkloading(false)
      })
  }

  useEffect(() => {
    if (stack === 'workload') {
      fetchWorkloadData()
    }
  }, [stack, refresh])

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG, width: '100%' },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <DateRangePickerModal
        visibility={datePickerVisible}
        setVisibility={setDatePickerVisible}
        dateRange={dateSelected}
        setDateRange={setDateSelected}
        onConfirm={updateTimePeriod}
      />
      <View style={{ flex: 1 }}>
        <View
          style={[
            s.outerPadding,
            { marginBottom: Platform.OS === 'ios' ? (height > 670 ? 54 : 54) : 54 },
          ]}
        >
          <CHeaderWithTwoIcons
            onPress={goBack}
            iconWrapColors={iconWrapColors}
            containerStyle={{ marginTop: 0 }}
          >
            <Text style={s.textStyle}>Profile</Text>
            <TouchableOpacity
              // outputRange={iconWrapColors}
              onPress={() =>
                navigation.navigate('UserEditScreen', { userId: userId, groupId: groupId })
              }
            >
              <EditIcon />
            </TouchableOpacity>
          </CHeaderWithTwoIcons>

          {!loading && (
            <View style={{ flex: 1 }}>
              <View style={[g.containerLeft]}>
                <Image
                  source={{ uri: user?.image ? user?.image : null }}
                  style={s.profileImage}
                ></Image>
                <View style={{ flex: 1 }}>
                  <Text style={s.companyName}>{user.name ? user.name : user.email}</Text>
                  <View style={[g.containerLeft, s.messageContainer]}>
                    <TouchableOpacity>
                      <MessageIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('sms:' + user.phone)}>
                      <SmsIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('mailto:' + user.email)}>
                      <EmailIcon />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('UserAssignScreen', {
                          role: user?.organization_user_role_setting?.role?.name,
                          id: userId,
                        })
                      }
                    >
                      <FloatingPlusButton />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={s.profileContainer}>
                <TouchableOpacity
                  style={[s.profileButton, stack === 'details' ? g.stackButtonActive : null]}
                  onPress={() => {
                    setStack('details')
                  }}
                >
                  <Text
                    style={[
                      g.stackButtonText,
                      stack === 'details' ? g.stackButtonTextActive : null,
                    ]}
                  >
                    Details
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.profileButton, stack === 'activity' ? g.stackButtonActive : null]}
                  onPress={() => {
                    setStack('activity')
                  }}
                >
                  <Text
                    style={[
                      g.stackButtonText,
                      stack === 'activity' ? g.stackButtonTextActive : null,
                    ]}
                  >
                    Activity
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.profileButton, stack === 'workload' ? g.stackButtonActive : null]}
                  onPress={() => {
                    setStack('workload')
                  }}
                >
                  <Text
                    style={[
                      g.stackButtonText,
                      stack === 'workload' ? g.stackButtonTextActive : null,
                    ]}
                  >
                    Workload
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
                {stack == 'details' && (
                  <>
                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Email:</Text>
                      <Text style={s.sectionValueText}>{user.email}</Text>
                    </View>

                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Phone number:</Text>
                      <Text style={s.sectionValueText}>
                        {user.phone ? user.phone : '+9087837878'}
                      </Text>
                    </View>

                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Role:</Text>
                      <Text style={s.sectionValueText}>
                        {user?.organization_user_role_setting?.role?.name}
                      </Text>
                    </View>

                    <Text
                      style={s.sectionLabelText}
                    >{`Licenses ( ${userSettings?.organization?.org_subscription?.subscription_plan?.available_user} of ${userSettings?.organization?.org_subscription?.subscription_plan?.max_user} available ) `}</Text>
                    <View style={[g.containerLeft, g.marginVertical1x]}>
                      <ToggleSwitch
                        isOn={userActive}
                        onColor={colors.IN_PROGRESS_BG}
                        offColor={colors.SEC_BG}
                        labelStyle={{ color: 'black', fontWeight: '900' }}
                        size="medium"
                        onToggle={() => {}}
                        // onToggle={(isOn) => setUserActive(isOn)}
                        animationSpeed={150}
                      />
                      <Text style={s.textStyle}>{userActive ? 'Enabled' : 'Disabled'} </Text>
                    </View>

                    <View style={s.divider}></View>
                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Working Hours Per Week:</Text>
                      <Text style={s.sectionValueText}>
                        {user?.organization_user_role_setting?.user_setting?.max_wh_per_week}
                      </Text>
                    </View>
                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Working Hours Per Day:</Text>
                      <Text style={s.sectionValueText}>
                        {user?.organization_user_role_setting?.user_setting?.max_wh_per_day}
                      </Text>
                    </View>
                    <View style={s.divider}></View>
                    <View style={s.spaceBelow}>
                      <Text style={s.sectionLabelText}>Date of Birth</Text>
                      <Text style={s.sectionValueText}>{user?.dob}</Text>
                    </View>
                  </>
                )}

                {stack == 'activity' && (
                  <ActivityScreenDirectory
                    navigation={navigation}
                    route={route}
                    userId={user?.id}
                    commentModal={commentModal}
                    setCommentModal={setCommentModal}
                  />
                )}
                {stack == 'workload' && (
                  <View>
                    <View style={{ marginBottom: 16 }}>
                      <CDateRangerPicker
                        showDateSelection={datePickerVisible}
                        setShowDateSelection={setDatePickerVisible}
                        rangeDate={rangeDate}
                        setRangeDate={setRangeDate}
                      />
                    </View>
                    {workloading && (
                      <View style={[g.contentCenter]}>
                        <ActivityIndicator size="large" color={colors.HOVER} />
                      </View>
                    )}
                    {!workloading &&
                      piecCharts?.map((pieChart, index) => (
                        <View
                          key={index}
                          style={{
                            borderWidth: 1,
                            borderColor: colors.SEC_BG,
                            borderRadius: 8,
                            marginVertical: 16,
                          }}
                        >
                          <View style={[s.singleWorkloadContainer]}>
                            <Text
                              style={[g.body3, { color: colors.NORMAL }]}
                            >{`${pieChart?.name} Total:`}</Text>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={[g.body3, { color: colors.NORMAL }]}>
                                {pieChart?.total}
                              </Text>
                              <Text
                                style={[g.body3, { color: colors.NORMAL }]}
                              >{`${pieChart?.name}s`}</Text>
                            </View>
                          </View>

                          <Svg
                            width={400}
                            height={200}
                            viewBox="85 0 350 400"
                            style={{ position: 'relative' }}
                          >
                            <VictoryPie
                              standalone={false}
                              width={400}
                              height={380}
                              data={Object.values(pieChart.stages)}
                              innerRadius={120}
                              labelRadius={165}
                              labels={({ data, index }) =>
                                data[index]._y > 0 ? `${data[index]._y.toFixed(0)}%` : ''
                              }
                              style={{ labels: { fontSize: 28, fill: colors.NORMAL, padding: 5 } }}
                              animate={{
                                duration: 4000,
                                onLoad: {
                                  duration: 4000,
                                },
                              }}
                              colorScale={[
                                colors.COMPLETED_BG,
                                colors.IN_PROGRESS_BG,
                                colors.ON_HOLD_BG,
                                colors.PAST_DUE_BG,
                                colors.REVIEW_BG,
                              ]}
                            />
                            <VictoryLabel
                              textAnchor="middle"
                              verticalAnchor="middle"
                              x={200}
                              y={200}
                              style={{
                                fontSize: 36,
                                fill: colors.NORMAL,
                                textAlign: 'center',
                                fontWeight: 600,
                                fontFamily: 'inter',
                              }}
                              text={() => [`${pieChart?.total}`, `${pieChart?.name}`]}
                            />
                            <VictoryLegend
                              x={240}
                              y={10}
                              orientation="vertical"
                              gutter={10}
                              // style={{ border: { stroke: "black" }, title: {fontSize: 36,fontWeight:600 } }}
                              data={[
                                {
                                  name: 'Completed',
                                  symbol: { fill: colors.COMPLETED_BG },
                                  labels: {
                                    fontSize: 14,
                                    fontWeight: 500,
                                  },
                                },
                                {
                                  name: 'In Progress',
                                  symbol: { fill: colors.IN_PROGRESS_BG },
                                  labels: {
                                    fontSize: 14,
                                    fontWeight: 500,
                                  },
                                },
                                {
                                  name: 'Issue',
                                  symbol: { fill: colors.ON_HOLD_BG },
                                  labels: {
                                    fontSize: 14,
                                    fontWeight: 500,
                                  },
                                },
                                {
                                  name: 'Past Due',
                                  symbol: { fill: colors.PAST_DUE_BG },
                                  labels: {
                                    fontSize: 14,
                                    fontWeight: 500,
                                  },
                                },
                                {
                                  name: 'Review',
                                  symbol: { fill: colors.REVIEW_BG },
                                  labels: {
                                    fontSize: 14,
                                    fontWeight: 500,
                                  },
                                },
                              ]}
                            />
                          </Svg>
                        </View>
                      ))}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          {loading && <ActivityIndicator size={'large'} color={colors.NORMAL} />}
        </View>
        {stack !== 'workload' && <CFloatingPlusIcon onPress={() => setCommentModal(true)} />}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  textStyle: {
    fontFamily: 'inter-regular',
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.NORMAL,
    marginLeft: 4,
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
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  profileImage: { width: 100, height: 100, marginRight: 16, borderRadius: 50 },
  mainItemText: {
    fontFamily: 'inter-regular',
    fontSize: 16,
    paddingTop: 10,
    color: colors.HOME_TEXT,
    fontWeight: 'bold',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  messageContainer: {
    marginVertical: 16,
    gap: 16,
  },

  IconsContainer: {
    // borderWidth: 1,
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    textAlign: 'left',
    color: colors.NORMAL,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
  },
  companyEmail: {
    textAlign: 'center',
    color: colors.NORMAL,
    fontSize: 16,
  },
  divider: {
    borderBottomColor: colors.SEC_BG,
    borderBottomWidth: 1,
    marginVertical: 24,
  },
  detailsText: {
    color: colors.NORMAL,
    fontSize: 16,
    marginLeft: 34,
  },
  detailsContainer: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sectionLabelText: { color: colors.PRIM_CAPTION, fontSize: 12 },
  sectionValueText: { fontSize: 16, fontWeight: 'bold', color: colors.NORMAL },
  spaceBelow: { marginBottom: 30 },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  profileButton: {
    width: '32%',
    borderRadius: 10,
    backgroundColor: colors.SEC_BG,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  outerPadding: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  singleWorkloadContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.SEC_BG,
    padding: 8,
    borderRadius: 8,
  },
  boldTitle: {
    color: colors.NORMAL,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'Inter',
    // font: Inter;
    // font-size: 14px;
    // font-style: normal;
    // font-weight: 700;
    // line-height: normal;
  },
})
