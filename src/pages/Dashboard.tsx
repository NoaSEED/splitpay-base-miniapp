import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import GroupCard from '../components/GroupCard'

const Dashboard: React.FC = () => {
  const { isConnected, account } = useWeb3()
  const { groups, getGroupsByParticipant } = useGroups()

  // Get user's groups
  const userGroups = account ? getGroupsByParticipant(account) : groups

  // Calculate stats
  const totalGroups = userGroups.length
  const totalExpenses = userGroups.reduce((sum, group) => sum + group.expenses.length, 0)
  const totalAmount = userGroups.reduce((sum, group) => sum + group.totalAmount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
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
          <p className="text-gray-600 mb-6">
            Conecta tu wallet de Base para comenzar a dividir gastos con tus amigos.
          </p>
          <div className="bg-base-50 rounded-lg p-4">
            <p className="text-sm text-base-700">
              💡 <strong>Tip:</strong> Asegúrate de estar conectado a la red Base para usar SplitPay.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus gastos compartidos en Base
          </p>
        </div>
        
        <Link
          to="/create-group"
          className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Grupo</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Grupos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos Registrados</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Mis Grupos
          </h2>
          <span className="text-sm text-gray-500">
            {userGroups.length} grupo{userGroups.length !== 1 ? 's' : ''}
          </span>
        </div>

        {userGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-base-200">
            <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-base-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes grupos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer grupo para comenzar a dividir gastos con tus amigos.
            </p>
            <Link
              to="/create-group"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Grupo</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-base-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="flex justify-center">
          <Link
            to="/create-group"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-sm transition-shadow border border-base-200"
          >
            <div className="w-10 h-10 bg-base-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-base-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Crear Nuevo Grupo</p>
              <p className="text-sm text-gray-600">Inicia un nuevo grupo de gastos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
