import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import getEnvVars from '../environment.js'

const { apiUrl } = getEnvVars()

axios.defaults.baseURL = apiUrl
axios.defaults.headers.common = {
  Accept: 'application/json',
}

export const setToken = async (token) => {
  console.log("this is token...",token)
  if (token && token.length) {
    axios.defaults.headers.common = {
      ...axios.defaults.headers.common,
      Authorization: `Bearer ${token}`,
    }
    await AsyncStorage.setItem('token', token)
  } else {
    await AsyncStorage.removeItem('token')
  }
}

export const setRefreshToken = async (token) => {
  if (token && token.length) {
    await AsyncStorage.setItem('refreshtoken', token)
  } else {
    await AsyncStorage.removeItem('refreshtoken')
  }
}

export default axios
