import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import "./IncomingCall.css"
import GetUserList from '../../tools/GetUserList'
import { Avatar } from '@mui/material'
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
function IncomingCall({ isOpen, setIsIncomingCall, setIsOpenVidCallWindow, callerPeerId, userList, answerCall }) {
    const [caller, setCaller] = useState()

    const getCaller = async () => {
        const caller = await userList?.find((u) => {
            if ("peerId" in u) {
                return u.peerId == callerPeerId
            }
        })
        console.log(caller)
        setCaller(caller)
    }

    useEffect(() => {
        getCaller()

    }, [isOpen])
    if (!caller) return
    return (
        <ReactModal className='incoming-body' isOpen={isOpen} >
            <div className='incoming-wrapper'>
                <h3>Incoming Call</h3>
                <Avatar
                    style={{ width: '7em', height: '7em' }}
                    src={caller.avatarId}

                />
                <div className="caller-info">
                    <span>{caller.name}</span>
                    <e>{caller.email}</e>
                </div>
                <div className="answer">
                    <CallIcon style={{ padding: '.5em', background: '#6aeb8c', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={answerCall}
                    />
                    <CloseIcon style={{ padding: '.5em', background: 'red', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={() => setIsIncomingCall(false)}
                    />
                </div>
            </div>

        </ReactModal>
    )
}

export default IncomingCall