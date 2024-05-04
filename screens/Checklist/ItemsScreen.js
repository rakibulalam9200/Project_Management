import { useIsFocused } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Swipeable } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete_white.svg'
import FloatingPlusButton from '../../assets/svg/floating-plus.svg'
import GripIcon from '../../assets/svg/grip.svg'
import MoreIcon from '../../assets/svg/more.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SortIcon from '../../assets/svg/sort.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CCheckbox from '../../components/common/CCheckbox'
import CSearchInput from '../../components/common/CSearchInput'
import CText from '../../components/common/CText'
import CDetailsSettingModal from '../../components/modals/CDetailsSettingModal'
import CheckListItemModal from '../../components/modals/ChecklistItemModal'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'
import { setNormal } from '../../store/slices/tab'
import { getErrorMessage, getOnlyErrorMessage } from '../../utils/Errors'
import { getSortingOrderData } from '../../utils/Order'
import { extractPermissionsIdsFromRef } from '../../utils/Permissions'
import { getIdsFromArray } from '../../utils/PickIds'

export default function ItemsScreen({ navigation, route }) {
  const iconWrapColors = [colors.WHITE, colors.MID_BG, colors.END_BG]
  const multipleSelect = useRef({})
  const singleSelect = useRef(null)
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [listItems, setListItems] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [listName, setListName] = useState('')
  const [showChecklistItemModal, setShowChecklistItemModal] = useState(false)
  let refetch = route.params ? route.params.refetch : null
  let id = route.params ? route.params.id : null
  const toggleRefresh = () => {
    setRefresh((prev) => !prev)
  }
  const onRefresh = () => {
    toggleRefresh()
  }

  const openChecklistItemModal = () => {
    setShowChecklistItemModal(true)
  }

  const ListItemCard = ({ item, drag, isActive }) => {
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
                  onPress={() =>
                    navigation.navigate('ItemDetails', { id: item.id, refetch: Math.random() })
                  }
                  // onPress={() => {
                  //   navigation.navigate('ChecklistEdit', { id: item.id })
                  // }}
                >
                  <View style={s.cardRowBetween}>
                    <Text style={g.body1}>
                      <Text style={{ color: colors.SECONDARY }}>{`${
                        item.order >= 10 ? item.order : '0' + item.order
                      }. `}</Text>
                      {item.description.value.length > 30
                        ? item.description.value.slice(0, 30) + '...'
                        : item.description.value}
                    </Text>

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
                  <Text style={g.gCardStatus}>{'Opened'}</Text>
                  <View style={s.cardRowLeft}></View>
                </TouchableOpacity>
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
    setSelected({ id: -1, name: '' })
  }

  const resetMilestone = () => {
    setMilestoneSelected({ id: -1, name: '' })
  }

  const resetTask = (id) => {
    setTaskSelected((pre) => {
      const copy = pre
      return copy.filter((each) => each.id !== id)
    })
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(setNormal())
      // dispatch(setPlusDestination('ChecklistAdd'))
    }
  }, [isFocused])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(search)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const attemptDelete = async () => {
    try {
      if (selectable) {
        // multiselect is on
        let toDeleteArray = extractPermissionsIdsFromRef(multipleSelect)
        //console.log(toDeleteArray)
        if (toDeleteArray.length == 0) {
          Alert.alert('Please select at least one item to delete!.')
        } else {
          let res = await api.checklist.deleteMultipleChecklistItems({
            listitem_ids: toDeleteArray,
          })

          if (res.success) {
            Alert.alert('Delete Successful.')
          }
          setShowDeleteModal(false)
          toggleRefresh()
        }
      } else {
        if (singleSelect.current) {
          let res = await api.checklist.deleteChecklistItem(singleSelect.current)

          if (res.success) {
            Alert.alert('Delete Successful.')
            multipleSelect.current = {}
            toggleRefresh()
          }
          setShowDeleteModal(false)
        } else {
          Alert.alert('Please select at least one Checklist to delete')
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
    }
  }

  const attemptClone = async () => {
    try {
      if (selectable) {
        let toCloneArray = extractPermissionsIdsFromRef(multipleSelect)
        if (toCloneArray.length == 0) {
          Alert.alert('Please select at least one item to clone.')
        } else {
          let res = await api.checklist.cloneChecklistItem({
            list_item_ids: toCloneArray,
          })
          //console.log(res)
          if (res.success) {
            Alert.alert('Clone Successful.')
            multipleSelect.current = {}
            toggleRefresh()
          }
        }
      } else {
        Alert.alert('Please select at least one Checklist to clone.')
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
    }
  }

  const attemptOrder = async () => {
    try {
      let orderArray = getSortingOrderData(listItems)

      let res = await api.checklist.orderChecklistItem({
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
    }
  }

  useEffect(() => {
    setLoading(true)
    let body = {
      allData: true,
      sort_by: 'in_order',
    }
    if (query != '') {
      body['search'] = query
    }

    if (selected.id !== -1) {
      body['project_id'] = selected.id
    }
    if (taskSelected.length > 0) {
      let taskIds = getIdsFromArray(taskSelected, 'task_ids')
      body = { ...body, ...taskIds }
    }

    api.checklist
      .getChecklist(id)
      .then((res) => {
        setListItems(
          res?.todolist.list_items.map((item, idx) => {
            return { ...item, order: idx + 1 }
          })
        )
        setListName(res?.todolist?.name)
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
  }, [refresh, refetch, query, selected, milestoneSelected, taskSelected])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DeleteConfirmationModal
        confirmationMessage={'Do you want to delete this Checklist? This cannot be undone'}
        visibility={showDeleteModal}
        setVisibility={setShowDeleteModal}
        onDelete={attemptDelete}
      />
      <CDetailsSettingModal
        visibility={showSettingsModal}
        setVisibility={setShowSettingsModal}
        onEdit={() => navigation.navigate('ChecklistEdit', { id: id })}
        onDelete={() => setShowDeleteModal(true)}
        onClone={attemptClone}
      />
      <CheckListItemModal
        visibility={showChecklistItemModal}
        setVisibility={setShowChecklistItemModal}
      />

      <View style={[g.outerContainer, g.listingSpaceBelow]}>
        <View style={s.outerPadding}>
          <View style={s.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[g.body1, s.textColor]}>{listName}</CText>
            <View style={s.buttonGroup}>
              <TouchableOpacity
                onPress={() => {
                  // setAllCollapsable(!allCollapsable)
                }}
                style={[s.buttonGroupBtn, { marginRight: 10 }]}
              >
                <SortIcon fill={colors.NORMAL} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSettingsModal(true)
                }}
                style={s.buttonGroupBtn}
              >
                <MoreIcon fill={colors.NORMAL} />
              </TouchableOpacity>
            </View>
          </View>

          <CSearchInput placeholder="Search" value={search} setValue={setSearch} />
          {showFilters && (
            <View>
              {selected.id !== -1 && (
                <View style={s.filterContainer}>
                  <View style={[s.userItemContainer]}>
                    <Text style={s.userItemTextDark}>{selected?.name}</Text>
                  </View>

                  <TouchableOpacity onPress={resetFilters}>
                    <CrossIcon />
                  </TouchableOpacity>
                </View>
              )}
              {milestoneSelected.id !== -1 && (
                <View style={s.filterContainer}>
                  <View style={[s.userItemContainer]}>
                    <Text style={s.userItemTextDark}>{milestoneSelected?.name}</Text>
                  </View>

                  <TouchableOpacity onPress={resetMilestone}>
                    <CrossIcon />
                  </TouchableOpacity>
                </View>
              )}

              <View style={s.filterContainer}>
                {taskSelected?.map((filter, idx) => {
                  return (
                    <View style={s.filterContainer} key={idx}>
                      <View key={idx} style={[s.userItemContainer]}>
                        <Text style={s.userItemTextDark}>{filter.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => resetTask(filter.id)}>
                        <CrossIcon />
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </View>
            </View>
          )}
        </View>
        {!loading && listItems?.length == 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text>
              No listItems to show. Please create your new Checklist by pressing the plus button.
            </Text>
          </View>
        )}
        {loading && <ActivityIndicator size="small" color={colors.NORMAL} />}
        {!loading && (
          <DraggableFlatList
            data={listItems}
            onDragBegin={() => {}}
            onDragEnd={({ data }) => {
              setListItems(
                data.map((item, idx) => {
                  return { ...item, order: idx + 1 }
                })
              )
            }}
            keyExtractor={(item) => item.id}
            renderItem={(props) => <ListItemCard {...props} />}
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              paddingHorizontal: 20,
            }}
          />
        )}
        {!loading && !draggable && (
          <TouchableOpacity
            style={s.plusButton}
            onPress={() => navigation.navigate('ItemAdd', { listId: id })}
          >
            <FloatingPlusButton />
          </TouchableOpacity>
        )}
        <View>{draggable && <CButtonInput label="Save" onPress={attemptOrder} />}</View>
      </View>
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
    paddingHorizontal: 20,
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
    color: colors.NORMAL,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 16,
    marginTop: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardStatus: {
    fontSize: 14,
    letterSpacing: 1.1,
    borderRadius: 40,
    backgroundColor: '#1DAF2B',
    color: colors.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 4,
    alignSelf: 'flex-start',
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
  plusButton: {
    position: 'absolute',
    bottom: -15,
    right: 0,
  },
})
