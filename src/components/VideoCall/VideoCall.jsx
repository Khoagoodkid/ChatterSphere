import React, { useState, useRef, useEffect, useContext } from 'react'
import ReactModal from 'react-modal'
import CloseIcon from '@mui/icons-material/Close';
import Peer from 'peerjs';
import { AuthContext } from '../../context/AuthContext';
import { v1 as uuid } from "uuid"
import "./VideoCall.css"
import MicIcon from '@mui/icons-material/Mic';
import CallIcon from '@mui/icons-material/Call';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { SocketContext } from '../../pages/Messenger/Messenger';
function VideoCall({ isOpen, receiver, setIsOpen, currentUserVideoRef, remoteVideoRef, peerInstance, callInstance }) {
    const socket = useContext(SocketContext)
    const hangUp = () => {
        callInstance.current.close()
        setIsOpen(false)
    }

    useEffect(() => {
        socket.on("hideCamSignal", res => {
            console.log(res)
        })
    },[])

    const [isCamHidden, setIsCamHidden] = useState(false)
    const [isReceiverCamHidden, setIsReceiverCamHidden] = useState(false)
    const hideCam = () => {
    
        setIsCamHidden(!isCamHidden)
        socket.emit("hideCam" , {
            receiverID: receiver._id
        })
    }
    return (

        <ReactModal isOpen={isOpen} className={'vid-body'}>
            {/* {roomId} */}
            <div className="vid-wrapper">
                <CloseIcon
                    style={{ position: 'absolute', top: 10, right: 10, color:'white',cursor:'pointer' }}
                    onClick={() => {
                        hangUp()
                    }} />
                <div className='vid-window'>
                    <div className='vid-frame own'>
                        {/* <button onClick={() => currentUserVideoRef.current.play()}>ddd</button> */}
                        <video ref={currentUserVideoRef} autoPlay muted
                            hidden={isCamHidden}
                        />
                    </div>
                    <div className='vid-frame oppo'>
                        <video ref={remoteVideoRef} autoPlay muted />
                    </div>
                </div>
                <div className='features'>
                    {isCamHidden ? <VideocamOffIcon
                        style={{ padding: '.5em', background: 'white', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={() => hideCam()} /> :

                        <VideocamIcon style={{ padding: '.5em', background: 'white', borderRadius: '50%', cursor: 'pointer' }}
                            onClick={() => hideCam()}
                        />
                    }
                    <CallIcon style={{ padding: '.5em', background: 'red', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={hangUp}
                    />
                    <MicIcon style={{ padding: '.5em', background: 'white', borderRadius: '50%', cursor: 'pointer' }} />
                </div>
            </div>




        </ReactModal>
    )
}

export default VideoCall