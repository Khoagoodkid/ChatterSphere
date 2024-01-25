import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import Avatar from '@mui/material/Avatar';
import './ChatMenu.css'
import AddCommentIcon from '@mui/icons-material/AddComment';
import TextField from '@mui/material/TextField'
import CreateConversationModal from '../CreateConversation/CreateConversationModal';
import { url } from '../../tools/Database';
import Conversation from '../Conversation/Conversation';
import { CurrentChatContext } from '../../pages/Messenger/Messenger';
import { database, ref, push, onValue } from '../../tools/firebase'
import { storage } from '../../tools/firebase';
import { listAll, getDownloadURL } from 'firebase/storage'
import { remove } from 'firebase/database'
import { avatarRef } from '../../tools/GetAvatar';
import { Howl, Howler } from 'howler';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PeopleIcon from '@mui/icons-material/People';
import DoNotDisturbOnTotalSilenceSharpIcon from '@mui/icons-material/DoNotDisturbOnTotalSilenceSharp';
import OnlineUsers from '../OnlineUsers/OnlineUsers';
function ChatMenu() {
    const { user, setUser } = useContext(AuthContext)
    const { currentChat, setCurrentChat } = useContext(CurrentChatContext)
    const [openModal, setOpenModal] = useState(false)
    const [conversations, setConversations] = useState([])
    const [avatar, setAvatar] = useState(null)
    const [filteredConversations, setFilteredConversations] = useState([])
    const [openConversations, setOpenConversations] = useState(true)
    const [openSpamConversations, setOpenSpamConversations] = useState(false)
    const [spamConversations, setSpamConversations] = useState([])
    const [openOnlineUsers, setOpenOnlineUsers] = useState(false)
    const [currentSelected,setCurrentSelected] = useState(null)
    useEffect(() => {

        getConversations()


    }, [])

    const getConversations = () => {
        onValue(ref(database, 'conversations'), (data) => {
            const getCon = []
            const getSpam = []
            data.forEach((d) => {
                // console.log(d.val())
                if (d.val().members?.includes(user._id) && !d.val().spam?.includes(user._id)) {

                    getCon.push({
                        ...d.val(),
                        _id: d.key
                    })
                } else if (d.val().members?.includes(user._id) && d.val().spam?.includes(user._id)) {
                    getSpam.push({
                        ...d.val(),
                        _id: d.key
                    })
                }
            })
            getCon.sort((a, b) => {
                return new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
            })
            setConversations(getCon)
            setFilteredConversations(getCon)
            setSpamConversations(getSpam)
        })



    }
    const deleteConversations = (id) => {
        remove(ref(database, `conversations/${id}`))
    }

    const filterConversations = (query) => {
        return conversations.filter((el) => {

            return el.name?.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1


        })
    }
    const getSpamConversations = () => {

    }
    const logOut = () => {
        setUser(null)

    }
    return (
        <div className='chatMenuBody' >

            <div className='topMenu'>
                <button onClick={() => logOut()}>Log Out</button>
                <div className='userInfo'>
                    <Avatar
                        src={user.avatarId}
                        sx={{ width: '2em', height: '2em' }}

                    />
                    <span>{user?.name}</span>
                </div>


            </div>
            <div className='bodyMenu'>
                <div className='createConversation'>
                    <TextField id="standard-basic"
                        label="Find Conversation"
                        variant="standard"
                        inputProps={{
                            style: { color: 'white' }
                        }}
                        sx={{ input: { color: 'white' }, label: { color: 'white' }, width: '80%' }}
                        onChange={(e) => setFilteredConversations(filterConversations(e.target.value))}
                    />
                    <AddCommentIcon
                        sx={{ width: '1em', height: '1em', float: 'right', marginTop: '1em', cursor: 'pointer', color: 'white' }}
                        onClick={() => setOpenModal(true)}
                    />
                </div>
                <CreateConversationModal isOpenModal={openModal} setIsOpenModal={setOpenModal} conversations={conversations} />
                {openConversations && <div className='conversationsDisplay'>
                    <h2>Conversations</h2>
                    {filteredConversations.map((c,index) => {

                        return (
                            <div 
                            key={index}
                           
                            onClick={() => {
                                setCurrentChat(c)
                                setCurrentSelected(c._id)
                            }}>

                                <Conversation key={c._id}
                                    conversation={c}
                                    currentUser={user}
                                    deleteConversations={deleteConversations}
                                    index = {index}
                                    currentSelected = {currentSelected}
                                />
                            </div>
                        )
                    })}
                </div>}
                {openSpamConversations && <div className='conversationsDisplay'>
                    <h2>Spammed Conversations</h2>
                    {spamConversations.map((c,index) => {
                        return (
                            <div key={index}
                            
                            onClick={() => {
                                setCurrentChat(c)

                            }}>
                              
                                <Conversation key={c._id}
                                    conversation={c}
                                    currentUser={user}
                                    deleteConversations={deleteConversations}
                                />
                            </div>
                        )
                    })}
                </div>}
                {openOnlineUsers &&
                    <OnlineUsers setCurrentChat={setCurrentChat}
                        user={user}
                        conversations = {conversations}
                    />}

            </div>
            <div className='navigators'>
                <ChatBubbleIcon className='navigator' onClick={() => {
                    setOpenConversations(true)
                    setOpenSpamConversations(false)
                    setOpenOnlineUsers(false)
                }} />
                <PeopleIcon className='navigator' onClick={() => {
                    setOpenConversations(false)
                    setOpenSpamConversations(false)
                    setOpenOnlineUsers(true)
                }} />
                <DoNotDisturbOnTotalSilenceSharpIcon className='navigator' onClick={() => {
                    setOpenConversations(false)
                    setOpenSpamConversations(true)
                    setOpenOnlineUsers(false)
                }} />
            </div>

        </div>
    )
}

export default ChatMenu