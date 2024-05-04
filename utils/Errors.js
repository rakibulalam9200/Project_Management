import {
  isEmpty,
  isValidCode,
  isValidDomain,
  isValidEmail,
  isValidRate,
  isValidUserName,
} from './Validations'

export const errorTypes = [
  'domain',
  'email',
  'name',
  'first_name',
  'last_name',
  'password',
  'message',
  'time_zone',
  'phone',
  'website',
  'zip_code',
  'logo_image',
  'website',
  'address_line_1',
  'start_date',
  'end_date',
  'acceptance_needed',
  'project_id',
  'group_id',
  'role_id',
  'type',
  'token',
  'old_password',
  'description',
  'task_id',
  'lead',
  'supervisor',
  'image_file',
  'id',
  'file,',
  'event_repeat.end_type',
  'event_repeat.every',
  'event_repeat.type',
  'repeat',
  'storage',
  'company',
  'companyAddressLine1'

]

export const getErrorMessage = (err) => {
  let errorMsg = ''
  const data = err.response.data
  //console.log(data)
  errorTypes.forEach((type) => {
    if (data['errors'][type]) {
      try {
        errorMsg += data['errors'][type][0] + '\n'
      } catch (e) { }
    }
  })

  return errorMsg
}

export const getOnlyErrorMessage = (err) => {
  let errorMsg = ''
  const data = err.response.data
  //console.log(data)
  if (data.message) {
    errorMsg += data.message
  }

  return errorMsg
}

const setSingleError = (key, val, setErrors) => {
  setErrors((prev) => {
    return {
      ...prev,
      [key]: val,
    }
  })
}

export const hasEmailErrors = (email, setErrors) => {
  if (isEmpty(email)) {
    setSingleError('email', 'Email can not be empty', setErrors)
    return true
  }

  if (!isValidEmail(email)) {
    setSingleError('email', 'Please Enter a valid email address.', setErrors)
    return true
  }
  setSingleError('email', '', setErrors)
  return false
}

export const hasUserNameErrors = (userName, setErrors) => {
  if (isEmpty(userName)) {
    setSingleError('userName', 'User Name can not be empty.', setErrors)
    return true
  }

  if (!isValidUserName(userName)) {
    setSingleError('userName', 'Please Enter a valid user name.', setErrors)
    return true
  }
  setSingleError('userName', '', setErrors)
  return false
}

export const hasPasswordErrors = (password, rPassword, setErrors) => {
  if (isEmpty(password) || isEmpty(rPassword)) {
    setSingleError('password', 'Password can not be empty', setErrors)
    return true
  }

  if (password !== rPassword) {
    setSingleError('password', 'Password did not match.', setErrors)
    return true
  }

  // if (!isValidPassword(password)) {
  //   setSingleError(
  //     'password',
  //     'Password should contain minimum six characters maximum twenty characters, at least one letter, one number and one special character.',
  //     setErrors
  //   )
  //   return true
  // }
  setSingleError('password', '', setErrors)
  return false
}

export const hasCodeErrors = (code, setErrors) => {
  if (isEmpty(code)) {
    setSingleError('code', 'Code can not be empty.', setErrors)
    return true
  }

  if (!isValidCode(code)) {
    setSingleError('code', 'Please Enter a valid code.', setErrors)
    return true
  }
  setSingleError('code', '', setErrors)
  return false
}

export const hasDomainErrors = (domain, setErrors) => {
  if (isEmpty(domain)) {
    setSingleError('domain', 'Company name can not be empty.', setErrors)
    return true
  }

  if (!isValidDomain(domain)) {
    setSingleError('domain', 'Please Enter a valid Company Name.', setErrors)
    return true
  }
  setSingleError('domain', '', setErrors)
  return false
}

export const hasCompanyDomainErrors = (domain, setErrors) => {
  if (isEmpty(domain)) {
    setSingleError('domain', 'Please select a domain.', setErrors)
    return true
  }
  setSingleError('domain', '', setErrors)
  return false
}

