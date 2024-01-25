import { url } from "./Database";
 function GetConversations  ()  {
    const conversations = []
     url.get('/conversations.json')
    .then(res => {
      
        for(const key in res.data){
            conversations.push({
                members: res.data[key].members,
                createdAt:res.data[key].createdAt,
                _id: key
            })
        }
    })
    .catch(err => console.log(err))
    // console.log(conversations)
    return conversations
}
export default GetConversations