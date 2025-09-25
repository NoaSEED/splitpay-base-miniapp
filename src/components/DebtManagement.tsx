import React, { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { OptimizedCard } from './OptimizedCard'
import { AlertCircle, CreditCard, Users } from 'lucide-react'
import PayDebtButton from './PayDebtButton'
import { calculateBalances } from '../utils'

interface DebtManagementProps {
  groupId: string
  onPaymentCompleted?: () => void
}

const DebtManagement: React.FC<DebtManagementProps> = ({ groupId, onPaymentCompleted }) => {
  const { account } = useWeb3()
  const { groups } = useGroups()
  const [group, setGroup] = useState<any>(null)
  const [debts, setDebts] = useState<{ from: string; to: string; amount: number }[]>([])
  const [userOwes, setUserOwes] = useState(0)
  const [userIsOwed, setUserIsOwed] = useState(0)

  // Cargar grupo y calcular deudas
  const loadGroupAndCalculateDebts = useCallback(async () => {
    if (!account || !groupId) return

    try {
      // Obtener grupo directamente del localStorage para tener datos actualizados
      const groups = JSON.parse(localStorage.getItem('splitpay-groups') || '[]')
      const groupData = groups.find((g: any) => g.id === groupId)
      
      if (!groupData) return

      setGroup(groupData)
      
      // Calcular balances usando la función utilitaria
      const { debts: calculatedDebts, userOwes: calculatedUserOwes, userIsOwed: calculatedUserIsOwed } = 
        calculateBalances(groupData, account)

      setDebts(calculatedDebts)
      setUserOwes(calculatedUserOwes)
      setUserIsOwed(calculatedUserIsOwed)

    } catch (error) {
      console.error('Error loading group or calculating debts:', error)
    }
  }, [account, groupId])

  useEffect(() => {
    loadGroupAndCalculateDebts()
  }, [loadGroupAndCalculateDebts])

  // Escuchar cambios en el contexto de grupos
  useEffect(() => {
    const groupData = groups.find(g => g.id === groupId)
    if (groupData && account) {
      setGroup(groupData)
      
      const { debts: calculatedDebts, userOwes: calculatedUserOwes, userIsOwed: calculatedUserIsOwed } = 
        calculateBalances(groupData, account)

      setDebts(calculatedDebts)
      setUserOwes(calculatedUserOwes)
      setUserIsOwed(calculatedUserIsOwed)
    }
  }, [groups, groupId, account])

  // Escuchar cambios en localStorage para actualización inmediata
  useEffect(() => {
    const handleStorageChange = () => {
      loadGroupAndCalculateDebts()
    }

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange)
    
    // También crear un intervalo para verificar cambios (para la misma pestaña)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [loadGroupAndCalculateDebts])

  if (!account) {
    return (
      <OptimizedCard className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Conecta tu Wallet</h3>
        <p className="text-gray-600">Necesitas conectar tu wallet para ver las deudas</p>
      </OptimizedCard>
    )
  }

  if (!group) {
    return (
      <OptimizedCard className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando información del grupo...</p>
      </OptimizedCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Deudas del Usuario */}
      <OptimizedCard>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mis Deudas</h3>
            <p className="text-sm text-gray-600">Resumen de pagos pendientes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Lo que debes */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Debes</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {userOwes.toFixed(2)} USDC
            </p>
          </div>

          {/* Lo que te deben */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Te deben</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {userIsOwed.toFixed(2)} USDC
            </p>
          </div>
        </div>
      </OptimizedCard>

      {/* Lista de Deudas Específicas */}
      {debts.length > 0 ? (
        <OptimizedCard>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Deudas Pendientes</h3>
              <p className="text-sm text-gray-600">Pagos específicos por realizar</p>
            </div>
          </div>

          <div className="space-y-4">
            {debts.map((debt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {group.participantNames?.[debt.from.toLowerCase()] || 
                         `${debt.from.slice(0, 6)}...${debt.from.slice(-4)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        debe a {group.participantNames?.[debt.to.toLowerCase()] || 
                                `${debt.to.slice(0, 6)}...${debt.to.slice(-4)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">
                      {debt.amount.toFixed(2)} USDC
                    </p>
                  </div>
                </div>

                {/* Botón de Pagar - Solo si el usuario actual es quien debe */}
                <PayDebtButton
                  groupId={groupId}
                  debtAmount={debt.amount}
                  fromAddress={debt.from}
                  toAddress={debt.to}
                  onPaymentCompleted={() => {
                    loadGroupAndCalculateDebts()
                    if (onPaymentCompleted) {
                      onPaymentCompleted()
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </OptimizedCard>
      ) : (
        <OptimizedCard className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
          <p className="text-gray-600">
            {userIsOwed > 0 
              ? `Te deben ${userIsOwed.toFixed(2)} USDC`
              : 'No tienes deudas pendientes en este grupo'
            }
          </p>
        </OptimizedCard>
      )}

      {/* Información adicional */}
      <OptimizedCard className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Cómo funciona el pago?</p>
            <ol className="space-y-1 text-xs">
              <li>1. Haz clic en "Pagar" para la deuda que quieres saldar</li>
              <li>2. Realiza la transacción en tu wallet</li>
              <li>3. Copia el hash de la transacción</li>
              <li>4. Pégalo en el formulario y confirma</li>
              <li>5. ¡La deuda se marcará como pagada automáticamente!</li>
            </ol>
          </div>
        </div>
      </OptimizedCard>
    </div>
  )
}

export default DebtManagement