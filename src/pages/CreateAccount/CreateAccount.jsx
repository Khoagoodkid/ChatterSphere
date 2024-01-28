import React, { useState, useEffect } from 'react'
import Login from '../../components/Login/Login'
import SignUp from '../../components/SignUp/SignUp'
import './CreateAccount.css'
import {database,ref,push,onValue} from '../../tools/firebase'
import SmsIcon from '@mui/icons-material/Sms';
import GetUserList from '../../tools/GetUserList'
function CreateAccount() {
    
    const [userList, setUserList] = useState([])
    useEffect(()=>{
        setUserList(GetUserList())
    },[])
    // useEffect(() => {
    //     const getUserList = () => {
    //         onValue(ref(database,'users'),(data) => {
    //             const userList1 = []
    //             data.forEach((d) => {
    //                 userList.push({
    //                    ...d.val(),
    //                    _id: d.key
    //                 })
    //             })
    //             setUserList(userList1)
    //         })
            
    //     }
    //     getUserList()
    //     console.log(userList)
    // }, [])
    return (
        <body>
            <div className='createAccountBody'>
                <div className='loginContainer'>

                    <h1 style={{letterSpacing:'.1em'}}>Chatter Sphere</h1>

                    <Login userList={userList} setUserList={setUserList} />
                </div>
                <div className='signupContainer'>

                    <SignUp userList={userList} setUserList={setUserList} />
                </div>
            </div>

        </body>
    )
}

export default CreateAccount