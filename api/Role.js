import Api from './defaultApi'

class Role extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  // getRoles(params) {
  //   return this.get('/role', params)
  // }

  getRoles(params) {
    return this.get('/role-list', params)
  }

  getRole(id, params) {
    return this.get(`/role/${id}`, params)
  }

  updateRole(id, params) {
    return this.post(`/role/${id}`, params)
  }

  getAllPermissions(params) {
    return this.get('/get-permissions', params)
  }

  createRole(params) {
    return this.post('/role', params)
  }
}

export default Role
