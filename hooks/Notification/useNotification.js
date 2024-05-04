import { useEffect, useState } from 'react'
import api from '../../api/api'

export default function useNotification() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    setLoading(true)
    api.notification.getAllNotification().then((res) => {
      
      setNotifications(res.data)
    }).catch((err) => {
      //console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  return {
    loading,
    setLoading,
    notifications,
    setNotifications,
  }
}
