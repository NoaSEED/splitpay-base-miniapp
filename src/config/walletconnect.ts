import { EthereumProvider } from '@walletconnect/ethereum-provider'

export const WALLETCONNECT_PROJECT_ID = (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID || 'c8e3b10c5757e6e3e19e5c5e8f9a1b2e'

export const WALLETCONNECT_METADATA = {
  name: 'SplitPay',
  description: 'Divide gastos con amigos en Base Network',
  url: 'https://splitpayapp.xyz',
  icons: ['https://splitpayapp.xyz/icon.png']
}

export const createWalletConnectProvider = async () => {
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [8453], // Base Mainnet
    optionalChains: [84532], // Base Sepolia
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '9999'
      }
    },
    metadata: WALLETCONNECT_METADATA,
    rpcMap: {
      8453: 'https://mainnet.base.org',
      84532: 'https://sepolia.base.org'
    }
  })

  return provider
}
