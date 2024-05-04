import { View, StyleSheet, StatusBar, ScrollView, Platform, ActivityIndicator } from 'react-native'
import React from 'react'
import CText from '../components/common/CText'
import g from '../assets/styles/global'
import colors from '../assets/constants/colors'
import CCard from '../components/common/CCard'
import api from '../api/api'

import useIsMounted from '../hooks/useIsMounted'

const NotificationScreen = () => {
  const [notifications, setNotifications] = React.useState(null)
  const [notificationsCount, setNotificationsCount] = React.useState(null)

  const [offset, setOffset] = React.useState(0)
  const [paginate, setPaginate] = React.useState(false)
  const [fullLoaded, setFullLoaded] = React.useState(false)

  const limit = 30

  const loadNewNotifications = () => {
    if (offset + limit < notificationsCount) {
      setPaginate(true)
      api.notifications.notifications({
        limit,
        offset: offset + limit,
      }).then(res => {
        if (!isMounted()) { return }
        setOffset(ps => ps + limit)
        setNotifications(notifications.concat(res.data))
        setPaginate(false)
      })
    } else {
      setFullLoaded(true)
      setPaginate(false)
    }
  }

  const isMounted = useIsMounted()

  const initLoadNotifications = () => {
    api.notifications.notifications({
      limit,
      offset,
    }).then(res => {
      if (!isMounted()) { return }
      setNotifications(res.data)
      setNotificationsCount(res.count)
    })
  }

  React.useEffect(() => {
    initLoadNotifications()
  }, [])

  return (
    <View style={[s.container]}>
      <CText style={[s.text, g.title1, s.title]}>Notifications</CText>
      <ScrollView onScroll={
        (e) => {
          let event = e.nativeEvent
          if (event.contentSize.height - (event.contentOffset.y + event.layoutMeasurement.height) < 600 && !paginate) {
            loadNewNotifications()
          }
        }
      }

        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {
          notifications
            ? notifications.length
              ? notifications.map(
                notif => <CCard key={notif.id} style={s.card}>
                  <CText style={[s.text, g.title3, { marginBottom: 10 }]}>{notif.title}</CText>
                  <CText style={[s.text, g.body1]}>{notif.text}</CText>
                </CCard>)
              : <CText style={[g.body1, { color: colors.BLACK, marginTop: 20 }]}>No notifications</CText>
            : <View style={g.container}>
              <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.NORMAL} />
            </View>

        }
        {paginate && !fullLoaded && notifications ? <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.NORMAL} /> : null}
      </ScrollView>
    </View >
  )
}

const s = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: colors.PRIM_BG,
    paddingBottom: 80,
    paddingHorizontal: 25,
    paddingTop: 4,
  },
  text: {
    color: colors.HEADING,
  },
  card: {
    marginBottom: 12,
  },
  title: {
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 25,
  },
})

export default NotificationScreen
