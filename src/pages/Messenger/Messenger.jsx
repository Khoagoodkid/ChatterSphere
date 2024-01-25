import React, { useContext, createContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext'
import './Messenger.css'
import ChatMenu from '../../components/ChatMenu/ChatMenu'
import ChatWindow from '../../components/ChatWindow/ChatWindow'
import io from 'socket.io-client'
export const CurrentChatContext = createContext()
export const OnlineUsersContext = createContext()
const socket = io('https://chattersphere-server.onrender.com/')
function Messenger() {
  const { user, setUser } = useContext(AuthContext)
  const [currentChat, setCurrentChat] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(null)
  useEffect(() => {
    socket.emit('addUser', user?._id)
    socket.on('getUsers', users => {
      setOnlineUsers(users)
      console.log(users)
    })

  }, [user])
  return (
    <div className='messengerBody'>
      <div className='messengerWindow'>
        <CurrentChatContext.Provider value={{ currentChat, setCurrentChat }}>
          <OnlineUsersContext.Provider value ={onlineUsers}>
            <ChatMenu />
            <ChatWindow />

          </OnlineUsersContext.Provider>
        </CurrentChatContext.Provider>

      </div>
      
    </div>
  )
}

export default Messenger