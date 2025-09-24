import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { XCircle, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CancelDebtProps {
  groupId: string
  from: string
  to: string
  amount: number
  onClose: () => void
}

const CancelDebt: React.FC<CancelDebtProps> = ({
  groupId,
  from,
  to,
  amount,
  onClose
}) => {
  const { formatAddress } = useWeb3()
  const { getParticipantName, cancelDebt } = useGroups()
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')

  const fromName = getParticipantName(groupId, from)
  const toName = getParticipantName(groupId, to)
  const displayFromName = fromName || formatAddress(from)
  const displayToName = toName || formatAddress(to)

  const handleCancelDebt = async () => {
    if (!reason.trim()) {
      toast.error('Por favor explica el motivo de la cancelación')
      return
    }

    setIsLoading(true)
    try {
      const success = await cancelDebt(groupId, from, to, amount, reason)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error cancelling debt:', error)
      toast.error('Error al cancelar la deuda')
    } finally {
      setIsLoading(false)
    }
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
          <h2 className="text-xl font-bold text-gray-800">Cancelar Deuda</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Advertencia</h3>
          </div>
          <p className="text-sm text-red-700">
            Esta acción cancelará permanentemente la deuda de <strong>{formatCurrency(amount)} USDC</strong> 
            entre <strong>{displayFromName}</strong> y <strong>{displayToName}</strong>.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la cancelación *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Ej: Error en el cálculo, gasto duplicado, acuerdo mutuo..."
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Importante</p>
                <p className="mt-1">
                  Esta acción no se puede deshacer. La deuda será marcada como cancelada 
                  y se registrará en el historial del grupo.
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
              onClick={handleCancelDebt}
              disabled={isLoading || !reason.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cancelando...</span>
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  <span>Cancelar Deuda</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancelDebt

