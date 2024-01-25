import React from 'react'
import ReactModal from 'react-modal'
import './PinnedMessages.css'
import Close from '@mui/icons-material/Close'
import { useEffect } from 'react'
import PinnedMessagesCard from './PinnedMessagesCard'
function PinnedMessages({openPinnedMsg,setOpenPinnedMsg,pinnedMsg}) {
  
  return (
    <ReactModal isOpen={openPinnedMsg} className='pinnedMsgBody'>
        
        <div className='pinnedMsgContainer'>
            <Close onClick={()=>setOpenPinnedMsg(false)} style={{float:'right',cursor:'pointer'}}/>
            <div style={{marginTop:'2em'}}>
                {pinnedMsg.map(msg => {
                    return (
                        <div key={msg._id}>
                           <PinnedMessagesCard message = {msg}/>
                        </div>
                    )
                })}
                </div>
        </div>

    </ReactModal>
  )
}

export default PinnedMessages