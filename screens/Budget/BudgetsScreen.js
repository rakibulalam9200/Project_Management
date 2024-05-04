import React, { useState } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import colors from '../../assets/constants/colors'
import DownIcon from '../../assets/svg/arrow-down.svg'
import BackArrow from '../../assets/svg/arrow-left.svg'
import UpIcon from '../../assets/svg/arrow-up.svg'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import FilterIcon from '../../assets/svg/filter.svg'
import GripIcon from '../../assets/svg/grip.svg'
import SettingsIcon from '../../assets/svg/settings.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CText from '../../components/common/CText'
import IconWrap from '../../components/common/IconWrap'

import { useIsFocused } from '@react-navigation/native'
import { useEffect, useRef } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CFloatingPlusIcon from '../../components/common/CFloatingPlusIcon'
import CSearchInput from '../../components/common/CSearchInput'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import ProjectFilterModal from '../../components/modals/ProjectFilterModal'
import ProjectSettingsModal from '../../components/modals/ProjectSettingsModal'
import { setNormal } from '../../store/slices/tab'
import { getFilterStagesFromSelectedFilters } from '../../utils/Filters'
import { getUserIdsFromSelectedUsers } from '../../utils/User'

export default function BudgetsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState([])
  const [users, setUsers] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [budgets, setBudgets] = useState([
    { id: 1, name: 'ProjectName 1', amount: 562000, status: 'Draft' },
    { id: 2, name: 'ProjectName 2', amount: 3000, status: 'Submitted' },
    { id: 3, name: 'ProjectName 3', amount: 4654, status: 'Submitted' },
    { id: 4, name: 'ProjectName 4', amount: 655000, status: 'Submitted' },
    { id: 5, name: 'ProjectName 5', amount: 562000, status: 'Submitted' },
    { id: 6, name: 'ProjectName 6', amount: 200000, status: 'Approved' },
  ])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  let refetch = route.params ? route.params.refetch : null
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const BudgetCard = ({ item, drag, isActive }) => {
    const [checked, setChecked] = useState(() => {
      if (multipleSelect.current[item.id]) return true
      else return false
    })

    const toggleDeleteMultiple = () => {
      multipleSelect.current[item.id] = multipleSelect.current[item.id] ? undefined : true
    }

    const RightActions = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            singleSelect.current = item.id
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
        key={item.id}
        renderLeftActions={LeftActions}
        renderRightActions={RightActions}
        onSwipeableLeftWillOpen={() => {
          setDraggable((prev) => !prev)
        }}
      >
        <TouchableWithoutFeedback
          onLongPress={() =>
            setSelectable((prev) => {
              return !prev
            })
          }
        >
          <View style={g.containerBetween}>
            {draggable && (
              <TouchableOpacity onPressIn={drag} style={s.containerGrip}>
                <GripIcon />
              </TouchableOpacity>
            )}
            <View style={[s.cardContainer, g.containerBetween]}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onLongPress={() =>
                    setSelectable((prev) => {
                      return !prev
                    })
                  }
                  onPress={() => {
                    navigation.navigate('BudgetDetails')
                  }}
                >
                  <View style={s.cardRowBetween}>
                    <Text style={s.cardTitle}>{item.name}</Text>

                    <View style={s.spaceRight}>
                      {selectable && (
                        <CCheckbox
                          showLabel={false}
                          checked={checked}
                          setChecked={setChecked}
                          onChecked={toggleDeleteMultiple}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={[s.cardRowBetween, { paddingBottom: 15, paddingLeft: 10 }]}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <Text
                      style={{
                        color: '#9CA2AB',
                        fontWeight: '500',
                        fontFamily: 'inter-medium',
                        fontSize: 14,
                      }}
                    >
                      {'Amount:'}
                    </Text>
                    <Text
                      style={{
                        color: '#246BFD',
                        fontWeight: '500',
                        fontFamily: 'inter-medium',
                        fontSize: 14,
                        marginLeft: 10,
                      }}
                    >{`$${item.amount}`}</Text>
                  </View>

                  <Text style={[g.gCardStatus, { backgroundColor: '#1DAF2B' }]}>{item.status}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    )
  }

  const toggleFilters = () => {
    setShowFilters((prev) => !prev)
  }

  const resetFilters = () => {
    setSelected([])
  }

  const resetUsers = () => {
    setUsers([])
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlusDestination('BudgetAdd'))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const attemptDelete = async () => {
    /* try {
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        //console.log(toDeleteArray)
        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.project.deleteMultiplebudgets({
            project_ids: toDeleteArray,
          })

          if (res.success) {
            Alert.alert('Delete Successful.')
          }
          setShowDeleteModal(false)
          toggleRefresh()
        }
      } else {
        if (singleSelect.current) {
          let res = await api.project.deleteProject(singleSelect.current)

          if (res.success) {
            Alert.alert('Delete Successful.')
            multipleSelect.current = {}
            toggleRefresh()
          }
          setShowDeleteModal(false)
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
    } */
  }

  const attemptClone = async () => {
    /*try {
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.project.clonebudgets({
            project_ids: toCloneArray,
          })
          //console.log(res)
          if (res.success) {
            Alert.alert('Clone Successful.')
            multipleSelect.current = {}
            toggleRefresh()
          }
        }
      } else {
        Alert.alert('Please select at least one project to clone.')
      }
    } catch (err) {
      //console.log(err.response)
      let errorMsg = ''
      try {
        errorMsg = getOnlyErrorMessage(err)
      } catch (err) {
        //console.log(err)
        errorMsg = 'An error occured. Please try again later.'
      }
      Alert.alert(errorMsg)
    } */
  }

  const attemptOrder = async () => {
    /*  try {
       let orderArray = getSortingOrderData(budgets)
 
       let res = await api.project.orderProject({
         sorting_data: orderArray,
       })
       //console.log(res)
       if (res.success) {
         Alert.alert('Ordering Successful.')
         toggleRefresh()
         setDraggable(false)
       }
     } catch (err) {
       //console.log(err.response)
       let errorMsg = ''
       try {
         errorMsg = getOnlyErrorMessage(err)
       } catch (err) {
         //console.log(err)
         errorMsg = 'An error occured. Please try again later.'
       }
       Alert.alert(errorMsg)
     } */
  }

  useEffect(() => {
    setLoading(true)
    const body = {
      allData: true,
      sort_by: 'in_order',
    }
    if (query != '') {
      body['search'] = query
    }
    if (users.length > 0) {
      body['members'] = getUserIdsFromSelectedUsers(users)
    }

    if (selected.length > 0) {
      body['stages'] = getFilterStagesFromSelectedFilters(selected)
    }
    setBudgets([
      { id: 1, name: 'ProjectName 1', amount: 562000, status: 'Draft' },
      { id: 2, name: 'ProjectName 2', amount: 3000, status: 'Submitted' },
      { id: 3, name: 'ProjectName 3', amount: 4654, status: 'Submitted' },
      { id: 4, name: 'ProjectName 4', amount: 655000, status: 'Submitted' },
      { id: 5, name: 'ProjectName 5', amount: 562000, status: 'Submitted' },
      { id: 6, name: 'ProjectName 6', amount: 200000, status: 'Approved' },
    ])
    if (budgets.length > 0) {
      setLoading(false)
    }

    /* api.project
      .getAllProjects(body)
      .then((res) => {
        setBudgets(res)
        //console.log(res)
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
      }) */
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProjectSettingsModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onDelete={() => setShowDeleteModal(true)}
        onClone={attemptClone}
      />
      <ProjectFilterModal
        visibility={showFiltersModal}
        setVisibility={setShowFiltersModal}
        selectedUsers={users}
        setSelectedUsers={setUsers}
        selectedFilters={selected}
        setSelectedFilters={setSelected}
        setShowParentFilters={setShowFilters}
      />
      <DeleteConfirmationModal
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
      />
      <View style={[g.outerContainer, g.spaceBelow]}>
        <View style={s.outerPadding}>
          {/* Headin with icons */}
          <View style={s.headerContainer}>
            <IconWrap
              onPress={() => {
                navigation.goBack()
              }}
              outputRange={iconWrapColors}
            >
              <BackArrow fill={colors.NORMAL} />
            </IconWrap>
            <CText style={[g.title3, s.textColor]}>Budgets</CText>
            <View style={s.buttonGroup}>
              <IconWrap
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <SettingsIcon fill={colors.NORMAL} />
              </IconWrap>
              <IconWrap
                onPress={() => {
                  setShowFiltersModal(true)
                }}
                outputRange={iconWrapColors}
                style={s.buttonGroupBtn}
              >
                <FilterIcon fill={colors.NORMAL} />
              </IconWrap>
              <IconWrap onPress={() => {}} outputRange={iconWrapColors} style={s.buttonGroupBtn}>
                <SortIcon fill={colors.NORMAL} />
              </IconWrap>
            </View>
          </View>
          {/* Heading with icons */}

          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />

          <TouchableOpacity style={[g.containerBetween, s.filters]} onPress={toggleFilters}>
            <Text style={s.filterText}>Filters</Text>
            {showFilters ? <DownIcon /> : <UpIcon />}
          </TouchableOpacity>
          {showFilters && (
            <View>
              <View style={s.filterContainer}>
                {users.map((user, idx) => {
                  return (
                    <View key={idx} style={[s.userItemContainer]}>
                      <Text style={s.userItemTextDark}>{user.name}</Text>
                    </View>
                  )
                })}
                {users.length > 0 && (
                  <TouchableOpacity onPress={resetUsers}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              <View style={s.filterContainer}>
                {selected.map((filter, idx) => {
                  return (
                    <View
                      key={idx}
                      style={[s.userItemContainer, { backgroundColor: filter.color }]}
                    >
                      <Text style={s.userItemText}>{filter.label}</Text>
                    </View>
                  )
                })}
                {selected.length > 0 && (
                  <TouchableOpacity onPress={resetFilters}>
                    <CrossIcon />
                  </TouchableOpacity>
                )}
              </View>
              BudgetAdd
            </View>
          )}
        </View>
        {!loading && budgets.length == 0 && (
          <Text>
            No budgets to show. Please create your new project by pressing the plus button.
          </Text>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <DraggableFlatList
            data={budgets}
            onDragBegin={() => {}}
            onDragEnd={({ data }) => {
              setBudgets(data)
            }}
            keyExtractor={(item) => item.id}
            renderItem={(props) => <BudgetCard {...props} />}
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              paddingHorizontal: 10,
            }}
          />
        )}
        <View>{draggable && <CButtonInput label="Save" onPress={attemptOrder} />}</View>
      </View>
      <CFloatingPlusIcon onPress={() => navigation.navigate('BudgetAdd')} />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    paddingTop: 20,
    backgroundColor: 'yellow',
  },
  scrollContainer: {
    paddingBottom: 100,
    paddingHorizontal: 23,
    paddingTop: 4,
  },
  outerContainer: {
    paddingTop: StatusBar.currentHeight,
    backgroundColor: colors.CONTAINER_BG,
    flex: 1,
    alignItems: 'center',
    marginBottom: 100,
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
  userItemContainer: {
    backgroundColor: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 4,
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
    marginBottom: 24,
    marginTop: 24,
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
  containerGrip: {
    padding: 10,
  },
  cardListContainer: {
    flex: 1,
    backgroundColor: 'blue',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'inter-medium',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#1DAF2B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 4,
  },
  cardProgressText: {
    marginLeft: 10,
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
  dragItemWrapper: {
    backgroundColor: colors.CONTAINER_BG,
    width: '0.1%',
  },
  dragItemText: {
    color: colors.CONTAINER_BG,
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: ' #1DAF2B',
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 4,
  },
})
