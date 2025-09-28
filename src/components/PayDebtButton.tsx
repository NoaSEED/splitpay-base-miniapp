import React, { useState } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { useLanguage } from '../contexts/LanguageContext'
import { OptimizedButton } from './OptimizedButton'
import { OptimizedInput } from './OptimizedInput'
import { OptimizedCard } from './OptimizedCard'
import { X, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateTransaction } from '../utils/transactionValidator'

interface PayDebtButtonProps {
  groupId: string
  debtAmount: number
  fromAddress: string
  toAddress: string
  onPaymentCompleted?: () => void
}

const PayDebtButton: React.FC<PayDebtButtonProps> = ({
  groupId,
  debtAmount,
  fromAddress,
  toAddress,
  onPaymentCompleted
}) => {
  const { account, provider } = useWeb3()
  const { getParticipantName } = useGroups()
  const { t, translateNotification } = useLanguage()
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Solo mostrar si el usuario actual es quien debe pagar
  if (!account || account.toLowerCase() !== fromAddress.toLowerCase()) {
    return null
  }

  const handlePayDebt = async () => {
    if (!transactionHash.trim()) {
      setError(t('payment.transaction_hash_required'))
      return
    }

    // Validar formato de hash de transacción
    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash.trim())) {
      setError(t('payment.transaction_hash_invalid_format'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!provider) {
        setError('No hay conexión a Web3')
        return
      }

      const validationResult = await validateTransaction(
        transactionHash.trim(),
        fromAddress,
        toAddress,
        debtAmount,
        provider
      )

      if (!validationResult.isValid) {
        setError(validationResult.error || 'Transacción inválida')
        console.error('❌ Validación fallida:', validationResult.error)
        return
      }

      console.log('✅ Transacción validada correctamente:', validationResult.transactionData)
      toast.success(t('payment.validate_success'))
      // Generar ID único para el pago
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Crear pago completado directamente (no crear como pending primero)
      const groups = JSON.parse(localStorage.getItem('splitpay-groups') || '[]')
      const updatedGroups = groups.map((group: any) => {
        if (group.id === groupId) {
          const completedPayment = {
            id: paymentId,
            from: fromAddress,
            to: toAddress,
            amount: debtAmount,
            status: 'completed',
            transactionHash: transactionHash.trim(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            completedBy: account,
            notes: 'Pago completado mediante hash de transacción'
          }

          // Crear notificación para el receptor
          const notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'payment_completed',
            groupId: group.id,
            groupName: group.name,
            message: translateNotification('notifications.payment_received', {
              amount: debtAmount.toFixed(2),
              from: group.participantNames?.[fromAddress.toLowerCase()] || `${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`,
              group: group.name
            }),
            amount: debtAmount,
            from: fromAddress,
            to: toAddress,
            timestamp: new Date().toISOString(),
            read: false
          }

          // Guardar notificación para el receptor
          const notificationsKey = `notifications_${toAddress.toLowerCase()}`
          const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]')
          localStorage.setItem(notificationsKey, JSON.stringify([...existingNotifications, notification]))

          return {
            ...group,
            payments: [...group.payments, completedPayment]
          }
        }
        return group
      })

      // Guardar grupos actualizados
      localStorage.setItem('splitpay-groups', JSON.stringify(updatedGroups))
      
      toast.success(`¡Pago de ${debtAmount.toFixed(2)} USDC completado!`)
      setShowPaymentModal(false)
      setTransactionHash('')
      setError(null)
      
      // Llamar callback para actualizar la UI
      if (onPaymentCompleted) {
        onPaymentCompleted()
      }

    } catch (error: unknown) {
      console.error('Error procesando pago:', error)
      setError(error instanceof Error ? error.message : 'Error al procesar el pago')
      toast.error('Error al procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  const fromName = getParticipantName(groupId, fromAddress)
  const toName = getParticipantName(groupId, toAddress)

  return (
    <>
      {/* Botón de Pagar */}
      <OptimizedButton
        variant="primary"
        size="sm"
        leftIcon={<CreditCard className="w-4 h-4" />}
        onClick={() => setShowPaymentModal(true)}
        className="w-full"
      >
        Pagar {debtAmount.toFixed(2)} USDC
      </OptimizedButton>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <OptimizedCard className="w-full max-w-md" padding="lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Completar Pago</h3>
                  <p className="text-sm text-gray-600">Ingresa el hash de la transacción</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setTransactionHash('')
                  setError(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Información del Pago */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">De:</span>
                  <span className="font-medium">{fromName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Para:</span>
                  <span className="font-medium">{toName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold text-green-600">
                    {debtAmount.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <OptimizedInput
                label="Hash de Transacción"
                placeholder="0x..."
                value={transactionHash}
                onChange={(e) => {
                  setTransactionHash(e.target.value)
                  setError(null)
                }}
                error={error || undefined}
                leftIcon={<AlertCircle className="w-4 h-4" />}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Instrucciones:</p>
                    <ol className="mt-1 space-y-1 text-xs">
                      <li>1. Realiza la transacción en tu wallet</li>
                      <li>2. Copia el hash de la transacción</li>
                      <li>3. Pégalo en el campo de arriba</li>
                      <li>4. Haz clic en "Completar Pago"</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <OptimizedButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setShowPaymentModal(false)
                    setTransactionHash('')
                    setError(null)
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </OptimizedButton>
                
                <OptimizedButton
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={isLoading}
                  onClick={handlePayDebt}
                  disabled={!transactionHash.trim() || isLoading}
                >
                  {isLoading ? 'Procesando...' : 'Completar Pago'}
                </OptimizedButton>
              </div>
            </div>
          </OptimizedCard>
        </div>
      )}
    </>
  )
}

export default PayDebtButton
