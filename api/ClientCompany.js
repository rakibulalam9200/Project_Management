import Api from './defaultApi'

class ClientCompany extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getclientCompanies(params) {
    return this.get(`/client-company`, params)
  }
  getclientCompany(params) {
    return this.get(`/client-company/${params.id}`)
  }
  getSingleClientCompany(id){
    return this.get(`/client-company/${id}`)
  }
  createClientCompany(params) {
    return this.postFormData(`/client-company`, params)
  }

  createClientCompany(params) {
    return this.postFormData(`/client-company`, params)
  }

  deleteClientCompany(id) {
    return this.delete(`/client-company/${id}`)
  }

  updateClientCompany(params,id) {
    return this.postFormData(`/client-company/${id}`, params)
  }
}

export default ClientCompany
