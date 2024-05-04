import Api from './defaultApi'

class Group extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getGroups(params) {
    return this.get('/group', params)
  }

  getGroup(id, params) {
    return this.get(`/group/${id}`, params)
  }

  getUser(id) {
    return this.get(`/user/${id}`)
  }
  updateUser(id, params) {
    return this.postFormData(`/user/${id}`, params)
  }

  updateGroup(id, params) {
    return this.post(`/group/${id}`, params)
  }

  createGroup(params) {
    return this.postFormData('/group', params)
  }

  getGroupUsers(id, params) {
    console.log('id', id, params)
    return this.get(`/group-user/${id}`, params)
  }
}

export default Group
