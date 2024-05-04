import Api from './defaultApi'

class Task extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllTasks(params) {
    return this.get('/task', params)
  }
  getTaskByMilestoneIdAndProjectId(params, projectId, milestoneId) {
    return this.get(`/task?project_id=${projectId}&milestone_id=${milestoneId}`, params)
  }
  getTaskByProjectId(params, projectId) {
    return this.get(`/task?project_id=${projectId}`, params)
  }

  getTasksByProjectsAndMilestones(params) {
    return this.get(`/find-task-from-project-and-milestone`, params)
  }

  getTasks(params, projectId, milestoneId) {
    if (projectId && milestoneId) {
      return this.get(`/task?project_id=${projectId}&milestone_id=${milestoneId}`, params)
    } else if (projectId && !milestoneId) {
      return this.get(`/task?project_id=${projectId}`, params)
    } else if (!projectId && milestoneId) {
      return this.get(`/task?milestone_id=${milestoneId}`, params)
    } else if (!projectId && !milestoneId) {
      return this.get('/task', params)
    }
  }
  createTask(params) {
    return this.postFormData('/task', params)
  }
  updateTask(params, id) {
    return this.postFormData(`/task/${id}`, params)
  }
  deleteTask(id) {
    return this.delete(`/task/${id}`)
  }
  getTask(id) {
    return this.get(`/task/${id}`)
  }
  cloneTask(params) {
    return this.post(`/tasks-clone`, params)
  }
  deleteMultipleTasks(params) {
    return this.delete('/tasks-delete', params)
  }
  orderTask(params) {
    return this.post(`/order-task`, params)
  }

  notesConvertToTask(params) {
    return this.post(`/note-convert-to-task`, params)
  }

  changeTaskStatus(params, id) {
    return this.post(`/task-status-change/${id}`, params)
  }
}

export default Task
