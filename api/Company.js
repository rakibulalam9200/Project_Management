import Api from './defaultApi'

class Company extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllCompanies(params) {
    return this.get('/organization', params)
  }

  // /api/v1/user-organizations

  getUserCompanies(params) {
    return this.get('/user-organizations', params)
  }
  createCompany(params) {
    return this.postFormData('/organization', params)
  }

  updateCompany(params, id) {
    return this.postFormData(`/organization/${id}`, params)
  }

  deleteCompany(id) {
    console.log(id,'---------id..............')
    return this.delete(`/organization/${id}`)
  }

  getCompany(id) {
    return this.get(`/organization/${id}`)
  }

  changeCompany(params) {
    return this.post('/change-organization', params)
  }


  postCompanySecuritySettings(params) {
    return this.post('/organization-setting', params)
  }

  getCompanySecuritySettings() {
    return this.get('/organization-setting')
  }


}

export default Company
