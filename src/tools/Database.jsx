import axios from "axios";
export const url = axios.create({
    baseURL:'https://web-chat-f39dd-default-rtdb.asia-southeast1.firebasedatabase.app/'
})