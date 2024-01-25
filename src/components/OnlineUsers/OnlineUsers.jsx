import React, { useState, useContext } from 'react'
import "./OnlineUsers.css"
import { OnlineUsersContext } from '../../pages/Messenger/Messenger'
import OnlineUsersCard from './OnlineUsersCard'
import { useEffect } from 'react'
import { url } from '../../tools/Database'

function OnlineUsers({ setCurrentChat, user, conversations }) {
  let onlineUsers1 = useContext(OnlineUsersContext)
  const [onlineUsers, setOnlineUsers] = useState(null)
  useEffect(() => {

    setOnlineUsers(onlineUsers1.filter(oUser => oUser.userId != user._id))


  }, [onlineUsers1])
  const handleClick = (friendId) => {
    let conversation = conversations.find(c => c.members.includes(user._id) && c.members.includes(friendId) && c.members.length == 2)
    if (!conversation) {
      url.post(`/conversations.json`, {
        members: [friendId, user._id],
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        name: '',

      })
        .then(res => {
          console.log(res)
          url.get(`/conversations/${res.data.name}.json`)
            .then(res => {
              conversation = res.data

              setCurrentChat(conversation)
            })

        })
    }
    setCurrentChat(conversation)
  }
  return (
    <div className='onlineUsersBody'>
      <h2>Activity</h2>
      {onlineUsers?.map(user => {
        return (
          <div style={{ width: "100%" }} onClick={() => handleClick(user.userId)}>
            <OnlineUsersCard user={user} />
          </div>
        )
      })}
    </div>
  )
}

export default OnlineUsers