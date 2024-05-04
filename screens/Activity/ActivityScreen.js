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
import RenderHTML from 'react-native-render-html'
import api from '../../api/api'
import { FilterColors } from '../../assets/constants/filters'
import MoreIcon from '../../assets/svg/more.svg'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CommentModal from '../../components/modals/CommentModal'
import { getErrorMessage } from '../../utils/Errors'
import { objectToArray } from '../../utils/Strings'
import { getDateWithZeros } from '../../utils/Timer'
// import { useEvent } from 'react-native-reanimated'

const searchWords = Object.keys(FilterColors)

export default function ActivityScreen({ navigation, route }) {
  let activity = route.params ? route.params.activity : null
  let title = route.params ? route.params.title : null
  let loggerId = route.params ? route.params.loggerId : null
  let state = route.params ? route.params.state : null
  const [commentModal, setCommentModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activityData, setActivityData] = useState([])
  const today = getDateWithZeros(new Date())
  const [refresh, setRefresh] = useState(false)
  const [page, setPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const [isKey, setIsKey] = useState(false)
  const [newKey, setNewKey] = useState('')

  // console.log(activityData,'activity..........')
  // const arrayData = objectToArray(activity)?.reverse()
  const ActivityCard = ({ item }) => {
    // console.log('item......',item)
    for (let key in item) {
      console.log(key, 'key...........')
      // console.log(prevKey,newKey,key, 'pre new key........')
      const activityList = item[key]
      // console.log(key ,'activlity list key')
      const dateText = key === today ? 'TODAY' : key
      return (
        <View style={s.cardContainer}>
          {
            <View style={s.dateTextContainer}>
              <Text style={s.dateText}>{dateText}</Text>
            </View>
          }
          {activityList.map((activity, idx) => {
            {
              /* console.log(activity, 'activity........') */
            }
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
                {activity?.log_name === 'todolist' &&
                (activity?.event === 'created' || activity?.event === 'updated') ? (
                  <>
                    <RenderHTML source={{ html: `${activity?.description}` }} />
                  </>
                ) : (
                  <View style={s.descriptionContainer}>
                    {chunks.map((chunk, index) => {
                      const text = activity?.description.substr(
                        chunk.start,
                        chunk.end - chunk.start
                      )
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
                )}
              </View>
            )
          })}
        </View>
      )
    }
  }

  useEffect(() => {
    const getActivities = async () => {
      let body = {
        state: state,
        logger_id: loggerId,
        pagination: 10,
        page: page,
      }
      setLoading(true)
      api.activity
        .getActivities(body)
        .then((res) => {
          if (res?.data) {
            // console.log('-------data------', res)
            setCurrentPage(res.meta.current_page)
            setLastPage(res.meta.last_page)
            if (page == 1) {
              console.log(res?.data, 'first page data')
              setActivityData(objectToArray(res?.data))
            } else {
              let newData = objectToArray(res?.data)
              console.log(newData, '------new Data-------')
              if (
                newData?.length &&
                Object.keys(activityData[activityData?.length - 1])[0] ===
                  Object.keys(newData[0])[0]
              ) {
                let newKey = Object.keys(activityData[activityData?.length - 1])[0]
                // console.log(newKey, '....new key.........', Object.keys(newData[0])[0])
                // console.log('activity Data', activityData)
                setActivityData((pre) => [...pre, ...newData])
                // setActivityData((pre) => {
                //   let copy = pre
                //   console.log('before copy...', copy, newData)
                //   // setActivityData((pre) => [...pre, ...newData])
                //   let previousData = Object.values(copy[copy?.length - 1])[0]
                //   console.log('previous data........')
                //   let newDataCompare = Object.values(newData[0])[0]
                //   console.log('new compare data........')
                //   let newLastData = [...previousData, ...newDataCompare]
                //   console.log(newLastData,'new last data.......',copy)
                //   // return []
                //   let updatedCopy = copy.pop()
                //   return [...updatedCopy, { [newKey]: newLastData }]
                // })
              } else {
                console.log(activityData, 'new data........', newData)
                setActivityData((pre) => [...pre, ...newData])
              }

              // setActivityData((pre) => [...pre, ...newData])
            }

            // setActivityData(objectToArray(res?.data)?.reverse())
          }
        })
        .catch((err) => {
          console.log(err, 'err message..........')
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
  }, [loggerId, state, refresh, page])

  return (
    <SafeAreaView style={g.safeAreaStyle}>
      <StatusBar animated={true} backgroundColor={colors.CONTAINER_BG} />
      <CommentModal
        visibility={commentModal}
        setVisibility={setCommentModal}
        modelId={loggerId}
        model={state}
        setRefresh={setRefresh}
        setPage={setPage}
      />
      <View style={[s.outerContainer]}>
        <View style={[s.headerContainer]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack()
            }}
          >
            <BackArrow fill={colors.NORMAL} />
          </TouchableOpacity>

          <Text style={[g.body1]}>{title}</Text>
          <TouchableOpacity style={s.buttonGroup}>
            <MoreIcon fill={colors.NORMAL} />
          </TouchableOpacity>
        </View>
        <View style={[g.containerLeft, { width: '100%' }]}>
          <Text style={s.activityTitle}>Activity</Text>
        </View>
        {loading && (
          <View
            style={{
              flex: 1,
              zIndex: 200,
              height: '100%',
              width: '100%',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color={colors.HOVER} />
          </View>
        )}
        {
          <View style={{ width: '100%', flex: 1 }}>
            {activityData?.length > 0 && (
              <FlatList
                data={activityData}
                renderItem={(props) => <ActivityCard {...props} />}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.1}
                initialNumToRender={10}
                onEndReached={() => {
                  if (lastPage == 1) {
                    currentPage < lastPage && setPage(page + 1)
                  } else {
                    currentPage <= lastPage && setPage(page + 1)
                  }
                }}
              />
            )}
            {activityData?.length == 0 && (
              <View style={s.contentCenter}>
                <Text style={g.body1}>No activity log recorded yet.</Text>
              </View>
            )}
          </View>
        }

        <CFloatingPlusIcon onPress={() => setCommentModal(true)} />
      </View>
    </SafeAreaView>
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
