import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { Users, Calendar, Hash, FileText } from 'lucide-react'

const CreateGroup: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected, account } = useWeb3()
  const { createGroup, isLoading } = useGroups()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    divisionMethod: 'equal',
    participants: [account || ''],
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const participants = value.split('\n').filter(p => p.trim() !== '')
    setFormData(prev => ({
      ...prev,
      participants: [...participants, account || ''].filter((p, i, arr) => arr.indexOf(p) === i)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del grupo es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (formData.participants.length < 2) {
      newErrors.participants = 'Se necesitan al menos 2 participantes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!isConnected) {
      alert('Por favor, conecta tu wallet primero')
      return
    }

    try {
      const success = await createGroup({
        name: formData.name,
        description: formData.description,
        currency: 'USDC',
        category: formData.category,
        divisionMethod: formData.divisionMethod,
        participants: formData.participants,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: 'active'
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
            Conecta tu Wallet
          </h2>
          <p className="text-gray-600">
            Necesitas conectar tu wallet para crear un grupo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nuevo Grupo
        </h1>
        <p className="text-gray-600">
          Crea un grupo para dividir gastos con tus amigos usando USDC en Base.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-base-600" />
            Información Básica
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Grupo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Viaje a la playa"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe el propósito del grupo..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                >
                  <option value="general">General</option>
                  <option value="travel">Viaje</option>
                  <option value="food">Comida</option>
                  <option value="entertainment">Entretenimiento</option>
                  <option value="utilities">Servicios</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="divisionMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de División
                </label>
                <select
                  id="divisionMethod"
                  name="divisionMethod"
                  value={formData.divisionMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
                >
                  <option value="equal">Igual para todos</option>
                  <option value="proportional">Proporcional</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-base-600" />
            Participantes
          </h3>
          
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
              Direcciones de Wallet (una por línea) *
            </label>
            <textarea
              id="participants"
              name="participants"
              value={formData.participants.filter(p => p !== account).join('\n')}
              onChange={handleParticipantsChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500 ${
                errors.participants ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0x1234567890123456789012345678901234567890&#10;0x9876543210987654321098765432109876543210"
            />
            {errors.participants && (
              <p className="text-sm text-red-600 mt-1">{errors.participants}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Tu dirección ({account?.slice(0, 6)}...{account?.slice(-4)}) se agregará automáticamente.
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm border border-base-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-base-600" />
            Fechas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500 focus:border-base-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin (opcional)
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
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                <span>Crear Grupo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateGroup
