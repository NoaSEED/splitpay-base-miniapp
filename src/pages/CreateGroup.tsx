import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Users, Plus, X, User } from 'lucide-react'
import AddParticipant from '../components/AddParticipant'

interface Participant {
  address: string
  name: string
}

const CreateGroup: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected, account, formatAddress } = useWeb3()
  const { createGroup, isLoading } = useGroups()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    divisionMethod: 'equal',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const [participants, setParticipants] = useState<Participant[]>(() => {
    // Inicializar con el usuario actual si está conectado
    if (account) {
      return [{ address: account, name: 'Tú' }]
    }
    return []
  })

  const [showAddParticipant, setShowAddParticipant] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddParticipant = (address: string, name: string) => {
    setParticipants(prev => [...prev, { address, name }])
    setShowAddParticipant(false)
  }

  const handleRemoveParticipant = (address: string) => {
    setParticipants(prev => prev.filter(p => p.address !== address))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      alert('Por favor, conecta tu wallet primero')
      return
    }

    if (participants.length < 2) {
      alert('Debes agregar al menos 2 participantes (incluyéndote a ti)')
      return
    }

    try {
      // Crear mapeo de nombres
      const participantNames: { [key: string]: string } = {}
      participants.forEach(p => {
        participantNames[p.address.toLowerCase()] = p.name
      })

      const success = await createGroup({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        participants: participants.map(p => p.address)
      })

      if (success) {
        navigate('/')
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-base-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('create.connect_wallet')}
          </h2>
          <p className="text-gray-600">
            {t('create.connect_description')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('ui.create_new_group')}</h1>
        <p className="text-gray-600">
          {t('create.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('ui.group_info')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('ui.group_name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                placeholder={t('placeholder.group_name')}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                {t('ui.category')}
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
              >
                <option value="general">{t('category.general')}</option>
                <option value="travel">{t('category.travel')}</option>
                <option value="food">{t('category.food')}</option>
                <option value="entertainment">{t('category.entertainment')}</option>
                <option value="utilities">{t('category.services')}</option>
                <option value="other">{t('category.other')}</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('ui.description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                placeholder={t('placeholder.description')}
            />
          </div>
        </div>

        {/* Participantes */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('ui.participants')}</h2>
            <button
              type="button"
              onClick={() => setShowAddParticipant(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors"
            >
              <Plus size={16} />
              <span>{t('ui.add_participant')}</span>
            </button>
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{t('ui.no_participants')}</p>
              <p className="text-sm">{t('ui.add_min_participants')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.address} className="flex items-center justify-between p-3 bg-base-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-base-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-base-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm text-gray-500 font-mono">
                        {formatAddress(participant.address)}
                      </p>
                    </div>
                  </div>
                  {participant.address !== account && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(participant.address)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('ui.remove_participant')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>• Tú estás incluido automáticamente como participante</p>
            <p>• Agrega las direcciones de wallet de tus amigos</p>
            <p>• Mínimo 2 participantes para crear el grupo</p>
          </div>
        </div>

        {/* Configuración */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="divisionMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Método de división
              </label>
              <select
                id="divisionMethod"
                name="divisionMethod"
                value={formData.divisionMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
              >
                <option value="equal">División igual</option>
                <option value="proportional">Proporcional</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de fin (opcional)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isLoading || participants.length < 2 || !formData.name.trim()}
            className="px-6 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('common.creating') : t('nav.create_group')}
          </button>
        </div>
      </form>

      {/* Modal para agregar participante */}
      {showAddParticipant && (
        <AddParticipant
          onAddParticipant={handleAddParticipant}
          onClose={() => setShowAddParticipant(false)}
          existingParticipants={participants.map(p => p.address)}
        />
      )}
    </div>
  )
}

export default CreateGroup