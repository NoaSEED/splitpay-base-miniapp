import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import toast from 'react-hot-toast'

// ===========================================
// Types & Interfaces
// ===========================================

interface Payment {
  id: string
  from: string // Quien debe pagar
  to: string // Quien recibe el pago
  amount: number
  status: 'pending' | 'completed' | 'disputed' | 'cancelled'
  transactionHash?: string // Hash de la transacción
  proofImage?: string // Imagen del comprobante
  createdAt: string
  completedAt?: string
  completedBy?: string // Quien marcó como completado
  notes?: string
}

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
  participantNames: { [address: string]: string } // Mapeo de dirección a nombre
  createdAt: string
  status: string
  totalAmount: number
  expenses: any[]
  payments: Payment[] // Nuevo: historial de pagos
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
  deleteExpense: (groupId: string, expenseId: string) => Promise<boolean>
  cancelExpense: (groupId: string, expenseId: string) => Promise<boolean>
  cancelDebt: (groupId: string, from: string, to: string, amount: number, reason: string) => Promise<boolean>
  getGroup: (groupId: string) => Promise<GroupData | null>
  updateGroup: (groupId: string, updates: Partial<GroupData>) => Promise<boolean>
  deleteGroup: (groupId: string) => Promise<boolean>
  
  // Participant management
  addParticipantName: (groupId: string, address: string, name: string) => Promise<boolean>
  getParticipantName: (groupId: string, address: string) => string
  
  // Payment management
  createPayment: (groupId: string, from: string, to: string, amount: number) => Promise<boolean>
  completePayment: (groupId: string, paymentId: string, transactionHash: string, completedBy: string) => Promise<boolean>
  getPendingPayments: (groupId: string, participant: string) => Payment[]
  getPaymentHistory: (groupId: string) => Payment[]
  
  // Utility
  getGroupsByParticipant: (address: string) => GroupData[]
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
        payments: [],
        totalAmount: 0,
        status: 'active',
        participantNames: groupData.participantNames || {}
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
          
          // Crear pagos automáticamente para cada participante que debe
          const newPayments: Payment[] = []
          const amountPerPerson = expenseData.amount / group.participants.length
          
          group.participants.forEach(participant => {
            if (participant !== expenseData.paidBy) {
              // Solo crear pago si el participante no es quien pagó
              newPayments.push({
                id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                from: participant,
                to: expenseData.paidBy,
                amount: amountPerPerson,
                status: 'pending',
                createdAt: new Date().toISOString()
              })
            }
          })
          
          return {
            ...group,
            expenses: [...group.expenses, newExpense],
            payments: [...group.payments, ...newPayments],
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
      
      toast.success('Gasto eliminado')
      console.log('🗑️ Gasto eliminado:', expenseId)
      
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Error al eliminar el gasto')
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
          
          // Marcar el gasto como cancelado en lugar de eliminarlo
          const updatedExpenses = group.expenses.map(expense => 
            expense.id === expenseId 
              ? { ...expense, status: 'cancelled', cancelledAt: new Date().toISOString() }
              : expense
          )
          
          // Cancelar todos los pagos pendientes relacionados con este gasto
          const updatedPayments = group.payments.map(payment => {
            // Cancelar pagos pendientes que involucran al que pagó el gasto
            if (payment.status === 'pending' && 
                (payment.from === expenseToCancel.paidBy || payment.to === expenseToCancel.paidBy)) {
              return { ...payment, status: 'cancelled' as const }
            }
            return payment
          })
          
          return {
            ...group,
            expenses: updatedExpenses,
            payments: updatedPayments
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      
      toast.success('Gasto cancelado')
      console.log('❌ Gasto cancelado:', expenseId)
      
      return true
    } catch (error) {
      console.error('Error cancelling expense:', error)
      toast.error('Error al cancelar el gasto')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const cancelDebt = useCallback(async (groupId: string, from: string, to: string, amount: number, reason: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          // Crear un pago cancelado para registrar la cancelación de deuda
          const cancelledPayment: Payment = {
            id: `cancelled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from,
            to,
            amount,
            status: 'cancelled',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            completedBy: from,
            notes: `Deuda cancelada: ${reason}`
          }

          return {
            ...group,
            payments: [...group.payments, cancelledPayment]
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success('Deuda cancelada')
      console.log('❌ Deuda cancelada:', { from, to, amount, reason })
      
      return true
    } catch (error) {
      console.error('Error cancelling debt:', error)
      toast.error('Error al cancelar la deuda')
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
  // Participant Name Management
  // ===========================================

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
      toast.success(`Nombre "${name}" agregado para ${address}`)
      return true
    } catch (error) {
      console.error('Error adding participant name:', error)
      toast.error('Error al agregar el nombre')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

  const getParticipantName = useCallback((groupId: string, address: string): string => {
    const group = groups.find(g => g.id === groupId)
    if (!group || !group.participantNames) return ''
    return group.participantNames[address.toLowerCase()] || ''
  }, [groups])

  const getParticipantDebts = useCallback((address: string): { groupId: string; groupName: string; amount: number }[] => {
    const userGroups = getGroupsByParticipant(address)
    return userGroups.map(group => ({
      groupId: group.id,
      groupName: group.name,
      amount: getTotalOwed(group.id, address)
    })).filter(debt => debt.amount > 0)
  }, [getGroupsByParticipant, getTotalOwed])

  // ===========================================
  // Payment Management
  // ===========================================

  const createPayment = useCallback(async (groupId: string, from: string, to: string, amount: number): Promise<boolean> => {
    setIsLoading(true)
    try {
      const newPayment: Payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from,
        to,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            payments: [...group.payments, newPayment]
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success(`Pago de $${amount.toFixed(2)} USDC creado`)
      console.log('💰 Pago creado:', newPayment.id)
      
      return true
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Error al crear el pago')
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

          // Crear notificación automática y cancelar deuda relacionada
          const completedPayment = group.payments.find(p => p.id === paymentId)
          if (completedPayment) {
            // Guardar notificación en localStorage
            const notification = {
              id: `payment_completed_${paymentId}`,
              type: 'payment_completed',
              groupId: group.id,
              groupName: group.name,
              message: `Pago de $${completedPayment.amount.toFixed(2)} USDC completado`,
              amount: completedPayment.amount,
              from: completedPayment.from,
              to: completedPayment.to,
              timestamp: new Date().toISOString(),
              read: false
            }

            // Guardar notificación para el que recibió el pago
            const toNotifications = JSON.parse(localStorage.getItem(`notifications_${completedPayment.to}`) || '[]')
            toNotifications.push(notification)
            localStorage.setItem(`notifications_${completedPayment.to}`, JSON.stringify(toNotifications))

            // CANCELAR AUTOMÁTICAMENTE LA DEUDA RELACIONADA
            // Buscar y cancelar pagos pendientes relacionados con este pago
            const updatedPaymentsWithCancellation = updatedPayments.map(payment => {
              // Si es un pago pendiente que involucra a los mismos participantes
              if (payment.status === 'pending' && 
                  payment.from === completedPayment.from && 
                  payment.to === completedPayment.to &&
                  payment.amount === completedPayment.amount) {
                return {
                  ...payment,
                  status: 'cancelled' as const,
                  completedAt: new Date().toISOString(),
                  completedBy: completedBy,
                  notes: `Deuda cancelada automáticamente por pago completado`
                }
              }
              return payment
            })

            return {
              ...group,
              payments: updatedPaymentsWithCancellation
            }
          }

          return {
            ...group,
            payments: updatedPayments
          }
        }
        return group
      })

      saveGroups(updatedGroups)
      toast.success('Pago marcado como completado')
      console.log('✅ Pago completado:', paymentId)
      
      return true
    } catch (error) {
      console.error('Error completing payment:', error)
      toast.error('Error al completar el pago')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [groups, saveGroups])

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
    deleteExpense,
    cancelExpense,
    cancelDebt,
    getGroup,
    updateGroup,
    deleteGroup,
    
    // Participant management
    addParticipantName,
    getParticipantName,
    
    // Payment management
    createPayment,
    completePayment,
    getPendingPayments,
    getPaymentHistory,
    
    // Utility
    getGroupsByParticipant,
    getTotalOwed,
    getParticipantDebts,
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

export type { GroupData, GroupContextType, Payment }
