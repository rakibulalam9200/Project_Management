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
import { priorities } from '../../assets/constants/calendar-priority'
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
import CSearchInput from '../common/CSearchInput'
import CSelectWithLabel from '../common/CSelectWithLabel'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'
import MultipleProjectPickerModal from './MultipleProjectPickerModal'
import SaveFilterListModal from './SaveFilterListModal'
import UserPickerModal from './UserPickerModal'

const CalendarFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  setSelectedProject,
  selectedProject,
  selectedUsers,
  setSelectedUsers,
  selectedDate,
  setSelectedDate,
  setShowParentFilters,
  selectedStatuses,
  setSelectedStatuses,
  selectedPriorities,
  setSelectedPriorities,
  setSearch=null,
  search="",
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [showMilestonePickerModal, setShowMilestonePickerModal] = useState(false)
  const [showTaskPickerModal, setShowTaskPickerModal] = useState(false)
  const [selected, setSelected] = useState([])
  const [prioritiesSelected, setPrioritiesSelected] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [date, setDate] = useState(null)
  const [filterScreen, setFilterScreen] = useState('filter')
  // const [search, setSearch] = useState('')
  const [filterList, setFilterList] = useState([])
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
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterData, setFilterData] = useState([])

  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }
  const openUserPickerModal = () => {
    setShowUserPickerModal(true)
  }
  const openSaveFilterListModal = () => {
    setShowSaveFilterListModal(true)
  }
  const closeModal = () => {
    setShowFilterModal(false)
  }

  const deleteFilterHistory = async (filterId) => {
    let res = await api.filterHistory.deleteFilterHistory(filterId)
    if (res.success) {
      setRefresh((prev) => !prev)
      Alert.alert('Delete Successful.')
      resetListingFilter()
    }
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
    let result = selected.map((s) => s?.label)
    let members = users.map((u) => u.id)
    let priorities = prioritiesSelected.map((p) => p.value)
    let projectsIds = projects.map((p) => p.id)
    // //console.log(members)
    let searchData = {
      moduleName: 'Milestone',
      // search: listingSearch,
      stages: result,
      members: members,
      priorities: priorities,
      project_ids: projectsIds,
    }
    if(search){
      searchData['search']=listingSearch
    }
    setSearchData(searchData)
  }, [ listingSearch,selected, users, prioritiesSelected, projects])
  
  useEffect(() => {
    setProjects(selectedProject)
    setSelected(selectedStatuses)
    setUsers(selectedUsers)
    setPrioritiesSelected(selectedPriorities)
  }, [selectedProject, selectedStatuses, selectedUsers, selectedPriorities])

  const applyFilters = () => {
    setSelectedProject(projects)
    setSelectedUsers(users)
    // setSelectedDate(date)
    setSelectedStatuses(selected)
    setSelectedPriorities(prioritiesSelected)
    setShowParentFilters(true)
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
    if(objSavedData?.search){
      setSearch(objSavedData?.search)
      setListingSearch(objSavedData?.search)
    }
    setProjects(savedProjects)
    setSelected(savedStages)
    setUsers(savedMembers)
    setSelectedPriorities(savedPriorities)
    setPrioritiesSelected(savedPriorities)
    setSelectedStatuses(savedStages)
    setSelectedUsers(savedMembers)
    setSelectedProject(savedProjects)
    setShowParentFilters(true)
    closeModal()
  }


  const resetFilters = () => {
    setProjects([])
    setUsers([])
    setSelected([])
    setPrioritiesSelected([])
    setListingSearch('')
  }

  const resetListingFilter = () => {
    setSelectedStatuses([])
    setSelectedUsers([])
    setSelectedPriorities([])
    if(setSearch){
      setSearch('')
    }
    
    setSelectedProject([])
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

  const resetAllUsers = () => {
    setUsers([])
  }
  const resetUsers = (user) => {
    if (users?.length > 1) {
      setUsers((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => user.id !== filterItem.id)
      })
    } else if (users?.length == 1) {
      setUsers([])
    }
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

  const checkIfSelectedPriorities = (filter) => {
    const found = prioritiesSelected.find((f) => f.value == filter.value)
    return found
  }

  const toggleSelectedPriorities = (filter) => {
    if (checkIfSelectedPriorities(filter)) {
      setPrioritiesSelected((prev) => {
        const copy = [...prev]
        return copy.filter((selectedFilter) => filter.value != selectedFilter.value)
      })
    } else {
      setPrioritiesSelected((prev) => [...prev, filter])
    }
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
    if(objFitlerData?.search){
      setSearch(objFitlerData?.search)
      setListingSearch(objFitlerData?.search)
    }
    setSelected(savedStages)
    setUsers(savedMembers)
    setPrioritiesSelected(savedPriorities)
    setProjects(savedProjects)
    setEditData({ id: filterData?.id, name: filterData?.name })
  }

  useEffect(() => {
    setLoading(true)
    const body = {
      moduleName: 'Calendar',
    }

    if (query != '') {
      body['search'] = query
    }
    api.filterHistory
      .getAllFilterHistory(body)
      .then((res) => {
        // //console.log(res,'res..........')
        setFilterData(res.data)
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
            // resetFilters(item)
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

  return (
    <Modal visible={showFilterModal} animationType="fade" onRequestClose={closeModal}>
      <SafeAreaView
        style={[g.safeAreaStyleWithPrimBG, { marginTop: 0, paddingTop: 0, paddingBottom: 16 }]}
      >
        {/* <FilterNameEditModal
          visibility={openEditModal}
          setVisibility={setOpenEditModal}
          filterName={filterName}
          setFilterName={setFilterName}
        /> */}
        <SaveFilterListModal
          visibility={showSaveFilterListModal}
          setVisibility={setShowSaveFilterListModal}
          searchData={searchData}
          moduleName={'Calendar'}
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
        {/* <MilestonePickerModal
          projectId={project.id}
          visibility={showMilestonePickerModal}
          setVisibility={setShowMilestonePickerModal}
          selected={milestone}
          setSelected={setMilestone}
        /> */}
        {/* <TaskPickerModal
          projectId={project.id}
          milestoneId={milestone.id}
          visibility={showTaskPickerModal}
          setVisibility={setShowTaskPickerModal}
          selected={task}
          setSelected={setTask}
        /> */}
        <UserPickerModal
          visibility={showUserPickerModal}
          setVisibility={setShowUserPickerModal}
          selected={users}
          setSelected={setUsers}
        />

        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                closeModal()
              }}
            >
              <BackArrow fill={colors.NORMAL} />
            </TouchableOpacity>
            <CText style={[styles.textColor]}>Calendar Filter</CText>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity onPress={openSaveFilterListModal} style={styles.buttonGroupBtn}>
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
                styles.dashboardPickerButtonText,
                filterScreen == 'filter' ? styles.dashboardPickerButtonTextActive : null,
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
                styles.dashboardPickerButtonText,
                filterScreen == 'filterList' ? styles.dashboardPickerButtonTextActive : null,
              ]}
            >
              Filter List
            </Text>
          </TouchableOpacity>
        </View>

        {filterScreen == 'filter' ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}
            >
              <View style={{ paddingHorizontal: 16 }}>
                <View style={[styles.selects]}>
                  <CSelectWithLabel
                    style={{ backgroundColor: colors.WHITE }}
                    label="Project element"
                    onPress={openProjectPickerModal}
                    // selectText={project.length != -1 ? project.name : 'Select'}
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
                            {project?.name.length > 30 ? project?.name.slice(0, 30) : project?.name}
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
                  {/* <CSelectWithLabel
                    label="Milestone"
                    onPress={() => setShowMilestonePickerModal(true)}
                    selectText={milestone.id != -1 ? milestone.name : 'Select'}
                    style={{ backgroundColor: colors.WHITE }}
                    required
                  /> */}

                  <CSelectWithLabel
                    label="Members"
                    style={{ backgroundColor: colors.WHITE }}
                    onPress={openUserPickerModal}
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
                            {user?.name.length > 30
                              ? resetAllProjectsuser?.name.slice(0, 30)
                              : user?.name}
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
                  {/* <CDateTime
                    pickedDate={date}
                    setPickedDate={setDate}
                    style={{ width: '100%', backgroundColor: colors.WHITE }}
                    label="Date"
                    showLabel
                    dateFormate
                  /> */}
                  {/* <CDateTime
                    pickedDate={date}
                    setPickedDate={setDate}
                    style={{ width: '100%', backgroundColor: colors.WHITE }}
                    label="Date"
                    showLabel
                    dateFormate
                    // containerStyle={s.dateInput}
                    flex={{}}
                  /> */}
                </View>
                <Text
                  style={{
                    color: '#9CA2AB',
                    marginTop: 16,
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.WHITE,
                  }}
                >
                  Status
                </Text>
                <View style={styles.filterContainer}>
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
                <Text style={{ color: '#9CA2AB', paddingVertical: 8 }}>Priority</Text>
                <View style={styles.filterContainer}>
                  {priorities.map((filter, idx) => {
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.filterItemContainer, { backgroundColor: filter.color }]}
                        onPress={() => toggleSelectedPriorities(filter)}
                      >
                        {checkIfSelectedPriorities(filter) ? <CheckedIcon /> : <PlusIcon />}
                        <Text style={styles.filterItemText}>{filter.value}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
              {/* <View style={[g.containerBetween, styles.resetContainer]}>
                <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                  <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                    <ResetIcon />
                  </IconWrap>
                  <Text style={styles.resetText}>Reset Filters</Text>
                </TouchableOpacity>
                <CButtonInput label="Apply Filter" onPress={applyFilters} />
              </View> */}
            </ScrollView>
          </>
        ) : (
          <>
            <CSearchInput
              placeholder="Search"
              value={search}
              setValue={setSearch}
              filterIcon={true}
              style={{ marginBottom: 0, marginHorizontal: 16 }}
              onPress={() => {}}
            />
            <View style={{ marginTop: 20, flex: 1, paddingHorizontal: 16 }}>
            {loading && <ActivityIndicator size="small" color={colors.HOVER} />}
             { !loading && <FlatList
                data={filterData}
                renderItem={({ item }) => <Item item={item} />}
                keyExtractor={(item, index) => item.id}
                style={{ flex: 1 }}
              />}
            </View>
          </>
        )}
        {filterScreen == 'filter' && (
          <View style={[g.containerBetween, styles.resetContainer]}>
            <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
              <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                <ResetIcon />
              </IconWrap>
              <Text style={styles.resetText}>Reset Filters</Text>
            </TouchableOpacity>
            <CButtonInput label="Apply Filter" onPress={applyFilters} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  dashboardPickerContainer: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
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
    marginTop: 20,
  },
  resetText: {
    marginLeft: 10,
    color: colors.PRIM_CAPTION,
  },
  resetContainer: {
    marginTop: 15,
    paddingHorizontal: 16,
    gap: 5,
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
    paddingHorizontal: 16,
    // marginBottom: 24,
    // marginTop: 24,
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
})

export default CalendarFilterModal
