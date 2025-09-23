import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddParticipantProps {
  onAddParticipant: (address: string, name: string) => void
  onClose: () => void
  existingParticipants: string[]
}

const AddParticipant: React.FC<AddParticipantProps> = ({
  onAddParticipant,
  onClose,
  existingParticipants
}) => {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address.trim() || !name.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      toast.error('Por favor ingresa una dirección Ethereum válida (0x...)')
      return
    }

    // Verificar que no sea un participante duplicado
    const normalizedAddress = address.toLowerCase()
    const isDuplicate = existingParticipants.some(existing => 
      existing.toLowerCase() === normalizedAddress
    )
    
    if (isDuplicate) {
      toast.error('Este participante ya está en el grupo')
      return
    }

    setIsLoading(true)
    try {
      onAddParticipant(address.trim(), name.trim())
      setAddress('')
      setName('')
      toast.success(`Participante "${name}" agregado`)
    } catch (error) {
      toast.error('Error al agregar participante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Agregar Participante</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del participante *
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

          <div>
            <label htmlFor="participantAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de wallet *
            </label>
            <input
              type="text"
              id="participantAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-base-500 focus:border-base-500 font-mono text-sm"
              placeholder="0x..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Dirección Ethereum completa (0x + 40 caracteres)
            </p>
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
              disabled={isLoading || !address.trim() || !name.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddParticipant
