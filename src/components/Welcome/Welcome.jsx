import React from 'react'
import robot from '../../assets/robot.gif'
import "./Welcome.css"
function Welcome({user}) {
  return (
    <div className='welcomeBody'>
        <img src={robot}/>
        <span>Welcome, <span style={{color:'#4e00ff'}}>{user.name} </span> ! </span>
        <span>Please select a conversation to Start Messaging</span>
    </div>
  )
}

export default Welcome