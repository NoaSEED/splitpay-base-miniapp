import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface DebtManagementProps {
  groupId: string
}

const DebtManagement: React.FC<DebtManagementProps> = ({ groupId }) => {
  const { account } = useWeb3()
  const [debtAmount, setDebtAmount] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Calcular deuda simple
  const calculateDebt = () => {
    if (!account) return
    
    const groups = JSON.parse(localStorage.getItem('groups') || '[]')
    const group = groups.find((g: any) => g.id === groupId)
    if (!group) return

    // Gastos activos
    const activeExpenses = group.expenses.filter((expense: any) => expense.status !== 'cancelled')
    const totalExpenses = activeExpenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
    const participantCount = group.participants.length
    const sharePerPerson = totalExpenses / participantCount

    // Lo que ha pagado en gastos
    const paidByParticipant = activeExpenses
      .filter((expense: any) => expense.paidBy?.toLowerCase() === account.toLowerCase())
      .reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

    // Lo que ha recibido en pagos completados
    const receivedPayments = group.payments
      .filter((payment: any) => payment.to?.toLowerCase() === account.toLowerCase() && payment.status === 'completed')
      .reduce((sum: number, payment: any) => sum + payment.amount, 0)

    // Deuda = lo que debe - lo que ha pagado - lo que ha recibido
    const debt = sharePerPerson - paidByParticipant - receivedPayments
    setDebtAmount(Math.max(0, debt))
  }

  useEffect(() => {
    calculateDebt()
  }, [account, groupId])

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      calculateDebt()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handlePayDebt = () => {
    setShowPaymentModal(true)
  }

  const handleSubmitPayment = async () => {
    if (!transactionHash.trim()) {
      toast.error('Por favor ingresa el hash de la transacción')
      return
    }

    setIsLoading(true)
    try {
      // Obtener grupos actuales
      const currentGroups = JSON.parse(localStorage.getItem('groups') || '[]')
      
      // Encontrar el grupo y agregar un pago completado
      const updatedGroups = currentGroups.map((group: any) => {
        if (group.id === groupId) {
          // Encontrar a quién le debe (el que pagó los gastos)
          const expenses = group.expenses || []
          const activeExpenses = expenses.filter((expense: any) => expense.status !== 'cancelled')
          const paidBy = activeExpenses.length > 0 ? activeExpenses[0].paidBy : account
          
          const completedPayment = {
            id: `paid-${Date.now()}`,
            from: account,
            to: paidBy,
            amount: debtAmount,
            status: 'completed',
            transactionHash: transactionHash,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            completedBy: account,
            notes: 'Pago completado por el usuario'
          }
          
          return {
            ...group,
            payments: [...(group.payments || []), completedPayment]
          }
        }
        return group
      })
      
      // Guardar en localStorage
      localStorage.setItem('groups', JSON.stringify(updatedGroups))
      
      // Actualizar el estado local
      setDebtAmount(0)
      setShowPaymentModal(false)
      setTransactionHash('')
      
      // Forzar recálculo
      calculateDebt()
      
      toast.success('Deuda pagada exitosamente')
      
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

  if (!account || debtAmount <= 0) {
    return null
  }

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Tienes una deuda pendiente</h3>
        </div>

        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Monto adeudado</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(debtAmount)} USDC</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePayDebt}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              <span>Pagar Deuda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Completar Pago</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hash de la Transacción
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Monto: <span className="font-semibold">{formatCurrency(debtAmount)} USDC</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DebtManagement