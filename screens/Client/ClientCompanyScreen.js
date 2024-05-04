import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useIsFocused } from '@react-navigation/native'
import { useEffect } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { CLIENT_COM_SORT_BY } from '../../assets/constants/filesSortBy'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import ClientCompanySortModal from '../../components/modals/ClientCompanySortModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'

export default function ClientCompanyScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [companies, setCompanies] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState(CLIENT_COM_SORT_BY[0])
  const [showSortModal, setShowSortModal] = useState(false)
  let refetch = route.params ? route.params.refetch : null
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const singleSelect = useRef(null)
  let id = route.params ? route.params.id : null
  //console.log(id)

  const CompanyCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
    const {
      item: { name, address, clients_count, logo, id },
    } = props
    const [checked, setChecked] = useState(false)
    const onChecked = () => {
      toggleSelected(props.item)
    }

    const RightActions = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            singleSelect.current = id
            setShowDeleteModal(true)
          }}
          style={s.deleteItemWrapper}
        >
          <DeleteIcon />
          <Text style={s.deleteItemText}>Delete</Text>
        </TouchableOpacity>
      )
    }

    return (
      <Swipeable key={id} renderRightActions={RightActions}>
        <TouchableWithoutFeedback>
          <View style={[s.cardContainer, g.containerBetween]}>
            <TouchableOpacity
              style={g.containerLeft}
              onPress={() => {
                navigation.navigate('ClientCompanyDetailsScreen', {
                  id: id,
                })
              }}
            >
              <Image source={{ uri: logo + '?' + new Date() }} style={s.profileImage} />
              <View>
                <Text style={s.cardTitle}>{name?.length > 25 ? name.slice(0,25) : name}</Text>
                {address && (
                  <Text style={s.cardSubtitle}>
                    {address?.length > 30 ? address.slice(0, 30) + '...' : address}
                  </Text>
                )}
                <Text style={s.cardSubtitle}>{clients_count} Clients</Text>
              </View>
            </TouchableOpacity>
            <CCheckbox
              showLabel={false}
              checked={checked}
              setChecked={setChecked}
              onChecked={onChecked}
            />
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }

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
    if (!search) {
      setFilteredCompanies(companies)
      return
    }
    const delayDebounceFn = setTimeout(() => {
      setFilteredCompanies(
        companies.filter((user) => {
          return user.name.toLowerCase().includes(search.toLowerCase().trim())
        })
      )
    }, 700)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      // allData: false,
      pagination: 10,
    }
    if (query != '') {
      body['search'] = query
    }
    if (sortBy) {
      body['sort_by'] = sortBy.param
    }
    api.client
      .getclientCompanies(body)
      .then((res) => {
        setCompanies(res.data)
        setFilteredCompanies(res.data)
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
  }, [refresh, refetch, query, isFocused, sortBy])

  const attemptDelete = async () => {
    try {
      setBtnLoading(true)
      let res = await api.clientCompany.deleteClientCompany(singleSelect.current)
      // //console.log(res)
      if (res.success) {
        toggleRefresh()
        Alert.alert('Delete Successful.')
      }
    } catch (err) {
      console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        // //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoading(false)
      setShowDeleteModal(false)
    }
  }

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
      <ClientCompanySortModal
        visibility={showSortModal}
        setVisibility={setShowSortModal}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this Client Company? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoading}
      />
      <View style={[g.listingOuterContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>

            <Text style={[g.body1]}>Client Companies</Text>

            <View style={s.buttonGroup}>
              <TouchableOpacity
                onPress={() => {
                  setShowSortModal(true)
                }}
                outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>
          <CSearchInput
            placeholder="Search"
            value={search}
            setValue={setSearch}
            style={{ marginVertical: 8 }}
            isGSearch={true}
            searchIcon={true}
            // removing search value
            onPress={() => setSearch('')}
          />
        </View>
        {!loading && (companies.length == 0 || !filteredCompanies.length) && (
          <Text
            style={{
              paddingHorizontal: 16,
              textAlign: 'center',
            }}
          >
            No Client Company to show. Please add a new Client Company pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredCompanies}
              keyExtractor={(item, index) => index}
              renderItem={(props) => (
                <CompanyCard
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

        <CFloatingPlusIcon
          onPress={() => navigation.navigate('ClientCompanyAddScreen', { groupId: id })}
        />
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 20,
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
  deleteItemWrapper: {
    backgroundColor: colors.RED_NORMAL,
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    marginVertical: 10,
    borderRadius: 8,
  },
  deleteItemText: {
    color: colors.WHITE,
  },
})
