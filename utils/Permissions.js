export const formatPermissions = (str) => {
  if (!str) return ''
  return str.replace('management', '') + ' Management'
}

export const extractPermissionsIdsFromRef = (ref) => {
  //console.log(ref,'ref..........')
  const arr = []
  if (!ref.current) return arr
  for (let key in ref.current) {
    if (ref.current[key]) {
      arr.push(Number(key))
    }
  }
  return arr
}
export const extractPermissionsIdsFromRefForSubscriptionModules = (ref, modules) => {
  console.log('modules', modules)
  const arr = []
  if (!ref.current) return arr
  for (let key in ref.current) {
    if (ref.current[key]) {
      arr.push({ 'module_id': Number(key), 'plan_setting_module_id': findPlanSettingModuleId(Number(key), modules) })
    }
  }
  return arr
}

const findPlanSettingModuleId = (id, modules) => {
  console.log("modules finding............",modules)
  //console.log('id', id)
  // const planSettingModuleId = modules.find(module => module.id == id).plan_setting_module_id
  const planSettingModuleId = modules.find(module => module.module_management_id == id).plan_setting_module_id
  console.log('planSettingModuleId', planSettingModuleId)
  return planSettingModuleId
}
