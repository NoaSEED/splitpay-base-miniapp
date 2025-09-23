import React from 'react'
import { useGroups } from '../contexts/GroupContext'
import { CheckCircle, Clock, XCircle, ExternalLink, DollarSign } from 'lucide-react'

interface PaymentHistoryProps {
  groupId: string
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ groupId }) => {
  const { getPaymentHistory, getParticipantName } = useGroups()
  const payments = getPaymentHistory(groupId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'disputed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'disputed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'pending':
        return 'Pendiente'
      case 'disputed':
        return 'Disputado'
      default:
        return 'Desconocido'
    }
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay pagos registrados</p>
          <p className="text-sm">Los pagos aparecerán aquí cuando se agreguen gastos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
      
      <div className="space-y-3">
        {payments.map((payment) => {
          const fromName = getParticipantName(groupId, payment.from)
          const toName = getParticipantName(groupId, payment.to)
          const displayFromName = fromName || payment.from.slice(0, 6) + '...' + payment.from.slice(-4)
          const displayToName = toName || payment.to.slice(0, 6) + '...' + payment.to.slice(-4)
          
          return (
            <div key={payment.id} className={`p-4 rounded-lg border ${getStatusColor(payment.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium text-gray-900">
                    {getStatusText(payment.status)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">De:</span>
                  <span className="text-sm font-medium text-gray-900">{displayFromName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Para:</span>
                  <span className="text-sm font-medium text-gray-900">{displayToName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monto:</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                </div>
                
                {payment.status === 'completed' && payment.transactionHash && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Transacción:</span>
                      <a
                        href={`https://basescan.org/tx/${payment.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-base-600 hover:text-base-700"
                      >
                        <span className="font-mono">{payment.transactionHash.slice(0, 10)}...</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    {payment.completedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completado: {formatDate(payment.completedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentHistory
