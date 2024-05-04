import Api from './defaultApi'

class Timezone extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getTimezones(params) {
    return this.get('/timezone', params)
  }
}

export default Timezone
