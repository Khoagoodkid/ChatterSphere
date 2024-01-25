import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from 'firebase/database'
import { getStorage, uploadBytes } from 'firebase/storage'
const firebaseConfig = {
  apiKey: "AIzaSyDS7PpIPjGBR-QOx363fwuhMJVRocnfiQQ",
  authDomain: "web-chat-f39dd.firebaseapp.com",
  databaseURL: "https://web-chat-f39dd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-chat-f39dd",
  storageBucket: "web-chat-f39dd.appspot.com",
  messagingSenderId: "220113296908",
  appId: "1:220113296908:web:3d5bb84aac7fd003b91829",
  measurementId: "G-3B0VHDYBM4"
};
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
export const storage = getStorage(app)
export const pinnedMsgRef = ref(database,'pinnedMessages')
// export const imgRef = ref(storage,'imgMsg')
export { database, ref, push, onValue }