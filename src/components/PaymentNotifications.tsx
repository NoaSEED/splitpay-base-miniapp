import React, { useState, useEffect } from 'react'
import { useWeb3 } from '../contexts/Web3Context'
import { useGroups } from '../contexts/GroupContext'
import { Bell, X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'

interface PaymentNotification {
  id: string
  type: 'payment_created' | 'payment_completed' | 'debt_reminder'
  groupId: string
  groupName: string
  message: string
  amount?: number
  from?: string
  to?: string
  timestamp: string
  read: boolean
}

const PaymentNotifications: React.FC = () => {
  const { account, isConnected } = useWeb3()
  const { getParticipantDebts, getGroupsByParticipant } = useGroups()
  const [notifications, setNotifications] = useState<PaymentNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isConnected && account) {
      loadNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isConnected, account])

  const loadNotifications = () => {
    if (!account) return

    const userGroups = getGroupsByParticipant(account)
    const newNotifications: PaymentNotification[] = []

    // Crear notificaciones de deudas
    userGroups.forEach(group => {
      const debts = getParticipantDebts(account)
      const groupDebt = debts.find(debt => debt.groupId === group.id)
      
      if (groupDebt && groupDebt.amount > 0) {
        newNotifications.push({
          id: `debt_${group.id}`,
          type: 'debt_reminder',
          groupId: group.id,
          groupName: group.name,
          message: `Tienes una deuda pendiente de $${groupDebt.amount.toFixed(2)} USDC`,
          amount: groupDebt.amount,
          timestamp: new Date().toISOString(),
          read: false
        })
      }
    })

    // Cargar notificaciones guardadas
    const savedNotifications = localStorage.getItem(`notifications_${account}`)
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      newNotifications.push(...parsed)
    }

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.filter(n => !n.read).length)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    // Guardar en localStorage
    if (account) {
      const updated = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
      localStorage.setItem(`notifications_${account}`, JSON.stringify(updated))
    }
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
    if (account) {
      localStorage.removeItem(`notifications_${account}`)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Hace un momento'
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_created':
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case 'payment_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'debt_reminder':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }


  if (!isConnected || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-16 w-80 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Limpiar todo
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.groupName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${notification.amount.toFixed(2)} USDC
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentNotifications
