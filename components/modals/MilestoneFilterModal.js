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
import filters from '../../assets/constants/calendar-filters'
import colors from '../../assets/constants/colors'
import { Priorities } from '../../assets/constants/filters'
import g from '../../assets/styles/global'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'
import PlusIcon from '../../assets/svg/plus-filled-white.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SaveIcon from '../../assets/svg/save-icon.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import CheckedIcon from '../../assets/svg/white-minus.svg'
import CButtonInput from '../common/CButtonInput'
import CInputWithLabel from '../common/CInputWithLabel'
import CSearchInput from '../common/CSearchInput'
import CSelectWithLabel from '../common/CSelectWithLabel'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'
import MultipleProjectPickerModal from './MultipleProjectPickerModal'
import SaveFilterListModal from './SaveFilterListModal'
import UserPickerModal from './UserPickerModal'

const MilestoneFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  setSelectedProject,
  selectedProject,
  selectedUsers,
  setSelectedUsers,
  setShowParentFilters,
  selectedStatuses,
  setSelectedStatuses,
  setSelectedPriorities,
  selectedPriorities,
  onApply,
  search,
  setSearch,
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(selectedStatuses)
  const [prioritiesSelected, setPrioritiesSelected] = useState(selectedPriorities)
  const [projects, setProjects] = useState(selectedProject)
  const [allProjects, setAllProjects] = useState([])
  const [users, setUsers] = useState(selectedUsers)
  const [filterScreen, setFilterScreen] = useState('filter')
  // const [search, setSearch] = useState('')
  const [filterData, setFilterData] = useState([])
  const [openEditModal, setOpenEditModal] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [searchData, setSearchData] = useState({})
  const [showSaveFilterListModal, setShowSaveFilterListModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchText, setSearchText] = useState('')
  const [query, setQuery] = useState('')
  const [editData, setEditData] = useState({})
  const [listingSearch, setListingSearch] = useState(search)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    let result = selected.map((s) => s?.label)
    let members = users.map((u) => u.id)
    let priorities = prioritiesSelected.map((p) => p.value)
    let projectsIds = projects.map((p) => p.id)
    // //console.log(members)
    let searchData = {
      moduleName: 'Milestone',
      search: listingSearch,
      stages: result,
      members: members,
      priorities: priorities,
      project_ids: projectsIds,
    }
    setSearchData(searchData)
  }, [listingSearch, selected, users, prioritiesSelected, projects])

  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }
  const closeModal = () => {
    setShowFilterModal(false)
  }
  const openSaveFilterListModal = () => {
    setShowSaveFilterListModal(true)
  }

  useEffect(() => {
    // //console.log(query)
    const body = {
      allData: true,
    }
    api.user
      .getUsers(body)
      .then((res) => {
        //console.log({ res })
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

  useEffect(() => {
    // //console.log(query)
    const body = {
      allData: true,
    }
    api.project
      .getAllProjects(body)
      .then((res) => {
        //console.log({ res })
        setAllProjects(res)
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

  useEffect(() => {
    setProjects(selectedProject)
    setUsers(selectedUsers)
    setSelected(selectedStatuses)
    setPrioritiesSelected(selectedPriorities)
  }, [selectedProject, selectedUsers, selectedStatuses, selectedPriorities])

  useEffect(() => {
    setListingSearch(search)
  }, [search])

  const applyFilters = () => {
    setSelectedProject(projects)
    setSelectedUsers(users)
    setSelectedStatuses(selected)
    setSelectedPriorities(prioritiesSelected)
    setSearch(listingSearch)
    if (
      projects.length > 0 ||
      selected.length > 0 ||
      users.length > 0 ||
      prioritiesSelected.length > 0
    ) {
      setShowParentFilters(true)
    }
    onApply && onApply()
    closeModal()
  }

  const applySavedFilter = (savedData) => {
    const objSavedData = JSON.parse(savedData)
    let savedStages = filters.filter((s) => {
      return objSavedData?.stages?.find((f) => f === s.label)
    })
    let savedMembers = allUsers.filter((user) => {
      return objSavedData?.members?.find((m) => m === user.id)
    })
    let savedProjects = allProjects.filter((project) => {
      return objSavedData?.project_ids?.find((projectId) => projectId === project.id)
    })
    let savedPriorities = Priorities.filter((f) => {
      return objSavedData?.priorities?.find((p) => p === f.value)
    })
    setSearch(objSavedData?.search)
    setListingSearch(objSavedData?.search)
    setProjects(savedProjects)
    setSelected(savedStages)
    setUsers(savedMembers)
    setSelectedPriorities(savedPriorities)
    setPrioritiesSelected(savedPriorities)
    setSelectedStatuses(savedStages)
    setSelectedUsers(savedMembers)
    setSelectedProject(savedProjects)
    setShowParentFilters(true)
    onApply && onApply()
    closeModal()
  }

  const editSavedFilter = (filterData) => {
    setFilterScreen('filter')
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
    let savedProjects = allProjects.filter((project) => {
      return objFitlerData?.project_ids?.find((projectId) => projectId === project.id)
    })
    setSearch(objFitlerData?.search)
    setListingSearch(objFitlerData?.search)
    setSelected(savedStages)
    setUsers(savedMembers)
    setPrioritiesSelected(savedPriorities)
    setProjects(savedProjects)
    setEditData({ id: filterData?.id, name: filterData?.name })
  }

  const deleteFilterHistory = async (filterId) => {
    let res = await api.filterHistory.deleteFilterHistory(filterId)
    if (res.success) {
      setRefresh((prev) => !prev)
      Alert.alert('Delete Successful.')
      resetListingFilter()
    }
  }

  const resetFilters = () => {
    setProjects([])
    setUsers([])
    setSelectedUsers([])
    setSelected([])
    setSelectedPriorities([])
    setListingSearch('')
  }

  const resetListingFilter = () => {
    setSelectedStatuses([])
    setSelectedUsers([])
    setSelectedPriorities([])
    setSearch('')
    setSelectedProject([])
  }

  const checkIfSelectedStatuses = (filter) => {
    const found = selected.find((f) => f.value == filter.value)
    return found
  }

  const toggleSelectedStatuses = (filter) => {
    if (checkIfSelectedStatuses(filter)) {
      setSelected((prev) => {
        const copy = [...prev]
        return copy.filter((selectedFilter) => filter.value != selectedFilter.value)
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(searchText)
      // setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [searchText])

  useEffect(() => {
    setLoading(true)
    const body = {
      moduleName: 'Milestone',
    }

    if (query != '') {
      body['search'] = query
    }
    api.filterHistory
      .getAllFilterHistory(body)
      .then((res) => {
        // //console.log(res.data, 'res..........')
        setFilterData(res.data)
        // toggleRefresh()
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
  }, [filterScreen, query, refresh])

  const Item = ({ item }) => (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
        <TouchableOpacity onPress={() => applySavedFilter(item.json_data)}>
          <Text style={g.normalText}>
            {item.name.length > 25 ? item.name.slice(0, 25) : item.name}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={() => {
            editSavedFilter(item)
            resetFilters()
            }}>
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
  const resetAllProjects = () => {
    setProjects([])
  }
  const resetProjects = (project) => {
    if (projects?.length > 1) {
      setProjects((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => project.id !== filterItem.id)
      })
    } else if (projects?.length == 1) {
      setProjects([])
    }
  }

  return (
    <Modal
      visible={showFilterModal}
      animationType="fade"
      onRequestClose={closeModal}
      transparent={true}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[g.outerContainer]}>
          <SaveFilterListModal
            visibility={showSaveFilterListModal}
            setVisibility={setShowSaveFilterListModal}
            searchData={searchData}
            moduleName={'Milestone'}
            editData={editData}
            resetFilters={resetFilters}
            setEditData={setEditData}
            setListingSearch={setListingSearch}
            setRefresh={setRefresh}
          />
          <MultipleProjectPickerModal
            visibility={showProjectPicker}
            setVisibility={setShowProjectPicker}
            selected={projects}
            setSelected={setProjects}
          />
          <UserPickerModal
            visibility={showUserPickerModal}
            setVisibility={setShowUserPickerModal}
            selected={users}
            setSelected={setUsers}
            label={'Members'}
          />
          <View style={[g.modalOuterContainer, { paddingHorizontal: 0 }]}>
            <View style={[styles.modalContent]}>
              <View style={{ flex: 1 }}>
                <View style={styles.headerContainer}>
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
                  <CText style={[styles.textColor]}>Milestone Filter</CText>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.buttonGroupBtn}
                      onPress={openSaveFilterListModal}
                    >
                      <SaveIcon fill={colors.NORMAL} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[g.containerBetween, styles.dashboardPickerContainer]}>
                  <TouchableOpacity
                    style={[
                      styles.dashboardPickerButton,
                      filterScreen == 'filter' ? styles.dashboardPickerButtonActive : null,
                    ]}
                    onPress={() => {
                      setFilterScreen('filter')
                    }}
                  >
                    <Text
                      style={[
                        g.filterButtonText,
                        filterScreen == 'filter' ? g.filterButtonTextActive : null,
                      ]}
                    >
                      Filter
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.dashboardPickerButton,
                      filterScreen == 'filterList' ? styles.dashboardPickerButtonActive : null,
                    ]}
                    onPress={() => {
                      setFilterScreen('filterList')
                    }}
                  >
                    <Text
                      style={[
                        g.filterButtonText,
                        filterScreen == 'filterList' ? g.filterButtonTextActive : null,
                      ]}
                    >
                      Filter List
                    </Text>
                  </TouchableOpacity>
                </View>

                {filterScreen == 'filter' ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.selects]}>
                      <CInputWithLabel
                        value={listingSearch}
                        setValue={setListingSearch}
                        placeholder=""
                        label="SearchText"
                        style={{ backgroundColor: 'white', paddingVertical: 8 }}
                      />
                      <CSelectWithLabel
                        style={{ backgroundColor: colors.WHITE }}
                        label="Project"
                        onPress={openProjectPickerModal}
                        containerStyle={{ marginBottom: 16 }}
                        // selectText={project.id != -1 ? project.name : 'Select'}
                        // required
                      />
                      <View style={styles.filterContainer}>
                        {projects.map((project, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={styles.userItemTextDark}>
                                {project?.name.length > 30
                                  ? project?.name.slice(0, 30)
                                  : project?.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => resetProjects(project)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.SECONDARY} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                        {projects.length > 0 && (
                          <TouchableOpacity onPress={resetAllProjects} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>

                      <CSelectWithLabel
                        label="Members"
                        style={{ backgroundColor: colors.WHITE }}
                        onPress={openUserPickerModal}
                        containerStyle={{ marginBottom: 16 }}
                      />
                      <View style={styles.filterContainer}>
                        {users.map((user, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={styles.userItemTextDark}>
                                {user?.name || user?.email}
                              </Text>
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
                    </View>
                    <Text style={{ color: '#9CA2AB', marginTop: 8 }}>Status</Text>
                    <View style={[styles.filterContainer, { marginTop: 8 }]}>
                      {filters.map((filter, idx) => {
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.filterItemContainer, { backgroundColor: filter.color }]}
                            onPress={() => toggleSelectedStatuses(filter)}
                          >
                            {checkIfSelectedStatuses(filter) ? <CheckedIcon /> : <PlusIcon />}
                            <Text style={styles.filterItemText}>{filter.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <Text style={{ color: '#9CA2AB', marginTop: 8 }}>Priority</Text>
                    <View style={[styles.filterContainer, { marginTop: 8 }]}>
                      {Priorities.map((priority, idx) => {
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.filterItemContainer,
                              { backgroundColor: priority.color },
                            ]}
                            onPress={() => toggleSelectedPriorities(priority)}
                          >
                            {checkIfSelectedPriorities(priority) ? <CheckedIcon /> : <PlusIcon />}
                            <Text style={styles.filterItemText}>{priority.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </ScrollView>
                ) : (
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
                        keyExtractor={(item, index) => item.id}
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                )}
              </View>
            {filterScreen == 'filter' && <View style={[g.containerBetween, styles.resetContainer]}>
              <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                <IconWrap
                  outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}
                  onPress={resetFilters}
                >
                  <ResetIcon />
                </IconWrap>
                <Text style={styles.resetText}>Reset Filters</Text>
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

const styles = StyleSheet.create({
  dashboardPickerContainer: {
    // marginTop: 16,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
  },
  dashboardPickerButton: {
    width: '50%',
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    paddingVertical: 8,
  },
  dashboardPickerButtonActive: {
    backgroundColor: colors.ICON_BG,
  },
  dashboardPickerButtonText: {
    color: colors.BLACK,
    fontFamily: 'inter-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  dashboardPickerButtonTextActive: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  selects: {
    marginTop: 16,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    marginVertical: 16,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderBottomWidth: 0.7,
    paddingBottom: 5,
    borderBottomColor: colors.WHITE,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroupBtn: {
    marginLeft: 10,
  },
  textColor: {
    color: 'black',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
  },
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    flex: 1,
    // position: 'relative',
    justifyContent: 'space-between',
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
})

export default MilestoneFilterModal
