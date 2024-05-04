import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import SortIcon from '../../assets/svg/sort.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'

import { useDispatch } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import { setNormal, setPlus, setPlusDestination } from '../../store/slices/tab'
import CLetterCard from '../../components/common/CLetterCard'
import { getErrorMessage } from '../../utils/Errors'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'

const GroupCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
  const { item } = props
  const [checked, setChecked] = useState(false)
  const onChecked = () => {
    toggleSelected(item)
  }
  return (
    <View style={[s.cardContainer, g.containerBetween]}>
      <View style={g.containerLeft}>
        <CLetterCard label={item?.name} />
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('GroupEdit', { id: item.id })
            }}
          >
            <Text style={s.cardTitle}>{item?.name}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CCheckbox
        showLabel={false}
        checked={checked}
        setChecked={setChecked}
        onChecked={onChecked}
      />
    </View>
  )
}

export default function GroupListScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [groups, setGroups] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const [selectedGroups, setSelectedGroups] = useState([])

  const checkIfSelected = (group) => {
    const found = selectedGroups.find((singlegroup) => singlegroup.id == group.id)
    return found
  }

  const toggleSelected = (group) => {
    if (checkIfSelected(group)) {
      setSelectedGroups((prev) => {
        const copy = [...prev]
        return copy.filter((singlegroup) => group.id != singlegroup.id)
      })
    } else {
      setSelectedGroups((prev) => [...prev, group])
    }
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlusDestination('GroupAdd'))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      allData: true,
    }
    if (query != '') {
      body['search'] = query
    }
    api.group
      .getGroups(body)
      .then((res) => {
        setGroups(res)
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
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, refetch, query])

  return (
    <>
      <View style={[s.outerContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
              outputRange={iconWrapColors}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.title3, s.textColor]}>Groups</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <SettingsIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>

          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
        </View>
        {!loading && groups.length == 0 && (
          <Text>No Groups to show. Please create your new group by pressing the plus button.</Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={(props) => (
                <GroupCard
                  props={props}
                  checkIfSelected={checkIfSelected}
                  toggleSelected={toggleSelected}
                  navigation={navigation}
                />
              )}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                marginBottom: 100,
                paddingHorizontal: 10,
              }}
            />
          </View>
        )}

        <CFloatingPlusIcon onPress={() => navigation.navigate('GroupAdd')} />
      </View>
    </>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,

    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
  },
  outerPadding: {
    paddingHorizontal: 24,

    width: '100%',
  },
  filters: {
    width: '100%',
    padding: 10,
  },
  filterText: {
    color: colors.HOME_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  groupItemText: {
    color: colors.WHITE,
  },
  groupItemTextDark: {
    color: colors.HOME_TEXT,
  },
  textColor: {
    color: 'black',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 20,
    borderRadius: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  searchIcon: {
    padding: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    color: '#424242',
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 10,
    marginVertical: 5,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.NORMAL,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.NORMAL,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#1DAF2B',
    color: 'white',
    padding: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardLevel: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#F2F6FF',
    color: '#E9203B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  cardProgressText: {
    marginLeft: 10,
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  containerRight: {
    position: 'relative',
    left: 42,
    flexDirection: 'row',
  },
  containerRightDrag: {
    position: 'relative',
    left: 2,
    flexDirection: 'row',
  },
  overLapIcon: {
    position: 'relative',
    left: -24,
  },
  overLapIcon3: {
    position: 'relative',
    left: -48,
  },
  overLapIcon2: {
    position: 'relative',
    left: -72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'dodgerblue',
  },
  project: {
    fontSize: 14,
    color: '#9CA2AB',
    marginRight: 5,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: 14,
    color: '#001D52',
    marginRight: 5,
    fontWeight: '500',
  },
})
