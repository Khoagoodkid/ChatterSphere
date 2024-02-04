import { url } from "./Database";
import {database,ref,push,onValue} from './firebase'
function GetUserList() {
    const userList = []
    url.get('/users.json')
    .then(res => {
     
        for(const key in res.data){
            userList.push({
                email:res.data[key].email,
                name:res.data[key].name,
                password:res.data[key].password,
                _id:key,
                avatarId:res.data[key].avatarId,
                peerId: res.data[key].peerId
            })
        }
    }) 
    .catch(err => console.log(err))
  
    return userList
}
export default GetUserList