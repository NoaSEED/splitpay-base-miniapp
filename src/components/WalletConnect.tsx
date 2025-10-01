import React, { useState } from 'react'
import { Wallet, LogOut, Copy, Check, ChevronDown } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { useWeb3Modal } from '@web3modal/ethers/react'

// 1. Get projectId from environment or use a public one
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

const WalletConnect: React.FC = () => {
  const { 
    account, 
    isConnected, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    currentNetwork 
  } = useWeb3()
  
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const { open } = useWeb3Modal()

  const handleCopyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copying address:', error)
      }
    }
  }

  const handleConnectMetaMask = async () => {
    await connectWallet('metamask')
    setShowOptions(false)
  }

  const handleConnectWalletConnect = async () => {
    setShowOptions(false)
    await open()
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-base-100 rounded-lg">
        <div className="w-4 h-4 border-2 border-base-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-base-700">Conectando...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-medium">Conectar Wallet</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowOptions(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-2 bg-base-50 border-b border-base-200">
                <p className="text-xs font-semibold text-base-900">Selecciona tu wallet</p>
              </div>
              
              <div className="p-2 space-y-1">
                {/* MetaMask / Extensiones */}
                <button
                  onClick={handleConnectMetaMask}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-base-50 rounded-lg transition-colors group"
                >
                  <span className="text-2xl">🦊</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-base-600">MetaMask</p>
                    <p className="text-xs text-gray-500">Extensión de navegador</p>
                  </div>
                </button>

                {/* WalletConnect */}
                <button
                  onClick={handleConnectWalletConnect}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-base-50 rounded-lg transition-colors group"
                >
                  <span className="text-2xl">🔗</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-base-600">WalletConnect</p>
                    <p className="text-xs text-gray-500">Wallets móviles</p>
                  </div>
                </button>

                {/* Coinbase */}
                <button
                  onClick={() => {
                    connectWallet('coinbase')
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-base-50 rounded-lg transition-colors group"
                >
                  <span className="text-2xl">💙</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-base-600">Coinbase Wallet</p>
                    <p className="text-xs text-gray-500">App o extensión</p>
                  </div>
                </button>

                {/* Rabby */}
                <button
                  onClick={() => {
                    connectWallet('rabby')
                    setShowOptions(false)
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-base-50 rounded-lg transition-colors group"
                >
                  <span className="text-2xl">🐰</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-base-600">Rabby</p>
                    <p className="text-xs text-gray-500">Extensión de navegador</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Network Badge */}
      {currentNetwork && (
        <div 
          className="px-3 py-2 bg-base-100 rounded-lg border border-base-200"
          title={currentNetwork.name}
        >
          <span className="text-sm font-medium text-base-700">
            {currentNetwork.name}
          </span>
        </div>
      )}

      {/* Account Info */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <button
          onClick={handleCopyAddress}
          className="flex items-center space-x-2 hover:text-green-700 transition-colors"
          title="Copiar dirección"
        >
          <span className="text-sm font-medium text-green-700">
            {formatAddress(account || '')}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 text-green-600" />
          )}
        </button>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnectWallet}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Desconectar wallet"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}

export default WalletConnect
