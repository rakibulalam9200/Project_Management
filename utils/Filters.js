export const getStagesObjectFromSelectedStages = (stages) => {
  let result = {}
  if (!stages) return result
  for (let i = 0; i < stages.length; i++) {
    result[`stages[${i}]`] = stages[i].label
  }
  return result
}

export const getFilterStagesFromSelectedFilters = (filters) => {
  return filters.map((filter) => {
    return filter.label ? filter.label : ''
  })
}

export const getProjectFromSelectedProjects = (projects) => {
  return projects.map((project) => {
    return project.id ? project.id : ''
  })
}

export const getPrioritiesFromSelectedPriorities = (priorities) => {
  return priorities.map((priority) => {
    return priority.value ? priority.value : ''
  })
}

export const getPrioritiesObjectFromSelectedPriorities = (priorities) => {
  let result = {}
  if (!priorities) return result

  for (let i = 0; i < priorities.length; i++) {
    result[`priorities[${i}]`] = String(priorities[i].value).toLowerCase()
  }
  return result
}

export const getIdsfromProjects = (projects) => {
  let result = {}
  if (!projects) return result
  for (let i = 0; i < projects.length; i++) {
    result[`project_ids[${i}]`] = projects[i].id
  }
  //console.log(result,'result....')
  return result
}
