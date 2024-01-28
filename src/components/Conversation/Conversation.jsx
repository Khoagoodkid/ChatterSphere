import React, { useState, useEffect } from 'react'
import './Conversation.css'
import Avatar from '@mui/material/Avatar';
import { url } from '../../tools/Database'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks'
import DoNotDisturbOnTotalSilenceSharpIcon from '@mui/icons-material/DoNotDisturbOnTotalSilenceSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
// import TimeAgo from 'javascript-time-ago'
// import ReactTimeAgo from 'react-time-ago'
// import en from 'javascript-time-ago/locale/en.json'
// import ru from 'javascript-time-ago/locale/ru.json'
// TimeAgo.addDefaultLocale(en)
// TimeAgo.addLocale(ru)
import msgNotiSound from '../../Sound/msgNotiSound.mp3'
import { Howl } from 'howler'
import CircleIcon from '@mui/icons-material/Circle';
import { format } from 'timeago.js'
function Conversation({ conversation, currentUser, deleteConversations,index,currentSelected }) {
  const [user, setUser] = useState(null)
  const [bgColor, setBgColor] = useState(null)
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' })
  const msgNotiPlay = () => {
    const sound = new Howl({
      src: msgNotiSound
    })
    sound.play()
  }
  useEffect(() => {
    if (conversation?.latestMsg?.senderId != currentUser._id) {
      // msgNotiPlay()
    }
  }, [conversation])
  useEffect(() => {

    const friendId = conversation.members.find(mem => {
      return mem != currentUser?._id
    })

    url.get(`/users/${friendId}.json`)
      .then(res => {

        setUser(res.data)
      })




  }, [conversation, currentUser])
  const markAsSpamConversation = () => {
    console.log('hello')
    if (!conversation.spam?.includes(currentUser._id)) {

      url.patch(`conversations/${conversation._id}.json`, {
        spam: [...conversation.spam || [], currentUser._id]
      })
    }
  }
  return (
    <div className={`conversationCard ${conversation._id == currentSelected ? "selected" : ""}`}>
      <div className='conversationInfo'>

        <Avatar src={conversation.members.length > 2 ? conversation.groupPictureUrl : (user?.avatarId)}></Avatar>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%', justifyContent: 'center' }}>
          {conversation.members.length > 2 && <span style={{ textOverflow: 'ellipsis',fontWeight: 'bold', textAlign:'left'}}>{conversation?.name || 'Group Chat'}</span>}
          {conversation.members.length == 2 && <span style={{ textOverflow: 'ellipsis',fontWeight: 'bold' }}>{user?.name}</span>}
          <div style={{ fontSize: '0.85em', color: 'white', display: 'flex',letterSpacing:'0em' }}>
            <span  >{conversation?.latestMsg?.senderId == currentUser._id && 'You:'}</span>
            <span>{conversation?.latestMsg?.text?.substring(0, 6)}</span>
            <span >{conversation?.latestMsg?.text?.length > 6 && '...'}</span>

            <CircleIcon style={{ width: '.2em', marginLeft: '0.5em' }} />
            {conversation.latestMsg && <span style={{ marginLeft: '0.1em' }}>
              {format(new Date(conversation?.latestMsg?.createdAt))}

            </span>}

          </div>
        </div>
      </div>
      <MoreHorizIcon sx={{ cursor: 'pointer' }} {...bindTrigger(popupState)} />
      <Menu {...bindMenu(popupState)}>
        <MenuItem onClick={() => {
          popupState.close
          deleteConversations(conversation._id)
        }} >
          <DeleteSharpIcon />
          Delete conversation
        </MenuItem>
        <MenuItem onClick={() => {
          popupState.close
          markAsSpamConversation()

        }}>
          <DoNotDisturbOnTotalSilenceSharpIcon onClick={() => {
          }} />
          Mark as spam
        </MenuItem>
      </Menu>




    </div>
  )
}

export default Conversation