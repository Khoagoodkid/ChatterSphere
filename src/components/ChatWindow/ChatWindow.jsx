import React, { useState, useContext, useEffect, useRef } from 'react'
import './ChatWindow.css'
import { CurrentChatContext, SocketContext } from '../../pages/Messenger/Messenger'
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
import { v1 as uuid } from "uuid";
import ChosenImgContainer from '../ChosenImgContainer/ChosenImgContainer'
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Welcome from '../Welcome/Welcome'
import VideoCallIcon from '@mui/icons-material/VideoCall';
import VideoCall from '../VideoCall/VideoCall'
import Peer from 'peerjs'
import IncomingCall from '../IncomingCall/IncomingCall'
import Picker from 'emoji-picker-react';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
function ChatWindow() {
    const { user, setUser } = useContext(AuthContext)
    const { currentChat, setCurrentChat } = useContext(CurrentChatContext)
    const socket = useContext(SocketContext)
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
    const [repMsg, setRepMsg] = useState(null)
    const repMsgRef = useRef()
    const [isOpenVidCallWindow, setIsOpenVidCallWindow] = useState(false)
    const [roomId, setRoomId] = useState(null)
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const callInstance = useRef(null)
    const [receiver, setReceiver] = useState(null)
    const [isIncomingCall, setIsIncomingCall] = useState(false)
    const [callerPeerId, setCallerPeerId] = useState(null)
    const [isParterCamHidden, setIsParterCamHidden] = useState(false)
    const [showPicker, setShowPicker] = useState(false);
    const connRef = useRef(null)
    useEffect(() => {
        if (!user) return
        // console.log(user.peerId)
        const peer = new Peer(user.peerId);
        peer.on('open', (id) => {

            setPeerId(id)

        });
        peer.on('error', err => {
            console.error(err);
        });

        peer.on('call', (call) => {
            setCallerPeerId(call.peer)
            callInstance.current = call
            setIsIncomingCall(true)



        })

        peerInstance.current = peer;
        return () => {
            peer.destroy()
        }
    }, [])
    useEffect(() => {
        if (isIncomingCall) document.getElementById("incoming_sound").play()
        else document.getElementById("incoming_sound").pause()
    }, [isIncomingCall])
    useEffect(() => {
        if (connRef.current) {
            console.log(connRef.current)
            connRef.current.on('data', (data) => {
                if (data.action === 'hideCam') {
                    console.log('Partner has muted their audio.');
                    // Update the UI or state accordingly, e.g., set a state to show a mute icon
                } else if (data.action === 'unmute') {
                    console.log('Partner has unmuted their audio.');
                    // Update the UI or state accordingly, e.g., remove the mute icon
                }
            });
        }
    }, [connRef.current])
    const notifyPartner = (action) => {
        connRef.current.send({ action: action });
    }

    const answerCall = () => {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        connRef.current = peerInstance.current.connect(callerPeerId)
        setIsOpenVidCallWindow(true)
        setIsIncomingCall(false)
        getUserMedia({ video: true, audio: true }, (mediaStream) => {
            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();
            callInstance.current.answer(mediaStream)
            callInstance.current.on('stream', function (remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream
                remoteVideoRef.current.play();
            });
        });
    }

    const call = (remotePeerId) => {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        connRef.current = peerInstance.current.connect(remotePeerId)

        getUserMedia({ video: true, audio: true }, (mediaStream) => {

            currentUserVideoRef.current.srcObject = mediaStream;
            currentUserVideoRef.current.play();

            const call = peerInstance.current.call(remotePeerId, mediaStream)

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream
                remoteVideoRef.current.play();
            });

            callInstance.current = call
        });
    }


    useEffect(() => {
        setUserList(GetUserList())
    }, [])
    useEffect(() => {
        getMsg()
        getNonGroupName()
        setMenu(false)
        fetchTypingUsers()
        setRepMsg(null)
    }, [currentChat])
    useEffect(() => {
        typingUserRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [typingUsers])
    useEffect(() => {
        msgRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    useEffect(() => {
        repMsgRef.current?.scrollIntoView({ behavior: 'smooth' })

    }, [repMsg])

    const scrollToRepMsg = (id) => {
        document.getElementById(id)?.scrollIntoView({ block: "center", inline: "nearest" });
    }


    const sendMsg = (e) => {
        e.preventDefault()

        if (text) {


            push(ref(database, 'messages'), {
                text,
                senderId: user._id,
                conversationId: currentChat._id,
                createdAt: Date.now(),
                senderName: user.name,
                type: 'text',
                repMsg: repMsg
            })
                .then(res => {
                    updateConversationDate()
                    updateLatestMsg(text)
                    setText('')
                    remove(ref(database, `typingUsers/${currentChat?._id}/${user._id}`))
                    setRepMsg(null)
                    setShowPicker(false)
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
    const getNonGroupName = async () => {
        if (currentChat?.members.length > 2) return
        const friendId = currentChat?.members.find(memberId => {
            return memberId != user._id
        })
        await url.get(`users/${friendId}.json`).then(res => {

            setNonGroupName(res?.data?.name)
            url.patch(`conversations/${currentChat._id}.json`, {
                name: res?.data?.name
            })

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

            setTypingUsers(typingUsers1)
        })
    }
    useEffect(() => {

    }, [])

    const createVidCall = async () => {
        const receiverID = currentChat?.members.find(m => m != user._id)
        let peerId = null
        await url.get(`/users/${receiverID}.json`).then((res) => {
            peerId = res.data.peerId
            setReceiver({
                ...res.data,
                _id: receiverID
            })
            // console.log(res.data)

        })

        if (peerId) {
            console.log(peerId)
            call(peerId)
        }

        setIsOpenVidCallWindow(true)

        // setIsIncomingCall(false)
    }
    const onEmojiClick = (emojiObject) => {
        setText((prevInput) => prevInput + emojiObject.emoji);

    };

    return (
        <div className='chatWindowBody'>
            <audio src={'/sound/incoming_call.mp3'}
                id="incoming_sound"
                loop
                hidden
            />
            <IncomingCall
                isOpen={isIncomingCall}
                setIsIncomingCall={setIsIncomingCall}
                setIsOpenVidCallWindow={setIsOpenVidCallWindow}
                callerPeerId={callerPeerId}
                userList={userList}
                answerCall={answerCall}

            />

            <VideoCall
                isOpen={isOpenVidCallWindow}
                receiver={receiver}
                setIsOpen={setIsOpenVidCallWindow}
                currentUserVideoRef={currentUserVideoRef}
                remoteVideoRef={remoteVideoRef}
                peerInstance={peerInstance}
                callInstance={callInstance}
                notifyPartner={notifyPartner}
            />
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
                            <VideoCallIcon
                                onClick={() => createVidCall()}
                                sx={{ color: 'white', cursor: 'pointer' }}
                                fontSize='large'
                            />
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


                                            <Message
                                                setRepMsg={setRepMsg}
                                                message={message}
                                                currentChat={currentChat}
                                                setCurrentChat={setCurrentChat}
                                                scrollToRepMsg={scrollToRepMsg}
                                            />

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
                                    {typingUsers.length > 0 && <div style={{ marginLeft: '.2em' }}>
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
                            {repMsg &&
                                <div style={{ width: '100%', position: 'absolute', bottom: '100%', left: '0' }} ref={repMsgRef}>
                                    <RepMsgCard repMsg={repMsg} setRepMsg={setRepMsg} user={user} />
                                </div>
                            }
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
                            <div style={{ position: 'relative',display:'flex', alignItems:'center' }}>
                                <Picker open={showPicker} style={{ position: 'absolute', bottom: '120%', right: '10%' }}
                                    onEmojiClick={onEmojiClick}
                                />
                                <EmojiEmotionsIcon onClick={() => setShowPicker(!showPicker)}
                                    fontSize='large'
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                />
                            </div>

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
const RepMsgCard = ({ repMsg, setRepMsg, user }) => {
    const [senderName, setSenderName] = useState(null)
    const getSenderName = async () => {
        let sender
        await url.get(`users/${repMsg?.senderId}.json`).then(res => {
            sender = res.data

        })
        if (sender) setSenderName(sender.name)
    }
    useEffect(() => {
        getSenderName()
    }, [repMsg])
    return (
        <div className='rep-msg'>
            <div style={{ position: 'absolute', top: '0', right: '1em' }}>
                <CloseIcon onClick={() => { setRepMsg(null) }} sx={{ color: 'white', cursor: 'pointer' }} />
            </div>
            {<span>Replying to {repMsg.senderId == user._id ? "yourself" : (repMsg.senderName || senderName)}</span>}
            {repMsg.text}

        </div>
    )
}

export default ChatWindow