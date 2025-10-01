import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Web3Provider } from './contexts/Web3Context'
import { GroupProvider } from './contexts/GroupContext'
import { LanguageProvider } from './contexts/LanguageContext'
import App from './App'
import './index.css'

// Initialize Web3Modal
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId
const projectId = '3fbb6bba6f1de962d911bb5b5c9ddd26'

// 2. Set chains
const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org'
}

// 3. Create a metadata object
const metadata = {
  name: 'SplitPay',
  description: 'Gastos Compartidos en Base',
  url: 'https://splitpay-base-miniapp.vercel.app',
  icons: ['https://splitpay-base-miniapp.vercel.app/icon.png']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: 'https://mainnet.base.org',
  defaultChainId: 8453,
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [base],
  projectId,
  enableAnalytics: false,
  themeMode: 'light',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Web3Provider>
          <GroupProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f9fafb',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f9fafb',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#0052FF',
                    secondary: '#f9fafb',
                  },
                },
              }}
            />
          </GroupProvider>
        </Web3Provider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

