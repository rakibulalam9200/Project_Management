class Api {
  constructor(_axios, _prefix = '') {
    this.axios = _axios
    this.prefix = _prefix + '/v1'
  }

  get(url, params = {}) {
    return this.axios
      .get(`${this.prefix}${url}`, {
        params,
      })
      .then((res) => res.data)
  }

  post(url, params = {}) {
    return this.axios.post(`${this.prefix}${url}`, params).then((res) => {
      return res.data
    })
  }

  put(url, params = {}) {
    return this.axios.put(`${this.prefix}${url}`, params).then((res) => res.data)
  }

  delete(url, params = {}) {
    return this.axios
      .delete(`${this.prefix}${url}`, {
        params,
      })
      .then((res) => res.data)
  }

  postFormData(url, params = {}) {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    }
    // eslint-disable-next-line no-undef
    const formData = new FormData()

    //console.log(params, 'params')
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((item, i) => {
          if (typeof item === 'object') {
            for (let itemKey in item) {
              formData.append(`${key}[${i}][${itemKey}]`, item[itemKey])
            }
          }
        })
      } else if (typeof params[key] == 'object') {
        // //console.log('here')
        // //console.log(key, 'Object.entries(params[key])')
        if (key == 'event_repeat') {
          console.log('Ekhane dhukse')
          Object.entries(params[key]).forEach(([itemKey, itemValue]) => {
            formData.append(`${key}[${itemKey}]`, itemValue)
          })
        } else {
          formData.append(key, params[key])
        }
      } else {
        // //console.log('there')
        if (typeof params[key] === 'boolean') {
          params[key] = params[key] ? 1 : 0
        }

        formData.append(key, params[key])
      }

      console.log(formData,'==================')
    }

    // //console.log(formData, 'formData')
    // return
    return this.axios
      .post(`${this.prefix}${url}`, formData, {
        headers,
      })
      .then((res) => res.data)
  }

  postFormDataEvent(url, params = {}) {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    }
    // eslint-disable-next-line no-undef
    const formData = new FormData()
    const {
      name,
      start_date,
      end_date,
      is_all_day,
      repeat,
      description,
      address,
      calendar_id,
      event_repeat,
    } = params || {}
    console.log(params, 'params')
    // if (attachments)
    //   for (let i = 0; i < attachments?.length; i++) {
    //     formData.append(`attachments[]`, attachments[i])
    //   }

    // if (invitees)
    //   for (let i = 0; i < invitees.length; i++) {
    //     formData.append(`invitees[]`, invitees[i])
    //   }
    formData.append('_method', 'put')
    formData.append('name', name)
    formData.append('start_date', start_date)
    formData.append('end_date', end_date)
    // formData.append('is_all_day', is_all_day)
    repeat && formData.append('repeat', repeat)
    if (description) formData.append('description', params?.description)
    if (address) formData.append('address', params?.address)
    formData.append('calendar_id', params?.calendar_id)
    if (params?.repeat !== 'One-time event') {
      if (params?.event_repeat.every) {
        console.log(params.event_repeat)

        formData.append('event_repeat[every]', params?.event_repeat.every)
      }
      if (params?.event_repeat.type) {
        formData.append('event_repeat[type]', params?.event_repeat.type)
      }
      if (params?.repeat == 'Weekly') {
        if (params?.event_repeat.repeat_on?.length > 0) {
          for (let i = 0; i < params?.event_repeat.repeat_on?.length; i++) {
            formData.append(`event_repeat[repeat_on][]`, params?.event_repeat.repeat_on[i])
          }
        }
      }
      if (params?.event_repeat.end_type) {
        formData.append('event_repeat[end_type]', params?.event_repeat.end_type)
      }
      if (params?.event_repeat.end_date) {
        formData.append('event_repeat[end_date]', params?.event_repeat.end_date)
      }
      if (params?.event_repeat.total_occurrence) {
        formData.append('event_repeat[total_occurrence]', params?.event_repeat.total_occurrence)
      }
    }
    console.log(formData, 'formData')
    return this.axios
      .put(`${this.prefix}${url}`, formData, {
        headers,
      })
      .then((res) => res.data)
  }
}

export default Api
