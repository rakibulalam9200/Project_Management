export const convertArrayToObjectForPost = (array, key = '') => {
  if (!array) return {}
  let obj = {}
  for (let i = 0; i < array.length; i++) {
    let id = array[i]
    obj[`${key}[${i}]`] = array[i]
  }
  return obj
}

export const getDaysObjFromSelectedDaysForWeekView = (selected) => {
  // console.log(selected,'--------selected----------')
  let repeat_on = {}
  if (!selected) return repeat_on
  for (let i = 0; i < selected.length; i++) {
    console.log(selected[i])
    repeat_on[`event_repeat[repeat_on][${i}]`] = selected[i]? selected[i] : null
  }
  return repeat_on
}


// For calendar show types
export const getShowTypesArray = (types) => {
  let showTypes = {}
  for (let i = 0; i < types.length; i++) {
    showTypes[`show[${i}]`] = types[i]
  }
  return showTypes
}

export const getAllShoowTypesArray = () => {
  let showTypes = {}
  const arr = ['Project', 'Milestone', 'Task', 'Issue', 'Event']
  for (let i = 0; i < arr.length; i++) {
    showTypes[`show[${i}]`] = arr[i]
  }
  return showTypes
}