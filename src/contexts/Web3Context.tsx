import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// ===========================================
// Types & Interfaces
// ===========================================

interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  color: string
  enabled: boolean
}

interface Web3ContextType {
  // Connection state
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  isLoading: boolean
  
  // Network management
  currentNetwork: NetworkConfig | null
  supportedNetworks: NetworkConfig[]
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  addNetwork: (chainId: number) => Promise<void>
  
  // Utility functions
  formatAddress: (address: string) => string
  getNetworkName: (chainId: number) => string
  isNetworkSupported: (chainId: number) => boolean
}

// ===========================================
// Network Configuration - SOLO BASE
// ===========================================

const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    color: '#0052FF',
    enabled: true,
  },
  // Base Sepolia para testing
  {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    color: '#0052FF',
    enabled: import.meta.env.NODE_ENV === 'development',
  },
]

// ===========================================
// Context Creation
// ===========================================

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// ===========================================
// Provider Component
// ===========================================

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Computed values
  const isConnected = !!account && !!provider
  const currentNetwork = SUPPORTED_NETWORKS.find(network => network.chainId === chainId) || null
  const supportedNetworks = SUPPORTED_NETWORKS.filter(network => network.enabled)

  // ===========================================
  // Utility Functions
  // ===========================================

  const formatAddress = useCallback((address: string): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const getNetworkName = useCallback((chainId: number): string => {
    const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId)
    return network?.name || `Chain ${chainId}`
  }, [])

  const isNetworkSupported = useCallback((chainId: number): boolean => {
    return SUPPORTED_NETWORKS.some(network => network.chainId === chainId && network.enabled)
  }, [])

  // ===========================================
  // Wallet Connection
  // ===========================================

  const connectWallet = useCallback(async (): Promise<void> => {
    if (!window.ethereum) {
      toast.error('MetaMask no está instalado. Por favor, instala MetaMask para continuar.')
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No se encontraron cuentas')
      }

      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)

      // Check if network is supported
      if (!isNetworkSupported(currentChainId)) {
        toast.error(`Red no soportada: ${getNetworkName(currentChainId)}`)
        // Auto-switch to Base
        await switchNetwork(8453)
        return
      }

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(currentChainId)

      toast.success(`Wallet conectada en ${getNetworkName(currentChainId)}`)
      
      // Log connection for analytics
      console.log('🔗 Wallet conectada:', {
        address: accounts[0],
        network: getNetworkName(currentChainId),
        chainId: currentChainId
      })

    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      
      if (error.code === 4001) {
        toast.error('Conexión cancelada por el usuario')
      } else if (error.code === -32002) {
        toast.error('Conexión ya en progreso. Por favor, espera.')
      } else {
        toast.error(`Error al conectar wallet: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isNetworkSupported, getNetworkName])

  const disconnectWallet = useCallback((): void => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    toast.success('Wallet desconectada')
    
    console.log('🔌 Wallet desconectada')
  }, [])

  // ===========================================
  // Network Management
  // ===========================================

  const switchNetwork = useCallback(async (targetChainId: number): Promise<void> => {
    if (!window.ethereum) {
      toast.error('MetaMask no está disponible')
      return
    }

    const targetNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === targetChainId)
    if (!targetNetwork) {
      toast.error('Red no soportada')
      return
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })

      toast.success(`Cambiado a ${targetNetwork.name}`)
      
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, try to add it
        await addNetwork(targetChainId)
      } else {
        console.error('Error switching network:', error)
        toast.error(`Error al cambiar a ${targetNetwork.name}`)
      }
    }
  }, [])

  const addNetwork = useCallback(async (chainId: number): Promise<void> => {
    if (!window.ethereum) return

    const network = SUPPORTED_NETWORKS.find(n => n.chainId === chainId)
    if (!network) {
      toast.error('Red no soportada')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer],
            nativeCurrency: network.nativeCurrency,
          },
        ],
      })

      toast.success(`${network.name} agregada exitosamente`)
      
    } catch (error: any) {
      console.error('Error adding network:', error)
      if (error.code === 4001) {
        toast.error('Agregar red cancelado por el usuario')
      } else {
        toast.error(`Error al agregar ${network.name}`)
      }
    }
  }, [])

  // ===========================================
  // Event Listeners
  // ===========================================

  useEffect(() => {
    if (!window.ethereum) return

    const provider = new ethers.BrowserProvider(window.ethereum)
    
    // Check if already connected
    const checkConnection = async () => {
      try {
        const accounts = await provider.send('eth_accounts', [])
        if (accounts.length > 0) {
          const network = await provider.getNetwork()
          const currentChainId = Number(network.chainId)
          
          if (isNetworkSupported(currentChainId)) {
            setAccount(accounts[0])
            setChainId(currentChainId)
            setProvider(provider)
            const signer = await provider.getSigner()
            setSigner(signer)
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }

    checkConnection()

    // Account change listener
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setAccount(accounts[0])
        toast('Cuenta cambiada', { icon: 'ℹ️' })
      }
    }

    // Chain change listener
    const handleChainChanged = (chainId: string) => {
      const newChainId = Number(chainId)
      setChainId(newChainId)
      
      if (isNetworkSupported(newChainId)) {
        toast.success(`Cambiado a ${getNetworkName(newChainId)}`)
      } else {
        toast.error(`Red no soportada: ${getNetworkName(newChainId)}`)
      }
      
      // Reload page to ensure clean state
      setTimeout(() => window.location.reload(), 1000)
    }

    // Connect event listener
    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log('🔗 Wallet conectada:', connectInfo)
    }

    // Disconnect event listener
    const handleDisconnect = (error: any) => {
      console.log('🔌 Wallet desconectada:', error)
      disconnectWallet()
    }

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('connect', handleConnect)
    window.ethereum.on('disconnect', handleDisconnect)

    // Cleanup
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('connect', handleConnect)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [disconnectWallet, isNetworkSupported, getNetworkName])

  // ===========================================
  // Context Value
  // ===========================================

  const value: Web3ContextType = {
    // Connection state
    account,
    chainId,
    provider,
    signer,
    isConnected,
    isLoading,
    
    // Network management
    currentNetwork,
    supportedNetworks,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    
    // Utility functions
    formatAddress,
    getNetworkName,
    isNetworkSupported,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// ===========================================
// Hook
// ===========================================

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// ===========================================
// Export types for external use
// ===========================================

export type { NetworkConfig, Web3ContextType }
