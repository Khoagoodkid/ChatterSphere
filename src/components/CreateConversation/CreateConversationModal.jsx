import React, { useEffect, useState, useContext } from 'react'
import ReactModal from 'react-modal'
import GetUserList from '../../tools/GetUserList'
import "./CreateConversationModal.css"
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import { url } from '../../tools/Database'
import { AuthContext } from '../../context/AuthContext'
import { database, ref, push, onValue } from '../../tools/firebase'
function CreateConversationModal({ isOpenModal, setIsOpenModal, conversations }) {
    const { user, setUser } = useContext(AuthContext)
    const [members, setMembers] = useState([])
    const [membersId, setMembersId] = useState([])
    const [userList, setUserList] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [groupName, setGroupName] = useState('')
    useEffect(() => {
        setUserList(GetUserList())

    }, [])
    // useEffect(()=>{
    //     setMembers([])

    // },[isOpenModal])
    const filterUser = (query) => {

        return userList.filter((el) => {

            return el.name?.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1 && el._id != user._id ||
                el.email?.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1 && el._id != user._id;

        })

    }

    const addMembers = (newMem) => {

        if (!JSON.stringify(members).includes(JSON.stringify(newMem))) {
            setMembers(current => [...current, newMem])
            setMembersId(current => [...current, newMem._id])

        }

    }
    const deleteMembers = (memberId) => {
        const newMembers = members.filter((member) => {
            return member._id != memberId
        })
        const newMembersId = membersId.filter((id) => {
            return id != memberId
        })
        setMembers(newMembers)
        setMembersId(newMembersId)

    }
    const createConversation = () => {

       
        let check = false
        // if ([...membersId, user._id].length == 2) {
        //     check = conversations.some(c => {
        //         return JSON.stringify(c.members.sort()) == JSON.stringify([...membersId, user._id].sort())
        //     })

        // }
        if (!check) {
            let noGroupName
            if (members.length + 1 > 2 && !groupName) {
                noGroupName = 'Group Chat'
            }
            console.log(check)
            url.post('/conversations.json',{
                members:[...membersId,user._id],
                createdAt:new Date().toLocaleString(),
                updatedAt: new Date().toLocaleString(),
                name: groupName || noGroupName || '',
                typingUsers:[]
            })
            .then(res => {
                setIsOpenModal(false)
                
            })
            push(ref(database, 'conversations'), {
                members: [...membersId, user._id],
                createdAt: new Date().toLocaleString(),
                updatedAt: new Date().toLocaleString(),
                name: groupName || noGroupName || '',
                typingUsers:[]
            })
                .then(res => {
                    setIsOpenModal(false)

                })
        }
    }
    return (
        <ReactModal isOpen={isOpenModal} className='createConversationBody'>
            <div className='createConversationModal'>

                <TextField id="standard-basic" label="Find user" variant="standard" sx={{ width: '90%' }}
                    onChange={(e) => setFilteredUsers(filterUser(e.target.value))}
                />
                <div className='filteredUsersContainer'>

                    {filteredUsers.map((user) => {
                        return (
                            <div className='filteredUser' key={user._id} onClick={() => addMembers(user)}>
                                <Avatar alt="Remy Sharp"
                                    src={user.avatarId}
                                    sx={{ width: '2em', height: '2em' }}
                                />
                                <span>{user.name}</span>

                            </div>
                        )
                    })}
                </div>
                <div className='membersContainer'>
                    <div className='groupName'>
                        <h2>Members</h2>
                        <TextField size='small'
                            disabled={members.length + 1 < 3}
                            label='Group Name'
                            placeholder='Only for groups'
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />

                    </div>
                    <div className='membersDisplay'>
                        {members.map((member) => {
                            return (

                                <div className='memberCard' key={member._id}>
                                    <div className='memberInfo'>

                                        <Avatar alt="Remy Sharp"
                                            src={member.avatarId}
                                            sx={{ width: '2em', height: '2em' }}
                                        />
                                        <span>{member.name}</span>
                                    </div>
                                    <CloseIcon onClick={() => deleteMembers(member._id)} />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='featureBtn'>
                    <button className='btn' onClick={() => setIsOpenModal(false)}>
                        Back
                    </button>
                    <button className='btn' onClick={() => createConversation()}>
                        Create
                    </button>
                </div>
            </div>
        </ReactModal>
    )
}

export default CreateConversationModal