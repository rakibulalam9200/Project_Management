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
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'
import CSettingsModal from '../../components/modals/CSettingModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { capitalizeFirstLetter } from '../../utils/Capitalize'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'

export default function UserListScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [users, setUsers] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [actionType, setActionType] = useState('')
  let refetch = route.params ? route.params.refetch : null
  let id = route.params ? route.params.id : null
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  //console.log(id)
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
      .getGroupUsers(id ? id : 1, body)
      .then((res) => {
        setUsers(res.data)
        setFilteredUsers(res.data)
      })
      .catch((err) => {
        //console.log(err.response.data)
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

  const UserCard = ({ props, checkIfSelected, toggleSelected, navigation, groupId }) => {
    const { item } = props

    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item?.id]) return true
      else return false
    })
    const [isCollapsed, setIsCollapsed] = useState(false)

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item?.id] = multipleSelect.current[item?.id] ? undefined : true
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
    const LeftActions = () => {
      return (
        <View style={s.dragItemWrapper}>
          <Text style={s.dragItemText}>Drag</Text>
        </View>
      )
    }

    return (
      <Swipeable
        key={item?.id}
        // renderLeftActions={LeftActions}
        renderRightActions={RightActions}
        onSwipeableLeftWillOpen={() => {
          setDraggable((prev) => !prev)
        }}
      >
        <TouchableWithoutFeedback
          onLongPress={() => {
            setSelectable((prev) => {
              return !prev
            })
            setActionType('')
            multipleSelect.current = {}
          }}
        >
          <View style={[s.cardContainer, g.containerBetween]}>
            <TouchableOpacity
              style={g.containerLeft}
              onPress={() => {
                navigation.navigate('UserDetailsScreen', {
                  user: item,
                  userId: item.id,
                  groupId: groupId,
                })
              }}
            >
              <Image source={{ uri: item.image }} style={s.profileImage} />
              <View>
                <Text style={s.cardTitle}>
                  {item?.name.length > 22 ? item?.name?.slice(0, 22) + '...' : item?.name}
                </Text>
                <Text style={s.cardSubtitle}>
                  {item?.email?.length > 35 ? item?.email?.slice(0, 35) + '...' : item?.email}
                </Text>
                <View style={g.containerLeft}>
                  <MultiWordHighlighter
                    searchWords={[
                      {
                        word: 'Active',
                        textStyle: {
                          backgroundColor: colors.PRIM_BG,
                          color: colors.GREEN_NORMAL,
                          borderRadius: 12,
                          paddingVertical: 2,
                          paddingHorizontal: 4,
                          fontSize: 12,
                          fontFamily: 'inter-regular',
                        },
                      },
                      {
                        word: 'Invited',
                        textStyle: {
                          backgroundColor: colors.PRIM_BG,
                          color: colors.SECONDARY,
                          borderRadius: 12,
                          paddingVertical: 2,
                          paddingHorizontal: 4,
                          fontSize: 12,
                          fontFamily: 'inter-regular',
                        },
                      },
                      {
                        word: 'Disabled',
                        textStyle: {
                          backgroundColor: colors.PRIM_BG,
                          color: colors.LIGHT_GRAY,
                          borderRadius: 12,
                          paddingVertical: 2,
                          paddingHorizontal: 4,
                          fontSize: 12,
                          fontFamily: 'inter-regular',
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

  const attemptDelete = async () => {
    try {
      setBtnLoader(true)
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        console.log(toDeleteArray, 'delete array........')
        if (toDeleteArray.length == 0) {
          setShowDeleteModal(false)
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.user.deleteMultipleUsers({
            ids: toDeleteArray,
          })

          if (res.success) {
            multipleSelect.current = {}
            setShowDeleteModal(false)
            setSelectable(false)
            toggleRefresh()
            Alert.alert('Delete Successful.')
          }
        }
      } else {
        if (singleSelect.current) {
          let res = await api.user.deleteUser(singleSelect.current)

          if (res.success) {
            multipleSelect.current = {}
            toggleRefresh()
            setShowDeleteModal(false)
            Alert.alert('Delete Successful.')
          }
        } else {
          Alert.alert('Please select at least one project to delete')
          setShowDeleteModal(false)
        }
      }
    } catch (err) {
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } finally {
      setBtnLoader(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[s.outerContainer]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconWrap
                onPress={() => {
                  navigation.goBack()
                }}
                // outputRange={iconWrapColors}
              >
                <BackArrow fill={colors.NORMAL} />
              </IconWrap>
            </View>
            <View style={{ flex: 1, marginLeft: '22%' }}>
              <CText style={[g.title3, s.textColor]}>Employees</CText>
            </View>

            <View style={s.buttonGroup}>
              {/* <IconWrap onPress={() => {}} style={s.buttonGroupBtn}>
                <SortIcon fill={colors.NORMAL} />
              </IconWrap> */}
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
            style={{ paddingHorizontal: 16 }}
          />

          <DeleteConfirmationModal
            visibility={showDeleteModal}
            setVisibility={setShowDeleteModal}
            onDelete={attemptDelete}
            setSelectable={setSelectable}
            multipleSelect={multipleSelect}
            confirmationMessage={'Do you want to delete employee? This cannot be undone.'}
            btnLoader={btnLoader}
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
                  groupId={id}
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

        <CFloatingPlusIcon
          onPress={() => navigation.navigate('UserAdd', { groupId: id, fromDirectoryDetail: true })}
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
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 55,
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
    // marginBottom: 8,
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
