import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import toast from 'react-hot-toast'

// ===========================================
// Types & Interfaces
// ===========================================

interface GroupData {
  id: string
  name: string
  description: string
  currency: 'USDC' // Solo USDC en Base
  category: string
  startDate: string
  endDate?: string
  divisionMethod: string
  participants: string[]
  createdAt: string
  status: string
  totalAmount: number
  expenses: any[]
  contractAddress?: string
}

interface GroupContextType {
  // Groups state
  groups: GroupData[]
  currentGroup: GroupData | null
  isLoading: boolean
  
  // Actions
  createGroup: (groupData: Omit<GroupData, 'id' | 'createdAt' | 'expenses' | 'totalAmount'>) => Promise<boolean>
  addExpense: (groupId: string, expenseData: any) => Promise<boolean>
  getGroup: (groupId: string) => Promise<GroupData | null>
  updateGroup: (groupId: string, updates: Partial<GroupData>) => Promise<boolean>
  deleteGroup: (groupId: string) => Promise<boolean>
  
  // Utility
  getGroupsByParticipant: (address: string) => GroupData[]
  getTotalOwed: (groupId: string, participant: string) => number
}

// ===========================================
// Context Creation
// ===========================================

const GroupContext = createContext<GroupContextType | undefined>(undefined)

// ===========================================
// Provider Component
// ===========================================

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [groups, setGroups] = useState<GroupData[]>([])
  const [currentGroup, setCurrentGroup] = useState<GroupData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ===========================================
  // Load Groups from localStorage
  // ===========================================

  useEffect(() => {
    const loadGroups = () => {
      try {
        const savedGroups = localStorage.getItem('splitpay-groups')
        if (savedGroups) {
          const parsedGroups = JSON.parse(savedGroups)
          setGroups(parsedGroups)
          console.log('📁 Grupos cargados:', parsedGroups.length)
        }
      } catch (error) {
        console.error('Error loading groups:', error)
        toast.error('Error al cargar los grupos')
      }
    }

    loadGroups()
  }, [])

  // ===========================================
  // Save Groups to localStorage
  // ===========================================

  const saveGroups = useCallback((newGroups: GroupData[]) => {
    try {
      localStorage.setItem('splitpay-groups', JSON.stringify(newGroups))
      setGroups(newGroups)
    } catch (error) {
      console.error('Error saving groups:', error)
      toast.error('Error al guardar los grupos')
    }
  }, [])

  // ===========================================
  // Group Management Functions
  // ===========================================

  const createGroup = useCallback(async (groupData: Omit<GroupData, 'id' | 'createdAt' | 'expenses' | 'totalAmount'>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const newGroup: GroupData = {
        ...groupData,
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        expenses: [],
        totalAmount: 0,
        status: 'active'
      }

      const updatedGroups = [...groups, newGroup]
      saveGroups(updatedGroups)
      
      toast.success(`Grupo "${newGroup.name}" creado exitosamente`)
      console.log('✅ Grupo creado:', newGroup.name)
      
      return true
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Error al crear el grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const addExpense = useCallback(async (groupId: string, expenseData: any): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const newExpense = {
            ...expenseData,
            id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            groupId: groupId
          }
          
          return {
            ...group,
            expenses: [...group.expenses, newExpense],
            totalAmount: group.totalAmount + (expenseData.amount || 0)
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success(`Gasto "${expenseData.description}" agregado`)
      console.log('💰 Gasto agregado:', expenseData.description)
      
      return true
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Error al agregar el gasto')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const getGroup = useCallback(async (groupId: string): Promise<GroupData | null> => {
    try {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        setCurrentGroup(group)
        return group
      }
      return null
    } catch (error) {
      console.error('Error getting group:', error)
      return null
    }
  }, [groups])

  const updateGroup = useCallback(async (groupId: string, updates: Partial<GroupData>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { ...group, ...updates }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success('Grupo actualizado')
      console.log('🔄 Grupo actualizado:', groupId)
      
      return true
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Error al actualizar el grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const deleteGroup = useCallback(async (groupId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.filter(group => group.id !== groupId)
      saveGroups(updatedGroups)
      
      toast.success('Grupo eliminado')
      console.log('🗑️ Grupo eliminado:', groupId)
      
      return true
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Error al eliminar el grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  // ===========================================
  // Utility Functions
  // ===========================================

  const getGroupsByParticipant = useCallback((address: string): GroupData[] => {
    return groups.filter(group => 
      group.participants.some(participant => 
        participant.toLowerCase() === address.toLowerCase()
      )
    )
  }, [groups])

  const getTotalOwed = useCallback((groupId: string, participant: string): number => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return 0

    // Calcular cuánto debe cada participante
    const totalExpenses = group.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const participantCount = group.participants.length
    const sharePerPerson = totalExpenses / participantCount

    // Calcular cuánto ha pagado cada participante
    const paidByParticipant = group.expenses
      .filter(expense => expense.paidBy?.toLowerCase() === participant.toLowerCase())
      .reduce((sum, expense) => sum + (expense.amount || 0), 0)

    return sharePerPerson - paidByParticipant
  }, [groups])

  // ===========================================
  // Context Value
  // ===========================================

  const value: GroupContextType = {
    // Groups state
    groups,
    currentGroup,
    isLoading,
    
    // Actions
    createGroup,
    addExpense,
    getGroup,
    updateGroup,
    deleteGroup,
    
    // Utility
    getGroupsByParticipant,
    getTotalOwed,
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

// ===========================================
// Hook
// ===========================================

export const useGroups = (): GroupContextType => {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider')
  }
  return context
}

// ===========================================
// Export types for external use
// ===========================================

export type { GroupData, GroupContextType }
