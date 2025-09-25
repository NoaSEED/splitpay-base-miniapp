import { useState, useEffect, useCallback } from 'react'
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../utils'
import type { Notification } from '../types'

// ===========================================
// Notifications Hook
// ===========================================

export const useNotifications = (address: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading] = useState(false)

  // Load notifications when address changes
  useEffect(() => {
    if (!address) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const loadNotifications = () => {
      try {
        const userNotifications = getNotifications(address)
        const unread = getUnreadNotificationsCount(address)
        
        setNotifications(userNotifications)
        setUnreadCount(unread)
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()
  }, [address])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (!address) return

    try {
      markNotificationAsRead(address, notificationId)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [address])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!address) return

    try {
      markAllNotificationsAsRead(address)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [address])

  // Get unread notifications
  const unreadNotifications = notifications.filter(notif => !notif.read)

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notif => notif.type === type)
  }, [notifications])

  // Get recent notifications (last 7 days)
  const getRecentNotifications = useCallback(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    return notifications.filter(notif => 
      new Date(notif.timestamp) > sevenDaysAgo
    )
  }, [notifications])

  // Clear old notifications (older than 30 days)
  const clearOldNotifications = useCallback(() => {
    if (!address) return

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const filteredNotifications = notifications.filter(notif => 
        new Date(notif.timestamp) > thirtyDaysAgo
      )
      
      // Update localStorage
      localStorage.setItem(`notifications_${address.toLowerCase()}`, JSON.stringify(filteredNotifications))
      
      // Update local state
      setNotifications(filteredNotifications)
      setUnreadCount(filteredNotifications.filter(notif => !notif.read).length)
    } catch (error) {
      console.error('Error clearing old notifications:', error)
    }
  }, [address, notifications])

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    getNotificationsByType,
    getRecentNotifications,
    clearOldNotifications
  }
}

// ===========================================
// Notification Subscription Hook
// ===========================================

export const useNotificationSubscription = (address: string | null) => {
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!address) {
      setIsSubscribed(false)
      return
    }

    // Check if user has notifications enabled
    const notificationSettings = localStorage.getItem(`notification_settings_${address.toLowerCase()}`)
    const settings = notificationSettings ? JSON.parse(notificationSettings) : {
      enabled: true,
      expenseAdded: true,
      paymentCompleted: true,
      debtReminder: true
    }

    setIsSubscribed(settings.enabled)

    // Set up periodic check for new notifications
    const checkInterval = setInterval(() => {
      try {
        const unreadCount = getUnreadNotificationsCount(address)
        // Update browser notification badge if supported
        if ('setAppBadge' in navigator && unreadCount > 0) {
          navigator.setAppBadge(unreadCount)
        }
      } catch (error) {
        console.error('Error checking notifications:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => {
      clearInterval(checkInterval)
      // Clear badge when component unmounts
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge()
      }
    }
  }, [address])

  const updateSubscription = useCallback((settings: {
    enabled: boolean
    expenseAdded: boolean
    paymentCompleted: boolean
    debtReminder: boolean
  }) => {
    if (!address) return

    try {
      localStorage.setItem(`notification_settings_${address.toLowerCase()}`, JSON.stringify(settings))
      setIsSubscribed(settings.enabled)
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }, [address])

  return {
    isSubscribed,
    updateSubscription
  }
}
