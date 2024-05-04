import Api from './defaultApi'

class Activity extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  saveCommentActivity(params) {
    return this.post(`/user-activity`, params)
  }

  getActivities(params) {
    console.log(params,'params.........')
    return this.get('/user-activity', params)
  }
  getActivitiesDirectory(params) {
    return this.get(`/user-activity/${params.user_id}`, params)
  }
}

export default Activity
