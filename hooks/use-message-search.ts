"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, query, orderByChild, startAt, endAt, onValue } from "firebase/database"
import type { Message } from "@/types/chat"

export function useMessageSearch() {
  const { user } = useAuth()
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchMessages = async (searchTerm: string, chatId?: string) => {
    if (!user || !searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // Search in specific chat or all user's chats
      const searchPath = chatId ? `messages/${chatId}` : `userChats/${user.uid}`

      const messagesRef = ref(database, searchPath)
      const searchQuery = query(
        messagesRef,
        orderByChild("content"),
        startAt(searchTerm.toLowerCase()),
        endAt(searchTerm.toLowerCase() + "\uf8ff"),
      )

      onValue(searchQuery, (snapshot) => {
        const results: Message[] = []

        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const message = child.val()
            if (message.content?.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({ id: child.key, ...message })
            }
          })
        }

        setSearchResults(results)
        setIsSearching(false)
      })
    } catch (error) {
      console.error("Error searching messages:", error)
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchResults([])
  }

  return {
    searchResults,
    isSearching,
    searchMessages,
    clearSearch,
  }
}
