import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { STORAGE_KEYS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants'
import { createNotification, saveNotification, calculateBalances, saveToLocalStorage, loadFromLocalStorage } from '../utils'
import type { Group, Expense, Payment, CreateGroupForm, AddExpenseForm, AddParticipantForm } from '../types'

// ===========================================
// Types & Interfaces
// ===========================================

interface GroupContextType {
  // Groups state
  groups: Group[]
  currentGroup: Group | null
  isLoading: boolean
  
  // Actions
  createGroup: (groupData: CreateGroupForm) => Promise<boolean>
  addExpense: (groupId: string, expenseData: AddExpenseForm) => Promise<boolean>
  deleteExpense: (groupId: string, expenseId: string) => Promise<boolean>
  cancelExpense: (groupId: string, expenseId: string) => Promise<boolean>
  completePayment: (groupId: string, paymentId: string, transactionHash: string, completedBy: string) => Promise<boolean>
  getGroup: (groupId: string) => Promise<Group | null>
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<boolean>
  deleteGroup: (groupId: string) => Promise<boolean>
  
  // Participant management
  addParticipant: (groupId: string, participantData: AddParticipantForm) => Promise<boolean>
  addParticipantName: (groupId: string, address: string, name: string) => Promise<boolean>
  getParticipantName: (groupId: string, address: string) => string
  
  // Payment management
  createPayment: (groupId: string, from: string, to: string, amount: number) => Promise<boolean>
  getPendingPayments: (groupId: string, participant: string) => Payment[]
  getPaymentHistory: (groupId: string) => Payment[]
  
  // Utility
  getGroupsByParticipant: (address: string) => Group[]
  getTotalOwed: (groupId: string, participant: string) => number
  getParticipantDebts: (address: string) => { groupId: string; groupName: string; amount: number }[]
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
  const [groups, setGroups] = useState<Group[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ===========================================
  // Load Groups from localStorage
  // ===========================================

  useEffect(() => {
    const loadGroups = () => {
      try {
        const savedGroups = loadFromLocalStorage<Group[]>(STORAGE_KEYS.GROUPS, [])
        setGroups(savedGroups)
        console.log('📁 Grupos cargados:', savedGroups.length)
      } catch (error: unknown) {
        console.error('Error loading groups:', error)
        toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      }
    }

    loadGroups()

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadGroups()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Verificar cambios cada 5 segundos (reducido para mejor rendimiento)
    const interval = setInterval(loadGroups, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // ===========================================
  // Save Groups to localStorage
  // ===========================================

  const saveGroups = useCallback((newGroups: Group[]) => {
    try {
      saveToLocalStorage(STORAGE_KEYS.GROUPS, newGroups)
      setGroups(newGroups)
    } catch (error: unknown) {
      console.error('Error saving groups:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
    }
  }, [])

  // ===========================================
  // Group Management Functions
  // ===========================================

  const createGroup = useCallback(async (groupData: CreateGroupForm): Promise<boolean> => {
    setIsLoading(true)
    try {
      const newGroup: Group = {
        ...groupData,
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        currency: 'USDC',
        divisionMethod: 'equal',
        status: 'active',
        expenses: [],
        payments: [],
        totalAmount: 0,
        participantNames: {},
      }

      const updatedGroups = [...groups, newGroup]
      saveGroups(updatedGroups)
      
      toast.success(`${SUCCESS_MESSAGES.GROUP_CREATED} "${newGroup.name}"`)
      console.log('✅ Grupo creado:', newGroup.name)
      
      return true
    } catch (error: unknown) {
      console.error('Error creating group:', error)
      toast.error('Error al crear el grupo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const addExpense = useCallback(async (groupId: string, expenseData: AddExpenseForm): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const newExpense: Expense = {
            ...expenseData,
            id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            status: 'active',
            groupId: groupId
          }
          
          // Crear notificaciones para todos los participantes excepto quien pagó
          group.participants.forEach(participant => {
            if (participant.toLowerCase() !== newExpense.paidBy.toLowerCase()) {
              const notification = createNotification(
                'expense_added',
                group.id,
                group.name,
                `Se ha añadido un gasto de ${newExpense.amount.toFixed(2)} USDC en "${group.name}"`,
                participant,
                newExpense.amount,
                newExpense.paidBy
              )
              saveNotification(participant, notification)
            }
          })

          return {
            ...group,
            expenses: [...group.expenses, newExpense],
            totalAmount: group.totalAmount + (newExpense.amount || 0)
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success(`${SUCCESS_MESSAGES.EXPENSE_ADDED} "${expenseData.description}"`)
      console.log('💰 Gasto agregado:', expenseData.description)
      
      return true
    } catch (error: unknown) {
      console.error('Error adding expense:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const deleteExpense = useCallback(async (groupId: string, expenseId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const expenseToDelete = group.expenses.find(expense => expense.id === expenseId)
          if (!expenseToDelete) return group
          
          return {
            ...group,
            expenses: group.expenses.filter(expense => expense.id !== expenseId),
            totalAmount: group.totalAmount - (expenseToDelete.amount || 0)
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success(SUCCESS_MESSAGES.EXPENSE_DELETED)
      console.log('🗑️ Gasto eliminado:', expenseId)
      
      return true
    } catch (error: unknown) {
      console.error('Error deleting expense:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const cancelExpense = useCallback(async (groupId: string, expenseId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const expenseToCancel = group.expenses.find(expense => expense.id === expenseId)
          if (!expenseToCancel) return group
          
          // Marcar el gasto como cancelado
          const updatedExpenses = group.expenses.map(expense => 
            expense.id === expenseId 
              ? { ...expense, status: 'cancelled' as const }
              : expense
          )
          
          return {
            ...group,
            expenses: updatedExpenses
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success(SUCCESS_MESSAGES.EXPENSE_CANCELLED)
      console.log('❌ Gasto cancelado:', expenseId)
      
      return true
    } catch (error: unknown) {
      console.error('Error cancelling expense:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const getGroup = useCallback(async (groupId: string): Promise<Group | null> => {
    try {
      const group = groups.find(g => g.id === groupId)
      if (group) {
        setCurrentGroup(group)
        return group
      }
      return null
    } catch (error: unknown) {
      console.error('Error getting group:', error)
      return null
    }
  }, [groups])

  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { ...group, ...updates }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success(SUCCESS_MESSAGES.GROUP_UPDATED)
      console.log('🔄 Grupo actualizado:', groupId)
      
      return true
    } catch (error: unknown) {
      console.error('Error updating group:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
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
      
      toast.success(SUCCESS_MESSAGES.GROUP_DELETED)
      console.log('🗑️ Grupo eliminado:', groupId)
      
      return true
    } catch (error: unknown) {
      console.error('Error deleting group:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  // ===========================================
  // Participant Management
  // ===========================================

  const addParticipant = useCallback(async (groupId: string, participantData: AddParticipantForm): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          // Verificar si el participante ya existe
          if (group.participants.includes(participantData.address)) {
            toast.error(ERROR_MESSAGES.PARTICIPANT_ALREADY_ADDED)
            return group
          }

          return {
            ...group,
            participants: [...group.participants, participantData.address],
            participantNames: {
              ...group.participantNames,
              [participantData.address.toLowerCase()]: participantData.name || participantData.address
            }
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success('Participante agregado exitosamente')
      return true
    } catch (error: unknown) {
      console.error('Error adding participant:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const addParticipantName = useCallback(async (groupId: string, address: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            participantNames: {
              ...group.participantNames,
              [address.toLowerCase()]: name
            }
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success(`${SUCCESS_MESSAGES.PARTICIPANT_NAME_ADDED} "${name}" para ${address.slice(0, 6)}...${address.slice(-4)}`)
      return true
    } catch (error: unknown) {
      console.error('Error adding participant name:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const getParticipantName = useCallback((groupId: string, address: string): string => {
    const group = groups.find(g => g.id === groupId)
    if (!group || !group.participantNames) return `${address.slice(0, 6)}...${address.slice(-4)}`
    return group.participantNames[address.toLowerCase()] || `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [groups])

  // ===========================================
  // Payment Management
  // ===========================================

  const createPayment = useCallback(async (groupId: string, from: string, to: string, amount: number): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const newPayment: Payment = {
            id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from,
            to,
            amount,
            status: 'pending',
            createdAt: new Date().toISOString()
          }

          return {
            ...group,
            payments: [...group.payments, newPayment]
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success(SUCCESS_MESSAGES.PAYMENT_CREATED)
      return true
    } catch (error: unknown) {
      console.error('Error creating payment:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const completePayment = useCallback(async (groupId: string, paymentId: string, transactionHash: string, completedBy: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const completedPayment = group.payments.find(p => p.id === paymentId)
          if (!completedPayment) {
            toast.error(ERROR_MESSAGES.PAYMENT_NOT_FOUND)
            return group
          }

          const updatedPayments = group.payments.map(payment => {
            if (payment.id === paymentId) {
              return {
                ...payment,
                status: 'completed' as const,
                transactionHash,
                completedAt: new Date().toISOString(),
                completedBy
              }
            }
            return payment
          })

          // Crear notificación automática para el receptor del pago
          const notification = createNotification(
            'payment_completed',
            group.id,
            group.name,
            `¡Has recibido un pago de ${completedPayment.amount.toFixed(2)} USDC de ${getParticipantName(group.id, completedPayment.from)} en "${group.name}"!`,
            completedPayment.to,
            completedPayment.amount,
            completedPayment.from
          )
          saveNotification(completedPayment.to, notification)

          return {
            ...group,
            payments: updatedPayments
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success(SUCCESS_MESSAGES.PAYMENT_COMPLETED)
      console.log('✅ Pago completado:', paymentId)
      
      return true
    } catch (error: unknown) {
      console.error('Error completing payment:', error)
      toast.error(ERROR_MESSAGES.GENERIC_CONNECTION_ERROR)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups, getParticipantName])

  const getPendingPayments = useCallback((groupId: string, participant: string): Payment[] => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return []
    
    return group.payments.filter(payment => 
      payment.from.toLowerCase() === participant.toLowerCase() && 
      payment.status === 'pending'
    )
  }, [groups])

  const getPaymentHistory = useCallback((groupId: string): Payment[] => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return []
    
    return group.payments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [groups])

  // ===========================================
  // Utility Functions
  // ===========================================

  const getGroupsByParticipant = useCallback((address: string): Group[] => {
    return groups.filter(group => 
      group.participants.some(participant => 
        participant.toLowerCase() === address.toLowerCase()
      )
    )
  }, [groups])

  const getTotalOwed = useCallback((groupId: string, participant: string): number => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return 0

    const { userOwes } = calculateBalances(group, participant)
    return userOwes
  }, [groups])

  const getParticipantDebts = useCallback((address: string) => {
    const userGroups = getGroupsByParticipant(address)
    const debts: { groupId: string; groupName: string; amount: number }[] = []

    userGroups.forEach(group => {
      const { userOwes } = calculateBalances(group, address)
      if (userOwes > 0) {
        debts.push({
          groupId: group.id,
          groupName: group.name,
          amount: userOwes
        })
      }
    })

    return debts
  }, [getGroupsByParticipant])

  // ===========================================
  // Context Value
  // ===========================================

  const value: GroupContextType = useMemo(() => ({
    // Groups state
    groups,
    currentGroup,
    isLoading,
    
    // Actions
    createGroup,
    addExpense,
    deleteExpense,
    cancelExpense,
    completePayment,
    getGroup,
    updateGroup,
    deleteGroup,
    
    // Participant management
    addParticipant,
    addParticipantName,
    getParticipantName,
    
    // Payment management
    createPayment,
    getPendingPayments,
    getPaymentHistory,
    
    // Utility
    getGroupsByParticipant,
    getTotalOwed,
    getParticipantDebts,
  }), [
    groups,
    currentGroup,
    isLoading,
    createGroup,
    addExpense,
    deleteExpense,
    cancelExpense,
    completePayment,
    getGroup,
    updateGroup,
    deleteGroup,
    addParticipant,
    addParticipantName,
    getParticipantName,
    createPayment,
    getPendingPayments,
    getPaymentHistory,
    getGroupsByParticipant,
    getTotalOwed,
    getParticipantDebts,
  ])

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

export type { GroupContextType }

