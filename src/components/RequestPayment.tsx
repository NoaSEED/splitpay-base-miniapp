import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { Bell, X, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

interface RequestPaymentProps {
  groupId: string
  from: string
  to: string
  amount: number
  onClose: () => void
}

const RequestPayment: React.FC<RequestPaymentProps> = ({
  groupId,
  from,
  to,
  amount,
  onClose
}) => {
  const { formatAddress } = useWeb3()
  const { getParticipantName } = useGroups()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fromName = getParticipantName(groupId, from)
  const toName = getParticipantName(groupId, to)
  const displayFromName = fromName || formatAddress(from)
  const displayToName = toName || formatAddress(to)

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error('Por favor escribe un mensaje')
      return
    }

    setIsLoading(true)
    try {
      // Crear notificación de solicitud de pago
      const notification = {
        id: `payment_request_${Date.now()}`,
        type: 'payment_request',
        groupId,
        groupName: 'Grupo', // Se puede obtener del contexto
        message: `Solicitud de pago: ${message}`,
        amount,
        from,
        to,
        timestamp: new Date().toISOString(),
        read: false
      }

      // Guardar notificación para el destinatario
      const toNotifications = JSON.parse(localStorage.getItem(`notifications_${to}`) || '[]')
      toNotifications.push(notification)
      localStorage.setItem(`notifications_${to}`, JSON.stringify(toNotifications))

      toast.success('Solicitud de pago enviada')
      onClose()
    } catch (error) {
      toast.error('Error al enviar la solicitud')
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
          <h2 className="text-xl font-bold text-gray-800">Solicitar Pago</h2>
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
              <span className="font-medium text-gray-900">{displayFromName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Para:</span>
              <span className="font-medium text-gray-900">{displayToName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-bold text-base-700">{formatCurrency(amount)} USDC</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje personalizado *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-base-500 focus:border-base-500"
              rows={3}
              placeholder="Ej: Hola, necesito que me pagues tu parte del gasto de la cena..."
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Notificación Automática</p>
                <p className="mt-1">
                  Se enviará una notificación a {displayToName} para recordarle el pago pendiente.
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
              onClick={handleSendRequest}
              disabled={isLoading || !message.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestPayment

