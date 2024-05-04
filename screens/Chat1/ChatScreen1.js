import React, { useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import g from '../../assets/styles/global'
import CButtonInput from '../../components/common/CButtonInput'
import CInputWithLabel from '../../components/common/CInputWithLabel'
import io from 'socket.io-client'
import { useRef } from 'react'
import colors from '../../assets/constants/colors'
import useWebsocket from '../../hooks/useWebsocket'

const details = {
  url: 'http://10.0.2.2:8080',
  email: 'user',
}
export default function Chat1Screen() {
  const flatListRef = useRef()
  const [message, setMessage] = useState('Test Message')
  const { send, data } = useWebsocket({
    ...details,
    onRecieveMessage: () => {
      //console.log('On recieve')
      flatListRef.current?.scrollToEnd({ animating: true })
    },
  })
  const ref = useRef()

  const sendMessage = async () => {
    send(message)
    setMessage('')
  }
  const renderItem = ({ item }) => {
    const { content, email } = item
    return (
      <View style={s.item}>
        <Text>{email} says:</Text>
        <Text style={s.title}>{content}</Text>
      </View>
    )
  }

  return (
    <View style={[g.innerContainer, s.container]}>
      <View style={s.listContainer}>
        <View style={s.container}>
          <CInputWithLabel value={message} setValue={setMessage} label="Message" />
          <CButtonInput label="Send Message" onPress={sendMessage} />
        </View>
        <FlatList
          data={data}
          ref={flatListRef}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContainer}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  title: {
    color: 'black',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    backgroundColor: colors.SEC_BG,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 200,
  },
})
