import { storage } from "./firebase"
import { ref, listAll, getDownloadURL } from 'firebase/storage'
export const avatarRef = ref(storage,'images/')
