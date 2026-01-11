import { useState } from 'react'
import './App.css'
import Auth from './page/Login/Auth'
import { Toaster } from 'sonner';
import FirstTimeWelcome from './page/FirstTimeWelcome/FirstTimeWelcome'
import { Onboarding } from './page/Onboarding/Onboarding';
import OnboardingSuccess from './page/OnboardingSuccess/OnboardingSuccess';
import WelcomeModal from './components/ui/WelcomeModel/WelcomeModal';

function App() {

  return (
    <>
      {/* <Auth />
      <Toaster/> */}
      {/* <FirstTimeWelcome /> */}
      {/* <Onboarding/> */}
      {/* <OnboardingSuccess userName="Анна" onContinue={() => {}} /> */}
      <WelcomeModal userName="Анна" onClose={() => {}} />
      <Toaster/>
    </>
  )
}

export default App
