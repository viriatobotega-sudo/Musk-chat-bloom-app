"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface OfflineMessage {
  id: string
  chatId: string
  content: string
  timestamp: number
  type: "text" | "image" | "document" | "audio"
  mediaUrl?: string
}

export function useOfflineSync() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingMessages, setPendingMessages] = useState<OfflineMessage[]>([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingMessages()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Load pending messages from localStorage
    loadPendingMessages()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadPendingMessages = () => {
    if (!user) return

    const stored = localStorage.getItem(`pendingMessages_${user.uid}`)
    if (stored) {
      setPendingMessages(JSON.parse(stored))
    }
  }

  const savePendingMessage = (message: OfflineMessage) => {
    if (!user) return

    const updated = [...pendingMessages, message]
    setPendingMessages(updated)
    localStorage.setItem(`pendingMessages_${user.uid}`, JSON.stringify(updated))
  }

  const syncPendingMessages = async () => {
    if (!user || pendingMessages.length === 0) return

    try {
      // TODO: Implement actual sync with Firebase
      console.log("Syncing pending messages:", pendingMessages)

      // Clear pending messages after successful sync
      setPendingMessages([])
      localStorage.removeItem(`pendingMessages_${user.uid}`)
    } catch (error) {
      console.error("Error syncing messages:", error)
    }
  }

  return {
    isOnline,
    pendingMessages,
    savePendingMessage,
    syncPendingMessages,
  }
}
