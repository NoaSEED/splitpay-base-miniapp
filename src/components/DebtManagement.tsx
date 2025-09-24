import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { AlertCircle, Bell, CheckCircle, XCircle } from 'lucide-react'
import RequestPayment from './RequestPayment'
import CancelDebt from './CancelDebt'

interface DebtManagementProps {
  groupId: string
  onPaymentCompleted?: () => void
}

const DebtManagement: React.FC<DebtManagementProps> = ({ groupId }) => {
  const { account } = useWeb3()
  const { getParticipantDebts } = useGroups()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<{
    from: string
    to: string
    amount: number
  } | null>(null)

  const debts = account ? getParticipantDebts(account) : []
  const groupDebt = debts.find(debt => debt.groupId === groupId)

  const handleRequestPayment = (from: string, to: string, amount: number) => {
    setSelectedDebt({ from, to, amount })
    setShowRequestModal(true)
  }

  const handleCancelDebt = (from: string, to: string, amount: number) => {
    setSelectedDebt({ from, to, amount })
    setShowCancelModal(true)
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
              <li>• <strong>Pagar:</strong> Haz la transacción y marca como completado</li>
              <li>• <strong>Avisar:</strong> Envía un recordatorio a quien debe recibir el pago</li>
              <li>• <strong>Cancelar:</strong> Anula la deuda si hay un error o acuerdo mutuo</li>
              <li>• <strong>Verificar:</strong> Revisa el historial de pagos del grupo</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleRequestPayment(account!, 'group', groupDebt.amount)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bell size={16} />
              <span>Avisar</span>
            </button>
            
            <button
              onClick={() => {
                // Scroll to pending payments section
                const pendingSection = document.querySelector('[data-pending-payments]')
                if (pendingSection) {
                  pendingSection.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={16} />
              <span>Pagar</span>
            </button>

            <button
              onClick={() => handleCancelDebt(account!, 'group', groupDebt.amount)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle size={16} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      {showRequestModal && selectedDebt && (
        <RequestPayment
          groupId={groupId}
          from={selectedDebt.from}
          to={selectedDebt.to}
          amount={selectedDebt.amount}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedDebt(null)
          }}
        />
      )}

      {showCancelModal && selectedDebt && (
        <CancelDebt
          groupId={groupId}
          from={selectedDebt.from}
          to={selectedDebt.to}
          amount={selectedDebt.amount}
          onClose={() => {
            setShowCancelModal(false)
            setSelectedDebt(null)
          }}
        />
      )}
    </div>
  )
}

export default DebtManagement
