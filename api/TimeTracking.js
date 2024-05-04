import Api from './defaultApi'

class TimeTracking extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  timeTrackingStart(params, id) {
    return this.post(`/time-tracking-start/${id}`, params)
  }

  timeTrackingPause(params, id) {
    return this.post(`/time-tracking-pause/${id}`, params)
  }

  timeTrackingStop(params, id) {
     console.log(params,id,'--------------')
    return this.post(`/time-tracking-stop/${id}`, params)
  }

  // //api/v1/time-tracking

  getCurrentTimeTracking(params) {
    return this.get(`/time-tracking`, params)
  }
}

export default TimeTracking
