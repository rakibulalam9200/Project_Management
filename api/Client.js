import Api from './defaultApi'

class Client extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getclients(params) {
    return this.get('/client', params)
  }

  getclient(id, params) {
    return this.get(`/client/${id}`, params)
  }

  updateclient(id, params) {
    return this.postFormData(`/client/${id}`, params)
  }

  createclient(params) {
    return this.postFormData('/client', params)
  }

  deleteSingleClient(id){
    return this.delete(`/user/${id}`)
  }

  deleteMultipleClients(params){
    return this.delete(`/users-remove`,params)
  }

  getclientUsers(id, params) {
    return this.get(`/client-user/${id}`, params)
  }

  getclientCompanies(params) {
    return this.get(`/client-company`, params)
  }
  getclientCompany(params) {
    return this.get(`/client-company/${params.id}`)
  }
  
}

export default Client
