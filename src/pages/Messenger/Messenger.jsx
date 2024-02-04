import React, { useContext, createContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext'
import './Messenger.css'
import ChatMenu from '../../components/ChatMenu/ChatMenu'
import ChatWindow from '../../components/ChatWindow/ChatWindow'
import io from 'socket.io-client'
export const SocketContext = createContext()
export const CurrentChatContext = createContext()
export const OnlineUsersContext = createContext()
const socket = io('https://chattersphere-server.onrender.com/')

// const socket = io('http://localhost:8080/')

function Messenger() {
  const { user, setUser } = useContext(AuthContext)
  const [currentChat, setCurrentChat] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(null)
  useEffect(() => {
    socket.emit('addUser', user?._id)
    socket.on('getUsers', users => {
      setOnlineUsers(users)
      // console.log(users)
    })
    socket.on("hideCamSignal", res => {
      console.log(res)
    })

  }, [user])
  useEffect(() => {
    socket.on("incomingCall", caller => {
      console.log(caller)
    })
  }, [])
  return (
    <div className='messengerBody'>
      <div className='messengerWindow'>
        <CurrentChatContext.Provider value={{ currentChat, setCurrentChat }}>
          <SocketContext.Provider value={socket}>

            <OnlineUsersContext.Provider value={onlineUsers}>
              <ChatMenu />
              <ChatWindow />

            </OnlineUsersContext.Provider>
          </SocketContext.Provider>
        </CurrentChatContext.Provider>

      </div>

    </div>
  )
}

export default Messenger