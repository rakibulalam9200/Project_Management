import Api from './defaultApi'

class Team extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getTeams(params) {
    return this.get('/team', params)
  }

  getTeam(id, params) {
    return this.get(`/team/${id}`, params)
  }

  updateTeam(id, params) {
    return this.postFormData(`/team/${id}`, params)
  }

  createTeam(params) {
    return this.postFormData('/team', params)
  }

  getTeamUsers(id, params) {
    return this.get(`/team-user/${id}`, params)
  }

  getTeamMembers(id,params){
    return this.get(`/team-members/${id}`,params)
  }

  deleteTeam(id) {
    return this.delete(`/team/${id}`)
  }
}

export default Team
