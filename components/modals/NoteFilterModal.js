import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
// import { ActivityIndicator } from 'react-native/types'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import g from '../../assets/styles/global'
import CrossIcon from '../../assets/svg/cross.svg'
import DeleteIcon from '../../assets/svg/delete-2.svg'
import EditIcon from '../../assets/svg/edit.svg'
import ResetIcon from '../../assets/svg/reset.svg'
import BackArrow from '../../assets/svg/righ-bold-arrow.svg'
import SaveIcon from '../../assets/svg/save-icon.svg'
import SmallCrossIcon from '../../assets/svg/small-cross.svg'
import CButtonInput from '../common/CButtonInput'
import CInputWithLabel from '../common/CInputWithLabel'
import CSearchInput from '../common/CSearchInput'
import CSelectWithLabel from '../common/CSelectWithLabel'
import CText from '../common/CText'
import IconWrap from '../common/IconWrap'
import MultipleProjectPickerModal from './MultipleProjectPickerModal'
import SaveFilterListModal from './SaveFilterListModal'
import UserPickerModal from './UserPickerModal'

const NoteFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  selectedFilters,
  setSelectedFilters,
  selectedUsers,
  setSelectedUsers,
  setShowParentFilters,
  search,
  setSearch,
  onApply,
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showUserPickerModal, setShowUserPickerModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState([])
  // const [selected, setSelected] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState(selectedUsers)
  const [allUsers, setAllUsers] = useState([])
  const [filterScreen, setFilterScreen] = useState('filter')
  const [listingSearch, setListingSearch] = useState(search)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [query, setQuery] = useState('')
  const [filterData, setFilterData] = useState([])
  const [showSaveFilterListModal, setShowSaveFilterListModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [searchData, setSearchData] = useState({})

  useEffect(() => {
    setListingSearch(search)
  }, [search])

  const openProjectPickerModal = () => {
    setShowProjectPicker(true)
  }

  const openMemberPickerModal = () => {
    setShowUserPickerModal(true)
  }

  const openSaveFilterListModal = () => {
    setShowSaveFilterListModal(true)
  }

  const closeModal = () => {
    setShowFilterModal(false)
  }

  const applyFilters = () => {
    setSelectedFilters(projects)
    setSelectedUsers(users)
    setSearch(listingSearch)
    if (projects.length > 0 || users.length > 0) {
      setShowParentFilters(true)
    }
    onApply && onApply()
    closeModal()
  }

  const deleteFilterHistory = async (filterId) => {
    let res = await api.filterHistory.deleteFilterHistory(filterId)
    if (res.success) {
      setRefresh((prev) => !prev)
      Alert.alert('Delete Successful.')
      resetFilters()
    }
  }

  useEffect(() => {
    setProjects(selectedFilters)
    setUsers(selectedUsers)
  }, [selectedFilters, selectedUsers])

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
        return copy.filter((filterItem) => user.email !== filterItem.email)
      })
    } else if (users?.length == 1) {
      setUsers([])
    }
  }

  const resetFilters = () => {
    setProjects([])
    setListingSearch('')
  }

  const resetListingFilter = () => {
    setSelectedFilters([])
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setQuery(searchText)
      //console.log('hit....here....')
      // setPage(1)
    }, 700)

    return () => clearTimeout(delayDebounceFn)
  }, [searchText])

  useEffect(() => {
    let projectsIds = projects.map((p) => p.id)

    let searchData = {
      moduleName: 'List',
      search: listingSearch,
      project_ids: projectsIds,
    }

    setSearchData(searchData)
  }, [listingSearch, projects])

  useEffect(() => {
    // //console.log(query)
    const body = {
      allData: true,
    }
    api.project
      .getAllProjects(body)
      .then((res) => {
        // //console.log({ res })
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

  const applySavedFilter = (savedData) => {
    const objSavedData = JSON.parse(savedData)

    //console.log(objSavedData, 'objsaved Data')

    let savedProjects = allProjects.filter((project) => {
      return objSavedData?.project_ids?.find((projectId) => projectId === project.id)
    })

    let savedMembers = allUsers.filter((user) => {
      return objSavedData?.members?.find((m) => m === user.id)
    })

    setSearch(objSavedData?.search)
    setProjects(savedProjects)
    setSelectedFilters(savedProjects)
    setUsers(savedMembers)
    setSelectedUsers(savedMembers)

    setShowParentFilters(true)
    onApply && onApply()
    closeModal()
  }

  const editSavedFilter = (filterData) => {
    setFilterScreen('filter')
    const objFilterData = JSON.parse(filterData?.json_data)
    //console.log(objFilterData, '=================')
    let savedProjects = allProjects.filter((project) => {
      return objFilterData?.project_ids?.find((projectId) => projectId === project.id)
    })

    let savedMembers = allUsers.filter((user) => {
      return objFilterData?.members?.find((m) => m === user.id)
    })

    setSearch(objFilterData?.search)
    setListingSearch(objFilterData?.search)
    setProjects(savedProjects)
    setUsers(savedMembers)

    setEditData({ id: filterData?.id, name: filterData?.name })
  }

  useEffect(() => {
    const body = {
      moduleName: 'Note',
    }
    if (query != '') {
      // //console.log(query,'querery....')
      body['search'] = query
    }
    setLoading(true)
    api.filterHistory
      .getAllFilterHistory(body)
      .then((res) => {
        // //console.log(res.data,'res..........')
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

  return (
    <Modal
      visible={showFilterModal}
      animationType="fade"
      onRequestClose={closeModal}
      transparent={true}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[g.outerContainer]}>
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
          />

          <SaveFilterListModal
            visibility={showSaveFilterListModal}
            setVisibility={setShowSaveFilterListModal}
            searchData={searchData}
            moduleName={'Note'}
            editData={editData}
            resetFilters={resetFilters}
            setEditData={setEditData}
            setListingSearch={setListingSearch}
            setRefresh={setRefresh}
          />

          <View style={[g.modalOuterContainer, { paddingHorizontal: 0 }]}>
            <View style={[styles.modalContent]}>
              <View style={{ flex: 1 }}>
                <View style={styles.headerContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      resetFilters()
                      resetListingFilter()
                      // setEditData({})
                      closeModal()
                    }}
                  >
                    <BackArrow fill={colors.NORMAL} />
                  </TouchableOpacity>
                  <CText style={[styles.textColor]}>Notes Filter</CText>
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
                        filterScreen == 'filterList'
                          ? styles.dashboardPickerButtonTextActive
                          : null,
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
                        style={{ backgroundColor: 'white', paddingVertical: 12 }}
                      />
                      <CSelectWithLabel
                        style={{ backgroundColor: colors.WHITE }}
                        label="Project"
                        onPress={openProjectPickerModal}
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
                        style={{ backgroundColor: colors.WHITE }}
                        label="Author"
                        onPress={openMemberPickerModal}
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
                                  ? user?.name.slice(0, 30)
                                  : user?.name || user?.email}
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

                      {/* <CSelectWithLabel
                        label="Issue"
                        onPress={() => setShowIssuePicker(true)}
                        style={{ backgroundColor: colors.WHITE }}
                      />
                      <View style={styles.filterContainer}>
                        {issues.map((issue, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={styles.userItemTextDark}>
                                {issue?.name.length > 30 ? issue?.name.slice(0, 30) : issue?.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => resetIssues(issue)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.SECONDARY} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                        {issues.length > 0 && (
                          <TouchableOpacity onPress={resetAllIssues} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View> */}
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
              <View style={[g.containerBetween, styles.resetContainer]}>
                <TouchableOpacity style={[g.containerLeft]} onPress={resetFilters}>
                  <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
                    <ResetIcon />
                  </IconWrap>
                  <Text style={styles.resetText}>Reset Filters</Text>
                </TouchableOpacity>
                <CButtonInput
                  label="Apply Filter"
                  onPress={applyFilters}
                  style={{ paddingHorizontal: 45 }}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  selects: {
    marginTop: 16,
  },
  resetText: {
    marginLeft: 10,
    color: colors.RED_NORMAL,
  },
  resetContainer: {
    marginTop: 90,
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
  modalContent: {
    backgroundColor: '#F2F6FF',
    width: '100%',
    height: '100%',
    flex: 1,
    // position: 'relative',
    justifyContent: 'space-between',
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
    marginLeft: 8,
  },
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
  textColor: {
    color: 'black',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'inter-medium',
    textAlignVertical: 'center',
    color: '#000E29',
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
})

export default NoteFilterModal
