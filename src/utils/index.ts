// ===========================================
// Utility Functions for SplitPay
// ===========================================

import type { Group, Notification } from '../types'

// ===========================================
// Format Functions
// ===========================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(isoString)
}

// ===========================================
// Validation Functions
// ===========================================

export const isValidAddress = (address: string): boolean => {
  // Basic check for Ethereum address format
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const isValidAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 10000
}

export const isValidGroupName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name)
}

// ===========================================
// Notification Management
// ===========================================

export const createNotification = (
  type: Notification['type'],
  groupId: string,
  groupName: string,
  message: string,
  toAddress: string,
  amount?: number,
  fromAddress?: string
): Notification => {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    groupId,
    groupName,
    message,
    amount,
    from: fromAddress,
    to: toAddress,
    timestamp: new Date().toISOString(),
    read: false,
  }
}

export const saveNotification = (address: string, notification: Notification) => {
  const key = `notifications_${address.toLowerCase()}`
  const notifications = JSON.parse(localStorage.getItem(key) || '[]') as Notification[]
  notifications.push(notification)
  localStorage.setItem(key, JSON.stringify(notifications))
}

export const getNotifications = (address: string): Notification[] => {
  const key = `notifications_${address.toLowerCase()}`
  return JSON.parse(localStorage.getItem(key) || '[]') as Notification[]
}

export const markNotificationAsRead = (address: string, notificationId: string) => {
  const key = `notifications_${address.toLowerCase()}`
  const notifications = JSON.parse(localStorage.getItem(key) || '[]') as Notification[]
  const updatedNotifications = notifications.map(notif =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  )
  localStorage.setItem(key, JSON.stringify(updatedNotifications))
}

export const markAllNotificationsAsRead = (address: string) => {
  const key = `notifications_${address.toLowerCase()}`
  const notifications = JSON.parse(localStorage.getItem(key) || '[]') as Notification[]
  const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }))
  localStorage.setItem(key, JSON.stringify(updatedNotifications))
}

export const getUnreadNotificationsCount = (address: string): number => {
  const notifications = getNotifications(address)
  return notifications.filter(notif => !notif.read).length
}

// ===========================================
// Group Utility Functions
// ===========================================

export const calculateBalances = (group: Group, currentAccount: string) => {
  const balances: { [address: string]: number } = {}
  group.participants.forEach(p => (balances[p] = 0))

  // Process expenses
  group.expenses.filter(e => e.status === 'active').forEach(expense => {
    const amountPerParticipant = expense.amount / group.participants.length
    group.participants.forEach(p => {
      if (p.toLowerCase() === expense.paidBy.toLowerCase()) {
        balances[p] += expense.amount - amountPerParticipant // Paid more than their share
      } else {
        balances[p] -= amountPerParticipant // Owes their share
      }
    })
  })

  // Process completed payments
  group.payments.filter(p => p.status === 'completed').forEach(payment => {
    balances[payment.from] += payment.amount
    balances[payment.to] -= payment.amount
  })

  // Determine who owes whom
  const debts: { from: string; to: string; amount: number }[] = []
  const creditors: { address: string; amount: number }[] = []
  const debtors: { address: string; amount: number }[] = []

  for (const address in balances) {
    if (balances[address] > 0) {
      creditors.push({ address, amount: balances[address] })
    } else if (balances[address] < 0) {
      debtors.push({ address, amount: Math.abs(balances[address]) })
    }
  }

  // Simple settlement algorithm
  let i = 0
  let j = 0
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]
    const amountToSettle = Math.min(creditor.amount, debtor.amount)

    if (amountToSettle > 0.01) { // Only add if amount is significant
      debts.push({
        from: debtor.address,
        to: creditor.address,
        amount: amountToSettle,
      })
    }

    creditor.amount -= amountToSettle
    debtor.amount -= amountToSettle

    if (creditor.amount <= 0.01) {
      i++
    }
    if (debtor.amount <= 0.01) {
      j++
    }
  }

  const userOwes = debts
    .filter(d => d.from.toLowerCase() === currentAccount.toLowerCase())
    .reduce((sum, d) => sum + d.amount, 0)

  const userIsOwed = debts
    .filter(d => d.to.toLowerCase() === currentAccount.toLowerCase())
    .reduce((sum, d) => sum + d.amount, 0)

  return { debts, userOwes, userIsOwed }
}

// ===========================================
// Local Storage Utilities
// ===========================================

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return defaultValue
  }
}

// ===========================================
// Debounce Utility
// ===========================================

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}







