import Api from './defaultApi'

class Milestone extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllMilestones(params) {
    return this.get('/milestone', params)
  }
  getMilestones(params, projectId) {
    if(projectId){
      return this.get(`/milestone?project_id=${projectId}`, params)
    }else{
      return this.get('/milestone', params)
    } 
  }

  getMilestonesByProjects(params){
    return this.get(`/find-milestone-from-project`, params)
  }
  createMilestone(params) {
    return this.postFormData('/milestone', params)
  }

  updateMilestone(params, id) {
    return this.postFormData(`/milestone/${id}`, params)
  }

  deleteMilestone(id) {
    return this.delete(`/milestone/${id}`)
  }

  deleteMultipleMilestones(params) {
    return this.delete('/milestones-delete', params)
  }

  getMilestone(id) {
    return this.get(`/milestone/${id}`)
  }

  cloneMilestones(params) {
    return this.post(`/milestones-clone`, params)
  }

  orderMilestone(params) {
    return this.post(`/order-milestone`, params)
  }
  changeMilestoneStatus(params,id){
    return this.post(`/milestone-status-change/${id}`,params)
  }
}

export default Milestone
