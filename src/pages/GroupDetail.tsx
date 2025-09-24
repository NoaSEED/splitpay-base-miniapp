import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { ArrowLeft, Plus, Users, DollarSign, Hash, User, XCircle, AlertTriangle, Trash2, Edit } from 'lucide-react'
import AddParticipantName from '../components/AddParticipantName'
import PendingPayments from '../components/PendingPayments'
import PaymentHistory from '../components/PaymentHistory'
import DebtManagement from '../components/DebtManagement'
import CancelDebt from '../components/CancelDebt'

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isConnected, account, formatAddress } = useWeb3()
  const { getGroup, addExpense, deleteExpense, cancelExpense, getParticipantName, deleteGroup, isLoading } = useGroups()
  
  const [group, setGroup] = useState<any>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddNameModal, setShowAddNameModal] = useState(false)
  const [showCancelDebtModal, setShowCancelDebtModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState('')
  const [selectedDebt, setSelectedDebt] = useState<{
    from: string
    to: string
    amount: number
  } | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: account || ''
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (id) {
      loadGroup()
    }
  }, [id])

  const loadGroup = async () => {
    if (id) {
      const groupData = await getGroup(id)
      setGroup(groupData)
    }
  }

  const handlePaymentCompleted = () => {
    // Recargar datos del grupo
    loadGroup()
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    const expenseData = {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy || account || ''
    }

    const success = await addExpense(id, expenseData)
    if (success) {
      setNewExpense({ description: '', amount: '', paidBy: account || '' })
      setShowAddExpense(false)
      loadGroup() // Recargar datos
    }
  }

  const handleEditParticipantName = (participant: string) => {
    setSelectedParticipant(participant)
    setShowAddNameModal(true)
  }

  const handleDeleteGroup = async () => {
    if (!id) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el grupo "${group?.name}"? Esta acción no se puede deshacer.`
    )
    
    if (confirmed) {
      const success = await deleteGroup(id)
      if (success) {
        navigate('/')
      }
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!id) return
    
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.'
    )
    
    if (confirmed) {
      const success = await deleteExpense(id, expenseId)
      if (success) {
        loadGroup() // Recargar datos
      }
    }
  }

  const handleCancelExpense = async (expenseId: string) => {
    if (!id) return
    
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres cancelar este gasto? Se marcará como cancelado pero se mantendrá en el historial.'
    )
    
    if (confirmed) {
      const success = await cancelExpense(id, expenseId)
      if (success) {
        loadGroup() // Recargar datos
      }
    }
  }

  const handleCancelDebt = (from: string, to: string, amount: number) => {
    setSelectedDebt({ from, to, amount })
    setShowCancelDebtModal(true)
  }

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

  const getTotalOwed = (participant: string) => {
    if (!group) return 0
    const totalExpenses = group.expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
    const participantCount = group.participants.length
    const sharePerPerson = totalExpenses / participantCount

    const paidByParticipant = group.expenses
      .filter((expense: any) => expense.paidBy?.toLowerCase() === participant.toLowerCase())
      .reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

    return sharePerPerson - paidByParticipant
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-base-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conecta tu Wallet
          </h2>
          <p className="text-gray-600">
            Necesitas conectar tu wallet para ver los detalles del grupo.
          </p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-base-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Grupo no encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          El grupo que buscas no existe o no tienes acceso a él.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-base-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {group.name}
            </h1>
            <p className="text-gray-600">
              {group.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Gasto</span>
          </button>
          
          <button
            onClick={handleDeleteGroup}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar Grupo</span>
          </button>
        </div>
      </div>

           {/* Debt Management */}
           {account && (
            <DebtManagement 
              groupId={group.id} 
              onPaymentCompleted={handlePaymentCompleted}
            />
           )}

           {/* Pending Payments */}
           {account && (
             <div data-pending-payments>
               <PendingPayments 
                 groupId={group.id} 
                 onPaymentCompleted={handlePaymentCompleted}
                 key={refreshKey}
               />
             </div>
           )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(group.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos</p>
              <p className="text-2xl font-bold text-gray-900">{group.expenses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Participantes</p>
              <p className="text-2xl font-bold text-gray-900">{group.participants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants and Balances */}
      <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes y Saldos</h3>
        <div className="space-y-3">
          {group.participants.map((participant: string, index: number) => {
            const owed = getTotalOwed(participant)
            const participantName = getParticipantName(group.id, participant)
            const displayName = participantName || (participant === account ? 'Tú' : 'Participante')
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-base-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-base-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-base-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {displayName}
                      </p>
                      <button
                        onClick={() => handleEditParticipantName(participant)}
                        className="p-1 hover:bg-base-200 rounded transition-colors"
                        title="Editar nombre"
                      >
                        <Edit size={14} className="text-base-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatAddress(participant)}
                    </p>
                  </div>
                </div>
                     <div className="flex items-center space-x-4">
                       <div className="text-right">
                         <p className={`font-semibold ${owed > 0 ? 'text-red-600' : owed < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                           {owed > 0 ? `Debe ${formatCurrency(owed)}` : 
                            owed < 0 ? `Le deben ${formatCurrency(Math.abs(owed))}` : 
                            'En balance'}
                         </p>
                       </div>
                       
                       {/* Botón de cancelar deuda - solo si el usuario actual debe dinero a este participante */}
                       {account && owed > 0 && participant.toLowerCase() !== account.toLowerCase() && (
                         <button
                           onClick={() => handleCancelDebt(account, participant, owed)}
                           className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                           title="Cancelar deuda con este participante"
                         >
                           <XCircle size={14} />
                           <span>Cancelar Deuda</span>
                         </button>
                       )}
                       
                       {/* Botón de cancelar deuda - si este participante debe dinero al usuario actual */}
                       {account && owed < 0 && participant.toLowerCase() !== account.toLowerCase() && (
                         <button
                           onClick={() => handleCancelDebt(participant, account, Math.abs(owed))}
                           className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                           title="Cancelar deuda de este participante"
                         >
                           <AlertTriangle size={14} />
                           <span>Cancelar Su Deuda</span>
                         </button>
                       )}
                     </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos</h3>
        
        {group.expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-base-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No hay gastos aún
            </h4>
            <p className="text-gray-600 mb-4">
              Agrega el primer gasto para comenzar a dividir los costos.
            </p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
            >
              Agregar Primer Gasto
            </button>
          </div>
             ) : (
               <div className="space-y-4">
                 {group.expenses.map((expense: any, index: number) => (
                   <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                     expense.status === 'cancelled' 
                       ? 'bg-gray-100 border border-gray-200' 
                       : 'bg-base-50'
                   }`}>
                     <div className="flex-1">
                       <div className="flex items-center space-x-2 mb-1">
                         <h4 className="font-medium text-gray-900">{expense.description}</h4>
                         {expense.status === 'cancelled' && (
                           <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                             Cancelado
                           </span>
                         )}
                       </div>
                       <p className="text-sm text-gray-500">
                         Pagado por: {expense.paidBy?.slice(0, 6)}...{expense.paidBy?.slice(-4)}
                       </p>
                       <p className="text-sm text-gray-500">
                         {formatDate(expense.createdAt)}
                       </p>
                       {expense.status === 'cancelled' && expense.cancelledAt && (
                         <p className="text-sm text-gray-400">
                           Cancelado: {formatDate(expense.cancelledAt)}
                         </p>
                       )}
                     </div>
                     <div className="flex items-center space-x-4">
                       <div className="text-right">
                         <p className={`text-lg font-semibold ${
                           expense.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-gray-900'
                         }`}>
                           {formatCurrency(expense.amount)}
                         </p>
                         <p className="text-sm text-gray-500">
                           {formatCurrency(expense.amount / group.participants.length)} por persona
                         </p>
                       </div>
                       <div className="flex items-center space-x-2">
                         {expense.status !== 'cancelled' && (
                           <button
                             onClick={() => handleCancelExpense(expense.id)}
                             className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                             title="Cancelar gasto"
                           >
                             <XCircle size={16} />
                           </button>
                         )}
                         <button
                           onClick={() => handleDeleteExpense(expense.id)}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           title="Eliminar gasto"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
      </div>

      {/* Payment History */}
      <PaymentHistory groupId={group.id} />

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Gasto</h3>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                  placeholder="Ej: Cena en restaurante"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pagado por
                </label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                >
                  {group.participants.map((participant: string, index: number) => (
                    <option key={index} value={participant}>
                      {participant === account ? 'Tú' : `${participant.slice(0, 6)}...${participant.slice(-4)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Agregando...' : 'Agregar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

           {/* Add Participant Name Modal */}
           {showAddNameModal && (
             <AddParticipantName
               groupId={group.id}
               address={selectedParticipant}
               currentName={getParticipantName(group.id, selectedParticipant)}
               onClose={() => {
                 setShowAddNameModal(false)
                 setSelectedParticipant('')
                 loadGroup() // Recargar datos para mostrar el nombre actualizado
               }}
             />
           )}

           {/* Cancel Debt Modal */}
           {showCancelDebtModal && selectedDebt && (
             <CancelDebt
               groupId={group.id}
               from={selectedDebt.from}
               to={selectedDebt.to}
               amount={selectedDebt.amount}
               onClose={() => {
                 setShowCancelDebtModal(false)
                 setSelectedDebt(null)
                 loadGroup() // Recargar datos después de cancelar
               }}
             />
           )}
    </div>
  )
}

export default GroupDetail
