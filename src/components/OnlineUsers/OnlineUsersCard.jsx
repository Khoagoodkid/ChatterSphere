import React, { useState } from 'react'
import "./OnlineUsersCard.css"
import { url } from '../../tools/Database'
import Avatar from '@mui/material/Avatar';
import { useEffect } from 'react';
import Badge from '@mui/material/Badge';

function OnlineUsersCard({ user }) {
    const [onlineUser, setOnlineUser] = useState(null)
    useEffect(() => {
        fetchUser()
    }, [])
    const fetchUser = async () => {
        const res = await url.get(`/users/${user?.userId}.json`)

        setOnlineUser(res.data)

    }
    return (
        <div className='onlineUserCard'>
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color='success'
            >
                <Avatar alt="Remy Sharp" src={onlineUser?.avatarId} />
            </Badge>
            <span>{onlineUser?.name}</span>

            

        </div>
    )
}

export default OnlineUsersCard