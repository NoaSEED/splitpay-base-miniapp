import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface DebtManagementProps {
  groupId: string
  onPaymentCompleted?: () => void
}

const DebtManagement: React.FC<DebtManagementProps> = ({ groupId, onPaymentCompleted }) => {
  const { account } = useWeb3()
  const { getTotalOwed, completePayment } = useGroups()
  const [isLoading, setIsLoading] = useState(false)
  
  // Recalcular deuda cada vez que cambie algo
  const groupDebt = account ? {
    groupId,
    groupName: 'Grupo',
    amount: getTotalOwed(groupId, account)
  } : null

  const handlePayDebt = async () => {
    if (!account || !groupDebt) return
    
    setIsLoading(true)
    try {
      // Crear un pago directo para cancelar la deuda
      const paymentId = `debt-${Date.now()}`
      const transactionHash = `tx-${Date.now()}` // Simular TX hash
      
      const success = await completePayment(
        groupId,
        paymentId,
        transactionHash,
        account
      )
      
      if (success) {
        toast.success('Deuda pagada exitosamente')
        if (onPaymentCompleted) {
          onPaymentCompleted()
        }
      } else {
        toast.error('Error al pagar la deuda')
      }
    } catch (error) {
      console.error('Error paying debt:', error)
      toast.error('Error al pagar la deuda')
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

  if (!groupDebt || groupDebt.amount <= 0) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">Tienes una deuda pendiente</h3>
      </div>

      <div className="bg-white rounded-lg p-4 border border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Monto adeudado</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(groupDebt.amount)} USDC</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Grupo</p>
            <p className="font-medium text-gray-900">{groupDebt.groupName}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium mb-2">¿Qué puedes hacer?</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• <strong>Pagar:</strong> Marca la deuda como pagada</li>
              <li>• <strong>Verificar:</strong> Revisa el historial de pagos del grupo</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePayDebt}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={20} />
              <span>{isLoading ? 'Pagando...' : 'Pagar Deuda'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtManagement