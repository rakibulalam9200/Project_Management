import { View, StatusBar, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React, { useState, useRef, useEffect } from 'react'

import IconWrap from '../components/common/IconWrap'
import CText from '../components/common/CText'
import TaskCard from '../components/cards/TaskCard'
import FiltersModal, { FiltersBlock } from '../components/modals/FiltersModal'

import FilterIcon from '../assets/svg/filter.svg'
import BackArrow from '../assets/svg/arrow-left.svg'
import CloseIcon from '../assets/svg/close.svg'

import useIsMounted from '../hooks/useIsMounted'
import api from '../api/api'
import colors from '../assets/constants/colors'
import g from '../assets/styles/global'

const TaskScreen = ({ route }) => {
  const isMounted = useIsMounted()
  const [modalVisibility, setModalVisibility] = useState(false)
  const [filters, setFilters] = useState((route.params && route.params.filters) || [])
  const filterScrollRef = useRef(null)
  const [tasks, setTasks] = useState(null)
  const [tasksCount, setTasksCount] = useState(null)

  const [offset, setOffset] = useState(0)
  const [paginate, setPaginate] = useState(false)
  const [fullLoaded, setFullLoaded] = useState(false)
  const navigation = useNavigation()



  const loadNewTasks = () => {
    setPaginate(true)
    api.task.tasks({
      limit: 30,
      offset,
    }).then(res => {
      if (!isMounted()) { return }
      setTasks(tasks.concat(res.data))
      setTasksCount(res.count)
      if (offset + 30 < res.count) {
        setPaginate(false)
      } else {
        setFullLoaded(true)
        setPaginate(true)
      }
      setOffset(ps => ps + 30)
    })
  }

  useEffect(() => {
    return () => {
      filterScrollRef.current = null
    }
  }, [])

  const handleFilterDelete = item => {
    setFilters(filters.filter(filter => filter !== item))
  }

  const handleNewFilters = items => {
    setFilters(items)
    if (filterScrollRef.current) { filterScrollRef.current.scrollTo({ x: 0, y: 0, animated: true }) }
  }

  const hideModal = () => setModalVisibility(true)
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]

  useEffect(() => {
    setPaginate(false)
    setFullLoaded(false)
    setTasks(null)
    setTasksCount(null)
    const params = {
      limit: 30,
      offset: 0,
    }

    if (filters.length) {
      params.status = filters.filter(item => item !== 'expired')
      if (params.status.length === 0) { delete params.status }
    }

    api.task.tasks(params)
      .then((res) => {
        if (!isMounted()) { return }
        setTasks(res.data)
        setTasksCount(res.count)
        setOffset(30)
      })
  }, [filters])



  return (
    <View style={[s.outerContainer]}>
      <FiltersModal
        title={'Work status filter'}
        visibility={modalVisibility}
        setVisibility={setModalVisibility}
        filterList={filters}
        setFilters={handleNewFilters}
      />
      <View style={s.container}>
        <View style={s.headerContainer}>
          <IconWrap onPress={() => navigation.navigate('Home')} outputRange={iconWrapColors}>
            <BackArrow fill={colors.NORMAL} />
          </IconWrap>
          <CText style={[g.title2, s.textColor]}>Task</CText>
          <IconWrap onPress={hideModal}>
            <FilterIcon fill={colors.NORMAL} />
          </IconWrap>
        </View>
        {filters.length ? (
          <FiltersBlock
            refer={filterScrollRef}
            horizontal
            localFilters={filters}
            icon={<CloseIcon style={s.filterIcon} fill={colors.WHITE} />}
            onPress={handleFilterDelete}
          />
        ) : null}
        <ScrollView scrollEventThrottle={200} onScroll={
          (e) => {
            if (!isMounted()) { return }
            let event = e.nativeEvent
            if (event.contentSize.height - (event.contentOffset.y + event.layoutMeasurement.height) < 600 && !paginate) {
              if (offset > tasksCount) { return }
              setPaginate(true)
              loadNewTasks()
            }
          }
        } bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContainer}>
          {tasks
            ? tasks.length
              ? tasks.filter(item => (!filters.length ? true : (!item.expired && filters.includes(item.status))) || (item.expired && filters.includes('expired'))).map((item, i) => {
                return <TaskCard
                  onPress={() => {
                    navigation.navigate('Home', { screen: 'Work', params: { ...item, filters, prevScreen: 'Tasks' } })
                  }}
                  content={item}
                  key={item.id}
                  style={i !== tasks.length - 1 ? { marginBottom: 16 } : {}}
                />
              })
              : <View style={[g.container]}><CText style={[g.body1, { color: colors.BLACK }]}>No tasks</CText></View>
            : <View style={[g.container]}>
              <ActivityIndicator size="large" color={colors.NORMAL} />
            </View>}
          {paginate && !fullLoaded && tasks ? <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.NORMAL} /> : null}
        </ScrollView>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: Platform.OS !== 'ios' ? StatusBar.currentHeight : StatusBar.currentHeight + 40,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    paddingBottom: 0,
  },
  textColor: {
    color: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 23,
  },
})

export default TaskScreen
