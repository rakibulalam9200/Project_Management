import Api from './defaultApi'

class Completion extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getCompletionPercentage(params,id) {
    return this.get(`/completion-percentage/${id}`, params)
  }
  getListingCompletionPercentages(params){
    return this.get(`/completion-percentages`, params)
  }
 updateIssueCompletion(params,id){
    // //console.log(params,'project listing.....')
    return this.post(`/issue-completion/${id}`, params)
  }
 updateTaskCompletion(params,id){
   //console.log(params,id,'task listing.....')
    return this.post(`/task-completion/${id}`, params)
  }
}

export default Completion