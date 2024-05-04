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
// import { ActivityIndicator } from 'react-native/types'
import api from '../../api/api'
import colors from '../../assets/constants/colors'
import { listFilters } from '../../assets/constants/filters'
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
import MultipleIssuePickerModal from './MultipleIssuePickerModal'
import MultipleMilestonePickerModal from './MultipleMilestonePickerModal'
import MultipleProjectPickerModal from './MultipleProjectPickerModal'
import MultipleTaskPickerModal from './MultipleTaskPickerModal'
import SaveFilterListModal from './SaveFilterListModal'

const CheeklistFilterModal = ({
  showFilterModal,
  setShowFilterModal,
  selectedFilters,
  setSelectedFilters,
  setShowParentFilters,
  milestoneFilters,
  setMilestoneFilters,
  setTaskFilters,
  taskFilters,
  issueFilters,
  setIssueFilters,
  selectedStatuses,
  setSelectedStatuses,
  search,
  setSearch,
  onApply,
}) => {
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showMilestonePicker, setShowMilestonePicker] = useState(false)
  const [showTaskPicker, setShowTaskPicker] = useState(false)
  const [showIssuePicker, setShowIssuePicker] = useState(false)
  const [filterStatus, setFilterStatus] = useState([])
  const [selected, setSelected] = useState({ id: -1, name: '' })
  const [milestoneSelected, setMilestoneSelected] = useState({ id: -1, name: '' })
  const [taskSelected, setTaskSelected] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [allMilestones, setAllMilestones] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [allIssues, setAllIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [milestones, setMilestones] = useState([])
  const [tasks, setTasks] = useState([])
  const [issues, setIssues] = useState([])
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
  const openMilestonePickerModal = () => {
    setShowMilestonePicker(true)
  }
  const openTaskPickerModal = () => {
    setShowTaskPicker(true)
  }
  const openIssuePickerModal = () => {
    setShowIssuePicker(true)
  }

  const openSaveFilterListModal = () => {
    setShowSaveFilterListModal(true)
  }

  const closeModal = () => {
    setShowFilterModal(false)
  }

  const applyFilters = () => {
    setSelectedStatuses(filterStatus)
    setSelectedFilters(projects)
    setTaskFilters(tasks)
    setMilestoneFilters(milestones)
    setIssueFilters(issues)
    setSearch(listingSearch)
    if (
      projects.length > 0 ||
      tasks.length > 0 ||
      issues.length > 0 ||
      milestones.length > 0 ||
      filterStatus.length > 0
    ) {
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
    setMilestones(milestoneFilters)
    setTasks(taskFilters)
    setIssues(issueFilters)
    setFilterStatus(selectedStatuses)
  }, [selectedFilters, milestoneFilters, taskFilters, issueFilters, selectedStatuses])

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

  const resetAllMilestones = () => {
    setMilestones([])
  }
  const resetMilestones = (milestone) => {
    if (milestones?.length > 1) {
      setMilestones((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => milestone.id !== filterItem.id)
      })
    } else if (milestones?.length == 1) {
      setMilestones([])
    }
  }

  const resetAllTasks = () => {
    setTasks([])
  }
  const resetTasks = (task) => {
    if (tasks?.length > 1) {
      setTasks((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => task.id !== filterItem.id)
      })
    } else if (tasks?.length == 1) {
      setTasks([])
    }
  }

  const resetAllIssues = () => {
    setIssues([])
  }
  const resetIssues = (issue) => {
    if (issues?.length > 1) {
      setIssues((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => issue.id !== filterItem.id)
      })
    } else if (issues?.length == 1) {
      setIssues([])
    }
  }

  const checkIfSelectedStatuses = (filter) => {
    // //console.log('filter status....', filterStatus)
    const found = filterStatus?.find((f) => f.value == filter.value)
    return found
  }

  const toggleSelectedStatuses = (filter) => {
    if (checkIfSelectedStatuses(filter)) {
      setFilterStatus((prev) => {
        const copy = [...prev]
        return copy.filter((selectedFilter) => filter.value != selectedFilter.value)
      })
    } else {
      setFilterStatus((prev) => [...prev, filter])
    }
  }

  const resetFilters = () => {
    setProjects([])
    setMilestones([])
    setTasks([])
    setIssues([])
    setFilterStatus([])
    setListingSearch('')
  }

  const resetListingFilter = () => {
    setSelectedFilters([])
    setMilestoneFilters([])
    setTaskFilters([])
    setIssueFilters([])
    setSelectedStatuses([])
    setSearch('')
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
    let milestoneIds = milestones.map((m) => m.id)
    let taskIds = tasks.map((t) => t.id)
    let issueIds = issues.map((s) => s.id)
    let result = filterStatus.map((f) => f.label)

    let searchData = {
      moduleName: 'List',
      search: listingSearch,
      project_ids: projectsIds,
      milestone_ids: milestoneIds,
      task_ids: taskIds,
      issue_ids: issueIds,
      stages: result,
    }

    setSearchData(searchData)
  }, [listingSearch, projects, milestones, tasks, issues, filterStatus])

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
  useEffect(() => {
    const body = {
      allData: true,
    }
    api.milestone
      .getAllMilestones(body)
      .then((res) => {
        setAllMilestones(res)
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
    api.task
      .getAllTasks(body)
      .then((res) => {
        setAllTasks(res)
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
    api.issue
      .getAllIssues(body)
      .then((res) => {
        setAllIssues(res)
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
    let savedMilestones = allMilestones.filter((milestone) => {
      return objSavedData?.milestone_ids?.find((milestoneId) => milestoneId === milestone.id)
    })
    let savedTasks = allTasks.filter((task) => {
      return objSavedData?.task_ids?.find((taskId) => taskId === task.id)
    })
    let savedIssues = allIssues.filter((issue) => {
      return objSavedData?.issue_ids?.find((issueId) => issueId === issue.id)
    })

    let savedStages = listFilters.filter((s) => {
      return objSavedData?.stages?.find((f) => f == s.label)
    })

    setMilestones(savedMilestones)
    setMilestoneFilters(savedMilestones)
    setSearch(objSavedData?.search)
    setProjects(savedProjects)
    setSelectedFilters(savedProjects)
    setTasks(savedTasks)
    setTaskFilters(savedTasks)
    setIssues(savedIssues)
    setIssueFilters(savedIssues)
    setFilterStatus(savedStages)
    setSelectedStatuses(savedStages)
    setShowParentFilters(true)
    onApply && onApply()
    closeModal()
  }

  const editSavedFilter = (filterData) => {
    setFilterScreen('filter')
    const objFilterData = JSON.parse(filterData?.json_data)
    // //console.log(objFilterData, '=================')
    let savedProjects = allProjects.filter((project) => {
      return objFilterData?.project_ids?.find((projectId) => projectId === project.id)
    })
    let savedMilestones = allMilestones.filter((milestone) => {
      return objFilterData?.milestone_ids?.find((milestoneId) => milestoneId === milestone.id)
    })
    let savedTasks = allTasks.filter((task) => {
      return objFilterData?.task_ids?.find((taskId) => taskId === task.id)
    })
    let savedIssues = allIssues.filter((issue) => {
      return objFilterData?.issue_ids?.find((issueId) => issueId === issue.id)
    })

    let savedStages = listFilters.filter((s) => {
      return objFilterData?.stages?.find((f) => f === s.label)
    })

    // console. log( typeof (objFilterData.date),'date type.........')
    setSearch(objFilterData?.search)
    setListingSearch(objFilterData?.search)
    setProjects(savedProjects)
    setMilestones(savedMilestones)
    setTasks(savedTasks)
    setIssues(savedIssues)
    setFilterStatus(savedStages)
    setEditData({ id: filterData?.id, name: filterData?.name })
  }

  useEffect(() => {
    const body = {
      moduleName: 'List',
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
          <MultipleMilestonePickerModal
            projects={projects}
            visibility={showMilestonePicker}
            setVisibility={setShowMilestonePicker}
            selected={milestones}
            setSelected={setMilestones}
          />
          <MultipleTaskPickerModal
            projects={projects}
            milestones={milestones}
            visibility={showTaskPicker}
            setVisibility={setShowTaskPicker}
            selected={tasks}
            setSelected={setTasks}
          />
          <MultipleIssuePickerModal
            projects={projects}
            milestones={milestones}
            tasks={tasks}
            visibility={showIssuePicker}
            setVisibility={setShowIssuePicker}
            selected={issues}
            setSelected={setIssues}
          />
          <SaveFilterListModal
            visibility={showSaveFilterListModal}
            setVisibility={setShowSaveFilterListModal}
            searchData={searchData}
            moduleName={'List'}
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
                  <CText style={[styles.textColor]}>List Filter</CText>
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
                        label="Milestone"
                        onPress={() => setShowMilestonePicker(true)}
                        style={{ backgroundColor: colors.WHITE }}
                      />
                      <View style={styles.filterContainer}>
                        {milestones.map((milestone, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={styles.userItemTextDark}>
                                {milestone?.name.length > 30
                                  ? milestone?.name.slice(0, 30)
                                  : milestone?.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => resetMilestones(milestone)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.SECONDARY} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                        {milestones.length > 0 && (
                          <TouchableOpacity onPress={resetAllMilestones} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>

                      <CSelectWithLabel
                        label="Task"
                        onPress={() => setShowTaskPicker(true)}
                        style={{ backgroundColor: colors.WHITE }}
                      />
                      <View style={styles.filterContainer}>
                        {tasks.map((task, idx) => {
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.userItemContainer,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <Text style={styles.userItemTextDark}>
                                {task?.name.length > 30 ? task?.name.slice(0, 30) : task?.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => resetTasks(task)}
                                style={{ marginLeft: 4 }}
                              >
                                <SmallCrossIcon fill={colors.SECONDARY} />
                              </TouchableOpacity>
                            </View>
                          )
                        })}
                        {tasks.length > 0 && (
                          <TouchableOpacity onPress={resetAllTasks} style={{ marginLeft: 8 }}>
                            <CrossIcon />
                          </TouchableOpacity>
                        )}
                      </View>
                      <CSelectWithLabel
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
                      </View>
                      <Text style={{ color: '#9CA2AB', marginTop: 8 }}>Status</Text>
                      <View style={[styles.filterContainer, { marginTop: 8 }]}>
                        {listFilters.map((filter, idx) => {
                          return (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.filterItemContainer,
                                { backgroundColor: filter.color },
                              ]}
                              onPress={() => toggleSelectedStatuses(filter)}
                            >
                              {/* <PlusIcon /> */}
                              {checkIfSelectedStatuses(filter) ? <CheckedIcon /> : <PlusIcon />}
                              <Text style={styles.filterItemText}>{filter.label}</Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
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
                <IconWrap outputRange={[colors.WHITE, colors.MID_BG, colors.END_BG]}>
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

export default CheeklistFilterModal
