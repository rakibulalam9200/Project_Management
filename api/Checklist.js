import Api from './defaultApi'

class Checklist extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllChecklists(params) {
    return this.get('/todolist', params)
  }

  createChecklist(params) {
    return this.postFormData('/todolist', params)
  }

  updateChecklist(params, id) {
    return this.postFormData(`/todolist/${id}`, params)
  }

  deleteChecklist(id) {
    return this.delete(`/todolist/${id}`)
  }

  deleteMultipleChecklists(params) {
    return this.delete('/todolist-delete', params)
  }

  getChecklist(id, params) {
    return this.get(`/todolist/${id}`, params)
  }

  cloneChecklists(params) {
    return this.post(`/todolist-clone`, params)
  }

  orderChecklist(params) {
    return this.post(`/order-todolist`, params)
  }

  getItemDetails(id) {
    return this.get(`/list-item/${id}`)
  }
  createItem(params) {
    return this.postFormData('/todolist-item-single', params)
  }

  updateItem(params, id) {
    return this.postFormData(`/list-item/${id}`, params)
  }
  deleteChecklistItem(id) {
    return this.delete(`/list-item/${id}`)
  }
  deleteMultipleChecklistItems(params) {
    return this.delete('/todolist-items-delete', params)
  }
  toggleListItemStatus(id) {
    return this.post(`/list-item-status/${id}`)
  }
  changeListStatus(id, params) {
    return this.post(`/todolist-status/${id}`, params)
  }
  orderChecklistItem(params) {
    return this.post(`/order-todolist-item`, params)
  }
  cloneChecklistItem(params) {
    return this.post('/todolist-items-clone', params)
  }
  convertToTask(params) {
    return this.post('/todolist-items-convert-to-task', params)
  }
}

export default Checklist
