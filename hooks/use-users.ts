"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, set, serverTimestamp } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { UserChat } from "@/types/chat"

export function useUsers() {
  const [users, setUsers] = useState<UserChat[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserChat[]>([])
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
      console.log("[v0] Firebase snapshot recebido:", snapshot.exists())

      const data = snapshot.val()
      console.log("[v0] Dados do Firebase:", data)

      if (data) {
        const usersList = Object.entries(data)
          .map(([uid, userData]: [string, any]) => {
            if (!userData.displayName && !userData.email) {
              console.log("[v0] Usuário ignorado por falta de dados básicos:", uid)
              return null
            }

            return {
              uid,
              id: uid,
              displayName: userData.displayName || userData.email?.split("@")[0] || "Usuário",
              email: userData.email || "",
              photoURL: userData.photoURL || "",
              phoneNumber: userData.phoneNumber || "",
              bio: userData.bio || "",
              isOnline: userData.isOnline || false,
              lastSeen: userData.lastSeen || Date.now(),
            }
          })
          .filter(Boolean) as UserChat[]

        console.log("[v0] Lista de usuários processada:", usersList.length, "usuários")
        console.log(
          "[v0] Usuários encontrados:",
          usersList.map((u) => u.displayName),
        )

        setUsers(usersList)

        const filtered = usersList.filter((u) => u.uid !== user.uid)
        setFilteredUsers(filtered)
        console.log("[v0] Usuários filtrados (excluindo atual):", filtered.length)

        setOnlineUsers(usersList.filter((u) => u.isOnline && u.uid !== user.uid).map((u) => u.uid))
      } else {
        console.log("[v0] Nenhum dado encontrado no Firebase")
        setUsers([])
        setFilteredUsers([])
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
    console.log("[v0] Usuários disponíveis para busca:", filteredUsers.length)

    if (!query.trim()) return filteredUsers

    const searchResults = filteredUsers.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(query.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(query.toLowerCase()) ||
        (u.phoneNumber || "").includes(query),
    )

    console.log("[v0] Resultados da busca para '", query, "':", searchResults.length)
    return searchResults
  }

  console.log("[v0] Hook useUsers retornando:", filteredUsers.length, "usuários")

  return {
    users: filteredUsers,
    onlineUsers,
    loading,
    searchUsers,
  }
}
