import { useEffect, useState } from 'react'
import {
  getIdsfromProjects,
  getPrioritiesObjectFromSelectedPriorities, getStagesObjectFromSelectedStages
} from '../utils/Filters'
import { getMembersObjFromSelectedUsers } from '../utils/User'

export default function useFilters() {
  const [showFilters, setShowFilters] = useState(false)
  const [expandFilters, setExpandFilters] = useState(true)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [selectedProject, setSelectedProject] = useState([])
  // const [selectedMilestone, setSelectedMilestone] = useState({ id: -1, name: '' })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedPriorities, setSelectedPriorities] = useState([])
  const [body, setBody] = useState({})
  const [filterCount, setFilterCount] = useState(0)

  // const resetUsers = () => {
  //   setSelectedMembers([])
  // }

  // const resetProject = () => {
  //   setSelectedProject([])
  // }

  const resetProjects = (project) => {
    if (selectedProject?.length > 1) {
      setSelectedProject((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => project.id !== filterItem.id)
      })
    } else if (selectedProject?.length == 1) {
      setSelectedProject([])
    }
  }
  const resetAllProjects = () => {
    setSelectedProject([])
  }

  const resetUsers = (user) => {
    if (selectedMembers?.length > 1) {
      setSelectedMembers((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => user.id !== filterItem.id)
      })
    } else if (selectedMembers?.length == 1) {
      setSelectedMembers([])
    }
  }

  const resetAllUsers = () => {
    setSelectedMembers([])
  }

  const resetStatuses = (status) => {
    if (selectedStatuses?.length > 1) {
      setSelectedStatuses((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => status.value !== filterItem.value)
      })
    } else if (selectedStatuses?.length == 1) {
      setSelectedStatuses([])
    }
   
  }

  const resetAllStatuses = () => {
    setSelectedStatuses([])
  }

  const resetPriorities = (priority) => {
    if (selectedPriorities?.length > 1) {
      setSelectedPriorities((prev) => {
        const copy = [...prev]
        return copy.filter((filterItem) => priority.value !== filterItem.value)
      })
    } else if (selectedPriorities?.length == 1) {
      setSelectedPriorities([])
    }
  }

  const resetAllPriorities = () => {
    setSelectedPriorities([])
  }

  // const resetMilestone = () => {
  //   setSelectedMilestone([])
  // }

  const resetDate = () => {
    setSelectedDate(null)
  }

  // const resetStatuses = () => {
  //   setSelectedStatuses([])
  // }

  // const resetPriorities = () => {
  //   setSelectedPriorities([])
  // }

  useEffect(() => {
    if (
      selectedMembers.length === 0 &&
      selectedProject.length === 0 &&
      // selectedMilestone.id == -1 &&
      selectedDate == null &&
      selectedStatuses.length == 0 &&
      selectedPriorities.length == 0
    ) {
      setShowFilters(false)
      setBody({})
    } else {
      let count = 0
      setShowFilters(true)
      let newBody = {}
      if (selectedProject.length> 0) {
       let projects = getIdsfromProjects(selectedProject)
       newBody = { ...newBody, ...projects }
       count++
      }
      if (selectedMembers.length > 0) {
        let members = getMembersObjFromSelectedUsers(selectedMembers)
        newBody = { ...newBody, ...members }
        count++
      }
      if (selectedStatuses.length > 0) {
        let stages = getStagesObjectFromSelectedStages(selectedStatuses)
        newBody = { ...newBody, ...stages }
        count++
      }
      if (selectedPriorities.length > 0) {
        let priorities = getPrioritiesObjectFromSelectedPriorities(selectedPriorities)
        newBody = { ...newBody, ...priorities }
        count++
      }
      setBody(newBody)
      setFilterCount(count)
    }
  }, [
    selectedMembers,
    selectedProject,
    // selectedMilestone,
    selectedDate,
    selectedStatuses,
    selectedPriorities,
  ])

  return {
    showFilters,
    setShowFilters,
    expandFilters,
    setExpandFilters,
    selectedProject,
    setSelectedProject,
    // selectedMilestone,
    // setSelectedMilestone,
    selectedDate,
    setSelectedDate,
    selectedMembers,
    setSelectedMembers,
    selectedStatuses,
    setSelectedStatuses,
    selectedPriorities,
    setSelectedPriorities,
    resetUsers,
    resetAllUsers,
    resetPriorities,
    resetProjects,
    resetAllProjects,
    resetAllStatuses,
    resetStatuses,
    resetAllPriorities,
    resetPriorities,
    resetDate,
    resetStatuses,
    filteredBody: body,
    filterCount,
  }
}
