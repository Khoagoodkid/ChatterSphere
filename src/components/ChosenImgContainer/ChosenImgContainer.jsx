import React, { useState } from 'react'
import './ChosenImgContainer.css'
import CloseIcon from '@mui/icons-material/Close';
import { url } from '../../tools/Database';
import { v4 } from 'uuid';
import { uploadBytes, listAll, getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../../tools/firebase';
function ChosenImgContainer({ chosenImg, setChosenImg, currentChat, user, chosenImgFile, setChosenImgFile }) {
    const sendImg = () => {

        if (chosenImg.length > 0) {
            for (const img of chosenImgFile) {

                const imgId = v4()
                uploadBytes(ref(storage, `img/${imgId}`), img).then(() => {
                    listAll(ref(storage, `img`)).then(data => {
                        const img1 = data.items.find((item) => {
                            return item.name == imgId
                        })
                        getDownloadURL(img1).then(imgUrl => {
                            url.post('messages.json', {
                                conversationId: currentChat._id,
                                senderId: user._id,
                                createdAt: Date.now(),
                                url: imgUrl,
                                type: 'img'
                            })
                        })
                    })
                })
            }
            setChosenImg([])
            setChosenImgFile([])
            updateConversationDate()
        }


    }
    const updateConversationDate = () => {
        url.patch(`conversations/${currentChat._id}.json`, {
            ...currentChat,
            updatedAt: Date.now()

        })
        
    }
    return (
        <div className='chosenImgContainer' >

            {chosenImg.map((img, index) => {
                return (
                    <div className='chosenImg' key={index}>

                        <img src={img} style={{ width: '5em', height: '5em', borderRadius: '.5em' }} />
                        <CloseIcon style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }}
                            onClick={() => {
                                const newChosenImg = chosenImg.filter((img) => {
                                    return chosenImg.indexOf(img) != index
                                })
                                setChosenImg(newChosenImg)
                            }} />
                    </div>

                )
            })}
            <button onClick={() => sendImg()}>Send</button>
            <CloseIcon className='closeViewChosenImg' onClick={() => {
                setChosenImg([])
                setChosenImgFile([])
            }} />
        </div>
    )
}

export default ChosenImgContainer