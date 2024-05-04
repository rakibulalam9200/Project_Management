import Api from './defaultApi'

class Notification extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllNotification(params) {
    return this.get('/notification', params)
  }
}

export default Notification
