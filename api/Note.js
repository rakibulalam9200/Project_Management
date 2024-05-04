import Api from './defaultApi'

class Note extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getAllNotes(params) {
    return this.get('/note', params)
  }
  getAllNoteByProject(params, projectId) {
    return this.get(`/note?project_id=${projectId}`, params)
  }
  createNote(params) {
    //console.log(params, 'note params')
    return this.postFormData('/note', params)
  }
  updateNote(params, id) {
    return this.postFormData(`/note/${id}`, params)
  }
  deleteNote(id) {
    return this.delete(`/note/${id}`)
  }
  getNote(id) {
    return this.get(`/note/${id}`)
  }

  cloneNote(params) {
    return this.post('/notes-clone', params)
  }
  deleteMultipleNotes(params) {
    return this.delete('/notes-delete', params)
  }
  orderNote(params) {
    return this.post('/order-note', params)
  }
}

export default Note
