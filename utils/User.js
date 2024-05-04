export const getUserIdsFromSelectedUsers = (selected) => {
  return selected.map((user) => {
    return user.id ? user.id : user.user_id ? user.user_id : null
  })
}

export const getMembersObjFromSelectedUsers = (selected) => {
  let members = {}
  if (!selected) return members
  for (let i = 0; i < selected.length; i++) {
    members[`members[${i}]`] = selected[i]['id'] ? selected[i]['id'] : selected[i]['user_id']
  }
  return members
}

export const getAssignableIdsObjFromSelectedUsers = (selected) => {
  let assignableIds = []
  if (!selected) return assignableIds
  for (let i = 0; i < selected.length; i++) {
    assignableIds[i] = selected[i]['id'] ? selected[i]['id'] : selected[i]['user_id']
  }
  return assignableIds
}

export const getModelIds = (selected) => {
  //console.log
  let modelIds = {}
  if (!selected) return modelIds
  for (let i = 0; i < selected.length; i++) {
    modelIds[`model_ids[${i}]`] = selected[i] ? selected[i] : selected[i]
  }
  return modelIds
}

export const getSupervisorObjFromSelectedUsers = (selected) => {
  let supervisors = {}
  if (!selected) return supervisors
  for (let i = 0; i < selected.length; i++) {
    supervisors[`supervisors[${i}]`] = selected[i]['id'] ? selected[i]['id'] : selected[i]['user_id']
  }
  return supervisors
}

export const getClientObjFromSelectedClients = (selected) => {
  let clients = {}
  if (!selected) return clients
  for (let i = 0; i < selected.length; i++) {
    clients[`clients[${i}]`] = selected[i]['id'] ? selected[i]['id'] : selected[i]['user_id']
  }
  return clients
}
