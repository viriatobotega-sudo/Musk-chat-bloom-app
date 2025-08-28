"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, off } from "firebase/database"

export function useUnreadCount() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const unreadRef = ref(database, `unreadCounts/${user.uid}`)

    const unsubscribe = onValue(unreadRef, (snapshot) => {
      if (snapshot.exists()) {
        const counts = snapshot.val()
        const total = Object.values(counts).reduce((sum: number, count: any) => sum + (count || 0), 0)
        setUnreadCount(total as number)
      } else {
        setUnreadCount(0)
      }
    })

    return () => off(unreadRef, "value", unsubscribe)
  }, [user])

  return { unreadCount }
}
