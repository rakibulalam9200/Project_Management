import Api from './defaultApi'

class Auth extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  login(params) {
    return this.post('/login', params)
  }

  logout() {
    return this.post('/logout')
  }

  registration(params) {
    return this.post('/register', params)
  }

  forgotSendMail(params) {
    return this.post('/forgot-sent-mail', params)
  }

  resendVerifyEmail(params) {
    return this.post('/resend-verify-email', params)
  }

  verifyCode(params) {
    return this.post('/verify-code', params)
  }

  resetPassword(params) {
    return this.post('/password-reset', params)
  }

  setNewPassword(params) {
    console.log('params.......',params)
    return this.post('/verify-email', params)
  }

  acceptInvitation(params) {
    return this.post('/invitation-accept', params)
  }

  me() {
    return this.get('/user')
  }
}

export default Auth
