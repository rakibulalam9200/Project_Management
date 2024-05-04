import React, { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { useIsFocused } from '@react-navigation/native'
import { useEffect } from 'react'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'

const ClientCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
  const {
    item: {
      name,
      address,
      clients_count,
      image,
      email,
      status: { is_can_login },
    },
  } = props
  const [checked, setChecked] = useState(false)
  const onChecked = () => {
    toggleSelected(props.item)
  }

  return (
    <View style={[s.cardContainer, g.containerBetween]}>
      <TouchableOpacity
        style={g.containerLeft}
        // onPress={() => {
        //   navigation.navigate('ClientCompanyDetailsScreen', {
        //     company: props.item,
        //   })
        // }}
      >
        <Image source={{ uri: image }} style={s.profileImage} />
        <View>
          <Text style={s.cardTitle}>{name}</Text>
          <Text style={s.cardSubtitle}>{email}</Text>
          <Text style={s.cardSubtitle}>{is_can_login}</Text>
        </View>
      </TouchableOpacity>
      <CCheckbox
        showLabel={false}
        checked={checked}
        setChecked={setChecked}
        onChecked={onChecked}
      />
    </View>
  )
}

export default function CompanyClients({ navigation, route, companyId }) {
  const isFocused = useIsFocused()
  const [companies, setCompanies] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

  const [selectedUsers, setSelectedUsers] = useState([])

  const checkIfSelected = (user) => {
    const found = selectedUsers.find((singleuser) => singleuser.id == user.id)
    return found
  }

  const toggleSelected = (user) => {
    if (checkIfSelected(user)) {
      setSelectedUsers((prev) => {
        const copy = [...prev]
        return copy.filter((singleuser) => user.id != singleuser.id)
      })
    } else {
      setSelectedUsers((prev) => [...prev, user])
    }
  }

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
    api.client
      .getclientCompany({
        id: companyId,
      })
      .then((res) => {
        setCompanies(res?.data?.user_clients)
      })
      .catch((err) => {
        // console.log(err)
        let errorMsg = ''
        try {
          errorMsg = getErrorMessage(err)
        } catch (err) {
          errorMsg = 'An error occured. Please try again later.'
        }
        // Alert.alert(errorMsg)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, refetch, query, isFocused])

  return (
    <ScrollView horizontal={true} contentContainerStyle={{backgroundColor: colors.CONTAINER_BG,width:'100%' }}>
      <View style={[g.listingOuterContainer]}>
        <View style={s.outerPadding}>
          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            style={{ marginTop: 0, marginBottom: 8 }}
            filterIcon={true}
          />
        </View>
        {!loading && companies?.length == 0 && (
          <Text style={{ textAlign: 'center', marginTop: 8 }}>
            No Users to show. Please add a new company pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={(props) => (
                <ClientCard
                  props={props}
                  navigation={navigation}
                  checkIfSelected={checkIfSelected}
                  toggleSelected={toggleSelected}
                />
              )}
              containerStyle={{
                flex: 1,
                flexDirection: 'row',
                marginBottom: 100,
                // paddingHorizontal: 10,
              }}
              style={{ paddingBottom: 100 }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    // paddingHorizontal: 20,
    paddingBottom: 70,
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 80,
    backgroundColor: colors.PRIM_BG,
    flex: 1,
    alignItems: 'center',
  },
  outerPadding: {
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

  userItemText: {
    color: colors.WHITE,
  },
  userItemTextDark: {
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
    // marginTop: 24,
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 999,
    margin: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buttonGroupBtn: {
    marginRight: 16,
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
    marginVertical: 10,
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
  cardRoleText: {
    color: colors.LIGHT_GRAY,
    fontSize: 12,
    marginLeft: 8,
  },
})
