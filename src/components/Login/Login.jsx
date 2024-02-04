import React, { useState, useContext, useEffect } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import { AuthContext } from '../../context/AuthContext'
import { database, ref, push, onValue } from '../../tools/firebase'
import GetUserList from '../../tools/GetUserList'
import {v1 as uuid} from "uuid"
function Login({ userList, setUserList }) {
    let navigate = useNavigate()
    const { user, setUser } = useContext(AuthContext)
    const [account, setAccount] = useState({
        email: '',
        password: ''
    })
    // useEffect(()=>{
    //     onValue(ref(database,'users'),(data) => {
    //         const userList1 = []
    //         data.forEach((d) => {
    //             userList.push({
    //                ...d.val(),
    //                _id: d.key
    //             })
    //         })
    //         setUserList(userList1)
    //     })
    //     console.log(userList)
    // },[])
    const submitHandler = (e) => {
        setUserList(GetUserList())
        e.preventDefault()
        console.log(userList)
        const userCheck = userList.filter(user => {
            return user.email == account.email && user.password == account.password
        })

        if (userCheck.length) {
            setUser(userCheck[0])
            
            console.log(userCheck[0])
            setTimeout(()=>{
                navigate(`/messenger`)
            },[2000])

        } else {
            alert('The account does not exist, please create an account')
        }
    }
    return (
        <form className='loginBody' onSubmit={submitHandler}>
            <label>Email</label>
            <TextField id="standard-basic" placeholder='Email' variant="standard"
                className='form-control'
                type='email'
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                sx={{input:{color:'white'}}}
            />
            <label>Password</label>
            <TextField id="standard-basic" placeholder='Password' variant="standard"
                className='form-control'
                type='password'
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                sx={{input:{color:'white'}}}
            />
            <button type='submit'>
                Login
            </button>
        </form>
    )
}

export default Login