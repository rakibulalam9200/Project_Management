import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import filters, { Priorities } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'
import PlusIcon from '../../assets/svg/plus-filled-white.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SaveIcon from '../../assets/svg/save_filter.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import CheckedIcon from '../../assets/svg/white-minus.svg'
import CButtonInput from '../../components/common/CButtonInput'
import CSelectWithLabel from '../../components/common/CSelectWithLabel'
import IconWrap from '../../components/common/IconWrap'
import { getErrorMessage } from '../../utils/Errors'
import CInputWithLabel from '../common/CInputWithLabel'
import CSearchInput from '../common/CSearchInput'
import CText from '../common/CText'
import SaveFilterListModal from './SaveFilterListModal'
import UserPickerModal from './UserPickerModal'

export default function ProjectFilterModal({
  children,
  visibility,
  setVisibility,
  navigation,
  selectedFilters,
  setSelectedFilters,
  selectedUsers,
  setSelectedUsers,
  setShowParentFilters,
  setSelectedPriorities,
  selectedPriorities,
  search,
  setSearch,
  onApply,
}) {
  const [selected, setSelected] = useState(selectedFilters)
  const [users, setUsers] = useState(selectedUsers)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showSaveFilterListModal, setShowSaveFilterListModal] = useState(false)
  const [projectFilter, setProjectFilter] = useState('Filter')
  const [searchData, setSearchData] = useState({})
  const [filterData, setFilterData] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [prioritiesSelected, setPrioritiesSelected] = useState(selectedPriorities)
  const [searchText, setSearchText] = useState('')
  const [listingSearch, setListingSearch] = useState(search)
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    let result = selected.map((s) => s?.label)
    let members = users.map((u) => u.id)
    let priorities = prioritiesSelected.map((p) => p.value)
    //console.log(members)
    let searchData = {
      moduleName: 'Project',
      search: listingSearch,
      stages: result,
      members: members,
      priorities: priorities,
    }
    setSearchData(searchData)
  }, [selected, users, prioritiesSelected, listingSearch])

  useEffect(() => {
    // //console.log(query)
    const body = {
      allData: true,
    }
    api.user
      .getUsers(body)
      .then((res) => {
        // //console.log(res,"---------------------")
        setAllUsers(res.members)
      })
      .catch((err) => {
        let errMsg = ''
        try {
          errMsg = getErrorMessage(err)
        } catch (err) {
          errMsg = 'An error occurred. Please try again later'
        }
        Alert.alert(errMsg)
      })
  }, [])

  const checkIfSelected = (filter) => {
    const found = selected.find((f) => f.label == filter.label)
    return found
  }

  const toggleSelected = (filter) => {
    if (checkIfSelected(filter)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((selectedFilter) => filter.label != selectedFilter.label)
      })
    } else {
      setSelected((prev) => [...prev, filter])
    }
  }

  const checkIfSelectedPriorities = (priority) => {
    const found = prioritiesSelected.find((f) => f.value == priority.value)
    return found
  }

  const toggleSelectedPriorities = (priority) => {
    if (checkIfSelectedPriorities(priority)) {
      setPrioritiesSelected((prev) => {
        const copy = [...prev]
        return copy.filter((selectedPriority) => priority.value != selectedPriority.value)
      })
    } else {
      setPrioritiesSelected((prev) => [...prev, priority])
    }
  }

  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const openSaveFilterListModal = () => {
    setShowSaveFilterListModal(true)
  }

  const goBack = () => {
    navigation.goBack()
  }

  const resetFilters = () => {
    setUsers([])
    setSelected([])
    setPrioritiesSelected([])
    setListingSearch('')
  }

  const resetListingFilter = () => {
    setSelectedFilters([])
    setSelectedUsers([])
    setSelectedPriorities([])
    setSearch('')
  }

  const resetAllUsers = () => {
    setUsers([])
  }
  const resetUsers = (user) => {
    if (users?.length > 1) {
      setUsers((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => user.email !== filterItem.email)
      })
    } else if (users?.length == 1) {
      setUsers([])
    }
  }

  const closeModal = () => {
    setVisibility(false)
  }

  const applyFilters = () => {
    // //console.log(users, 'users....')
    setSelectedFilters(selected)
    setSelectedUsers(users)
    setSelectedPriorities(prioritiesSelected)
    setSearch(listingSearch)
    if (selected.length > 0 || users.length > 0 || prioritiesSelected.length > 0) {
      setShowParentFilters(true)
    }
    onApply && onApply()
    closeModal()
  }

  const editSavedFilter = (filterData) => {
    setProjectFilter('Filter')
    const objFitlerData = JSON.parse(filterData?.json_data)
    let savedStages = filters.filter((s) => {
      return objFitlerData?.stages?.find((f) => f === s.label)
    })
    let savedMembers = allUsers.filter((user) => {
      return objFitlerData?.members?.find((m) => m === user.id)
    })
    let savedPriorities = Priorities.filter((f) => {
      return objFitlerData?.priorities?.find((p) => p === f.value)
    })
    setSearch(objFitlerData?.search)
    setListingSearch(objFitlerData?.search)
    setSelected(savedStages)
    setUsers(savedMembers)
    setPrioritiesSelected(savedPriorities)
    setEditData({ id: filterData?.id, name: filterData?.name })
  }

  const applySavedFilter = (savedData) => {
    const objSavedData = JSON.parse(savedData)
    let savedStages = filters.filter((s) => {
      return objSavedData?.stages?.find((f) => f === s.label)
    })
    let savedMembers = allUsers.filter((user) => {
      return objSavedData?.members?.find((m) => m === user.id)
    })
    let savedPriorities = Priorities.filter((f) => {
      return objSavedData?.priorities?.find((p) => p === f.value)
    })

    setSearch(objSavedData?.search)
    setListingSearch(objSavedData?.search)
    setSelected(savedStages)
    setUsers(savedMembers)
    setSelectedPriorities(savedPriorities)
    setPrioritiesSelected(savedPriorities)
    setSelectedFilters(savedStages)
    setSelectedUsers(savedMembers)
    setShowParentFilters(true)
    onApply && onApply()
    closeModal()
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(searchText)
      // setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [searchText])

  useEffect(() => {
    setUsers(selectedUsers)
    setSelected(selectedFilters)
    setPrioritiesSelected(selectedPriorities)
    // setListingSearch(search)
  }, [selectedUsers, selectedFilters, selectedPriorities])

  useEffect(() => {
    setListingSearch(search)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const body = {
      moduleName: 'Project',
    }

    if (query != '') {
      body['search'] = query
    }

    api.filterHistory
      .getAllFilterHistory(body)
      .then((res) => {
        // //console.log(res.data,'res..........')
        setFilterData(res.data)
      })
      .catch((err) => {
        // //console.log(err.response)
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
  }, [projectFilter, query, refresh])

  const deleteFilterHistory = async (filterId) => {
    let res = await api.filterHistory.deleteFilterHistory(filterId)
    if (res.success) {
      Alert.alert('Delete Successful.')
      setRefresh((prev) => !prev)
    }
  }

  const Item = ({ item }) => (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
        <TouchableOpacity onPress={() => applySavedFilter(item.json_data)}>
          <Text style={g.normalText}>
            {item.name.length > 25 ? item.name.slice(0, 25) : item.name}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={() => editSavedFilter(item)}>
            <EditIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFilterHistory(item?.id)}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ borderBottomColor: '#D6E2FF', borderBottomWidth: 1 }}></View>
    </View>
  )
  // //console.log(selected,'selected...')

  return (
    <Modal visible={visibility} animationType="fade" onRequestClose={closeModal} transparent={true}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.CONTAINER_BG }}>
        <View style={[g.outerContainer]}>
          <UserPickerModal
            visibility={showUserPickerModal}
            setVisibility={setShowUserPickerModal}
            selected={users}
            setSelected={setUsers}
            label={'Members'}
          />
          <SaveFilterListModal
            visibility={showSaveFilterListModal}
            setVisibility={setShowSaveFilterListModal}
            searchData={searchData}
            moduleName={'Project'}
            editData={editData}
            resetFilters={resetFilters}
            setEditData={setEditData}
            setListingSearch={setListingSearch}
            setRefresh={setRefresh}
          />
          <View style={[g.modalOuterContainer, { paddingHorizontal: 0 }]}>
            <View style={[s.modalContent]}>
              <View style={{ flex: 1 }}>
                <View style={[s.headerContainer]}>
                  <TouchableOpacity
                    onPress={() => {
                      resetFilters()
                      resetListingFilter()
                      setEditData({})
                      closeModal()
                    }}
                  >
                    <BackArrow fill={colors.NORMAL} />
                  </TouchableOpacity>
                  <CText style={[g.body1, s.textColor]}>Project Filter</CText>
                  <View style={s.buttonGroup}>
                    <TouchableOpacity style={s.buttonGroupBtn} onPress={openSaveFilterListModal}>
                      <SaveIcon fill={colors.NORMAL} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={[
                    g.containerBetween,
                    s.filterPickerContainer,
                    projectFilter === 'FilterList' && { marginBottom: 8 },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      s.filterButton,
                      projectFilter === 'Filter' ? s.filterButtonActive : null,
                    ]}
                    onPress={() => {
                      setProjectFilter('Filter')
                    }}
                  >
                    <Text
                      style={[
                        g.filterButtonText,
                        projectFilter === 'Filter' ? g.filterButtonTextActive : null,
                      ]}
                    >
                      Filter
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.filterButton,
                      projectFilter === 'FilterList' ? s.filterButtonActive : null,
                    ]}
                    onPress={() => {
                      setProjectFilter('FilterList')
                    }}
                  >
                    <Text
                      style={[
                        g.filterButtonText,
                        projectFilter === 'FilterList' ? g.filterButtonTextActive : null,
                      ]}
                    >
                      Filter List
                    </Text>
                  </TouchableOpacity>
                </View>
                {projectFilter === 'Filter' && (
                  <ScrollView style={{ flex: 1, marginTop: 8 }}>
                    <CInputWithLabel
                      value={listingSearch}
                      setValue={setListingSearch}
                      placeholder=""
                      label="SearchText"
                      style={{ backgroundColor: 'white', paddingVertical: 8 }}
                    />
                    <CSelectWithLabel
                      label="Member"
                      style={{ backgroundColor: colors.WHITE, paddingVertical: 8 }}
                      onPress={openUserPickerModal}
                      containerStyle={{ marginBottom: 16 }}
                    />

                    <View style={s.filterContainer}>
                      {users.map((user, idx) => {
                        return (
                          <View
                            key={idx}
                            style={[
                              s.userItemContainer,
                              { flexDirection: 'row', alignItems: 'center' },
                            ]}
                          >
                            <Text style={s.userItemTextDark}>{user?.name || user?.email}</Text>
                            <TouchableOpacity
                              onPress={() => resetUsers(user)}
                              style={{ marginLeft: 4 }}
                            >
                              <SmallCrossIcon fill={colors.SECONDARY} />
                            </TouchableOpacity>
                          </View>
                        )
                      })}
                      {users.length > 0 && (
                        <TouchableOpacity onPress={resetAllUsers} style={{ marginLeft: 8 }}>
                          <CrossIcon />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={{ color: '#9CA2AB', marginTop: 8 }}>Status</Text>
                    <View style={[s.filterContainer, { marginTop: 8 }]}>
                      {filters.map((filter, idx) => {
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[s.filterItemContainer, { backgroundColor: filter.color }]}
                            onPress={() => toggleSelected(filter)}
                          >
                            {checkIfSelected(filter) ? <CheckedIcon /> : <PlusIcon />}
                            <Text style={s.filterItemText}>{filter.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <Text style={{ color: '#9CA2AB', marginTop: 8 }}>Priority</Text>
                    <View style={[s.filterContainer, { marginTop: 8 }]}>
                      {Priorities.map((priority, idx) => {
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[s.filterItemContainer, { backgroundColor: priority.color }]}
                            onPress={() => toggleSelectedPriorities(priority)}
                          >
                            {checkIfSelectedPriorities(priority) ? <CheckedIcon /> : <PlusIcon />}
                            <Text style={s.filterItemText}>{priority.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </ScrollView>
                )}
                {projectFilter === 'FilterList' && (
                  <View style={{ flex: 1 }}>
                    <CSearchInput
                      placeholder="Search"
                      value={searchText}
                      setValue={setSearchText}
                      filterIcon={true}
                      style={{ marginBottom: 8 }}
                    />
                    {loading && <ActivityIndicator size="small" color={colors.HOVER} />}
                    {!loading && (
                      <FlatList
                        data={filterData}
                        renderItem={({ item }) => <Item item={item} />}
                        keyExtractor={(item) => item.id}
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                      />
                    )}
                  </View>
                )}
              </View>

              {projectFilter === 'Filter' && <View style={[g.containerBetween, s.resetContainer]}>
                <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                  <IconWrap
                    outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                    onPress={resetFilters}
                  >
                    <ResetIcon />
                  </IconWrap>
                  <Text style={s.resetText}>Reset Filters</Text>
                </TouchableOpacity>
                <CButtonInput
                  label="Apply Filter"
                  onPress={applyFilters}
                  style={{ paddingHorizontal: 54 }}
                />
              </View>}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const s = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    flexBasis: 1,
    flexWrap: 'wrap',
  },
  filterItemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 5,
    borderRadius: 20,
  },
  filterItemText: {
    color: colors.WHITE,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    marginVertical: 16,
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
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    // paddingHorizontal: 16,
    // marginBottom: 50,
    width: '100%',
    // flex: 1,
    backgroundColor: '#white',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    flex: 1,
    // position: 'relative',
    justifyContent: 'space-between',
  },
  filterPickerContainer: {
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    // marginVertical: 16,
  },
  filterButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  filterButtonText: {
    color: colors.NORMAL,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'inter-regular',
    fontWeight: '400',
  },
  filterButtonTextActive: {
    color: colors.WHITE,
    fontFamily: 'inter-bold',
    fontWeight: '700',
    fontSize: 18,
  },
})
