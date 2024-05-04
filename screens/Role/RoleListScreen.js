import React, { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import colors from '../../assets/constants/colors'

import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import DisabledCheckbox from '../../assets/svg/disabled-checkbox.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'

import { useIsFocused } from '@react-navigation/native'
import { useEffect } from 'react'

import { useDispatch } from 'react-redux'
import api from '../../api/api'
import g from '../../assets/styles/global'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import { setNormal } from '../../store/slices/tab'
import { setParentRoles } from '../../store/slices/user'

// let rolesData = [
//   {id: 1, name:'Member',label:'Member'},
//   {id: 2, name:'Supervisor',label:'Supervisor'},
//   {id: 3, name:'Owner',label:'Administrator'},
// ]

const RoleCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
  const { item } = props
  const [checked, setChecked] = useState(false)
  const onChecked = () => {
    toggleSelected(item)
  }
  return (
    <View style={[s.cardContainer, g.containerBetween]}>
      <View style={[g.containerLeft, { padding: 16 }]}>
        {/* <CLetterCard label={item?.name} /> */}
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RoleEdit', { id: item.id })
            }}
          >
            <Text style={g.body1}>{item?.name === 'Owner' ? 'Administrator' : item?.name}</Text>
            <Text style={[g.smallText1, { color: colors.LIGHT_GRAY }]}>
              {item?.have_users_count + ' users'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DisabledCheckbox />

      {/* <CCheckbox
        showLabel={false}
        checked={checked}
        setChecked={setChecked}
        onChecked={onChecked}
      /> */}
    </View>
  )
}

export default function RoleListScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [roles, setRoles] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const [selectedRoles, setSelectedRoles] = useState([])

  const checkIfSelected = (role) => {
    const found = selectedRoles.find((singlerole) => singlerole.id == role.id)
    return found
  }

  const toggleSelected = (role) => {
    if (checkIfSelected(role)) {
      setSelectedRoles((prev) => {
        const copy = [...prev]
        return copy.filter((singlerole) => role.id != singlerole.id)
      })
    } else {
      setSelectedRoles((prev) => [...prev, role])
    }
  }

  useEffect(() => {
    if (isFocused) {
      // dispatch(setPlus())
      dispatch(setNormal())
      // dispatch(setPlusDestination('RoleAdd'))
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
      // allData: true,
    }
    if (query != '') {
      body['search'] = query
    }
    // body['have_users_count']
    api.role
      .getRoles(body)
      .then((res) => {
        //console.log(res.data, 'res...........')
        const parentRoles = res.data.filter((role) => role.parent_id === null)
        dispatch(setParentRoles(parentRoles))
        setRoles(res.data)
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[s.outerContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack()
                }}>
                <BackArrow fill={colors.NORMAL} />
              </TouchableOpacity>
              <CText style={[g.title3, s.textColor,{marginLeft:10}]}>Roles</CText>
            
            <View style={s.buttonGroup}>
              <IconWrap onPress={() => {}} style={s.buttonGroupBtn}>
                <SortIcon fill={colors.NORMAL} />
              </IconWrap>
              <IconWrap
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                // outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </IconWrap>
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
        {!loading && roles?.length == 0 && (
          <Text style={{ textAlign: 'center' }}>
            No Roles to show. Please create your new task by pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={roles}
              keyExtractor={(item) => item.id}
              renderItem={(props) => (
                <RoleCard
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
                paddingHorizontal: 16,
              }}
            />
          </View>
        )}

        <CFloatingPlusIcon onPress={() => navigation.navigate('RoleAdd')} />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    marginBottom: 50,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 16,
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

  roleItemText: {
    color: colors.WHITE,
  },
  roleItemTextDark: {
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
    paddingTop: 8,
    zIndex: 10,
    backgroundColor: colors.PRIM_BG,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 16,
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
    borderRadius: 8,
    overflow: 'hidden',
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
