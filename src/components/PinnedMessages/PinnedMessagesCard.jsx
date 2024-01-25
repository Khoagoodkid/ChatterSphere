import React, { useState } from 'react'
import './PinnedMessagesCard.css'
import { url } from '../../tools/Database'
import { useEffect } from 'react'
import Avatar from '@mui/material/Avatar';
import { format } from 'date-fns'
import DeleteIcon from '@mui/icons-material/Delete';

function PinnedMessagesCard({ message }) {
    const [sender, setSender] = useState(null)
    useEffect(() => {
        getSender()
    }, [])
    const getSender = () => {
        url.get(`users/${message.senderId}.json`).then(res => {
            setSender(res.data)
        })
    }
    const deletePinnedMsg = () => {
        url.delete(`pinnedMessages/${message._id}.json`)
    }
    return (
        <div className='pinnedMsgCard'>
            <Avatar src={sender?.avatarId} />   
            <div className='msgDisplay'>
                <div className='senderInfo'>
                    <div style={{gap:'0.5em',display:'flex'}}>
                        <span>{sender?.name}</span>
                        <span>{format(new Date(message.createdAt), 'dd/MM/yyyy')}</span>

                    </div>
                    <DeleteIcon onClick={()=>deletePinnedMsg()} style={{cursor:'pointer'}}/>
                </div>
                {message.type == 'text' &&
                      <div className='text'>
                      {message.text}
                  </div>
                }
                {message.type == 'img'&& 
                <img src={message.url} style={{height:'15em',width:'15em'}}/>
                }
              
            </div>
        </div>
    )
}

export default PinnedMessagesCard