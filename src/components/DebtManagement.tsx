import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface DebtManagementProps {
  groupId: string
  onPaymentCompleted?: () => void
}

const DebtManagement: React.FC<DebtManagementProps> = ({ groupId, onPaymentCompleted }) => {
  const { account } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [debtAmount, setDebtAmount] = useState(0)

  // Calcular deuda de manera simple
  React.useEffect(() => {
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
  }, [account, groupId])

  const handlePayDebt = async () => {
    if (!account || debtAmount <= 0) return
    
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
            transactionHash: `tx-${Date.now()}`,
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
      
      toast.success('Deuda pagada exitosamente')
      
      // Notificar al componente padre
      if (onPaymentCompleted) {
        onPaymentCompleted()
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

  if (!account || debtAmount <= 0) {
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
            <p className="text-2xl font-bold text-red-700">{formatCurrency(debtAmount)} USDC</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Grupo</p>
            <p className="font-medium text-gray-900">Grupo</p>
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