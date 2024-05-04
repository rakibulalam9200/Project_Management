import Api from './defaultApi'

class Assign extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }
  
  assignTeam(params) {
    return this.postFormData('/team-assign', params)
  }

  assignCompany(params) {
    return this.postFormData('/company-assign', params)
  }

  assignMember(params){
    console.log('params......',params)
    return this.postFormData('/members-assign', params)
  }



}

export default Assign
