import Api from './defaultApi'

class User extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  updateUser(params) {
    return this.postFormData('/user-update', params)
  }

  getUser() {
    return this.get('/user')
  }

  getUserWorkLoad(id, params) {
    return this.get(`/user-workload/${id}`, params)
  }

  updateUserId(params, id) {
    return this.postFormData(`/user/${id}`, params)
  }

  getUsers(params) {
    // console.log(params,'---------params.------------------')
    return this.get('/user-members', params)
  }

  deleteUser(id, params) {
    return this.delete(`/user/${id}`, params)
  }

  deleteMultipleUsers(params) {
    return this.delete(`/users-remove`, params)
  }

  getMembers(params) {
    return this.get('/user-members', params)
  }

  assignMemeber(params) {
    return this.post('/members-assign', params)
  }

  inviteUser(params) {
    console.log(params, 'params...........')
    return this.postFormData('/invitation', params)
  }

  userPermissions(params) {
    return this.get('/initialize-systems', params)
  }

  userPasswordReset(params) {
    return this.post('/user-password-reset', params)
  }

  getUserSettings(params) {
    return this.get('/user-settings', params)
  }

  changeUserSettings(params) {
    return this.post('/user-settings', params)
  }

  sendSMSVerificationCode(params) {
    return this.post('/send-sms-verification-code', params)
  }

  verifySMSVerificationCode(params) {
    return this.post('/sms-verify-code', params)
  }

  sendVerificationCodeToEmailOrPhone() {
    return this.get('/process-multi-factor-verification')
  }

  verifyInitialVerificationCode(params) {
    return this.post('/multi-factor-authentication-code-verification', params)
  }

  updatePhoneNumber(params) {
    return this.post('/user-phone-update', params)
  }

  verifyPassword(params) {
    return this.post('/verify-password', params)
  }

  updateMFA(params) {
    return this.post('/user-mfa-phone-update', params)
  }

  disableMFA(params) {
    return this.post('/user-mfa-disable', params)
  }
}

export default User
