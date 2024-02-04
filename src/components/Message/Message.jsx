import React, { useEffect, useState } from 'react'
import './Message.css'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import Avatar from '@mui/material/Avatar';
import TimeAgo from 'javascript-time-ago'
import ReactTimeAgo from 'react-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'
import { url } from '../../tools/Database'
import PushPinIcon from '@mui/icons-material/PushPin';
import moment from 'moment';
import { format } from 'timeago.js'
import ReplyIcon from '@mui/icons-material/Reply';
// import Moment from 'react-moment';
// import {moment} from 'react-moment'
import 'moment-timezone';
TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(ru)
import DeleteIcon from '@mui/icons-material/Delete';
function Message({ setRepMsg, message, currentChat, setCurrentChat, scrollToRepMsg }) {
    const [sender, setSender] = useState(null)
    const { user, setUser } = useContext(AuthContext)
    const [msgFeature, setMsgFeature] = useState(false)
    const repMsg = message.repMsg || ''
    useEffect(() => {
        getSender()
    }, [])
    const updateCurrentChat = () => {
        url.get(`conversations/${message.conversationId}.json`).then(res => {
            setCurrentChat(res.data)
        })
    }
    const getSender = () => {

        url.get(`users/${message.senderId}.json`).then(res => {
            setSender(res.data)
        })

    }
    const pinMsg = () => {
        url.post(`pinnedMessages.json`, message).then(res => {
            updateCurrentChat()
        })
            .catch(err => console.log(err))
    }
    const deleteMsg = () => {
        url.delete(`messages/${message._id}.json`)
    }

    // const date = format(message.createdAt, "MMMM do, yyyy H:mma")
    return (
        <>
            {message.type !== 'changeNoti' ? (

                <div 
                style={{marginTop: repMsg ? '1em' : '.5em'}}
                className={user._id === message.senderId ? 'messageCard own' : 'messageCard'}
                    onMouseOver={() => {

                        setMsgFeature(true)

                    }}
                    onMouseLeave={() => setMsgFeature(false)}
                >



                    <div
                        style={{ height: repMsg && '8em' }}
                        className={user._id === message.senderId ? 'message own' : 'message'}>

                        <Avatar alt="Remy Sharp"
                            src={user._id === message.senderId ? user.avatarId : sender?.avatarId}
                            sx={{ width: '2em', height: '2em' }}
                        />
                        {message.type == 'text' &&
                            <div className={message.text.length > 20 ? 'text longText' : 'text'}>
                                {repMsg &&
                                    <div className={user._id === message.senderId ? 'repMsg-bubble-own' : 'repMsg-bubble'} onClick={() => scrollToRepMsg(repMsg._id)}>
                                        <b>Replied to {repMsg?.senderId == user._id ? "you" : repMsg.senderName}</b>
                                        <div className='repMsg-text'>
                                            {repMsg?.text}
                                        </div>
                                    </div>
                                }
                                <span>{message.text}</span>
                            </div>
                        }
                        {message.type == 'img' &&

                            <img src={message.url} className='imgMsg'></img>

                        }
                        <div className='msgFeatures'>
                            {msgFeature && message.senderId == user._id &&
                                <>
                                    <DeleteIcon sx={{ cursor: 'pointer' }} onClick={() => deleteMsg()} />

                                </>
                            }



                            {msgFeature && <>
                                <ReplyIcon sx={{ cursor: 'pointer' }} onClick={() => setRepMsg(message)} />
                                <PushPinIcon sx={{ cursor: 'pointer' }} onClick={() => pinMsg()} />
                            </>}
                        </div>
                    </div>

                    {/* <ReactTimeAgo date={new Date(message.createdAt).toLocaleString()} locale='en-us' className='timeago' /> */}
                    {/* <Moment fromNow>{message.createdAt}</Moment> */}
                    <span className='timeago'>{format(message.createdAt)}</span>

                </div>
            ) : (
                <div style={{ fontWeight: 'bold', color: 'white' }} >
                    {message.text}
                </div>
            )}




        </>
    )
}

export default Message