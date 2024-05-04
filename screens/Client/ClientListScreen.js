import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { useIsFocused } from '@react-navigation/native'
import { useEffect } from 'react'
import { Swipeable } from 'react-native-gesture-handler'
import { MultiWordHighlighter } from 'react-native-multi-word-highlight'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import SettingsIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import CSettingsModal from '../../components/modals/CSettingModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'

export default function ClientListScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [users, setUsers] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  let id = route.params ? route.params.id : null
  const singleSelect = useRef(null)
  const multipleSelect = useRef({})
  const refArray = useRef([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [actionType, setActionType] = useState('')
  const [selectable, setSelectable] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  let row = []
  let prevOpenedRow
  //console.log(id)
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

  const UserCard = ({ props, checkIfSelected, toggleSelected, navigation }) => {
    const { item } = props

    // console.log(item,'item....................')
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

    const onChecked = () => {
      toggleSelected(item)
    }

    const RightActions = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            singleSelect.current = item?.id
            setShowDeleteModal(true)
          }}
          style={s.deleteItemWrapper}
        >
          <DeleteIcon />
          <Text style={s.deleteItemText}>Delete</Text>
        </TouchableOpacity>
      )
    }

    const closeActions = (id) => {
      // console.log(prevOpenedRow,"---------")
      // console.log(prevOpenedRow, row[id], '0000000000000000')
      if (prevOpenedRow && prevOpenedRow !== row[id]) {
        prevOpenedRow.close()
      }
      prevOpenedRow = row[id]
    }

    return (
      <Swipeable
        friction={0.5}
        ref={(ref) => (row[item?.id] = ref)}
        key={item?.id}
        renderRightActions={RightActions}
        onSwipeableOpen={() => closeActions(item?.id)}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={[s.cardContainer, g.containerBetween]}>
            <TouchableOpacity
              style={g.containerLeft}
              onPress={() => {
                navigation.navigate('ClientDetails', { id: item?.id })
              }}
            >
              <Image source={{ uri: item.image }} style={s.profileImage} />
              <View>
                <Text style={s.cardTitle}>
                  {item?.name.length > 20 ? item?.name?.slice(0, 20) + ' ...' : item?.name}
                </Text>
                <Text style={s.cardSubtitle}>
                  {item?.email.length > 35 ? item?.email?.slice(0, 35) + ' ...' : item?.email}
                </Text>
                <View style={g.containerLeft}>
                  <MultiWordHighlighter
                    searchWords={[
                      {
                        word: 'Active',
                        textStyle: {
                          ...s.textStatus,
                        },
                      },
                      {
                        word: 'Invited',
                        textStyle: {
                          ...s.textStatus,
                          color: colors.SECONDARY,
                        },
                      },
                      {
                        word: 'Disabled',
                        textStyle: {
                          ...s.textStatus,
                          color: colors.LIGHT_GRAY,
                        },
                      },
                    ]}
                    textToHighlight={capitalizeFirstLetter(
                      item?.organization_user_role_setting?.user_status
                    )}
                  />
                  <Text style={s.cardRoleText}>
                    {item?.organization_user_role_setting?.role?.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <CCheckbox
              showLabel={false}
              checked={checked}
              setChecked={setChecked}
              onChecked={toggleDeleteMultiple}
            />
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }
  const [filteredUsers, setFilteredUsers] = useState([])

  useEffect(() => {
    if (!search) {
      setFilteredUsers(users)
      return
    }
    const delayDebounceFn = setTimeout(() => {
      setFilteredUsers(
        users.filter((user) => {
          return user.name.toLowerCase().includes(search.toLowerCase().trim())
        })
      )
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      pagination: 100,
      // allData: true,
    }
    if (query != '') {
      body['search'] = query
    }

    body['sort_by'] = 'last_update'

    api.group
      .getGroupUsers(id ? id : 2, body)
      .then((res) => {
        // console.log(res, '--------------')
        setUsers(res.data)
        setFilteredUsers(res.data)
      })
      .catch((err) => {
        //console.log(err.response)
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
  }, [refresh, refetch, query, isFocused])
  const goBack = () => {
    navigation.goBack()
  }

  const attemptDelete = async () => {
    try {
      setBtnLoading(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)

        console.log(toDeleteArray, '0000000000000000000')

        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.client.deleteMultipleClients({
            ids: toDeleteArray,
          })
          // //console.log(res)
          if (res.success) {
            setShowDeleteModal(false)
            setSelectable(false)
            setActionType('')
            toggleRefresh()
            multipleSelect.current = {}
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        let res = await api.client.deleteSingleClient(singleSelect.current)
        // //console.log(res)
        if (res.success) {
          toggleRefresh()
          Alert.alert('Delete Successful.')
        }
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

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.CONTAINER_BG },
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
      ]}
    >
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this Client? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
        btnLoader={btnLoading}
        multipleSelect={multipleSelect}
      />

      <CSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onDelete={() => {
          setActionType('delete')
          setSelectable(true)
          setShowDeleteModal(true)
        }}
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

            <Text style={[g.body1]}>Clients</Text>
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
        {!loading && (users.length == 0 || !filteredUsers.length) && (
          <Text style={{ paddingHorizontal: 16, textAlign: 'center' }}>
            No Users to show. Please add a new user pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <View style={s.container}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={(props) => (
                <UserCard
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
          onPress={() => navigation.navigate('ClientAddScreen', { groupId: id })}
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
    borderRadius: 8,
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
  textStatus: {
    backgroundColor: colors.PRIM_BG,
    color: colors.GREEN_NORMAL,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 12,
    fontFamily: 'inter-regular',
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
