import Api from './defaultApi'

class Template extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllTemplate(params) {
    return this.get('/template-project', params)
  }
  /* createProject(params) {
    return this.postFormData('/template', params)
  }

  updateProject(params, id) {
    return this.postFormData(`/template/${id}`, params)
  }

  deleteProject(id) {
    return this.delete(`/template/${id}`)
  } */

 /*  getProject(id) {
    return this.get(`/project/${id}`)
  } */
}

export default Template
