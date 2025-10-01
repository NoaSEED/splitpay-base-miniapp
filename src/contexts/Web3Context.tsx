import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { BASE_NETWORK, SUPPORTED_NETWORKS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import type { NetworkConfig } from '../types'

// ===========================================
// Types & Interfaces
// ===========================================

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
  isBaseNetwork: boolean
  
  // Actions
  connectWallet: (walletType?: 'metamask' | 'rabby' | 'coinbase' | 'trust' | 'walletconnect' | 'default') => Promise<void>
  connectWalletConnect: (provider: any) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  addNetwork: (chainId: number) => Promise<void>
  
  // Utility functions
  formatAddress: (address: string) => string
  getNetworkName: (chainId: number) => string
  isNetworkSupported: (chainId: number) => boolean
}

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
  const isBaseNetwork = chainId === BASE_NETWORK.chainId

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

  const getWalletProvider = useCallback((walletType: 'metamask' | 'rabby' | 'coinbase' | 'trust' | 'walletconnect' | 'default' = 'default') => {
    if (typeof window === 'undefined') return null;

    switch (walletType) {
      case 'metamask':
        return (window.ethereum as any)?.isMetaMask ? window.ethereum : null;
      case 'rabby':
        return (window.ethereum as any)?.isRabby ? window.ethereum : null;
      case 'coinbase':
        return (window.ethereum as any)?.isCoinbaseWallet ? window.ethereum : null;
      case 'trust':
        return (window.ethereum as any)?.isTrust ? window.ethereum : null;
      case 'walletconnect':
        // For WalletConnect, we'll handle it separately in the component
        return null;
      case 'default':
      default:
        return window.ethereum; // Fallback to generic ethereum provider
    }
  }, []);

  const connectWallet = useCallback(async (walletType: 'metamask' | 'rabby' | 'coinbase' | 'trust' | 'walletconnect' | 'default' = 'default'): Promise<void> => {
    const selectedProvider = getWalletProvider(walletType);

    if (!selectedProvider && walletType !== 'walletconnect') {
      toast.error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED);
      return;
    }

    // For WalletConnect, let the component handle it
    if (walletType === 'walletconnect') {
      return;
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(selectedProvider)
      
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
        toast.error(`${ERROR_MESSAGES.UNSUPPORTED_NETWORK} ${getNetworkName(currentChainId)}`)
        // Auto-switch to Base
        await switchNetwork(BASE_NETWORK.chainId)
        return
      }

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(currentChainId)

      toast.success(`${SUCCESS_MESSAGES.WALLET_CONNECTED} ${getNetworkName(currentChainId)}`)
      
      // Log connection for analytics
      console.log('🔗 Wallet conectada:', {
        address: accounts[0],
        network: getNetworkName(currentChainId),
        chainId: currentChainId
      })

    } catch (error: unknown) {
      console.error('Error connecting wallet:', error)
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const errorCode = (error as { code: unknown }).code
        if (errorCode === 4001) {
          toast.error(ERROR_MESSAGES.CONNECTION_CANCELLED)
        } else if (errorCode === -32002) {
          toast.error(ERROR_MESSAGES.CONNECTION_IN_PROGRESS)
        } else {
          toast.error(`${ERROR_MESSAGES.GENERIC_CONNECTION_ERROR} ${String(error)}`)
        }
      } else {
        toast.error(`${ERROR_MESSAGES.GENERIC_CONNECTION_ERROR} ${String(error)}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isNetworkSupported, getNetworkName, getWalletProvider])

  const connectWalletConnect = useCallback(async (provider: any): Promise<void> => {
    if (!provider) {
      toast.error('Provider de WalletConnect no disponible');
      return;
    }

    setIsLoading(true);
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      
      // Request account access
      const accounts = await ethersProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No se encontraron cuentas');
      }

      const signer = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      // Check if network is supported
      if (!isNetworkSupported(currentChainId)) {
        toast.error(`${ERROR_MESSAGES.UNSUPPORTED_NETWORK} ${getNetworkName(currentChainId)}`);
        // Auto-switch to Base
        await switchNetwork(BASE_NETWORK.chainId);
        return;
      }

      setProvider(ethersProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(currentChainId);

      toast.success(`${SUCCESS_MESSAGES.WALLET_CONNECTED} ${getNetworkName(currentChainId)}`);
      
      // Log connection for analytics
      console.log('🔗 WalletConnect conectado:', {
        address: accounts[0],
        network: getNetworkName(currentChainId),
        chainId: currentChainId
      });

    } catch (error: unknown) {
      console.error('Error connecting WalletConnect:', error);
      toast.error(`${ERROR_MESSAGES.GENERIC_CONNECTION_ERROR} ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [isNetworkSupported, getNetworkName, switchNetwork]);

  const disconnectWallet = useCallback((): void => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    toast.success(SUCCESS_MESSAGES.WALLET_DISCONNECTED)
    
    console.log('🔌 Wallet desconectada')
  }, [])

  // ===========================================
  // Network Management
  // ===========================================

  const switchNetwork = useCallback(async (targetChainId: number): Promise<void> => {
    if (!window.ethereum) {
      toast.error(ERROR_MESSAGES.METAMASK_NOT_INSTALLED)
      return
    }

    const targetNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === targetChainId)
    if (!targetNetwork) {
      toast.error(ERROR_MESSAGES.UNSUPPORTED_NETWORK)
      return
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })

      toast.success(`${SUCCESS_MESSAGES.NETWORK_SWITCHED} ${targetNetwork.name}`)
      
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 4902) {
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
      toast.error(ERROR_MESSAGES.UNSUPPORTED_NETWORK)
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

      toast.success(`${network.name} ${SUCCESS_MESSAGES.NETWORK_ADDED}`)
      
    } catch (error: unknown) {
      console.error('Error adding network:', error)
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 4001) {
        toast.error(ERROR_MESSAGES.ADD_NETWORK_CANCELLED)
      } else {
        toast.error(`${ERROR_MESSAGES.GENERIC_ADD_NETWORK_ERROR} ${network.name}`)
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
        toast.success(`${SUCCESS_MESSAGES.NETWORK_SWITCHED} ${getNetworkName(newChainId)}`)
      } else {
        toast.error(`${ERROR_MESSAGES.UNSUPPORTED_NETWORK} ${getNetworkName(newChainId)}`)
      }
      
      // Reload page to ensure clean state
      setTimeout(() => window.location.reload(), 1000)
    }

    // Connect event listener
    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log('🔗 Wallet conectada:', connectInfo)
    }

    // Disconnect event listener
    const handleDisconnect = (error: unknown) => {
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
  }, [disconnectWallet, isNetworkSupported, getNetworkName, switchNetwork])

  // ===========================================
  // Context Value
  // ===========================================

  const value: Web3ContextType = useMemo(() => ({
    // Connection state
    account,
    chainId,
    provider,
    signer,
    isConnected,
    isLoading,
    
    // Network management
    currentNetwork,
    supportedNetworks: SUPPORTED_NETWORKS,
    isBaseNetwork,
    
    // Actions
    connectWallet,
    connectWalletConnect,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    
    // Utility functions
    formatAddress,
    getNetworkName,
    isNetworkSupported,
  }), [
    account,
    chainId,
    provider,
    signer,
    isConnected,
    isLoading,
    currentNetwork,
    isBaseNetwork,
    connectWallet,
    connectWalletConnect,
    disconnectWallet,
    switchNetwork,
    addNetwork,
    formatAddress,
    getNetworkName,
    isNetworkSupported,
  ])

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