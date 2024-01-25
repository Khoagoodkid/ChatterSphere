import React, { useState, useContext, useEffect, useRef } from 'react'
import './ChatWindow.css'
import { CurrentChatContext } from '../../pages/Messenger/Messenger'
import { url } from '../../tools/Database'
import { AuthContext } from '../../context/AuthContext'
import { database, ref, push, onValue } from '../../tools/firebase'
import { remove, set } from 'firebase/database'
import Message from '../Message/Message'
import { storage } from '../../tools/firebase'
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ConversationMenu from '../ConversationMenu/ConversationMenu'
import GetUserList from '../../tools/GetUserList'
import ImageIcon from '@mui/icons-material/Image';

import ChosenImgContainer from '../ChosenImgContainer/ChosenImgContainer'
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Welcome from '../Welcome/Welcome'
function ChatWindow() {
    const { user, setUser } = useContext(AuthContext)
    const { currentChat, setCurrentChat } = useContext(CurrentChatContext)
    const [text, setText] = useState('')
    const [messages, setMessages] = useState([])
    const [menu, setMenu] = useState(false)
    const [userList, setUserList] = useState([])
    const [chosenImg, setChosenImg] = useState([])
    const [chosenImgFile, setChosenImgFile] = useState([])
    const msgRef = useRef()
    const typingUserRef = useRef()
    const [msgFeature, setMsgFeature] = useState({})
    const [nonGroupName, setNonGroupName] = useState(null)
    const [typingUsers, setTypingUsers] = useState([])
    useEffect(() => {
        setUserList(GetUserList())
    }, [])
    useEffect(() => {
        getMsg()
        getNonGroupName()
        setMenu(false)
        fetchTypingUsers()
    }, [currentChat])
    useEffect(() => {
        typingUserRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [typingUsers])
    useEffect(() => {
        msgRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    const sendMsg = (e) => {
        e.preventDefault()

        if (text) {


            push(ref(database, 'messages'), {
                text,
                senderId: user._id,
                conversationId: currentChat._id,
                createdAt: Date.now(),
                type: 'text'
            })
                .then(res => {
                    updateConversationDate()
                    updateLatestMsg(text)
                    setText('')
                    remove(ref(database, `typingUsers/${currentChat?._id}/${user._id}`))
                })
        }

    }
    const updateConversationDate = () => {
        set(ref(database, `conversations/${currentChat._id}`), {
            ...currentChat,
            updatedAt: Date.now()
        })
    }
    const getMsg = () => {
        onValue(ref(database, 'messages'), (data) => {
            const msg = []
            data.forEach(d => {
                // console.log({currentChat:currentChat._id,conversationId:d.val().conversationId})


                msg.push({
                    ...d.val(),
                    _id: d.key
                })

            })
            const filteredMsg = msg.filter(msg => {
                return msg.conversationId == currentChat?._id
            })
            filteredMsg.sort((a, b) => {
                return new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            })
            setMessages(filteredMsg)

        })




    }

    const viewChosenImg = (e) => {
        const file = e.target.files[0]
        setChosenImgFile(current => [...current, file])
        setChosenImg(current => [...current, URL.createObjectURL(file)])

    }
    const updateLatestMsg = (text) => {
        url.patch(`conversations/${currentChat._id}.json`, {
            latestMsg: {
                senderId: user._id,
                text,
                createdAt: new Date().toLocaleString()
            }
        })
    }
    const getNonGroupName = () => {
        const friendId = currentChat?.members.find(memberId => {
            return memberId != user._id
        })
        url.get(`users/${friendId}.json`).then(res => {
            setNonGroupName(res?.data?.name)

        })

    }
    const pushTypingUsers = (text) => {

        if (text) {

            set(ref(database, `typingUsers/${currentChat?._id}/${user._id}`),
                user.avatarId
            )
        } else {

            remove(ref(database, `typingUsers/${currentChat?._id}/${user._id}`)

            )
        }
    }
    const fetchTypingUsers = () => {
        onValue(ref(database, `typingUsers/${currentChat?._id}`), (data) => {
            const typingUsers1 = []
            data.forEach(d => {
                if (d.key != user._id) {

                    typingUsers1.push(d.val())
                }
            })
            console.log(typingUsers1)
            setTypingUsers(typingUsers1)
        })
    }
    return (
        <div className='chatWindowBody'>
            <div className='chatWindow'>

                <div className='topChatWindow'>
                    <div>
                        <h3>
                            {currentChat?.members.length > 2 && (currentChat?.name || 'Group Chat')}
                            {currentChat?.members.length == 2 && nonGroupName}

                        </h3>
                    </div>
                    {currentChat &&
                        <div className='features'>
                            {menu ? (
                                <CloseIcon onClick={() => setMenu(false)}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                    fontSize='large'
                                />
                            ) : (

                                <MenuIcon onClick={() => setMenu(true)}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                    fontSize='large'
                                />
                            )}


                        </div>
                    }



                </div>
                {currentChat ? (
                    <>
                        <div style={{
                            width: 'auto', height: chosenImg.length > 0 ? '68%' : '80%', backgroundImage: `url(${currentChat.backgroundUrl})`,
                            backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%', backgroundColor: currentChat.backgroundUrl ? 'rgba(8, 4, 32,0.5)' : '#080420'
                        }}>


                            <div className='messagesDisplay' >
                                {messages.map((message, index) => {

                                    return (
                                        <div key={message._id} ref={msgRef} id={message._id}>


                                            <Message message={message} currentChat={currentChat} setCurrentChat={setCurrentChat} />

                                        </div>
                                    )

                                })}
                                <div className='typingUsersContainer' ref={typingUserRef}>
                                    <AvatarGroup max={3}>
                                        {typingUsers.map(ty => {
                                            return (
                                                <Avatar src={ty} style={{ '--i': '1' }} className='typingText' />
                                            )
                                        })}
                                    </AvatarGroup>
                                    {typingUsers.length > 0 && <div style={{marginLeft:'.2em'}}>
                                        <span style={{ '--i': '2' }} className='typingText'>i</span>
                                        <span style={{ '--i': '3' }} className='typingText'>s</span>

                                        <span style={{ '--i': '4', marginLeft: '.3em' }} className='typingText'>t</span>
                                        <span style={{ '--i': '5' }} className='typingText'>y</span>
                                        <span style={{ '--i': '6' }} className='typingText'>p</span>
                                        <span style={{ '--i': '7' }} className='typingText'>i</span>
                                        <span style={{ '--i': '8' }} className='typingText'>n</span>
                                        <span style={{ '--i': '9' }} className='typingText'>g</span>

                                        <span style={{ '--i': '10' }} className='typingText'>.</span>
                                        <span style={{ '--i': '11' }} className='typingText'>.</span>
                                        <span style={{ '--i': '12' }} className='typingText'>.</span>
                                    </div>}

                                </div>

                            </div>
                        </div>
                        {chosenImg.length > 0 && <ChosenImgContainer chosenImg={chosenImg}
                            setChosenImg={setChosenImg}
                            currentChat={currentChat}
                            user={user}
                            chosenImgFile={chosenImgFile}
                            setChosenImgFile={setChosenImgFile}
                        />}
                        <form className='chatInput' onSubmit={sendMsg}>

                            <label htmlFor="file-input">
                                <ImageIcon fontSize='large' style={{ display: 'inline-block', cursor: 'pointer' }} />

                            </label>
                            <input type='file' id='file-input' style={{ display: 'none' }}
                                onChange={viewChosenImg}
                            />

                            <input className='textArea' onChange={e => {
                                setText(e.target.value)
                                pushTypingUsers(e.target.value)
                            }
                            }
                                value={text}
                            />
                            <SendIcon type='submit'
                                fontSize='large'
                                sx={{ color: 'white', cursor: 'pointer' }}
                                onClick={sendMsg} />


                        </form>
                    </>
                ) : (
                    <Welcome user={user} />
                )}
            </div>
            <div className={menu ? ('conversationMenu active') : ('conversationMenu')} >

                <ConversationMenu menu={menu} currentChat={currentChat} setCurrentChat={setCurrentChat} user={user} />
            </div>
        </div>
    )
}

export default ChatWindow