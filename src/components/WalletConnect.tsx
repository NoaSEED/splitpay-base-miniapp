import React, { useState } from 'react'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'

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
      <button
        onClick={() => connectWallet()}
        className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Conectar Wallet</span>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Network Badge */}
      <div className="flex items-center space-x-2 px-3 py-1 bg-base-100 rounded-lg">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: currentNetwork?.color || '#0052FF' }}
        ></div>
        <span className="text-sm font-medium text-base-700">
          {currentNetwork?.name || 'Base'}
        </span>
      </div>

      {/* Address */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-base-100 rounded-lg">
        <span className="text-sm font-mono text-base-700">
          {formatAddress(account || '')}
        </span>
        
        <button
          onClick={handleCopyAddress}
          className="p-1 hover:bg-base-200 rounded transition-colors"
          title="Copiar dirección"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-base-600" />
          )}
        </button>
      </div>

      {/* Disconnect */}
      <button
        onClick={disconnectWallet}
        className="p-2 hover:bg-base-200 rounded-lg transition-colors"
        title="Desconectar"
      >
        <LogOut className="w-4 h-4 text-base-600" />
      </button>
    </div>
  )
}

export default WalletConnect

