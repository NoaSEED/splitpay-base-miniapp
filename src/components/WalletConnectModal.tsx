import React, { useState, useEffect } from 'react'
import { X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (provider: any) => void
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [qrCode] = useState<string>('')
  const [deepLink, setDeepLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      initializeWalletConnect()
    }
  }, [isOpen])

  const initializeWalletConnect = async () => {
    try {
      setIsConnecting(true)
      
      // Simular la inicialización de WalletConnect
      // En una implementación real, aquí se configuraría WalletConnect
      const mockUri = 'wc:1234567890abcdef@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=1234567890abcdef'
      const mockDeepLink = `https://walletconnect.org/wc?uri=${encodeURIComponent(mockUri)}`
      
      setQrCode(mockUri)
      setDeepLink(mockDeepLink)
      
      // Simular conexión exitosa después de 3 segundos
      setTimeout(() => {
        setIsConnecting(false)
        // Simular que el usuario aceptó la conexión
        onConnect({ address: '0x1234567890abcdef1234567890abcdef12345678' })
        onClose()
      }, 3000)

    } catch (error) {
      console.error('Error inicializando WalletConnect:', error)
      setIsConnecting(false)
    }
  }

  const handleCopyDeepLink = async () => {
    if (deepLink) {
      try {
        await navigator.clipboard.writeText(deepLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copiando deep link:', error)
      }
    }
  }

  const handleOpenInWallet = () => {
    if (deepLink) {
      window.open(deepLink, '_blank')
    }
  }

  const handleClose = () => {
    setQrCode('')
    setDeepLink('')
    setIsConnecting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Conectar Wallet Móvil</h3>
              <p className="text-sm text-gray-500">Usa WalletConnect para conectar</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isConnecting ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600">Inicializando WalletConnect...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                    <p className="text-sm text-gray-600">Escanea con tu wallet</p>
                  </div>
                </div>
              </div>

              {/* Deep Link */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Enlace directo:</span>
                </div>
                
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={deepLink}
                    readOnly
                    className="flex-1 text-xs text-gray-600 bg-transparent border-none outline-none"
                  />
                  <button
                    onClick={handleCopyDeepLink}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleOpenInWallet}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Abrir en Wallet</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Instrucciones:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Abre tu wallet móvil (MetaMask, Trust Wallet, etc.)</li>
              <li>2. Busca "WalletConnect" o "Conectar DApp"</li>
              <li>3. Escanea el QR code o usa el enlace directo</li>
              <li>4. Acepta la conexión en tu wallet</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletConnectModal
