import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'


function Root() {
  const initialize = useAuthStore((state) => state.initialize)
  useEffect(() => { initialize() }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>  <Root /></BrowserRouter>
  
  </StrictMode>
) 