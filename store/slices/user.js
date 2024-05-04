import { createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    domain: '',
    domainIndex: -1,
    customDomain: '',
    customDomainIndex: -2,
    companies: [],
    permissions: {},
    role: {},
    userSettings: {},
    parentRoles: [],
    calendarList: [],
  },
  reducers: {
    setUser(state, action) {
      state.user = { ...state.user, ...action.payload }
    },
    setDomain(state, action) {
      state.domain = action.payload
    },
    setDomainIndex(state, action) {
      state.domainIndex = action.payload
    },

    setCustomDomain(state, action) {
      state.customDomain = action.payload
    },

    setCustomDomainIndex(state, action) {
      state.customDomainIndex = action.payload
    },

    setCompanies(state, action) {
      state.companies = action.payload
    },

    setPermissions(state, action) {
      state.permissions = action.payload
    },
    setRole(state, action) {
      state.role = action.payload
    },
    setParentRoles(state, action) {
      state.parentRoles = action.payload
    },

    setUserSettings(state, action) {
      state.userSettings = action.payload
    },

    setCalendarList(state, action) {
      state.calendarList = action.payload
    },
  },
})

export const {
  setUser,
  setParentRoles,
  setDomain,
  setDomainIndex,
  setCustomDomainIndex,
  setCustomDomain,
  setCompanies,
  setPermissions,
  setRole,
  setUserSettings,
  setCalendarList,
} = userSlice.actions
export default userSlice.reducer

export const changeCompany = (id) => (dispatch) => {
  return api.company
    .changeCompany({
      id: id,
    })
    .then((res) => {
      //console.log(res)
      if (res.success) {
        try {
          dispatch(setDomain(res.organization.name))
          dispatch(setDomainIndex(id))
        } catch (err) {
          //console.log(err)
        }
      }
      return res
    })
}

export const refreshCompanies = (id) => (dispatch) => {
  return api.company
    .getUserCompanies({
      allData: true,
    })
    .then((res) => {
      try {
        dispatch(setCompanies(res))
      } catch (err) {
        //console.log(err)
      }

      return res
    })
}

export const refreshCalendarList = () => (dispatch) => {
  return api.calendar
    .getCalendarList({
      allData: true,
    })
    .then((res) => {
      try {
        dispatch(setCalendarList(res))
      } catch (err) {
        //console.log(err)
      }

      return res
    })
}
