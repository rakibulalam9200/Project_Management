import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native'
  import colors from '../../assets/constants/colors'
  
  import CreatedIcon from '../../assets/svg/checked-circle.svg'
  import EditIcon from '../../assets/svg/edit.svg'
  import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
  
  import g from '../../assets/styles/global'
  
  import { findAll } from 'highlight-words-core'
  import { useEffect, useState } from 'react'
  import { FlatList } from 'react-native-gesture-handler'
  import api from '../../api/api'
  import { FilterColors } from '../../assets/constants/filters'
  import MoreIcon from '../../assets/svg/more.svg'
  import { getErrorMessage } from '../../utils/Errors'
  import { objectToArray } from '../../utils/Strings'
  import { getDateWithZeros } from '../../utils/Timer'
  import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
  import CommentModal from '../../components/modals/CommentModal'
  // import { useEvent } from 'react-native-reanimated'
  
  const searchWords = Object.keys(FilterColors)
  const ActivityCard = ({ item }) => {
    for (let key in item) {
      const activityList = item[key]
      const dateText = key
      // console.log(activityList, 'activityList', dateText)
  
      return (
        <View style={s.cardContainer}>
          <View style={s.dateTextContainer}>
            <Text style={s.dateText}>{dateText}</Text>
        </View>
          {activityList.map((activity, idx) => {
            const chunks = findAll({
              textToHighlight: activity.description,
              searchWords,
              caseSensitive: true,
            })
            return (
              <View key={activity?.id} style={s.activityContainer}>
                <View style={g.containerBetween}>
                  {(activity.event == 'updated' ||
                    activity.event == 'status changed' ||
                    activity.event === 'comment') && <EditIcon size={24} />}
                  {(activity.event == 'created' || activity.event == 'start working') && (
                    <CreatedIcon size={24} />
                  )}
                  {/* {//console.log(activity)} */}
                  <Text style={s.timeText}>{activity?.created_time}</Text>
                  <Image source={{ uri: activity?.user?.image }} style={s.profileImage} />
                </View>
                <View style={s.descriptionContainer}>
                  {chunks.map((chunk, index) => {
                    const text = activity?.description.substr(chunk.start, chunk.end - chunk.start)
                    if (activity.event === 'comment') {
                      return (
                        <Text key={index} style={s.descriptionText}>
                          {text}
                        </Text>
                      )
                    } else {
                      return !chunk.highlight ? (
                        <Text key={index} style={s.descriptionText}>
                          {text}
                        </Text>
                      ) : (
                        <Text
                          key={index}
                          style={[
                            g.gCardStatus,
                            {
                              backgroundColor: FilterColors[text].color,
                            },
                          ]}
                        >
                          {text}
                        </Text>
                      )
                    }
                  })}
                </View>
              </View>
            )
          })}
        </View>
      )
    }
  }
  export default function ActivityScreenDirectory({
    navigation,
    route,
    userId,
    commentModal,
    setCommentModal,
  }) {
    // let activity = route.params ? route.params.activity : null
    let title = route.params ? route.params.title : null
    let state = 'Milestone'
    const loggerId = 1
    const [loading, setLoading] = useState(false)
    const [activityData, setActivityData] = useState([])
    const today = getDateWithZeros(new Date())
    const [refresh, setRefresh] = useState(false)
    // const arrayData = objectToArray(activity)?.reverse()
    // console.log(state, 'state', userId, 'userId')
    // console.log(activityData, 'activityData');
    useEffect(() => {
      const getActivities = async () => {
        let body = {
          user_id: userId,
          pagination: 10,
          page: 1,
        }
        setLoading(true)
        api.activity
          .getActivitiesDirectory(body)
          .then((res) => {
            // console.log(res.data, 'res')
            if (res?.data) {
              // console.log('-------data------', res.data)
              setActivityData(objectToArray(res?.data))
            }
          })
          .catch((err) => {
            console.log(err)
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
      if (loggerId && state) {
        // //console.log(activity,'.......activity....')
        // //console.log(loggerId,state,'--------------loggerid,state----------')
        getActivities()
      }
    }, [loggerId, state, refresh])
    return (
      <View style={g.safeAreaStyle}>
    
        <CommentModal
          visibility={commentModal}
          setVisibility={setCommentModal}
          modelId={loggerId}
          model={state}
          setRefresh={setRefresh}
        />
        <View>
          {loading && (
            <View style={s.contentCenter}>
              <ActivityIndicator size="large" color={colors.HOVER} />
            </View>
          )}
          {!loading && (
            <View style={{ width: '100%', flex: 1 }}>
              {activityData?.length > 0 && (
                <FlatList
                  data={activityData}
                  renderItem={(props) => <ActivityCard {...props} />}
                  keyExtractor={(item, index) => index}
                  showsVerticalScrollIndicator={false}
                />
              )}
              {activityData?.length == 0 && (
                <View style={s.contentCenter}>
                  <Text style={g.body1}>No activity log recorded yet.</Text>
                </View>
              )}
            </View>
          )}
        </View>
        {/* <CFloatingPlusIcon onPress={() => setCommentModal(true)} /> */}
      </View>
    )
  }
  
  const s = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      alignItems: 'stretch',
      paddingTop: 20,
    },
    scrollContainer: {
      paddingBottom: 100,
      paddingHorizontal: 23,
      paddingTop: 4,
    },
    outerContainer: {
      paddingHorizontal: 16,
      backgroundColor: colors.PRIM_BG,
      flex: 1,
      alignItems: 'center',
      paddingBottom: 60,
    },
    headerContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      // paddingBottom: 8,
      alignItems: 'center',
      zIndex: 10,
      backgroundColor: colors.PRIM_BG,
      // borderWidth: 1,
    },
    activityTitle: {
      fontSize: 24,
      fontFamily: 'inter-regular',
      fontWeight: '700',
    },
    cardContainer: {
      flex: 1,
  
      width: '100%',
    },
    dateTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.SEC_BG,
      width: '100%',
      borderRadius: 10,
      marginVertical: 8,
      padding: 2,
    },
    dateText: {
      color: colors.NORMAL,
      fontFamily: 'inter-regular',
      fontWeight: '700',
      paddingVertical: 6,
    },
    profileImage: {
      width: 30,
      height: 30,
      borderRadius: 150,
    },
    descriptionText: {
      fontFamily: 'inter-regular',
      color: colors.NORMAL,
      fontWeight: '700',
    },
    descriptionContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      paddingHorizontal: 28,
    },
    timeText: {
      fontFamily: 'inter-regular',
      color: colors.PRIM_CAPTION,
  
      flex: 1,
      fontSize: 14,
      paddingLeft: 4,
    },
    activityContainer: {
      marginVertical: 24,
    },
    contentCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
  