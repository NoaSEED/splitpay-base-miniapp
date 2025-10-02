import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, DollarSign, TrendingUp, ArrowLeftRight } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { useLanguage } from '../contexts/LanguageContext'
import GroupCard from '../components/GroupCard'
import SplitPayExchange from '../components/SplitPayExchange'

const Dashboard: React.FC = () => {
  const { isConnected, account } = useWeb3()
  const { groups, getGroupsByParticipant } = useGroups()
  const { t } = useLanguage()
  
  // Estado para el modal de swap
  const [showSwap, setShowSwap] = useState(false)

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
            {t('dashboard.connect_wallet')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('dashboard.connect_description')}
          </p>
          <div className="bg-base-50 rounded-lg p-4">
            <p className="text-sm text-base-700">
              {t('dashboard.tip')}
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
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.manage_expenses')}
          </p>
        </div>
        
            <div className="flex items-center space-x-3">
              {/* Botón de Swap */}
              <button
                onClick={() => setShowSwap(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <span className="text-lg">🦄</span>
                <ArrowLeftRight className="w-4 h-4" />
                <span>Swap</span>
              </button>
              
              {/* Botón de Crear Grupo */}
              <Link
                to="/create-group"
                className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('dashboard.create_group')}</span>
              </Link>
            </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-base-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-base-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.active_groups')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('dashboard.total_spent')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('dashboard.registered_expenses')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('dashboard.my_groups')}
          </h2>
        </div>

        {userGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-base-200">
            <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-base-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('ui.no_groups')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.create_first_group')}
            </p>
            <Link
              to="/create-group"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('ui.create_new_group')}</span>
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


      {/* Modal de Swap */}
      <SplitPayExchange 
        isOpen={showSwap}
        onClose={() => setShowSwap(false)}
      />
    </div>
  )
}

export default Dashboard
