"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, set, serverTimestamp } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { UserChat } from "@/types/chat"

export function useUsers() {
  const [users, setUsers] = useState<UserChat[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const usersRef = ref(database, "userschat")

    const setUserOnline = async () => {
      const userStatusRef = ref(database, `userschat/${user.uid}`)
      const currentUser = users.find((u) => u.uid === user.uid)
      await set(userStatusRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "Usuário",
        email: user.email || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
        bio: currentUser?.bio || "",
        isOnline: true,
        lastSeen: serverTimestamp(),
      })
    }

    const setUserOffline = async () => {
      const userStatusRef = ref(database, `userschat/${user.uid}`)
      const currentUser = users.find((u) => u.uid === user.uid)
      await set(userStatusRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split("@")[0] || "Usuário",
        email: user.email || "",
        photoURL: user.photoURL || "",
        phoneNumber: user.phoneNumber || "",
        bio: currentUser?.bio || "",
        isOnline: false,
        lastSeen: serverTimestamp(),
      })
    }

    setUserOnline()

    // Listen for users changes
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([uid, userData]: [string, any]) => ({
          uid,
          id: uid, // Adicionando id para compatibilidade
          displayName: userData.displayName || userData.email?.split("@")[0] || "Usuário",
          email: userData.email || "",
          photoURL: userData.photoURL || "",
          phoneNumber: userData.phoneNumber || "",
          bio: userData.bio || "",
          isOnline: userData.isOnline || false,
          lastSeen: userData.lastSeen || Date.now(),
        })) as UserChat[]

        setUsers(usersList)
        setOnlineUsers(usersList.filter((u) => u.isOnline && u.uid !== user.uid).map((u) => u.uid))
      } else {
        setUsers([])
        setOnlineUsers([])
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
        ((u.displayName || "").toLowerCase().includes(query.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(query.toLowerCase()) ||
          (u.phoneNumber || "").includes(query)),
    )
  }

  return {
    users: users.filter((u) => u.uid !== user?.uid),
    onlineUsers,
    loading,
    searchUsers,
  }
}
