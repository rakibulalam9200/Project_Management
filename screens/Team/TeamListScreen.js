import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import colors, { teamColors } from '../../assets/constants/colors'

import MoreIcon from '../../assets/svg/more.svg'
import SortIcon from '../../assets/svg/sort.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'

import { SafeAreaView } from 'react-native'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CLetterCard from '../../components/common/CLetterCard'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage } from '../../utils/Errors'

const getTeamColor = (idx) => {
  return teamColors[idx % teamColors.length]
}

const TeamCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
  const { item, index } = props
  const color = useRef(getTeamColor(index))
  const [checked, setChecked] = useState(false)
  const onChecked = () => {
    toggleSelected(item)
  }
  return (
    <View style={[s.cardContainer, g.containerBetween]}>
      <View style={g.containerLeft}>
        <CLetterCard label={item?.name} color={color.current} />
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('TeamDetailsScreen', { id: item.id, refetch: Math.random() })
            }}
          >
            <Text style={s.cardTitle}>{item?.name}</Text>
            <Text style={[g.caption1, { color: colors.PRIM_CAPTION }]}>
              {`${item?.members_count} users`}{' '}
            </Text>
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

export default function TeamListScreen({ navigation, route }) {
  let refetch = route.params ? route.params.refetch : null
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

  const [Teams, setTeams] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const [selectedTeams, setSelectedTeams] = useState([])

  const checkIfSelected = (Team) => {
    const found = selectedTeams.find((singleTeam) => singleTeam.id == Team.id)
    return found
  }

  const toggleSelected = (Team) => {
    if (checkIfSelected(Team)) {
      setSelectedTeams((prev) => {
        const copy = [...prev]
        return copy.filter((singleTeam) => Team.id != singleTeam.id)
      })
    } else {
      setSelectedTeams((prev) => [...prev, Team])
    }
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlusDestination('TeamAdd'))
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
    api.team
      .getTeams(body)
      .then((res) => {
        console.log(res)
        setTeams(res)
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
  
  const goBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <View style={[g.listingOuterContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <Pressable
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </Pressable>
            <CText style={[g.title3, s.textColor, { marginLeft: 10 }]}>Teams</CText>
            {/* <View>
            <CHeaderWithBack title={'Teams'} onPress={goBack} containerStyle={{ marginTop: 0 }} />
          </View> */}
            <View style={s.buttonTeam}>
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                outputRange={iconWrapColors}
                style={s.buttonTeamBtn}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {}}
                outputRange={iconWrapColors}
                style={s.buttonTeamBtn}
              >
                <MoreIcon />
              </TouchableOpacity>
            </View>
          </View>

          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            isGSearch={true}
            searchIcon={true}
            // removing search value
            onPress={() => setSearch('')}
          />
        </View>
        {!loading && Teams.length == 0 && (
          <Text style={{ paddingHorizontal: 16, textAlign: 'center' }}>
            No Teams to show. Please create your new Team by pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={Teams}
              keyExtractor={(item) => item.id}
              renderItem={(props) => (
                <TeamCard
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

        <CFloatingPlusIcon onPress={() => navigation.navigate('TeamAddOrEditScreen')} />

        {/* <TouchableOpacity style={s.plusButton} onPress={() => navigation.navigate('TeamAddOrEditScreen')}>
        <FloatingPlusButton />
      </TouchableOpacity> */}
      </View>

      {/* */}
    </SafeAreaView>
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
    paddingHorizontal: 16,
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

  TeamItemText: {
    color: colors.WHITE,
  },
  TeamItemTextDark: {
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
  },
  buttonTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonTeamBtn: {
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
  buttonTeamBtn: {
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
  plusButton: {
    position: 'absolute',
    bottom: -15,
    right: 0,
    zIndex: 100,
  },
})
