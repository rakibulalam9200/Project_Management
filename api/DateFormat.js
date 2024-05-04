import Api from './defaultApi'

class DateFormat extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getDateFormat(params) {
    return this.get('/dateformat', params)
  }
}

export default DateFormat
