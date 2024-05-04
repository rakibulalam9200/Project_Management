import Api from './defaultApi'

class SupportCase extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllSupportCases(params) {
    return this.get('/support-case', params)
  }
  createSupportCase(params) {
    return this.postFormData('/support-case', params)
  }
  updateSupportCase(params, id) {
    return this.postFormData(`/support-case/${id}`, params)
  }
  getSupportCaseTypes() {
    return this.get('/support-case-type')
  }
  getSupportCase(id) {
    return this.get(`/support-case/${id}`)
  }
  closeSupportCase(id) {
    return this.post(`/support-case-close/${id}`)
  }
}

export default SupportCase
