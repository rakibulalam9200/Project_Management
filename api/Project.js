import Api from './defaultApi'

class Project extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllProjects(params) {
    return this.get(`/project`, params)
  }
  createProject(params) {
    return this.postFormData('/project', params)
  }

  updateProject(params, id) {
    return this.postFormData(`/project/${id}`, params)
  }

  deleteProject(id) {
    return this.delete(`/project/${id}`)
  }

  deleteMultipleProjects(params) {
    return this.delete('/projects-delete', params)
  }

  getProject(id) {
    return this.get(`/project/${id}`)
  }

  cloneProjects(params) {
    return this.post(`/projects-clone`, params)
  }
  
  changeStatus(params, id) {
    return this.post(`/project-status-change/${id}`, params)
  }

  orderProject(params) {
    return this.post(`/order-project`, params)
  }

  moveItems(params) {
    return this.post(`/model-move`, params)
  }

}

export default Project
