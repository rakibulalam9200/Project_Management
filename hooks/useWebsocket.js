import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
export default function useWebsocket({ email, url, onRecieveMessage }) {
  const [data, setData] = useState([])

  const ref = useRef()

  const send = (message) => {
    ref.current.emit('message', {
      content: message,
      email: email,
      date: new Date(),
    })
  }

  useEffect(() => {
    const socket = io(url)

    socket.on('disconnect', () => {
      //console.log('disconnected')
    })

    socket.on('connect', () => {
      //console.log(`connected`)
    })

    socket.on('message', (message) => {
      if (message)
        setData((prev) => {
          return [...prev, message]
        })
      //console.log(onRecieveMessage)
      onRecieveMessage()
    })

    socket.on('reconnect', () => {
      //console.log('reconnected')
    })

    ref.current = socket

    return () => {
      //console.log(`disconnecting`)
      socket.disconnect()
    }
  }, [])

  return {
    send,
    data,
  }
}
