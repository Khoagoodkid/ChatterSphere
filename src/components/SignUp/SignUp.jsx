import React, { useEffect, useState } from 'react'
import './SignUp.css'
import FilledInput from '@mui/material/FilledInput'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { url } from '../../tools/Database'
import GetUserList from '../../tools/GetUserList'
import { storage } from '../../tools/firebase'
import { ref,uploadBytes, listAll, getDownloadURL } from 'firebase/storage'
import { v4 } from 'uuid'
import { avatarRef } from '../../tools/GetAvatar'
function SignUp({ userList, setUserList }) {
    const [imgId, setImgId] = useState(null)
    const [avatar, setAvatar] = useState(null)
    const [account, setAccount] = useState({
        email: '',
        name: '',
        password: '',
        avatarId: null,

    })

    const [showPassword, setShowPassword] = useState(false)

    const submitHandler = (e) => {
        const imgId = v4()
        setUserList(GetUserList())
        const sameAccount = userList?.some(user => {
            return user.email == account.email
        })
        console.log(sameAccount)
        // console.log(userList)
        e.preventDefault()
        if (!account.email || !account.name || !account.password) {
            alert('You have to fill in all the information!')
        } else if (sameAccount) {
            alert('This email has been used!')
        } else {

            uploadAvatar(imgId)

          






        }
    }
    const checkHandle = (e) => {

    }
    const uploadAvatar = (imgId) => {
        let avatarUrl 

        uploadBytes(ref(storage, `images/${imgId}`), avatar).then(() => {


            listAll(avatarRef).then(data => {
                const userAvatar = data.items.find((item) => {
                    return item.name == imgId
                })
                getDownloadURL(userAvatar).then(url1 => {
                    url.post('/users.json', {
                        ...account,
                        avatarId: url1
                    })
                        .then(() => {
                            setAccount({
                                email: '',
                                name: '',
                                password: '',
                                avatarId: ''
        
                            })
                            setUserList(GetUserList())
                        })
                    
                })
            })

        })
        return avatarUrl
    }

    return (
        <form className="formBody" onSubmit={submitHandler} >

            <div className="form-group">
                <label for="exampleInputEmail1">Email address</label>
                <FilledInput
                    type='email'
                    className="form-control"
                    value={account.email}
                    size="100%"
                    variant="filled"
                    helperText="Please enter your email"
                    onChange={(e) => setAccount({ ...account, email: e.target.value })} />
                <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
            </div>


            <div className="form-group">
                <label for="exampleInputUsername1">Username</label>
                <FilledInput
                    className="form-control"
                    variant="filled"
                    size='medium'
                    helperText="Please enter your name"
                    value={account.name}
                    onChange={(e) => setAccount({ ...account, name: e.target.value })} />

            </div>

            <div className="form-group">
                <label for="exampleInputPassword1">Password</label>
                <FilledInput
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={account.password}
                    variant="filled"
                    helperText="Please enter your password"
                    onChange={(e) => setAccount({ ...account, password: e.target.value })}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}

                            >
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                        </InputAdornment>
                    }

                />

            </div>
            <div className='form-group'>
                <label>Set Profile Picture</label>
                <input type='file'
                    className='avatar'
                    onChange={(e) => setAvatar(e.target.files[0])}
                />
                <img src={account.avatarURL}></img>
            </div>
            <div className="form-group form-check">
                <input type="checkbox" className="form-check-input" id="exampleCheck1" onChange={checkHandle} />
                <label className="form-check-label" for="exampleCheck1">Check me out</label>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    )
}

export default SignUp