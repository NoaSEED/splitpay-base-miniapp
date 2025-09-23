import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups, Payment } from '../contexts/GroupContext'
import { AlertCircle, CheckCircle, Clock, User, DollarSign } from 'lucide-react'
import CompletePayment from './CompletePayment'

interface PendingPaymentsProps {
  groupId: string
}

const PendingPayments: React.FC<PendingPaymentsProps> = ({ groupId }) => {
  const { account, formatAddress } = useWeb3()
  const { getPendingPayments, completePayment, getParticipantName } = useGroups()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const pendingPayments = account ? getPendingPayments(groupId, account) : []

  const handleCompletePayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowCompleteModal(true)
  }

  const handlePaymentComplete = async (paymentId: string, transactionHash: string) => {
    if (account) {
      const success = await completePayment(groupId, paymentId, transactionHash, account)
      if (success) {
        setShowCompleteModal(false)
        setSelectedPayment(null)
      }
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

  if (pendingPayments.length === 0) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">Pagos Pendientes</h3>
      </div>

      <div className="space-y-3">
        {pendingPayments.map((payment) => {
          const toName = getParticipantName(groupId, payment.to)
          const displayToName = toName || formatAddress(payment.to)
          
          return (
            <div key={payment.id} className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Pago Pendiente</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Debe a: <span className="font-medium">{displayToName}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Monto: <span className="font-bold text-yellow-700">{formatCurrency(payment.amount)} USDC</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCompletePayment(payment)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <CheckCircle size={14} />
                    <span>Pagar</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs text-yellow-700">
                  💡 Haz clic en "Pagar" para marcar como completado y agregar el hash de la transacción
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {showCompleteModal && selectedPayment && (
        <CompletePayment
          paymentId={selectedPayment.id}
          from={selectedPayment.from}
          to={selectedPayment.to}
          amount={selectedPayment.amount}
          onComplete={handlePaymentComplete}
          onClose={() => {
            setShowCompleteModal(false)
            setSelectedPayment(null)
          }}
        />
      )}
    </div>
  )
}

export default PendingPayments
