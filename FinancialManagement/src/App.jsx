import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import AppRoutes from './app/Router.jsx'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
        <Toaster />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
