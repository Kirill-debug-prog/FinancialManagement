import { useState } from 'react'
import './App.css'
import Auth from './page/Login/Auth'
import { Toaster } from 'sonner';
import FirstTimeWelcome from './page/FirstTimeWelcome/FirstTimeWelcome'

function App() {

  return (
    <>
      {/* <Auth />
      <Toaster/> */}
      <FirstTimeWelcome />
    </>
  )
}

export default App
