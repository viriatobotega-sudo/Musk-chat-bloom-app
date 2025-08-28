"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, set, serverTimestamp } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { UserChat } from "@/types/chat"

export function useUsers() {
  const [users, setUsers] = useState<UserChat[]>([])
  const [onlineUsers, setOnlineUsers] = useState<UserChat[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const usersRef = ref(database, "userschat")

    // Set current user as online
    const setUserOnline = async () => {
      const userStatusRef = ref(database, `userschat/${user.uid}`)
      await set(userStatusRef, {
        ...users.find((u) => u.uid === user.uid),
        isOnline: true,
        lastSeen: serverTimestamp(),
      })
    }

    // Set user offline when they disconnect
    const setUserOffline = async () => {
      const userStatusRef = ref(database, `userschat/${user.uid}`)
      await set(userStatusRef, {
        ...users.find((u) => u.uid === user.uid),
        isOnline: false,
        lastSeen: serverTimestamp(),
      })
    }

    setUserOnline()

    // Listen for users changes
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.values(data) as UserChat[]
        setUsers(usersList)
        setOnlineUsers(usersList.filter((u) => u.isOnline && u.uid !== user.uid))
      }
      setLoading(false)
    })

    // Set user offline when page unloads
    window.addEventListener("beforeunload", setUserOffline)

    return () => {
      off(usersRef, "value", unsubscribe)
      window.removeEventListener("beforeunload", setUserOffline)
      setUserOffline()
    }
  }, [user])

  const searchUsers = (query: string) => {
    if (!query.trim()) return users.filter((u) => u.uid !== user?.uid)

    return users.filter(
      (u) =>
        u.uid !== user?.uid &&
        (u.displayName.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.phoneNumber?.includes(query)),
    )
  }

  return {
    users: users.filter((u) => u.uid !== user?.uid),
    onlineUsers,
    loading,
    searchUsers,
  }
}
