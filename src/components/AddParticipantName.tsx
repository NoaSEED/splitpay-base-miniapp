import React, { useState } from 'react'
import { useGroups } from '../contexts/GroupContext'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddParticipantNameProps {
  groupId: string
  address: string
  currentName?: string
  onClose: () => void
}

const AddParticipantName: React.FC<AddParticipantNameProps> = ({
  groupId,
  address,
  currentName = '',
  onClose
}) => {
  const { addParticipantName } = useGroups()
  const [name, setName] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Por favor ingresa un nombre')
      return
    }

    setIsLoading(true)
    const success = await addParticipantName(groupId, address, name.trim())
    setIsLoading(false)

    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {currentName ? 'Editar Nombre' : 'Agregar Nombre'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección del participante:
            </label>
            <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-600">
              {address}
            </div>
          </div>

          <div>
            <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del participante:
            </label>
            <input
              type="text"
              id="participantName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-base-500 focus:border-base-500"
              placeholder="Ej: Juan Pérez"
              maxLength={50}
              required
            />
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
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>{currentName ? 'Actualizar' : 'Agregar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddParticipantName
