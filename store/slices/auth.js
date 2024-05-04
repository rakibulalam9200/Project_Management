import { createSlice } from '@reduxjs/toolkit'
import { Alert } from 'react-native'
import api from '../../api/api'
import { setRefreshToken, setToken } from '../../plugins/axios'
import {
  makeSubscribed,
  makeUnSubscribed,
  setNeedInitialSubscription,
  setNotNeedInitialSubscription,
  setSubscriptionId,
  setSubscriptionNeededNewOrg,
  setSubscriptionNotNeededNewOrg,
} from './subscription'
import {
  setCustomDomainIndex,
  setDomain,
  setDomainIndex,
  setPermissions,
  setRole,
  setUser,
  setUserSettings,
} from './user'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    refreshToken: null,
    authenticated: false,
    needMFAVerification: false,
    loginEmail: null,
    signUpEmail: null,
    forgotMail: null,
    resendEmailTimer: 0,
    resendSignUpEmailTimer: 300,
    signUpPasswordToken: null,
    resetPasswordToken: null,
    notificationToken: null,
    showNewUserPasswordScreen: true,
    isAgreeTerms: false,
    isAgreePrivacy: false,
  },
  reducers: {
    changeToken(state, action) {
      state.token = action.payload
      setToken(state.token)
    },
    changeRefreshToken(state, action) {
      state.refreshToken = action.payload
      setRefreshToken(state.refreshToken)
    },
    authenticateUser(state) {
      state.authenticated = true
    },
    setNeedMFAVerification(state, action) {
      state.needMFAVerification = action.payload
    },
    deauthenticateUser(state) {
      state.authenticated = false
    },
    changeSignUpMail(state, action) {
      state.signUpEmail = action.payload
    },

    setLoginEmail(state, action) {
      state.loginEmail = action.payload
    },

    changeForgotMail(state, action) {
      state.forgotMail = action.payload
    },
    changeResendEmailTimer(state, action) {
      state.resendEmailTimer = action.payload
    },
    decrementResendEmailTimer(state) {
      if (state.resendEmailTimer > 0) state.resendEmailTimer = state.resendEmailTimer - 1
    },
    changeResendSignUpEmailTimer(state, action) {
      state.resendSignUpEmailTimer = action.payload
    },
    decrementResendSignUpEmailTimer(state) {
      if (state.resendSignUpEmailTimer > 0)
        state.resendSignUpEmailTimer = state.resendSignUpEmailTimer - 1
    },
    changeResetPasswordToken(state, action) {
      state.resetPasswordToken = action.payload
    },
    changeSignUpPasswordToken(state, action) {
      state.signUpPasswordToken = action.payload
    },
    setNotificationToken(state, action) {
      state.notificationToken = action.payload
    },

    setShowNewUserPasswordScreen(state, action) {
      state.showNewUserPasswordScreen = action.payload
    },

    setIsAgreeTerms(state, action) {
      state.isAgreeTerms = action.payload
    },

    setIsAgreePrivacy(state, action) {
      state.isAgreePrivacy = action.payload
    },
  },
})

export const {
  changeToken,
  changeRefreshToken,
  authenticateUser,
  deauthenticateUser,
  changeForgotMail,
  changeResendEmailTimer,
  changeResetPasswordToken,
  changeSignUpMail,
  changeSignUpPasswordToken,
  changeResendSignUpEmailTimer,
  decrementResendSignUpEmailTimer,
  decrementResendEmailTimer,
  setNotificationToken,
  setShowNewUserPasswordScreen,
  setNeedMFAVerification,
  setLoginEmail,
  setIsAgreeTerms,
  setIsAgreePrivacy,
} = authSlice.actions
export default authSlice.reducer

export const loadUser =
  (setDefaultOrg = true) =>
  (dispatch) => {
    return api.auth.me().then((res) => {
      if (res.success) {
        const user = res.user
        console.log('user here ------>>>..', user)

        // setup the organization name automatically if there is only one organization

        // //console.log(res.user)
        if (Array.isArray(user.organizations) && user.organizations.length == 1) {
          dispatch(setDomain(user.organizations[0].name))
          dispatch(setDomainIndex(user.organizations[0].id))
        }

        dispatch(setUser(user))
        if (setDefaultOrg) {
          dispatch(setDomain(user.user_setting.organization.name))
          dispatch(setDomainIndex(user.user_setting.default_organization_id))
          //console.log('User Settings', user.user_setting.default_organization_id, user.user_setting.organization.name)
        }
      }

      return res
    })
  }

export const loadPermissions = () => (dispatch) => {
  return api.user.userPermissions().then((res) => {
    if (res.success) {
      //console.log(res, 'Role')
      dispatch(setRole(res?.role))
      dispatch(setUserSettings(res?.user_setting))
      let permissionsObj = {}
      res.permissions.forEach((item) => {
        permissionsObj[item] = true
      })
      //console.log(permissionsObj, 'Permissions')
      dispatch(setPermissions(permissionsObj))
    }
    return res
  })
}

export const checkSubscription = () => (dispatch) => {
  return api.subscription
    .check()
    .then((res) => {
      //console.log('Should be here', res)
      if (res.success) {
        //console.log('Should be here too')
        dispatch(makeSubscribed())
        dispatch(setSubscriptionNotNeededNewOrg())
        dispatch(setNotNeedInitialSubscription())
      }
      return res
    })
    .catch((err) => {
      //console.log('Here', err.response.data)
      if (
        !err.response.data.paid &&
        err.response.data.trial_end == null &&
        !err.response.data.is_can_trial
      ) {
        //console.log('Here I am 2')
        dispatch(setSubscriptionId(err.response.data.subscription.id))
        dispatch(setCustomDomainIndex(err.response.data.subscription.organization_id))
        dispatch(makeUnSubscribed())
        dispatch(setSubscriptionNeededNewOrg())
        dispatch(setNotNeedInitialSubscription())
      } else if (!err.response.data.paid && err.response.data.is_can_trial) {
        //console.log(err.response.data.is_can_trial, 'Here I am')
        dispatch(setSubscriptionId(err.response.data.subscription.id))
        dispatch(setDomainIndex(err.response.data.subscription.organization_id))
        dispatch(setNeedInitialSubscription())
        dispatch(makeUnSubscribed())
        dispatch(setSubscriptionNotNeededNewOrg())
      }
    })
}

export const checkToken = () => async (dispatch, getState) => {
  const { auth } = getState()
  if (auth.token && auth.token.length) {
    // //console.log(auth.token)
    return dispatch(loadUser())
      .then((res) => {
        if (res.success) {
          // user is loaded successfully
          //console.log('User is loaded successfully')
          dispatch(checkSubscription())
            .then((res) => {
              if (res.success) {
                // user is subscribed
                //console.log('User is subscribed by checking token')
                dispatch(authenticateUser())
              }
            })
            .catch((err) => {
              //console.log('Check token error', err.response.data)
              dispatch(logout())
            })
        }
      })
      .catch((err) => {
        //console.log('Logging out here', err.response.data)
        dispatch(logout())
      })
  }
}

export const login = (params) => async (dispatch) => {
  return api.auth.login(params).then((res) => {
    dispatch(setLoginEmail(res.user.email))
    //console.log('Login response', res)
    if (res.is_multi_authorization) {
      dispatch(setNeedMFAVerification(true))
      dispatch(changeToken(res.access_token))
      dispatch(changeRefreshToken(res.refresh_token))
    } else {
      dispatch(setNeedMFAVerification(false))
      dispatch(changeToken(res.access_token))
      dispatch(changeRefreshToken(res.refresh_token))
      dispatch(checkSubscription())
        .then(() => {
          dispatch(authenticateUser())
        })
        .catch((err) => {
          dispatch(authenticateUser())
        })

      return dispatch(loadUser(false))
    }
  })
}

export const logout = () => async (dispatch) => {
  //console.log('Logging out')
  dispatch(changeToken(null))
  dispatch(changeRefreshToken(null))
  dispatch(setUser(null))
  dispatch(deauthenticateUser())
  dispatch(setDomain(''))
  dispatch(setDomainIndex(-1))
  dispatch(setCustomDomainIndex(-2))
  dispatch(setSubscriptionId(-1))
  dispatch(setSubscriptionNotNeededNewOrg())
  dispatch(makeUnSubscribed())
  dispatch(setNeedInitialSubscription(false))
  dispatch(setNeedMFAVerification(false))
}

export const registration = (params) => async (dispatch) => {
  return api.auth.registration(params).then((res) => {
    if (res.success) {
      dispatch(changeSignUpMail(res.email))
      dispatch(changeResendSignUpEmailTimer(res.expiry_seconds))
    }
    return res
  })
}

export const forgotSendMail = (params) => async (dispatch) => {
  return api.auth.forgotSendMail(params).then((res) => {
    if (res.success) {
      dispatch(changeForgotMail(res.email))
      dispatch(changeResendEmailTimer(res.expiry_seconds))
    }
    return res
  })
}

export const resendVerifyEmail =
  (params, mfaResend = false) =>
  async (dispatch) => {
    return api.auth.resendVerifyEmail(params).then((res) => {
      if (res.success) {
        if (mfaResend) {
          dispatch(setLoginEmail(res.email))
        } else {
          dispatch(changeSignUpMail(res.email))
        }
        dispatch(changeResendSignUpEmailTimer(res.expiry_seconds))
      }
      return res
    })
  }

export const verifyCode = (params) => async (dispatch) => {
  return api.auth.verifyCode(params).then((res) => {
    if (res.success) {
      dispatch(changeResetPasswordToken(res.token))
    }
    return res
  })
}

export const verifyMFACode = (params) => async (dispatch) => {
  return api.auth.verifyCode(params).then((res) => {
    if (res.success) {
      dispatch(checkSubscription())
        .then(() => {
          dispatch(authenticateUser())
          dispatch(setNeedMFAVerification(false))
        })
        .catch((err) => {
          dispatch(authenticateUser())
          dispatch(setNeedMFAVerification(false))
        })

      dispatch(loadUser(false))
    }
    return res
  })
}

export const verifySignUpCode = (params) => async (dispatch) => {
  return api.auth.verifyCode(params).then((res) => {
    // console.log('verify singup code...', res)
    if (res.success) {
      dispatch(changeToken(res.access_token))
      if (!res.has_password) {
        dispatch(changeSignUpPasswordToken(res.token))
        dispatch(setNeedInitialSubscription())
      } else {
        if (res?.is_can_trial) {
          dispatch(changeSignUpPasswordToken(res.token))
          dispatch(setNeedInitialSubscription())
        } else {
          Alert.alert('',
            'Your registration process has been successfully completed. Now you can login with your previous account.'
          )
          
        }
      }
    }
    return res
  })
}

export const resetPassword = (params) => async (dispatch) => {
  return api.auth.resetPassword(params).then((res) => {
    if (res.success) {
      dispatch(changeResetPasswordToken(null))
    }
    return res
  })
}

export const newUserPassword = (params) => async (dispatch) => {
  return api.auth.setNewPassword(params).then((res) => {
    console.log(res, 'response in new user password')
    if (res.success) {
    }
    return dispatch(loadUser())
  })
}

export const acceptInvitation = (params) => async (dispatch) => {
  return api.auth.acceptInvitation(params).then((res) => {
    if (res.success) {
      dispatch(changeRefreshToken(res.refresh_token))
      dispatch(changeToken(res.access_token))
    }
    return dispatch(loadUser())
  })
}
