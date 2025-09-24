import React from 'react'
import { Link } from 'react-router-dom'
import { Users, DollarSign, Calendar, MoreHorizontal } from 'lucide-react'
import { GroupData } from '../contexts/GroupContext'

interface GroupCardProps {
  group: GroupData
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-base-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {group.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {group.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{group.participants.length} participantes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(group.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
              {group.status === 'active' ? 'Activo' : group.status}
            </span>
            <button className="p-1 hover:bg-base-100 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-base-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-base-600" />
              <span className="text-sm font-medium text-base-700">Total Gastado</span>
            </div>
            <p className="text-lg font-semibold text-base-900">
              {formatCurrency(group.totalAmount)}
            </p>
          </div>
          
          <div className="bg-base-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-base-600" />
              <span className="text-sm font-medium text-base-700">Gastos</span>
            </div>
            <p className="text-lg font-semibold text-base-900">
              {group.expenses.length}
            </p>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Participantes:</p>
          <div className="flex flex-wrap gap-2">
            {group.participants.slice(0, 3).map((participant, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-base-100 text-base-700 rounded-md text-xs font-mono"
              >
                {participant.slice(0, 6)}...{participant.slice(-4)}
              </span>
            ))}
            {group.participants.length > 3 && (
              <span className="px-2 py-1 bg-base-100 text-base-700 rounded-md text-xs">
                +{group.participants.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/group/${group.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors text-sm font-medium"
          >
            <span>Ver Detalles</span>
          </Link>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>División: {group.divisionMethod}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupCard

