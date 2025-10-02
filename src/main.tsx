import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Web3Provider } from './contexts/Web3Context'
import { GroupProvider } from './contexts/GroupContext'
import { LanguageProvider } from './contexts/LanguageContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Web3Provider>
          <GroupProvider>
            <App />
            <Toaster position="top-right" />
          </GroupProvider>
        </Web3Provider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

