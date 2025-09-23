import React, { useState } from 'react'
import { CheckCircle, X, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface CompletePaymentProps {
  paymentId: string
  from: string
  to: string
  amount: number
  onComplete: (paymentId: string, transactionHash: string) => void
  onClose: () => void
}

const CompletePayment: React.FC<CompletePaymentProps> = ({
  paymentId,
  from,
  to,
  amount,
  onComplete,
  onClose
}) => {
  const [transactionHash, setTransactionHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!transactionHash.trim()) {
      toast.error('Por favor ingresa el hash de la transacción')
      return
    }

    // Validar formato de hash de transacción
    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash.trim())) {
      toast.error('Por favor ingresa un hash de transacción válido (0x + 64 caracteres)')
      return
    }

    setIsLoading(true)
    try {
      await onComplete(paymentId, transactionHash.trim())
      onClose()
    } catch (error) {
      toast.error('Error al completar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Completar Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-base-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Detalles del Pago</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">De:</span>
              <span className="font-mono text-gray-900">{from.slice(0, 6)}...{from.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Para:</span>
              <span className="font-mono text-gray-900">{to.slice(0, 6)}...{to.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-bold text-base-700">{formatCurrency(amount)} USDC</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transactionHash" className="block text-sm font-medium text-gray-700 mb-2">
              Hash de Transacción *
            </label>
            <div className="relative">
              <input
                type="text"
                id="transactionHash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-base-500 focus:border-base-500 font-mono text-sm"
                placeholder="0x..."
                required
              />
              <button
                type="button"
                onClick={() => copyToClipboard(transactionHash)}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                title="Copiar"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hash de la transacción en Base Network (0x + 64 caracteres)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Verificación de Pago</p>
                <p className="mt-1">
                  Una vez completado, el saldo se actualizará automáticamente y se notificará a todos los participantes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !transactionHash.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Completar Pago</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Puedes verificar la transacción en{' '}
            <a 
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-600 hover:text-base-700 underline"
            >
              BaseScan
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CompletePayment
