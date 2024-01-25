import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CreateAccount from './pages/CreateAccount/CreateAccount'
import { AuthContext } from './context/AuthContext'
import Messenger from './pages/Messenger/Messenger'
function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path='/' element={<CreateAccount />} />
          <Route path='/messenger' element={ user? <Messenger />: <CreateAccount/>} />
        </Routes>

      </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App
