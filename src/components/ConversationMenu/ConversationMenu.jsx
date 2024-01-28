import React, { useState } from 'react'
import { useEffect } from 'react'
import { url } from '../../tools/Database'
import Avatar from '@mui/material/Avatar';
import './ConversationMenu.css'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AvatarGroup from '@mui/material/AvatarGroup';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import TextField from '@mui/material/TextField'
import GetUserList from '../../tools/GetUserList';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import PushPinIcon from '@mui/icons-material/PushPin';
import WallpaperRoundedIcon from '@mui/icons-material/WallpaperRounded';
import SearchIcon from '@mui/icons-material/Search';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage'
import { v4 } from 'uuid';
import { storage } from '../../tools/firebase'
import PinnedMessages from '../PinnedMessages/PinnedMessages';
import ReactModal from 'react-modal';
import { set } from 'firebase/database';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { pinnedMsgRef, onValue, push } from '../../tools/firebase';
function ConversationMenu({ menu, currentChat, setCurrentChat, user }) {

    const [members, setMembers] = useState([])
    const [memberAvatar, setMemberAvatar] = useState([])
    const [membersId, setMembersId] = useState([])
    const [showMember, setShowMember] = useState(false)
    const [userList, setUserList] = useState([])
    const [nonMembers, setNonMembers] = useState([])
    const [filteredNonMembers, setFilteredNonMembers] = useState([])
    const [showInvitations, setShowInvitations] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [bg, setBg] = useState(null)
    const [openPinnedMsg, setOpenPinnedMsg] = useState(false)
    const [pinnedMsg, setPinnedMsg] = useState([])
    const [friend, setFriend] = useState(null)
    const setGroupPicture = (picture) => {
        if (picture) {

            const picId = v4()
            uploadBytes(ref(storage, `groupPicture/${picId}`), picture).then(() => {


                listAll(ref(storage, `groupPicture`)).then(data => {
                    const groupPic = data.items.find((item) => {
                        return item.name == picId
                    })
                    getDownloadURL(groupPic).then(url1 => {
                        url.patch(`conversations/${currentChat._id}.json`, {
                            groupPictureUrl: url1
                        }).then(res => {
                            updateCurrentChat()
                            sendChangeNoti('changed group picture')
                        })
                    })
                })

            })
        }
    }
    const findMessages = () => {

    }
    const groupFeatures = [
        {
            name: 'Group Picture',
            icon: <label htmlFor='groupPic'>
                <WallpaperRoundedIcon />
                <input type='file' style={{ display: 'none' }} id='groupPic'
                    onChange={(e) => setGroupPicture(e.target.files[0])}
                />
            </label>,
            fucntion: setGroupPicture()
        },
        {
            name: 'Find Messages',
            icon: <SearchIcon />,
            fucntion: findMessages()
        }
    ]
    useEffect(() => {
        setUserList(GetUserList())
    }, [])
    useEffect(() => {
        getMembers()
        setShowMember(false)
        getNonMembers()
        setShowInvitations(false)
        getPinnedMsg()
        nonGroupChat()
    }, [currentChat])
    const updateCurrentChat = () => {
        url.get(`conversations/${currentChat._id}.json`).then(res => {
            setCurrentChat(res.data)
        })
    }
    const getMembers = async () => {
        const members = []
        const memberAvatar = []
        const memberId = []
        await currentChat?.members.map((member) => {
            url.get(`/users/${member}.json`).then(res => {

                members.push({
                    ...res.data,
                    _id: member
                })
                memberAvatar.push(res.data.avatarId)
                memberId.push(member)
            })
        })

        setMembers(members)
        setMemberAvatar(memberAvatar)
        setMembersId(memberId)
    }
    const getNonMembers = () => {
        const nonMembers = userList.filter(user => {
            return !currentChat?.members.includes(user._id)
        })
        setNonMembers(nonMembers)
        setFilteredNonMembers(nonMembers)
    }
    const filterUser = (query) => {

        return nonMembers.filter((el) => {

            return el.name?.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1 ||
                el.email?.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1

        })

    }
    const addMembers = (newMem, index) => {
        // console.log(currentChat)
        url.patch(`conversations/${currentChat._id}.json`, {
            _id: currentChat._id,
            members: [...currentChat.members, newMem._id],
            createdAt: currentChat.createdAt
        }
        ).then((res) => {
            // url.patch(`conversations/${currentChat._id}.json`, {
            //     name: ''
            // })
            updateCurrentChat()
            sendChangeNoti(`added ${newMem.name} to the group`)

        })

    }
    const changeGroupName = () => {
        if (newGroupName) {

            url.patch(`conversations/${currentChat._id}.json`, {
                ...currentChat,
                name: newGroupName
            }).then(res => {
                setNewGroupName('')
                updateCurrentChat()
            })
        }
    }

    const groupChat = () => {

        return (
            <>
                <span style={{ fontSize: '2.5em', lineHeight: '1em' }}>{currentChat?.name || 'Group Chat'}</span>
                {currentChat?.groupPictureUrl ? (<Avatar src={currentChat?.groupPictureUrl}
                    sx={{ width: '5em', height: '5em' }}
                />) : (

                    <AvatarGroup max={3}>
                        {memberAvatar.map((avatar) => {
                            return (
                                <Avatar src={avatar} />
                            )
                        })}
                    </AvatarGroup>

                )}
                <div className='groupFeatures'>
                    {groupFeatures.map((feature) => {
                        return (
                            <div className='featureIcon'>
                                {feature.icon}
                            </div>
                        )
                    })}

                </div>

            </>
        )
    }
    const nonGroupChat = () => {
        const friendId = currentChat?.members.find(memberId => {
            return memberId != user._id
        })
        let friend
        url.get(`users/${friendId}.json`).then(res => {
            setFriend(res.data)
        })

    }
    const handleBackgroundChange = (bg) => {
        if (bg) {

            const bgId = v4()
            uploadBytes(ref(storage, `conversationBg/${bgId}`), bg).then(() => {
                listAll(ref(storage, `conversationBg`)).then(data => {
                    const bg1 = data.items.find((item) => {
                        return item.name == bgId
                    })
                    getDownloadURL(bg1).then(bgUrl => {
                        url.patch(`conversations/${currentChat._id}.json`, {
                            ...currentChat,
                            backgroundUrl: bgUrl
                        }).then(res => {
                            updateCurrentChat()
                        })
                    })
                })
            })
        }

    }
    const getPinnedMsg = () => {

        // url.get(`pinnedMessages.json`).then(res => {
        //     for (const key in res.data) {
        //         if (currentChat?._id == res.data[key].conversationId) {

        //             pinnedMsg1.push(
        //                 res.data[key]
        //             )
        //         }
        //     }
        //     setPinnedMsg(pinnedMsg1)
        // })
        onValue(pinnedMsgRef, (data) => {
            const getPinnedMsg = []
            data.forEach(d => {
                if (d.val().conversationId == currentChat?._id) {
                    getPinnedMsg.push({
                        ...d.val(),
                        _id: d.key
                    })
                }
            })
            setPinnedMsg(getPinnedMsg)
        })

    }
    const deleteMembers = (removedMember) => {

        const updatedMembers = membersId.filter((member) => {
            return member != removedMember._id
        })

        url.patch(`conversations/${currentChat._id}.json`, {

            members: updatedMembers
        }).then(res => {
            updateCurrentChat()
            sendChangeNoti(`removed ${removedMember.name} from the group `)
        })
    }
    const sendChangeNoti = (change) => {
        url.post(`messages.json`, {
            text: `${user.name}` + ' ' + `${change}`,
            senderId: user._id,
            conversationId: currentChat._id,
            createdAt: new Date().toLocaleString(),
            type: 'changeNoti'
        })
    }
    const leaveGroup = (leaveMem) => {
        const newMembers = currentChat.members.filter(member => {
            return member != leaveMem._id
        })
        url.patch(`conversations/${currentChat._id}.json`, {

            members: newMembers,

        }
        ).then((res) => {
            // url.patch(`conversations/${currentChat._id}.json`, {
            //     name: ''
            // })
            // updateCurrentChat()
            setCurrentChat(null)
            sendChangeNoti(` left the group`)

        })
    }
    return (


        <div className='conversationMenuBody'>
            {menu ? (
                <>
                    <div className='conversationInfo'>
                        {members.length > 2 && groupChat()}
                        {members.length == 2 && <>
                            <span style={{ fontSize: '2em', lineHeight: '1em' }}>{friend?.name}</span>
                            <Avatar src={friend.avatarId} sx={{ width: '5em', height: '5em' }} />
                        </>}
                    </div>
                    <div className='conversationName'>
                        {members.length > 2 &&

                            <div className='changeNameBtn'>

                                <EditIcon sx={{ marginLeft: '.8em' }} />
                                <TextField placeholder='Change group name' variant='standard' sx={{ input: { color: 'white' }, placeholder: { color: 'white' } }}
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                                <CheckIcon sx={{ cursor: 'pointer' }}
                                    style={{marginRight:'1em'}}
                                    onClick={() => {
                                        changeGroupName()
                                        sendChangeNoti('changed group name')
                                    }}
                                />
                            </div>
                        }

                    </div>
                    <label className='conversationBackground' htmlFor='background-change'>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>

                            <WallpaperIcon sx={{ marginLeft: '.8em' }} />
                            <span >Change background </span>
                            <input type='file' id='background-change' style={{ display: 'none' }}
                                onChange={(e) => {

                                    handleBackgroundChange(e.target.files[0])
                                    sendChangeNoti('changed background')
                                }
                                }
                            />
                        </div>

                    </label>
                   {currentChat?.members.length >2 && <div className='leaveGroup' onClick={() => leaveGroup(user)}>
                        <MeetingRoomIcon sx={{ marginLeft: '.8em' }} />
                        <span>Leave Group</span>


                    </div>} 
                    <div className='conversationPinnedMsg' onClick={() => setOpenPinnedMsg(true)}>
                        <PushPinIcon sx={{ marginLeft: '.8em' }} />

                        <span>Pinned Messages</span>



                    </div>
                    <PinnedMessages openPinnedMsg={openPinnedMsg} setOpenPinnedMsg={setOpenPinnedMsg} pinnedMsg={pinnedMsg} />
                    <div className='invitation'>
                        <div className='invitationBtn' onClick={() => setShowInvitations(!showInvitations)}>

                            <GroupAddIcon sx={{ marginLeft: '.8em' }} />
                            <span>Invite more friends</span>
                        </div>
                        {showInvitations && <div className='invitationDisplay'>
                            <TextField id="standard-basic"
                                variant="standard"
                                sx={{ label: { color: 'white' }, input: { color: 'white' }, width: '100%' }}
                                label='Find Friends'
                                onChange={(e) => setFilteredNonMembers(filterUser(e.target.value))}

                            />
                            {filteredNonMembers?.map((nonMember, index) => {
                                return (
                                    <div className='nonMemberCard' key={nonMember._id} onClick={() => addMembers(nonMember, index)}>
                                        <Avatar src={nonMember.avatarId} />
                                        <span>{nonMember.name}</span>
                                    </div>
                                )
                            })}
                        </div>}


                    </div>
                    <div className='membersDisplay'>
                        <div className='memberBtn' onClick={() => setShowMember(!showMember)}>
                            <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                                <GroupIcon />
                                <span>See group members</span>
                            </div>
                            {!showMember && <KeyboardArrowDownIcon sx={{ color: 'white', cursor: 'pointer' }} onClick={() => setShowMember(true)} />}
                            {showMember && <KeyboardArrowUpIcon sx={{ color: 'white', cursor: 'pointer' }} onClick={() => setShowMember(false)} />}
                        </div>
                        <div className={showMember ? 'members active' : 'members'}>
                            {showMember ? (

                                members.map((member) => {
                                    return (
                                        <div className='memberCard'>
                                            <div className='memberInfo'>
                                                <Avatar src={member.avatarId} />
                                                <span>{member.name}</span>
                                            </div>
                                            {members.length > 2 && member._id != user._id && <RemoveCircleIcon onClick={() => deleteMembers(member)} />}
                                        </div>
                                    )
                                })

                            ) : ('')}

                        </div>

                    </div>

                </>
            ) : ('')}

        </div>
    )
}

export default ConversationMenu