export const hasCompanyNameErrors = (domain, setErrors) => {
  if (isEmpty(domain)) {
    setSingleError('name', 'Please Enter company name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasCompanyAddressErrors = (companyAddressLine1, setErrors) => {
  console.log(companyAddressLine1,'address.....')
  if (isEmpty(companyAddressLine1)) {
    console.log("hit here.........")
    setSingleError('companyAddressLine1', 'Please enter company address.', setErrors)
    return true
  }
  setSingleError('companyAddressLine1', '', setErrors)
  return false
}

export const hasTimeZoneErrors = (timezoneIndex, timezone, setErrors) => {
  //console.log(timezone, timezoneIndex)
  if (!timezone && timezoneIndex == -1) {
    setSingleError('timezone', 'Please select your Timezone.', setErrors)
    return true
  }
  setSingleError('timezone', '', setErrors)
  return false
}

export const hasProjectNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter project name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasTeamNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter team name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasTaskNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter Task name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasCompanyPickerErrors = (company, setErrors) => {
  if (isEmpty(company)) {
    setSingleError('company', 'Please select company name.', setErrors)
    return true
  }
  setSingleError('company', '', setErrors)
  return false
}

export const hasProjectPickerErrors = (project, setErrors) => {
  if (isEmpty(project)) {
    setSingleError('project', 'Please select project name.', setErrors)
    return true
  }
  setSingleError('project', '', setErrors)
  return false
}

export const hasMilestonePickerErrors = (milestone, setErrors) => {
  if (isEmpty(milestone)) {
    setSingleError('milestone', 'Please select Milestone name.', setErrors)
    return true
  }
  setSingleError('milestone', '', setErrors)
  return false
}

export const hasPriorityPickerErrors = (priority, setErrors) => {
  if (isEmpty(priority)) {
    setSingleError('priority', 'Please select priority name.', setErrors)
    return true
  }
  setSingleError('priority', '', setErrors)
  return false
}

export const hasSupervisorPickerErrors = (supervisors, acceptance, setErrors) => {
  if (acceptance && supervisors?.length === 0) {
    setSingleError('supervisor', 'Please select supervisor.', setErrors)
    return true
  }
  setSingleError('supervisor', '', setErrors)
  return false
}

export const hasInvalidDateErrors = (startDate, endDate, setErrors) => {
  if (endDate < startDate) {
    setSingleError('date', 'End date must be after than start date.', setErrors)
    return true
  }
  setSingleError('date', '', setErrors)
  return false
}

export const hasRoleErrors = (role, setErrors) => {
  if (isEmpty(role)) {
    setSingleError('role', 'Please select role name.', setErrors)
    return true
  }
  setSingleError('role', '', setErrors)
  return false
}

export const hasCompletionPickerErrors = (completion, setErrors) => {
  if (isEmpty(completion)) {
    setSingleError('completion', 'Please select completion method.', setErrors)
    return true
  }
  setSingleError('completion', '', setErrors)
  return false
}

export const hasMilestoneNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter milestone name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasTaskPikerErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter task name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasLeadPickerError = (lead, setErrors) => {
  if (!lead) {
    setSingleError('lead', 'Please Select a Lead.', setErrors)
    return true
  }
  setSingleError('lead', '', setErrors)
  return false
}

export const hasIssueNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please enter Issue name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasNoteDescriptionErros = (des, setErrors) => {
  const regex = /(<([^>]+)>)/ig;
  let newDes = des.replace(regex,'').trim().replace('&nbsp;','')
  console.log(newDes,'new des........')
  if (isEmpty(newDes)) {
    setSingleError('des', 'Please enter Note description.', setErrors)
    return true
  }
  setSingleError('des', '', setErrors)
  return false
}

export const hasListItemDescriptionErros = (des, setErrors) => {
  const regex = /(<([^>]+)>)/ig;
  let newDes = des.replace(regex,'').trim()
  console.log(newDes,'new desc......')
  if (isEmpty(newDes)){
    setSingleError('des', 'Please enter List Item description.', setErrors)
    return true
  }
  setSingleError('des', '', setErrors)
  return false
}

export const hasRoleNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please Enter Role name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasGroupNameErrors = (name, setErrors) => {
  if (isEmpty(name)) {
    setSingleError('name', 'Please Enter Group name.', setErrors)
    return true
  }
  setSingleError('name', '', setErrors)
  return false
}

export const hasUserRateErrors = (rate, setErrors) => {
  if (!isValidRate(rate)) {
    setSingleError('rate', 'Please Enter a Valid Rate', setErrors)
    return true
  }
  setSingleError('rate', '', setErrors)
  return false
}

export const hasGroupPickerErrors = (group, setErrors) => {
  if (group.id == -1) {
    setSingleError('group', 'Please select a group.', setErrors)
    return true
  }
  setSingleError('group', '', setErrors)
  return false
}

export const hasRolePickerErrors = (role, setErrors) => {
  if (role.id == -1) {
    setSingleError('role', 'Please select a role.', setErrors)
    return true
  }
  setSingleError('role', '', setErrors)
  return false
}

export const hasCountryErrors = (country, setErrors) => {
  if (isEmpty(country)) {
    setSingleError('country', 'Please enter your country.', setErrors)
    return true
  }
  setSingleError('country', '', setErrors)
  return false
}

export const hasAddressErrors = (address, setErrors) => {
  if (isEmpty(address)) {
    setSingleError('address', 'Please enter your address.', setErrors)
    return true
  }
  setSingleError('address', '', setErrors)
  return false
}

export const hasStateErrors = (state, setErrors) => {
  if (isEmpty(state)) {
    setSingleError('state', 'Please enter your state.', setErrors)
    return true
  }
  setSingleError('state', '', setErrors)
  return false
}

export const hasZipErrors = (zip, setErrors) => {
  if (isEmpty(zip)) {
    setSingleError('zip', 'Please enter your zip code.', setErrors)
    return true
  }

  setSingleError('zip', '', setErrors)
  return false
}

export const hasCityErrors = (city, setErrors) => {
  if (isEmpty(city)) {
    setSingleError('city', 'Please enter your city.', setErrors)
    return true
  }

  setSingleError('city', '', setErrors)
  return false
}

export const hasMessageErrors = (message, setErrors) => {
  if (isEmpty(message)) {
    setSingleError('message', 'Please enter message name.', setErrors)
    return true
  }
  setSingleError('message', '', setErrors)
  return false
}

export const hasGroupNameErros = (groupName, setErrors) => {
  if (isEmpty(groupName)) {
    setSingleError('groupName', 'Please enter groupName name.', setErrors)
    return trueß
  }
  setSingleError('groupName', '', setErrors)
  return false
}
