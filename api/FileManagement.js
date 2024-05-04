import Api from './defaultApi'

class FileManagement extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getProjects(params) {
    return this.get(`/file-management-projects`, params)
  }

  getProjectDirectories(id, params) {
    return this.get(`/file-management/project/${id}`, params)
  }

  getProjectMilestoneDirectories(projectId, milestoneId, params) {
    return this.get(`/file-management/project/${projectId}/milestone/${milestoneId}`, params)
  }

  getTaskDirectories(project_id, milestone_id, task_id, params) {
    return this.get(
      `/file-management/project/${project_id}/milestone/${milestone_id}/task/${task_id}`,
      params
    )
  }

  getSingleTaskDirectories(project_id, task_id, params) {
    return this.get(`/file-management/project/${project_id}/task/${task_id}`, params)
  }

  getIssueDirectories(project_id, task_id, issue_id) {
    return this.get(`/file-management/project/${project_id}/task/${task_id}/issue/${issue_id}`)
  }

  getSingleIssueDirectories(project_id, issue_id, params) {
    return this.get(`/file-management/project/${project_id}/issue/${issue_id}`, params)
  }

  getProjectFiles(id, params) {
    return this.get(`/file-management/project/${id}`, params)
  }

  getProjectMilestoneFiles(projectId, milestoneId, params) {
    return this.get(`/file-management/project/${projectId}/milestone/${milestoneId}`, params)
  }

  getTaskFiles(project_id, milestone_id, task_id, params) {
    return this.get(
      `/file-management/project/${project_id}/milestone/${milestone_id}/task/${task_id}`,
      params
    )
  }

  getProjectTaskFiles(project_id, task_id, params) {
    return this.get(`/file-management/project/${project_id}/task/${task_id}`, params)
  }

  addprojectAttachments(id, params) {
    return this.postFormData(`/file-management/project/attachment-add/${id}`, params)
  }

  addprojectMilestoneAttachments(id, params) {
    return this.postFormData(`/file-management/attachment-add/milestone/${id}`, params)
  }

  addTaskAttachments(id, params) {
    return this.postFormData(`/file-management/attachment-add/task/${id}`, params)
  }

  addIssueAttachments(id, params) {
    return this.postFormData(`/file-management/attachment-add/issue/${id}`, params)
  }

  deleteMultipleAttachments(params) {
    return this.delete('/file-management-attachment-delete', params)
  }

  getTrashItems() {
    return this.get('/file-management-trash')
  }

  restoreTrashItems(params) {
    return this.post('/file-management-trash-restore', params)
  }

  deleteFilesPermanently(params) {
    return this.delete('/file-management-attachment-permanently-delete', params)
  }

  addAttachmentsToRoot(params) {
    return this.postFormData('/file-management-attachment-add', params)
  }

  addAttachmentsToFolder(id, params) {
    if (!id) {
      return this.addAttachmentsToRoot(params)
    }
    return this.postFormData(`/file-management-attachment-add/${id}`, params)
  }

  addAttachmentChunksToFolder(id, headers, body) {}

  getAttachmentsFromRoot(params) {
    return this.get('/file-management', params)
  }

  searchAttachments(params) {
    //console.log(params, 'searching')
    return this.get('/file-management-search', params)
  }
  getAttachments(id, params, search) {
    if (search || params['filters']) {
      return this.searchAttachments(params)
    }
    if (!id && !search) {
      return this.getAttachmentsFromRoot(params)
    }

    return this.get(`/file-management/${id}`, params)
  }
  saveFolder(params) {
    return this.post(`/file-management`, params)
  }
  downloadAtttachments(params) {
    return this.get('/file-management-download', params)
  }
}

export default FileManagement
