import Api from './defaultApi'

class Chat extends Api {
  constructor(_axios) {
    super(_axios, '/api')
  }

  getChatList(params) {
    return this.get(`/messages`, params)
  }
  getChatListFiles(params) {
    return this.get(`/internal-message-files`, params)
  }


  getChatDetails(id, params) {
    return this.get(`/messages/${id}`, params)
  }


  leaveGroupChat(id, params) {
    return this.post(`/leave-chat/${id}`, params)
  }


  deleteGroupChat(id) {
    return this.delete(`/group-message/${id}`)
  }


  muteChat(id, params) {
    return this.post(`/messages-mute/${id}`, params)
  }

  getChatMembers(type, id) {
    return this.get(`/messages/${type}/members/${id}`)
  }

  addChatMembers(id, params) {
    return this.post(`/add-members/${id}`, params)
  }

  removeChatMembers(id, params) {
    return this.post(`/remove-members/${id}`, params)
  }

  createGroupMessage(params) {
    return this.post(`/group-message`, params)
  }

  getChat(params) {
    return this.get(`/internal/message`, params)
  }

  createChat(params) {
    return this.postFormData('/internal/message', params)
  }
  deleteChat(id, params) {
    return this.delete(`/internal/message/${id}`, params)
  }

  updateChat(id, params) {
    return this.post(`/internal/message/${id}`, params)
  }


  pinChat(id, params) {
    return this.post(`/messages-pin/${id}`, params)
  }

  messageSeen(id, params) {
    return this.post(`/message-seen/${id}`, params)
  }

}

export default Chat
