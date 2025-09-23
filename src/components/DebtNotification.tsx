import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

const DebtNotification: React.FC = () => {
  const { account, isConnected } = useWeb3()
  const { getParticipantDebts } = useGroups()
  const [debts, setDebts] = useState<{ groupId: string; groupName: string; amount: number }[]>([])
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (isConnected && account) {
      const userDebts = getParticipantDebts(account)
      setDebts(userDebts)
      
      if (userDebts.length > 0) {
        setShowNotification(true)
        toast.success(`Tienes ${userDebts.length} deuda(s) pendiente(s)`)
      }
    } else {
      setDebts([])
      setShowNotification(false)
    }
  }, [isConnected, account, getParticipantDebts])

  if (!showNotification || debts.length === 0) {
    return null
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0)

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-red-800">Deudas Pendientes</h3>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-red-700">
            <span className="font-medium">Total adeudado:</span>
            <span className="font-bold">${totalDebt.toFixed(2)} USDC</span>
          </div>

          <div className="space-y-1">
            {debts.map((debt, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-red-600 bg-red-100 rounded-lg px-2 py-1">
                <span className="truncate">{debt.groupName}</span>
                <span className="font-medium">${debt.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-red-200">
          <p className="text-xs text-red-600">
            💡 Conecta tu wallet para ver y gestionar tus deudas
          </p>
        </div>
      </div>
    </div>
  )
}

export default DebtNotification
