import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import './assets/styles/main.scss'
import App from './App.jsx'
import { initializeGlobalErrorHandlers } from './api/globalErrorHandler'
import { ThemeProvider } from './components/ThemeProvider.jsx'

initializeGlobalErrorHandlers()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);