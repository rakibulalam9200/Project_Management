import Api from './defaultApi'

class Calendar extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getCalendar(params) {
    return this.get('/mobile/calendar', params)
  }

  getCalendarList(params) {
    return this.get('/calendar', params)
  }

  createEvent(params) {
    //console.log(params, 'params')
    return this.postFormData('/event', params)
  }
  updateEvent(params, id) {
    // console.log(params, 'params', id, 'id');
    return this.postFormData(`/event/${id}`, params)
  }

  getEventDetails(id) {
    return this.get(`/event/${id}`)
  }

  getCalendarDetails(id) {
    return this.get(`/calendar/${id}`)
  }

  createCalendar(params) {
    return this.post('/calendar', params)
  }

  editCalendar(id, params) {
    return this.put(`/calendar/${id}`, params)
  }

  destroyCalendar(id) {
    return this.delete(`/calendar/${id}`)
  }

  makeDefaultCalendar(id) {
    return this.post(`/calendar-make-default/${id}`)
  }
}

export default Calendar
