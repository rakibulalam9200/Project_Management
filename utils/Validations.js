export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,20}$/
export const CODE_REGEX = /^[a-zA-Z0-9]{6}$/
export const USERNAME_REGEX = /^[a-zA-Z0-9 .,]+$/
export const DOMAIN_REGEX = /^[a-zA-Z0-9 .,]+$/
export const NUMERIC_REGEX = /^[0-9.]+$/

export const isValid = (errorMessages) => {
  let valid = true

  for (let keys in errorMessages) {
    if (errorMessages[keys] != '') valid = false
  }

  return valid
}

export const isEmpty = (value) => {
  return !value
}

export const isValidEmail = (email) => {
  let valid = String(email).toLowerCase().match(EMAIL_REGEX)

  return valid
}

export const isValidUserName = (userName) => {
  let valid = String(userName).toLowerCase().match(USERNAME_REGEX)
  return valid
}

export const isValidCode = (code) => {
  let valid = String(code).toLowerCase().match(CODE_REGEX)
  return valid
}

export const isValidPassword = (password) => {
  let valid = String(password).toLowerCase().match(PASSWORD_REGEX)
  return valid
}

export const isValidDomain = (domain) => {
  let valid = String(domain).toLowerCase().match(DOMAIN_REGEX)

  return valid
}
export const isValidRate = (rate) => {
  let valid = String(rate).match(NUMERIC_REGEX)

  return valid
}
