import Api from './defaultApi'

class Issue extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllIssues(params) {
    return this.get('/issue', params)
  }

  getIssueByProjectId(params,projectId){
    return this.get(`/issue?project_id=${projectId}`, params)
  }

  getIssues(params,projectId,milestoneId,taskId){
    // //console.log(projectId,milestoneId,taskId,"===========")
    if(projectId && milestoneId && taskId){
      return this.get(`/issue?task_id=${taskId}`, params)
    }else if(!projectId && milestoneId && taskId){
      return this.get(`/issue?task_id=${taskId}`, params)
    }else if(projectId && milestoneId && !taskId){
      return this.get(`/issue?project_id=${projectId}&milestone_id=${milestoneId}`, params)
    }else if(projectId && taskId && !milestoneId){
      return this.get(`/issue?project_id=${projectId}&task_id=${taskId}`, params)
    }else if(projectId && !milestoneId){
      return this.get(`/issue?project_id=${projectId}`, params)
    }else if(taskId && !projectId && !milestoneId){
      return this.get(`/issue?task_id=${taskId}`, params)
    }else if(!projectId && !milestoneId && !taskId){
      return this.get('/issue', params)
    }
  }

  createIssue(params) {
    return this.postFormData('/issue', params)
  }
  updateIssue(params, id) {
    return this.postFormData(`/issue/${id}`, params)
  }
  deleteIssue(id) {
    return this.delete(`/issue/${id}`)
  }
  getIssue(id) {
    return this.get(`/issue/${id}`)
  }

  cloneIssue(params){
    return this.post('/issues-clone',params)
  }
  deleteMultipleIssues(params) {
    return this.delete('/issues-delete', params)
  }
  orderIssue(params) {
    return this.post('/order-issue', params)
  }

  changeIssueStatus(params,id){
    return this.post(`/issue-status-change/${id}`,params)
  }

}

export default Issue
